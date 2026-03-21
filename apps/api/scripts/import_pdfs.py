"""
Script to match and import local PDF scores to works in the database.

Usage:
    cd apps/api && source venv/bin/activate
    python scripts/import_pdfs.py [--dry-run]
"""
import sys
import os
import re
import json
import shutil
import uuid
import requests
from pathlib import Path
from difflib import SequenceMatcher

# ── Config ────────────────────────────────────────────────────────────────────
PDF_DIRS = [
    "/Users/angelguerraiglesias/Desktop/ORDENADOR ANTIGUO/Partituras Nuevas Propuestas/PARTITURAS TABLET",
    "/Users/angelguerraiglesias/Desktop/ORDENADOR ANTIGUO/Partituras Nuevas Propuestas",
]
API_BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@corales.com"
ADMIN_PASS = "password123"
SCORE_THRESHOLD = 0.72   # minimum fuzzy match score to auto-link
DRY_RUN = "--dry-run" in sys.argv

# ── Helpers ───────────────────────────────────────────────────────────────────
def normalize(text: str) -> str:
    """Lowercase, remove accents-ish, strip noise."""
    t = text.lower()
    t = re.sub(r'[_\-+]', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    t = t.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')
    t = t.replace('ä','a').replace('ë','e').replace('ï','i').replace('ö','o').replace('ü','u')
    t = t.replace('ñ','n').replace('ç','c')
    t = re.sub(r'[^a-z0-9 ]', '', t)
    return t.strip()

def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()

def best_match(pdf_name: str, works: list) -> tuple:
    """Return (work, score) for the best matching work."""
    # Filename → try to extract title (before composer hint)
    stem = Path(pdf_name).stem
    stem_norm = normalize(stem)

    best_work = None
    best_score = 0.0

    for w in works:
        title_norm = normalize(w['title'])
        composer_norm = normalize(w.get('composer') or '')

        # Score against title
        s_title = similarity(stem_norm, title_norm)
        # Bonus if composer also appears in stem
        if composer_norm and any(part in stem_norm for part in composer_norm.split() if len(part) > 3):
            s_title = min(1.0, s_title + 0.15)
        # Score against "title composer" combined
        combined = f"{title_norm} {composer_norm}"
        s_combined = similarity(stem_norm, combined)

        score = max(s_title, s_combined)

        if score > best_score:
            best_score = score
            best_work = w

    return best_work, best_score

# ── Collect unique PDFs (prefer TABLET folder, deduplicate by stem) ───────────
def collect_pdfs():
    seen_stems = {}  # stem_norm → path (prefer first dir = TABLET)
    for pdf_dir in PDF_DIRS:
        for pdf_path in sorted(Path(pdf_dir).glob("*.pdf")):
            stem = normalize(pdf_path.stem)
            if stem not in seen_stems:
                seen_stems[stem] = pdf_path
    return list(seen_stems.values())

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Importing PDFs into Corales\n")

    # 1. Auth
    r = requests.post(f"{API_BASE}/login/access-token",
                      data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    r.raise_for_status()
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Logged in as {ADMIN_EMAIL}")

    # 2. Fetch works + editions (we need edition IDs to upload assets)
    r = requests.get(f"{API_BASE}/works/?limit=500", headers=headers)
    r.raise_for_status()
    works = r.json()
    print(f"✓ {len(works)} works fetched from API")

    # Filter works that already have a PDF asset
    r2 = requests.get(f"{API_BASE}/works/?limit=500", headers=headers)
    # We'll check per-work below when we upload

    # 3. Collect PDFs
    pdfs = collect_pdfs()
    print(f"✓ {len(pdfs)} unique PDFs found\n")

    matched = []
    unmatched = []

    for pdf_path in sorted(pdfs):
        work, score = best_match(pdf_path.name, works)
        if score >= SCORE_THRESHOLD and work:
            matched.append((pdf_path, work, score))
        else:
            unmatched.append((pdf_path, work, score))

    print(f"=== MATCHED ({len(matched)}) ===")
    for pdf_path, work, score in sorted(matched, key=lambda x: -x[2]):
        print(f"  [{score:.2f}] {pdf_path.name} → {work['title']} ({work.get('composer','')})")

    print(f"\n=== UNMATCHED ({len(unmatched)}) ===")
    for pdf_path, work, score in unmatched:
        best_hint = f"best: {work['title']} ({score:.2f})" if work else "no candidates"
        print(f"  {pdf_path.name} ({best_hint})")

    if DRY_RUN:
        print("\n[DRY RUN] No files uploaded. Remove --dry-run to proceed.")
        return

    # 4. Upload matched PDFs
    print(f"\n=== UPLOADING {len(matched)} PDFs ===")
    uploaded = 0
    skipped = 0
    errors = 0

    for pdf_path, work, score in matched:
        work_id = work['id']

        # Get work detail to find edition and check existing PDFs
        r = requests.get(f"{API_BASE}/works/{work_id}", headers=headers)
        if not r.ok:
            print(f"  ✗ Could not fetch work {work['title']}: {r.status_code}")
            errors += 1
            continue

        work_detail = r.json()
        editions = work_detail.get('editions', [])
        if not editions:
            print(f"  ⚠ No edition for {work['title']} — skipping")
            skipped += 1
            continue

        edition_id = editions[0]['id']

        # Check if already has a SCORE_PDF
        existing_assets = editions[0].get('assets', [])
        already_has_pdf = any(
            a.get('asset_type', '').upper() in ['PDF', 'SCORE_PDF', 'SHEET_MUSIC']
            for a in existing_assets
        )
        if already_has_pdf:
            print(f"  → Already has PDF: {work['title']} — skipping")
            skipped += 1
            continue

        # Upload
        with open(pdf_path, 'rb') as f:
            resp = requests.post(
                f"{API_BASE}/assets/upload",
                headers=headers,
                data={
                    'edition_id': edition_id,
                    'asset_type': 'SCORE_PDF',
                    'rights_confirmed': 'true',
                },
                files={'file': (pdf_path.name, f, 'application/pdf')}
            )

        if resp.ok:
            print(f"  ✓ [{score:.2f}] {pdf_path.name} → {work['title']}")
            uploaded += 1
        else:
            print(f"  ✗ {pdf_path.name} → {work['title']}: {resp.status_code} {resp.text[:80]}")
            errors += 1

    print(f"\n✓ Done: {uploaded} uploaded, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    main()
