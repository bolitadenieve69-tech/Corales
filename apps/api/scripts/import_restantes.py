"""
Import PDFs from Desktop/PARTITURAS_RESTANTES into the Corales library.

- PDFs that match an existing work (fuzzy) → upload as SCORE_PDF (skip if already has one)
- PDFs with no match → create new work + edition, then upload
- Duplicate filenames in folder → deduplicated by normalised stem (only first kept)

Usage:
    cd apps/api && source venv/bin/activate
    python scripts/import_restantes.py [--dry-run]
"""
import sys
import re
import requests
from pathlib import Path
from difflib import SequenceMatcher

# ── Config ────────────────────────────────────────────────────────────────────
PDF_DIR      = "/Users/angelguerraiglesias/Desktop/PARTITURAS_RESTANTES"
API_BASE     = "http://localhost:8000/api/v1"
ADMIN_EMAIL  = "admin@corales.com"
ADMIN_PASS   = "password123"
CHOIR_ID     = "b262dcb3-9f19-46af-9fe3-397d520149ac"   # Coro Corales
THRESHOLD    = 0.55
DRY_RUN      = "--dry-run" in sys.argv

# ── Normalise helpers ─────────────────────────────────────────────────────────
def normalise(text: str) -> str:
    t = text.lower()
    t = re.sub(r'[_\-\.+]', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    for src, dst in [('á','a'),('é','e'),('í','i'),('ó','o'),('ú','u'),
                     ('ä','a'),('ë','e'),('ï','i'),('ö','o'),('ü','u'),
                     ('ñ','n'),('ç','c'),('è','e'),('à','a'),('â','a'),
                     ('ê','e'),('î','i'),('ô','o'),('û','u')]:
        t = t.replace(src, dst)
    t = re.sub(r'[^a-z0-9 ]', '', t)
    return t.strip()

def sim(a: str, b: str) -> float:
    return SequenceMatcher(None, normalise(a), normalise(b)).ratio()

# ── Extract title / composer from filename ────────────────────────────────────
# Remove common noise suffixes before trying to split title / composer
_NOISE = re.compile(
    r'\b(arr?|arreglo|arrangem?ent|mixed ?choir|piano ?only|con ?piano|'
    r'sin ?piano|voces|satb|ssatb|ssaattbb|ttbb|men|women|feten|fetén|'
    r'a ?[2-8]|no\.?\s*\d+|op\.?\s*\d+|bwv\s*\d+|kv\s*\d+|wab\s*\d+|'
    r'original|apocrifo|apócrifo|victoria|vitoria)\b',
    re.I
)

def parse_title_composer(stem: str):
    """Best-effort extraction of (title, composer) from a filename stem."""
    # Remove underscores / hyphens used as separators
    clean = re.sub(r'[_\-]', ' ', stem).strip()
    # Remove noise tokens
    clean = _NOISE.sub('', clean)
    clean = re.sub(r'\s{2,}', ' ', clean).strip()

    # Heuristic: if last word looks like a surname (capitalised, >3 chars)
    # and the rest looks like a title, split there.
    parts = clean.split()
    if len(parts) >= 3:
        last = parts[-1]
        if last[0].isupper() and len(last) > 3 and last.isalpha():
            title     = ' '.join(parts[:-1]).title()
            composer  = last
            return title, composer

    return clean.title(), None


# ── Collect unique PDF files ──────────────────────────────────────────────────
def collect_pdfs():
    folder = Path(PDF_DIR)
    seen   = {}   # normalised_stem → Path

    for p in sorted(folder.iterdir()):
        if p.is_dir():
            continue
        # Accept .pdf extension or files that start with PDF magic bytes
        if p.suffix.lower() == '.pdf':
            is_pdf = True
        elif p.suffix == '':
            try:
                is_pdf = p.read_bytes(4) == b'%PDF'
            except Exception:
                is_pdf = False
        else:
            is_pdf = False

        if not is_pdf:
            continue

        stem_key = normalise(p.stem if p.suffix else p.name)
        if stem_key not in seen:
            seen[stem_key] = p

    return list(seen.values())


# ── Best match against existing works ────────────────────────────────────────
def best_match(pdf_path: Path, works: list):
    stem = pdf_path.stem if pdf_path.suffix else pdf_path.name
    stem_n = normalise(stem)

    best_work  = None
    best_score = 0.0

    for w in works:
        title_n    = normalise(w['title'])
        composer_n = normalise(w.get('composer') or '')

        s_title = sim(stem_n, title_n)
        # bonus if composer surname appears in stem
        if composer_n:
            for part in composer_n.split():
                if len(part) > 3 and part in stem_n:
                    s_title = min(1.0, s_title + 0.10)
                    break
        s_combined = sim(stem_n, f"{title_n} {composer_n}")
        score = max(s_title, s_combined)

        if score > best_score:
            best_score = score
            best_work  = w

    return best_work, best_score


# ── Upload PDF to an existing edition ────────────────────────────────────────
def upload_pdf(pdf_path: Path, edition_id: str, headers: dict) -> bool:
    with open(pdf_path, 'rb') as f:
        resp = requests.post(
            f"{API_BASE}/assets/upload",
            headers=headers,
            data={'edition_id': edition_id, 'asset_type': 'SCORE_PDF',
                  'rights_confirmed': 'true'},
            files={'file': (pdf_path.name, f, 'application/pdf')}
        )
    return resp.ok, resp


# ── Create new work (auto-creates edition) ────────────────────────────────────
def create_work(title: str, composer, headers: dict):
    payload = {"title": title, "choir_id": CHOIR_ID}
    if composer:
        payload["composer"] = composer
    resp = requests.post(f"{API_BASE}/works/", headers=headers, json=payload)
    if not resp.ok:
        return None, resp
    return resp.json(), resp


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    tag = "[DRY RUN] " if DRY_RUN else ""
    print(f"{tag}Importing PDFs from PARTITURAS_RESTANTES\n")

    # Auth
    r = requests.post(f"{API_BASE}/login/access-token",
                      data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    r.raise_for_status()
    token   = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Logged in\n")

    # Fetch all works
    r = requests.get(f"{API_BASE}/works/?limit=500", headers=headers)
    r.raise_for_status()
    works = r.json()
    print(f"✓ {len(works)} works in library")

    # Collect PDFs (deduplicated)
    pdfs = collect_pdfs()
    print(f"✓ {len(pdfs)} unique PDFs found in folder\n")
    print("=" * 60)

    uploaded    = 0
    skipped     = 0
    created_new = 0
    errors      = 0

    for pdf_path in sorted(pdfs, key=lambda p: p.name.lower()):
        work, score = best_match(pdf_path, works)

        # ── Matched to existing work ──────────────────────────────────────
        if score >= THRESHOLD and work:
            work_id = work['id']
            r = requests.get(f"{API_BASE}/works/{work_id}", headers=headers)
            if not r.ok:
                print(f"  ✗ Cannot fetch {work['title']}: {r.status_code}")
                errors += 1
                continue

            detail   = r.json()
            editions = detail.get('editions', [])
            if not editions:
                print(f"  ⚠ No edition for '{work['title']}' – skipping")
                skipped += 1
                continue

            edition_id = editions[0]['id']
            has_pdf    = any(
                a.get('asset_type','').upper() in ['PDF','SCORE_PDF','SHEET_MUSIC']
                for a in editions[0].get('assets', [])
            )

            if has_pdf:
                print(f"  → [{score:.2f}] SKIP (ya tiene PDF): '{work['title']}'  ← {pdf_path.name}")
                skipped += 1
                continue

            print(f"  ↑ [{score:.2f}] '{pdf_path.name}'  →  '{work['title']}'")
            if not DRY_RUN:
                ok, resp = upload_pdf(pdf_path, edition_id, headers)
                if ok:
                    uploaded += 1
                    size_kb = pdf_path.stat().st_size // 1024
                    print(f"       ✓ Subido ({size_kb} KB)")
                else:
                    print(f"       ✗ Error {resp.status_code}: {resp.text[:80]}")
                    errors += 1
            else:
                uploaded += 1

        # ── No match → create new work ────────────────────────────────────
        else:
            stem  = pdf_path.stem if pdf_path.suffix else pdf_path.name
            title, composer = parse_title_composer(stem)
            hint  = f"(best guess: '{work['title']}' {score:.2f})" if work else ""
            print(f"  + NUEVA OBRA: '{title}' / {composer or 'compositor desconocido'}  ← {pdf_path.name}  {hint}")

            if not DRY_RUN:
                new_work, resp = create_work(title, composer, headers)
                if new_work is None:
                    print(f"       ✗ No se pudo crear la obra: {resp.status_code} {resp.text[:80]}")
                    errors += 1
                    continue

                # Work auto-creates a default edition
                works.append(new_work)   # add to local list to avoid re-creating
                editions = new_work.get('editions', [])
                if not editions:
                    # fetch detail
                    rd = requests.get(f"{API_BASE}/works/{new_work['id']}", headers=headers)
                    editions = rd.json().get('editions', []) if rd.ok else []

                if not editions:
                    print(f"       ✗ No edition created for '{title}'")
                    errors += 1
                    continue

                edition_id = editions[0]['id']
                ok, resp   = upload_pdf(pdf_path, edition_id, headers)
                if ok:
                    created_new += 1
                    size_kb = pdf_path.stat().st_size // 1024
                    print(f"       ✓ Creada + subida ({size_kb} KB)")
                else:
                    print(f"       ✗ Upload error {resp.status_code}: {resp.text[:80]}")
                    errors += 1
            else:
                created_new += 1

    print("\n" + "=" * 60)
    print(f"Subidas a obras existentes : {uploaded}")
    print(f"Obras nuevas creadas       : {created_new}")
    print(f"Saltadas (ya tenían PDF)   : {skipped}")
    print(f"Errores                    : {errors}")
    if DRY_RUN:
        print("\n[DRY RUN] Nada se ha guardado. Elimina --dry-run para ejecutar.")


if __name__ == "__main__":
    main()
