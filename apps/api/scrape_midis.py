import urllib.parse
"""
Descarga MIDIs de IMSLP para cada obra del catálogo con URL en el CSV,
los divide en 4 pistas SATB con music21 y los importa a la BD.

Flujo por obra:
  1. MediaWiki API → obtener nombres de archivos .mid de la página IMSLP
  2. imageinfo API  → obtener URL de descarga directa
  3. requests       → descargar el .mid
  4. music21        → separar pistas SATB
  5. SQLite         → registrar 4 assets MIDI_{SOPRANO,ALTO,TENOR,BASS}
"""
import sqlite3, csv, time, uuid, re, shutil, os
import requests
from pathlib import Path
from music21 import midi as m21midi, stream, note, chord

DB_PATH   = "corales.db"
CSV_PATH  = "data/obras_biblioteca.csv"
UPLOADS   = Path("data/uploads/editions")
IMSLP_API = "https://imslp.org/api.php"
HEADERS   = {
    "User-Agent": "CoralesApp/1.0 (educational choral software; contact admin@corales.com)",
    "Accept": "*/*",
}

VOICE_ASSET = ["MIDI_SOPRANO", "MIDI_ALTO", "MIDI_TENOR", "MIDI_BASS"]
VOICE_NAME  = ["Soprano", "Alto", "Tenor", "Bass"]

# ── helpers ──────────────────────────────────────────────────────────────────

def get_midi_filenames(page_title):
    """Returns list of .mid filenames linked on the IMSLP page."""
    r = requests.get(IMSLP_API, params={
        "action": "parse", "page": page_title,
        "prop": "links", "format": "json",
    }, headers=HEADERS, timeout=10)
    r.raise_for_status()
    links = r.json().get("parse", {}).get("links", [])
    return [
        lnk["*"].replace("File:", "")
        for lnk in links
        if lnk.get("ns") == 6 and lnk.get("*", "").lower().endswith(".mid")
    ]

def get_download_url(filename):
    """Returns direct download URL for an IMSLP File: page."""
    r = requests.get(IMSLP_API, params={
        "action": "query", "titles": f"File:{filename}",
        "prop": "imageinfo", "iiprop": "url", "format": "json",
    }, headers=HEADERS, timeout=10)
    r.raise_for_status()
    pages = r.json().get("query", {}).get("pages", {})
    for page in pages.values():
        info = page.get("imageinfo", [])
        if info:
            url = info[0].get("url", "")
            return "https:" + url if url.startswith("//") else url
    return None

def download_midi(url: str, dest: Path) -> bool:
    """Downloads a MIDI file. Returns True on success."""
    r = requests.get(url, headers=HEADERS, timeout=20)
    if r.status_code == 200 and len(r.content) > 100:
        dest.write_bytes(r.content)
        return True
    return False

def split_midi_satb(midi_path, edition_dir):
    """
    Splits a MIDI file into up to 4 per-voice MIDIs.
    Returns list of (asset_type, file_path) or None if not enough tracks.
    """
    try:
        mf = m21midi.MidiFile()
        mf.open(str(midi_path))
        mf.read()
        mf.close()
    except Exception as e:
        print(f"      [parse error] {e}")
        return None

    # Filter tracks that have actual note events
    note_tracks = [t for t in mf.tracks if any(
        isinstance(ev, m21midi.MidiEvent) and ev.type in ("NOTE_ON", "NOTE_OFF")
        for ev in t.events
    )]

    if len(note_tracks) == 0:
        return None

    results = []
    # Use up to 4 tracks; if fewer, repeat last track for missing voices
    for i, asset_type in enumerate(VOICE_ASSET):
        track = note_tracks[min(i, len(note_tracks) - 1)]
        new_mf = m21midi.MidiFile()
        new_mf.ticksPerQuarterNote = mf.ticksPerQuarterNote
        # Include tempo track (track 0) + the voice track
        if len(mf.tracks) > 0 and mf.tracks[0] != track:
            new_mf.tracks = [mf.tracks[0], track]
        else:
            new_mf.tracks = [track]

        dest = edition_dir / f"{uuid.uuid4()}.mid"
        try:
            new_mf.open(str(dest), "wb")
            new_mf.write()
            new_mf.close()
            results.append((asset_type, dest))
        except Exception as e:
            print(f"      [write error {asset_type}] {e}")

    return results if results else None

def get_or_create_edition(cur, work_id: str) -> str:
    row = cur.execute("SELECT id FROM editions WHERE work_id=?", (work_id,)).fetchone()
    if row:
        return row[0]
    eid = str(uuid.uuid4())
    cur.execute("INSERT INTO editions (id, work_id, publisher) VALUES (?,?,?)",
                (eid, work_id, "Edición Principal"))
    return eid

def already_has_midis(cur, edition_id: str) -> bool:
    n = cur.execute(
        "SELECT COUNT(*) FROM assets WHERE edition_id=? AND asset_type LIKE 'MIDI%'",
        (edition_id,)
    ).fetchone()[0]
    return n >= 4

# ── main ─────────────────────────────────────────────────────────────────────

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Load works with IMSLP URL that are missing MIDIs
works_with_url = []
with open(CSV_PATH, encoding="utf-8") as f:
    for row in csv.DictReader(f):
        url = row.get("IMSLP URL", "").strip()
        title = row.get("Título", "").strip()
        composer = row.get("Compositor", "").strip()
        if not url:
            continue
        work = cur.execute(
            "SELECT id FROM works WHERE title=? AND composer=?", (title, composer)
        ).fetchone()
        if not work:
            continue
        work_id    = work["id"]
        edition_id = get_or_create_edition(cur, work_id)
        if already_has_midis(cur, edition_id):
            continue
        # Extract page title from URL
        page_title = urllib.parse.unquote(url.replace("https://imslp.org/wiki/", ""))
        works_with_url.append((title, composer, work_id, edition_id, page_title))

conn.commit()
print(f"Obras con URL IMSLP sin MIDIs: {len(works_with_url)}\n")

ok = skipped = 0
tmp_dir = Path("data/uploads/_midi_tmp")
tmp_dir.mkdir(parents=True, exist_ok=True)

for i, (title, composer, work_id, edition_id, page_title) in enumerate(works_with_url):
    print(f"[{i+1:>3}/{len(works_with_url)}] {title[:40]:<40} {composer[:20]}")

    # 1. Get MIDI filenames from IMSLP page
    try:
        midi_files = get_midi_filenames(page_title)
        time.sleep(0.8)
    except Exception as e:
        print(f"      [API error] {e}")
        skipped += 1
        continue

    if not midi_files:
        print(f"      [sin MIDIs en IMSLP]")
        skipped += 1
        continue

    print(f"      MIDIs encontrados: {midi_files}")

    # 2. Try each MIDI file until one downloads and splits correctly
    edition_dir = UPLOADS / edition_id
    edition_dir.mkdir(parents=True, exist_ok=True)
    success = False

    for midi_filename in midi_files:
        try:
            dl_url = get_download_url(midi_filename)
            time.sleep(0.5)
            if not dl_url:
                continue

            tmp_midi = tmp_dir / f"{uuid.uuid4()}.mid"
            if not download_midi(dl_url, tmp_midi):
                print(f"      [descarga fallida] {midi_filename}")
                continue
            time.sleep(0.5)

            # 3. Split into SATB
            parts = split_midi_satb(tmp_midi, edition_dir)
            tmp_midi.unlink(missing_ok=True)

            if not parts:
                print(f"      [sin pistas SATB] {midi_filename}")
                continue

            # 4. Insert assets
            for asset_type, file_path in parts:
                asset_id = str(uuid.uuid4()).replace("-", "")
                cur.execute("""
                    INSERT OR IGNORE INTO assets
                        (id, edition_id, asset_type, file_url, original_filename, processing_status)
                    VALUES (?,?,?,?,?,?)
                """, (asset_id, edition_id, asset_type, str(file_path),
                      f"{asset_type.lower()}_{midi_filename}", "OK"))

            conn.commit()
            print(f"      ✓ {len(parts)} voces importadas ← {midi_filename}")
            ok += 1
            success = True
            break

        except Exception as e:
            print(f"      [error] {e}")

    if not success:
        skipped += 1

    time.sleep(1.0)  # rate limit entre obras

# Cleanup tmp
shutil.rmtree(tmp_dir, ignore_errors=True)
conn.close()

total_midi = sqlite3.connect(DB_PATH).execute(
    "SELECT COUNT(*) FROM assets WHERE asset_type LIKE 'MIDI%'"
).fetchone()[0]

print(f"\n{'='*60}")
print(f"  Obras con MIDIs importados : {ok}")
print(f"  Omitidas (sin MIDI en IMSLP): {skipped}")
print(f"  Total assets MIDI en BD    : {total_midi}")
