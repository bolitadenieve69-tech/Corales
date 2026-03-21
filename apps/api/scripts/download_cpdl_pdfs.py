"""
Downloads PDFs from CPDL (ChoralWiki) for works without a score in the DB.

Usage:
    cd apps/api && source venv/bin/activate
    python scripts/download_cpdl_pdfs.py [--dry-run]
"""
import sys
import re
import time
import requests
from pathlib import Path
from difflib import SequenceMatcher

API_BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@corales.com"
ADMIN_PASS = "password123"
CPDL_BASE = "https://cpdl.org/wiki/index.php"
DRY_RUN = "--dry-run" in sys.argv

HEADERS_BROWSER = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

def normalize(t: str) -> str:
    t = t.lower()
    t = re.sub(r'[_\-]', ' ', t)
    t = t.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')
    t = t.replace('ä','a').replace('ë','e').replace('ï','i').replace('ö','o').replace('ü','u')
    t = t.replace('ñ','n').replace('ç','c').replace('æ','ae').replace('ø','o').replace('å','a')
    t = re.sub(r'[^a-z0-9 ]', '', t)
    return t.strip()

def sim(a, b):
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()

def make_cpdl_slug(title: str, composer: str) -> list:
    """Generate candidate CPDL page title slugs to try."""
    # CPDL format: "Title (Composer Last Name)" or "Title (Composer Full Name)"
    composer_parts = composer.split()
    last_name = composer_parts[-1] if composer_parts else composer
    full_name = composer

    candidates = []
    for comp in [full_name, last_name]:
        slug = f"{title} ({comp})".replace(" ", "_")
        candidates.append(slug)
    # Also try just the title
    candidates.append(title.replace(" ", "_"))
    return candidates

def cpdl_get_pdf_url(title: str, composer: str):
    """Try candidate CPDL pages and return first PDF URL found."""
    slugs = make_cpdl_slug(title, composer)
    for slug in slugs:
        url = f"{CPDL_BASE}/{slug}"
        try:
            r = requests.get(url, headers=HEADERS_BROWSER, timeout=10, allow_redirects=True)
            if r.status_code == 404 or "noarticletext" in r.text:
                continue
            if r.status_code != 200:
                continue

            # Find PDF links in the page HTML
            # CPDL PDFs are hosted on cpdl.org/wiki/images/...
            pdf_links = re.findall(r'href="(/wiki/images/[^"]+\.pdf)"', r.text, re.IGNORECASE)
            if pdf_links:
                return f"https://cpdl.org{pdf_links[0]}", slug

            # Also check external PDF links
            ext_pdfs = re.findall(r'href="(https?://[^"]+\.pdf)"', r.text, re.IGNORECASE)
            if ext_pdfs:
                return ext_pdfs[0], slug

        except Exception as e:
            continue
    return None, None

def download_pdf(url: str, dest_path: Path) -> bool:
    try:
        r = requests.get(url, headers=HEADERS_BROWSER, timeout=30, stream=True)
        r.raise_for_status()
        content_type = r.headers.get("content-type", "")
        if "pdf" not in content_type and not url.lower().endswith(".pdf"):
            return False
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return dest_path.stat().st_size > 5000  # at least 5KB
    except Exception as e:
        print(f"    Download error: {e}")
        return False

def upload_pdf(api_headers: dict, edition_id: str, pdf_path: Path) -> bool:
    try:
        with open(pdf_path, "rb") as f:
            resp = requests.post(
                f"{API_BASE}/assets/upload",
                headers=api_headers,
                data={
                    "edition_id": edition_id,
                    "asset_type": "SCORE_PDF",
                    "rights_confirmed": "true",
                },
                files={"file": (pdf_path.name, f, "application/pdf")},
                timeout=30
            )
        return resp.ok
    except Exception as e:
        print(f"    Upload error: {e}")
        return False

def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Downloading CPDL scores for Corales\n")

    # Auth
    r = requests.post(f"{API_BASE}/login/access-token",
                      data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    r.raise_for_status()
    token = r.json()["access_token"]
    api_headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Logged in\n")

    # Get works without PDF
    r = requests.get(f"{API_BASE}/works/?limit=500", headers=api_headers)
    r.raise_for_status()
    all_works = r.json()

    works_without_pdf = []
    for w in all_works:
        editions = w.get("editions", [])
        if not editions:
            continue  # no edition = can't upload
        has_pdf = any(
            a.get("asset_type", "").upper() in ["PDF", "SCORE_PDF", "SHEET_MUSIC"]
            for ed in editions
            for a in ed.get("assets", [])
        )
        if not has_pdf:
            works_without_pdf.append(w)

    print(f"Works without PDF (with edition): {len(works_without_pdf)}\n")

    tmp_dir = Path("/tmp/cpdl_downloads")
    tmp_dir.mkdir(exist_ok=True)

    found = 0
    not_found = 0
    uploaded = 0
    errors = 0

    for work in works_without_pdf:
        title = work["title"]
        composer = work.get("composer", "")
        edition_id = work["editions"][0]["id"]

        print(f"→ {title} ({composer})")

        # Search CPDL
        pdf_url, matched_slug = cpdl_get_pdf_url(title, composer)
        if not pdf_url:
            print(f"  ✗ Not found in CPDL")
            not_found += 1
            time.sleep(0.8)
            continue

        print(f"  ✓ {matched_slug}: {pdf_url[:70]}...")
        found += 1

        if DRY_RUN:
            time.sleep(0.3)
            continue

        # Download
        safe_name = re.sub(r'[^a-z0-9_]', '_', normalize(title)) + ".pdf"
        dest = tmp_dir / safe_name

        if not download_pdf(pdf_url, dest):
            print(f"  ✗ Download failed or file too small")
            errors += 1
            time.sleep(0.5)
            continue

        # Upload
        if upload_pdf(api_headers, edition_id, dest):
            print(f"  ✓ Uploaded!")
            uploaded += 1
        else:
            print(f"  ✗ Upload failed")
            errors += 1

        time.sleep(0.8)  # be polite to CPDL

    print(f"\n{'='*50}")
    if DRY_RUN:
        print(f"[DRY RUN] Found on CPDL: {found} | Not found: {not_found}")
    else:
        print(f"Uploaded: {uploaded} | Not found: {not_found} | Errors: {errors}")

if __name__ == "__main__":
    main()
