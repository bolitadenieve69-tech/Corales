"""
Downloads PDFs from Mutopia Project for works without a score in the DB.

Usage:
    cd apps/api && source venv/bin/activate
    python scripts/download_mutopia_pdfs.py [--dry-run]
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
MUTOPIA_BASE = "https://www.mutopiaproject.org"
DRY_RUN = "--dry-run" in sys.argv

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*",
}

# Map common composer names → Mutopia composer codes
COMPOSER_MAP = {
    "bach": "BachJS",
    "handel": "HandelGF",
    "haendel": "HandelGF",
    "händel": "HandelGF",
    "haendel": "HandelGF",
    "mozart": "MozartWA",
    "beethoven": "BeethovenLv",
    "brahms": "BrahmsJ",
    "bruckner": "BrucknerA",
    "schubert": "SchubertF",
    "mendelssohn": "MendelssohnF",
    "victoria": "VictoriaTL",
    "palestrina": "PalestrinaPL",
    "tallis": "TallisT",
    "byrd": "ByrdW",
    "gibbons": "GibbonsO",
    "morley": "MorleyT",
    "weelkes": "WeelkesT",
    "purcell": "PurcellH",
    "vivaldi": "VivaldiA",
    "lassus": "LassusO",
    "lotti": "LottiA",
    "fauré": "FaureG",
    "faure": "FaureG",
    "rutter": "RutterJ",
    "whitacre": "WhitacreE",
    "verdi": "VerdiG",
    "haydn": "HaydnFJ",
    "franck": "FranckC",
    "elgar": "ElgarE",
    "rachmaninoff": "RachmaninovS",
    "rachmaninov": "RachmaninovS",
    "gounod": "GounodC",
    "praetorius": "PraetoriusM",
    "lobo": "LoboA",
    "guerrero": "GuerreroF",
    "morales": "MoralesC",
}


def normalize(t: str) -> str:
    t = t.lower()
    t = re.sub(r'[_\-]', ' ', t)
    for a, b in [('á','a'),('é','e'),('í','i'),('ó','o'),('ú','u'),
                 ('ä','a'),('ë','e'),('ï','i'),('ö','o'),('ü','u'),
                 ('ñ','n'),('ç','c'),('æ','ae'),('ø','o'),('å','a')]:
        t = t.replace(a, b)
    t = re.sub(r'[^a-z0-9 ]', '', t)
    return t.strip()


def sim(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def get_composer_code(composer: str) -> str:
    comp_norm = normalize(composer)
    for key, code in COMPOSER_MAP.items():
        if key in comp_norm:
            return code
    return None


def mutopia_search(title: str, composer: str):
    """Search Mutopia for a work. Returns (pdf_url, folder) or (None, None)."""
    # Try title + optional composer filter
    queries = [normalize(title).replace(' ', '+')]
    comp_code = get_composer_code(composer)

    for query in queries:
        url = f"{MUTOPIA_BASE}/cgibin/make-table.cgi?searchingfor={query}&Composer=&Instrument=&Style=&collection=&id=&mtype=&preview=&timelimit=0&orderby=d&preview="
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            if r.status_code != 200:
                continue

            # PDFs are listed directly as absolute URLs in search results
            a4_pdfs = re.findall(
                r'href="(https://www\.mutopiaproject\.org/ftp/[^"]*-a4\.pdf)"',
                r.text, re.IGNORECASE
            )
            all_pdfs = re.findall(
                r'href="(https://www\.mutopiaproject\.org/ftp/[^"]*\.pdf)"',
                r.text, re.IGNORECASE
            )

            pdfs = a4_pdfs or all_pdfs
            if not pdfs:
                continue

            # Filter by composer code if known — reject if wrong composer
            if comp_code:
                comp_pdfs = [p for p in pdfs if f'/ftp/{comp_code}/' in p]
                if not comp_pdfs:
                    continue  # results found but wrong composer
                pdfs = comp_pdfs

            # Pick best match by folder name similarity to title
            best_pdf = pdfs[0]
            best_score = 0
            for pdf in pdfs:
                folder = pdf.split('/')[-2].replace('-', ' ').replace('_', ' ')
                s = sim(title, folder)
                if s > best_score:
                    best_score = s
                    best_pdf = pdf

            folder = best_pdf.split('/')[-2]
            return best_pdf, folder

        except Exception:
            continue

    return None, None


def download_pdf(url: str, dest_path: Path) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        r.raise_for_status()
        content_type = r.headers.get("content-type", "")
        if "pdf" not in content_type and not url.lower().endswith(".pdf"):
            return False
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        return dest_path.stat().st_size > 5000
    except Exception as e:
        return False


def upload_pdf(api_headers: dict, edition_id: str, pdf_path: Path) -> bool:
    try:
        with open(pdf_path, "rb") as f:
            resp = requests.post(
                f"{API_BASE}/assets/upload",
                headers=api_headers,
                data={"edition_id": edition_id, "asset_type": "SCORE_PDF", "rights_confirmed": "true"},
                files={"file": (pdf_path.name, f, "application/pdf")},
                timeout=30,
            )
        return resp.ok
    except Exception:
        return False


def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Downloading Mutopia scores for Corales\n")

    r = requests.post(f"{API_BASE}/login/access-token",
                      data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    r.raise_for_status()
    token = r.json()["access_token"]
    api_headers = {"Authorization": f"Bearer {token}"}
    print("✓ Logged in\n")

    r = requests.get(f"{API_BASE}/works/?limit=500", headers=api_headers)
    r.raise_for_status()
    all_works = r.json()

    works_without_pdf = []
    for w in all_works:
        editions = w.get("editions", [])
        if not editions:
            continue
        has_pdf = any(
            a.get("asset_type", "").upper() in ["PDF", "SCORE_PDF", "SHEET_MUSIC"]
            for ed in editions for a in ed.get("assets", [])
        )
        if not has_pdf:
            works_without_pdf.append(w)

    print(f"Works without PDF (with edition): {len(works_without_pdf)}\n")

    tmp_dir = Path("/tmp/mutopia_downloads")
    tmp_dir.mkdir(exist_ok=True)

    found = uploaded = not_found = errors = 0

    for work in works_without_pdf:
        title = work["title"]
        composer = work.get("composer", "")
        edition_id = work["editions"][0]["id"]

        print(f"→ {title} ({composer})")

        pdf_url, piece_link = mutopia_search(title, composer)
        if not pdf_url:
            print(f"  ✗ Not in Mutopia")
            not_found += 1
            time.sleep(0.5)
            continue

        print(f"  ✓ {piece_link} → {pdf_url[:60]}...")
        found += 1

        if DRY_RUN:
            time.sleep(0.3)
            continue

        safe_name = re.sub(r'[^a-z0-9_]', '_', normalize(title)) + ".pdf"
        dest = tmp_dir / safe_name

        if not download_pdf(pdf_url, dest):
            print(f"  ✗ Download failed")
            errors += 1
            time.sleep(0.5)
            continue

        if upload_pdf(api_headers, edition_id, dest):
            print(f"  ✓ Uploaded ({dest.stat().st_size // 1024}KB)")
            uploaded += 1
        else:
            print(f"  ✗ Upload failed")
            errors += 1

        time.sleep(1.0)

    print(f"\n{'='*50}")
    if DRY_RUN:
        print(f"[DRY RUN] Found: {found} | Not found: {not_found}")
        print("Remove --dry-run to download and upload.")
    else:
        print(f"Uploaded: {uploaded} | Not found: {not_found} | Errors: {errors}")


if __name__ == "__main__":
    main()
