"""
Downloads PDFs from Spanish choral websites for works without a score.

Sources used:
  - Atril Coral (atrilcoral.com)  — siglo_xv.htm, corabach.htm

Usage:
    cd apps/api && source venv/bin/activate
    python scripts/download_web_pdfs.py [--dry-run]
"""
import sys
import re
import time
import requests
from pathlib import Path

API_BASE = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@corales.com"
ADMIN_PASS = "password123"
DRY_RUN = "--dry-run" in sys.argv

ATRIL = "https://www.atrilcoral.com/"
VICTORIA_UMA = "https://victoria.uma.es/pdf/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Referer": "https://www.atrilcoral.com/",
}

# ── Hardcoded matches: (work_title_fragment, composer_fragment, pdf_url) ──────
# Verified manually from atrilcoral.com catalogues
MATCHES = [
    # Palestrina
    ("Sicut cervus",              "Palestrina",      ATRIL + "sicutcer.pdf"),
    ("O bone Jesu",               "Palestrina",      ATRIL + "50obonej.pdf"),
    ("Super flumina Babylonis",   "Palestrina",      ATRIL + "superflu.pdf"),
    ("Ego sum panis vivus",       "Palestrina",      None),  # atrilcoral has Esquivel's version, not Palestrina's
    ("Jesu Rex admirabilis",      "Palestrina",      None),  # not found
    ("Tu es Petrus",              "Palestrina",      None),  # not found
    ("Veni Creator Spiritus",     "Palestrina",      None),  # not found
    # Bruckner
    ("Ave Maria",                 "Bruckner",        ATRIL + "avema_br.pdf"),
    ("Os justi",                  "Bruckner",        None),                     # not on atrilcoral
    ("Virga Jesse",               "Bruckner",        ATRIL + "virga_br.pdf"),
    ("Tantum Ergo",               "Bruckner",        ATRIL + "tantum_b.pdf"),
    ("Ecce sacerdos magnus",      "Bruckner",        None),                     # not found
    # Victoria
    ("Vere languores",            "Victoria",        ATRIL + "29verela.pdf"),
    ("Duo Seraphim",              "Victoria",        VICTORIA_UMA + "Duo_Seraphim.pdf"),
    ("Tenebrae factae sunt",      "Victoria",        VICTORIA_UMA + "TR08-Tenebrae_Factae_Sunt.pdf"),
    # Lassus
    ("Veni Creator Spiritus",     "Lassus",          None),
    ("Tristis est anima mea",     "Lassus",          None),
    ("Musica Dei donum",          "Lassus",          None),
    # Byrd
    ("Ave verum corpus",          "Byrd",            None),
    ("Sing joyfully",             "Byrd",            None),
    ("Justorum animae",           "Byrd",            None),
    # Tallis
    ("O nata lux",                "Tallis",          None),
    ("Spem in alium",             "Tallis",          None),
    # Morley
    ("April is in my mistress face", "Morley",       ATRIL + "aprilis.pdf"),
    ("Now is the month of Maying",   "Morley",       None),
    # Weelkes
    ("As Vesta was",              "Weelkes",         None),
    ("Hark, all ye lovely saints","Weelkes",         None),
    # Gibbons
    ("This is the record of John","Gibbons",         None),
    # Bach
    ("O Haupt voll Blut",         "Bach",            ATRIL + "bach_244_11.pdf"),
    ("Singet dem Herrn",          "Bach",            ATRIL + "Bach_411.pdf"),
    ("Der Geist hilft",           "Bach",            None),
    ("Magnificat BWV 243",        "Bach",            None),
    # Handel
    ("Zadok the Priest",          "Handel",          None),
    ("Dixit Dominus",             "Handel",          None),
    # Mendelssohn
    ("Verleih uns Frieden",       "Mendelssohn",     None),
    ("Hear My Prayer",            "Mendelssohn",     None),
    ("Ehre sei Gott",             "Mendelssohn",     None),
    # Franck / other
    ("Da pacem Domine",           "Franck",          ATRIL + "dapace_f.pdf"),
    ("Tantum ergo",               "Fauré",           None),
    ("Tantum ergo",               "Franck",          None),
    # Saint-Saëns
    ("Tollite Hostias",           "Saint",           ATRIL + "tollite.pdf"),
    # Vivaldi
    ("Nisi Dominus",              "Vivaldi",         None),
    ("Laudate Dominum",           "Vivaldi",         None),
    # Brahms
    ("Zigeunerlieder",            "Brahms",          None),
    # Ireland / Finzi / Elgar
    ("Greater Love",              "Ireland",         None),
    ("God is gone up",            "Finzi",           None),
    ("Lo, the full",              "Finzi",           None),
    ("Give unto the Lord",        "Elgar",           None),
    # Morales / Lobo
    ("Emendemus in melius",       "Morales",         None),
    ("Versa est in luctum",       "Lobo",            None),
    # Praetorius
    ("Puer Natus in Bethlehem",   "Praetorius",      ATRIL + "puerna_p.pdf"),
    # Popular / misc
    ("Hoy comamos y bebamos",     "",                ATRIL + "hoycom_e.pdf"),
    ("Dona nobis pacem",          "Mozart",          None),
    ("Va pensiero",               "Verdi",           None),
    ("All you need is love",      "Beatles",         None),
    ("Nada te turbe",             "Taizé",           None),
    ("Siyahamba",                 "",                None),
    ("Signore delle",             "Marzi",           None),
    ("Kalinka",                   "",                None),
    ("O Tannenbaum",              "",                None),
    ("Les anges dans nos campagnes", "",             None),
    ("Ay mi morena",              "",                None),
    ("Caballero de Gracia",       "",                None),
    ("Gatatumba",                 "",                None),
    ("Hoy comamos y bebamos",     "",                None),
    ("Los Sobrinos",              "",                None),
    ("Madre de siete dolores",    "",                None),
    ("Mazurca de las sombrillas", "",                None),
    ("Misa Brevis",               "Gounod",          None),
    ("Pájaro Triguero",           "",                None),
    ("Salve de Trujillo",         "",                None),
    ("Salve de Covadonga",        "",                None),
]

# Only keep entries with a PDF URL
ACTIONABLE = [(t, c, u) for (t, c, u) in MATCHES if u is not None]


def normalize(s):
    s = s.lower()
    for a, b in [('á','a'),('é','e'),('í','i'),('ó','o'),('ú','u'),
                 ('ä','a'),('ö','o'),('ü','u'),('ñ','n')]:
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9 ]', '', s).strip()


def find_work(works, title_frag, composer_frag):
    """Return work whose title AND composer both contain the fragments."""
    t = normalize(title_frag)
    c = normalize(composer_frag)
    for w in works:
        wt = normalize(w['title'])
        wc = normalize(w.get('composer') or '')
        if t in wt and (not c or c in wc):
            return w
    return None


def download_pdf(url, dest):
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        r.raise_for_status()
        ct = r.headers.get('content-type', '')
        if 'pdf' not in ct and not url.lower().endswith('.pdf'):
            return False
        with open(dest, 'wb') as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return dest.stat().st_size > 5000
    except Exception as e:
        print(f"    Error: {e}")
        return False


def upload_pdf(api_headers, edition_id, pdf_path):
    try:
        with open(pdf_path, 'rb') as f:
            resp = requests.post(
                f"{API_BASE}/assets/upload",
                headers=api_headers,
                data={'edition_id': edition_id, 'asset_type': 'SCORE_PDF', 'rights_confirmed': 'true'},
                files={'file': (pdf_path.name, f, 'application/pdf')},
                timeout=30,
            )
        return resp.ok
    except Exception as e:
        print(f"    Upload error: {e}")
        return False


def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Downloading choral web PDFs for Corales\n")

    r = requests.post(f"{API_BASE}/login/access-token",
                      data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    r.raise_for_status()
    token = r.json()["access_token"]
    api_headers = {"Authorization": f"Bearer {token}"}
    print("✓ Logged in\n")

    r = requests.get(f"{API_BASE}/works/?limit=500", headers=api_headers)
    r.raise_for_status()
    all_works = r.json()

    # Only works without PDF
    works_no_pdf = []
    for w in all_works:
        editions = w.get('editions', [])
        if not editions:
            continue
        has_pdf = any(
            a.get('asset_type', '').upper() in ['PDF', 'SCORE_PDF', 'SHEET_MUSIC']
            for ed in editions for a in ed.get('assets', [])
        )
        if not has_pdf:
            works_no_pdf.append(w)

    print(f"Works without PDF: {len(works_no_pdf)}\n")

    tmp = Path("/tmp/web_pdfs")
    tmp.mkdir(exist_ok=True)

    uploaded = skipped = errors = not_found = 0

    for title_frag, composer_frag, pdf_url in ACTIONABLE:
        work = find_work(works_no_pdf, title_frag, composer_frag)
        if not work:
            # Already has PDF or doesn't exist
            continue

        edition_id = work['editions'][0]['id']
        print(f"→ {work['title']} ({work.get('composer', '')})")
        print(f"  URL: {pdf_url}")

        if DRY_RUN:
            print(f"  [DRY RUN] would download and upload")
            skipped += 1
            time.sleep(0.2)
            continue

        safe = re.sub(r'[^a-z0-9_]', '_', normalize(work['title'])) + ".pdf"
        dest = tmp / safe

        if not download_pdf(pdf_url, dest):
            print(f"  ✗ Download failed")
            errors += 1
            time.sleep(0.5)
            continue

        if upload_pdf(api_headers, edition_id, dest):
            print(f"  ✓ Uploaded ({dest.stat().st_size // 1024} KB)")
            uploaded += 1
        else:
            print(f"  ✗ Upload failed")
            errors += 1

        time.sleep(0.8)

    print(f"\n{'='*50}")
    if DRY_RUN:
        print(f"[DRY RUN] Would process: {skipped} works")
    else:
        print(f"Uploaded: {uploaded} | Errors: {errors}")


if __name__ == "__main__":
    main()
