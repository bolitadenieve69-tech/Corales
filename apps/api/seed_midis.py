"""
seed_midis.py — Importacion masiva de MIDIs por voz a la BD de Corales.

Uso:
    python seed_midis.py

Estructura de carpetas esperada:
    midis/
        Abendlied/
            soprano.mid
            alto.mid
            tenor.mid
            bajo.mid       (o bass.mid)
        Ave Verum/
            soprano.mid
            ...

El script busca ediciones en la BD por titulo de obra (case-insensitive, sin tildes)
e inserta los assets apuntando a los archivos copiados en data/uploads/editions/.

Modo dry-run (no modifica nada):
    python seed_midis.py --dry-run
"""

import argparse
import shutil
import sqlite3
import unicodedata
import uuid
from pathlib import Path

# ── Configuración ────────────────────────────────────────────────────────────
DB_PATH      = "corales.db"
MIDIS_DIR    = Path("midis")          # carpeta con subcarpetas por obra
UPLOADS_DIR  = Path("data/uploads/editions")

VOICE_FILENAMES = {
    # Acepta cualquiera de estos nombres de archivo para cada voz
    'MIDI_SOPRANO': ['soprano.mid', 'soprano.midi', 's.mid'],
    'MIDI_ALTO':    ['alto.mid', 'alto.midi', 'a.mid'],
    'MIDI_TENOR':   ['tenor.mid', 'tenor.midi', 't.mid'],
    'MIDI_BASS':    ['bajo.mid', 'bass.mid', 'bajo.midi', 'bass.midi', 'b.mid'],
}
# ─────────────────────────────────────────────────────────────────────────────


def normalize(text: str) -> str:
    """Quita tildes y pasa a minúsculas para comparación fuzzy."""
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


def find_edition_id(cur, work_folder_name: str):
    """Busca edition_id por título de obra (coincidencia parcial, sin tildes)."""
    target = normalize(work_folder_name)
    rows = cur.execute(
        "SELECT e.id, w.title FROM editions e JOIN works w ON e.work_id = w.id"
    ).fetchall()
    for edition_id, title in rows:
        if normalize(title) == target or target in normalize(title):
            return edition_id
    return None


def asset_exists(cur, edition_id: str, asset_type: str) -> bool:
    row = cur.execute(
        "SELECT 1 FROM assets WHERE edition_id = ? AND asset_type = ?",
        (edition_id, asset_type)
    ).fetchone()
    return row is not None


def import_midi(cur, conn, edition_id: str, asset_type: str,
                src_path: Path, dry_run: bool) -> bool:
    """Copia el archivo y crea el registro de asset."""
    dest_dir = UPLOADS_DIR / edition_id
    dest_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4()}.mid"
    dest_path = dest_dir / unique_name

    if not dry_run:
        shutil.copy2(src_path, dest_path)
        asset_id = uuid.uuid4().hex
        cur.execute(
            """INSERT INTO assets
               (id, edition_id, asset_type, file_url, original_filename, processing_status)
               VALUES (?, ?, ?, ?, ?, 'OK')""",
            (asset_id, edition_id, asset_type, str(dest_path), src_path.name)
        )
        conn.commit()
    return True


def main():
    parser = argparse.ArgumentParser(description="Importar MIDIs SATB a Corales")
    parser.add_argument('--dry-run', action='store_true',
                        help="Muestra qué haría sin modificar nada")
    parser.add_argument('--midis-dir', default=str(MIDIS_DIR),
                        help=f"Carpeta raíz con subcarpetas por obra (default: {MIDIS_DIR})")
    parser.add_argument('--skip-existing', action='store_true', default=True,
                        help="Omite assets que ya existen (default: True)")
    args = parser.parse_args()

    midis_dir = Path(args.midis_dir)
    if not midis_dir.exists():
        print(f"✗ No se encontró la carpeta: {midis_dir}")
        print("  Crea la carpeta 'midis/' con subcarpetas por nombre de obra.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    stats = {'found': 0, 'imported': 0, 'skipped': 0, 'not_matched': 0}

    for work_dir in sorted(midis_dir.iterdir()):
        if not work_dir.is_dir():
            continue

        edition_id = find_edition_id(cur, work_dir.name)
        if not edition_id:
            print(f"  ? No encontrado en BD: '{work_dir.name}'")
            stats['not_matched'] += 1
            continue

        stats['found'] += 1
        print(f"\n  {work_dir.name} → edition {edition_id[:8]}...")

        for asset_type, filenames in VOICE_FILENAMES.items():
            # Busca el archivo de esta voz
            src = next(
                (work_dir / fn for fn in filenames if (work_dir / fn).exists()),
                None
            )
            if not src:
                print(f"    - {asset_type:<16} sin archivo")
                continue

            if args.skip_existing and asset_exists(cur, edition_id, asset_type):
                print(f"    ~ {asset_type:<16} ya existe, omitido")
                stats['skipped'] += 1
                continue

            ok = import_midi(cur, conn, edition_id, asset_type, src, args.dry_run)
            label = '[DRY]' if args.dry_run else '✓'
            print(f"    {label} {asset_type:<16} ← {src.name}")
            if ok:
                stats['imported'] += 1

    conn.close()

    print(f"""
─────────────────────────────────────
Resumen {'(DRY RUN) ' if args.dry_run else ''}
  Obras encontradas en BD : {stats['found']}
  Assets importados       : {stats['imported']}
  Omitidos (ya existían)  : {stats['skipped']}
  Obras sin coincidencia  : {stats['not_matched']}
─────────────────────────────────────""")


if __name__ == '__main__':
    main()
