"""
Busca cada obra en la IMSLP MediaWiki API y agrega la URL de la página al CSV.
Rate limit: ~0.8s por petición para no ser bloqueado.
"""
import csv, time, urllib.parse, requests

INPUT_CSV  = "data/obras_biblioteca.csv"
OUTPUT_CSV = "data/obras_biblioteca.csv"

IMSLP_API = "https://imslp.org/api.php"
HEADERS = {"User-Agent": "CoralesApp/1.0 (educational choral software; contact admin@corales.com)"}

def search_imslp(title, composer):
    query = f"{title} {composer}".strip()
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json",
        "srnamespace": 0,
        "srlimit": 3,
    }
    try:
        r = requests.get(IMSLP_API, params=params, headers=HEADERS, timeout=8)
        r.raise_for_status()
        results = r.json().get("query", {}).get("search", [])
        if results:
            page_title = results[0]["title"]
            encoded = urllib.parse.quote(page_title.replace(" ", "_"))
            return f"https://imslp.org/wiki/{encoded}"
    except Exception as e:
        print(f"    ERROR: {e}")
    return None

rows = []
with open(INPUT_CSV, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    original_fields = list(reader.fieldnames)
    rows = list(reader)

if "IMSLP URL" not in original_fields:
    fieldnames = original_fields + ["IMSLP URL"]
else:
    fieldnames = original_fields

print(f"Total obras: {len(rows)}\n")

found = 0
for i, row in enumerate(rows):
    title    = row.get("Titulo", "") or row.get("Título", "")
    composer = row.get("Compositor", "")
    url = search_imslp(title, composer)
    row["IMSLP URL"] = url or ""
    if url:
        found += 1
        marker = "ok"
    else:
        marker = "--"
    print(f"  [{i+1:>3}/{len(rows)}] {marker} {title[:35]:<35} {composer[:25]}")
    time.sleep(0.8)

with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"\nDone — {found}/{len(rows)} obras con URL IMSLP -> {OUTPUT_CSV}")
