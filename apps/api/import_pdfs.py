"""
Importa PDFs de ~/Desktop/Partituras_PDF a la BD y al directorio de uploads.
- DIRECT_IMPORTS: PDFs que ya tienen obra en la BD
- NEW_WORKS: PDFs sin obra en la BD → se crean obra + edición nuevas
"""
import sqlite3, shutil, uuid, os
from pathlib import Path
from datetime import datetime

DB_PATH   = "corales.db"
PDF_DIR   = Path.home() / "Desktop" / "Partituras_PDF"
UPLOADS   = Path("data/uploads/editions")

# Único choir_id existente en la BD
CHOIR_ID = "03b2412e-5900-4045-97cd-1429a7b7b9c7"

# ---------- PDFs → obras existentes en la BD ----------
# (pdf_filename, work_title_en_bd, compositor_en_bd)
DIRECT_IMPORTS = [
    ("Adeste Fideles.pdf",                              "Adeste Fideles",                     "Tradicional austríaca"),
    ("Alleluia.pdf",                                    "Alleluia",                           "William Boyce"),
    ("Boyce_-_Alleluia.pdf",                            "Alleluia",                           "William Boyce"),
    ("Ave Verum con piano.pdf",                         "Ave Verum",                          "W.A. Mozart"),
    ("Dadme Albricias.pdf",                             "Dadme albricias",                    "Cancionero de Palacio"),
    ("Domine Deus.pdf",                                 "Domine deus",                        "J. Haydn"),
    ("Et incarnatus est.pdf",                           "Et incarnatus est",                  "Wolfgang Amadeus Mozart"),
    ("Madrid_Chotis.pdf",                               "Madrid (Chotis)",                    "Agustín Lara"),
    ("Manolito_Chiquito.pdf",                           "Manolito Chiquito",                  "Tradicional de Extremadura"),
    ("O magnum mysterium.pdf",                          "O magnum mysterium",                 "Tomas L. de Victoria"),
    ("O magnum misteryum.pdf",                          "O magnum mysterium",                 "Tomas L. de Victoria"),
    ("Tollite hostias.pdf",                             "Tollite hostias",                    "Camille Saint-Saëns"),
    ("Boga_Boga.pdf",                                   "Boga, boga",                         "Popular Vasca"),
    ("BOGA, BOGA DO M - Arin- SATB.pdf",                "Boga, boga",                         "Popular Vasca"),
    ("Jesus Bleibet Meine Freude-Bach.pdf",             "Jesus Bleibet meine",                "Freude J.S. Bach"),
    ("Stabat Mater 383 Schubert.pdf",                   "Stabat Mater D.383",                 "F. Schubert"),
    ("riu riu chiu.pdf",                                "Riu, riu, chiu",                     "Cancionero de Venecia"),
    ("Panis Angelicus (Cesar Franck) sin solo.pdf",     "Panis Angelicus",                    "César Franck"),
    ("The Lord bless you and keep you-Router.pdf",      "The Lord bless you and keep you",    "John Rutter"),
    ("john-rutter-the-lord-bless-you-and-keep-you.pdf", "The Lord bless you and keep you",    "John Rutter"),
    ("Lacrymosa de Mozart.pdf",                         "Lacrymosa",                          "W.A. Mozart"),
    ("Andreo.pastores-de-extremadura.pdf",              "Pastores de Extremadura",            "Popular de Extremadura"),
    ("Nocturnos de la ventana  Vila-Lorca.pdf",         "Nocturnos de la Ventana",            "Lorca/Vila"),
    ("Ya_se_van_los_quintos_madre.pdf",                 "Ya se van los quintos",              "Tradicional de Cáceres"),
    ("O_Quam_Gloriosum-Sanctus.pdf",                    "O quam gloriosum",                   "Tomás Luis de Victoria"),
    ("gaudeamus_partitura.pdf",                         "Gaudeamus Igitur",                   "Himno Universitario"),
    ("Villancico Vera Caceres.pdf",                     "Villancico de la Vera",              "Tradicional de Cáceres"),
    ("Ave Maria de Shubert 2.pdf",                      "Ave Maria",                          "Franz Schubert"),
    ("Ave Maria - Bach-Gounod (1).pdf",                 "Ave Maria",                          "Franz Schubert"),
    ("Cantique_Racine_con_piano.pdf",                   "Le Cantique de Jean Racine",         "Gabriel Fauré"),
    ("Cantique_Racine_sin_piano.pdf",                   "Le Cantique de Jean Racine",         "Gabriel Fauré"),
    ("Miserere de Lotti.pdf",                           "Miserere",                           "Antonio Lotti"),
    ("Rheinberger_Abendlied.pdf",                       "Abendlied",                          "J. Rheinberger"),
    ("Noche de Paz Fetén.pdf",                         "Noche de paz",                       "Frank Gruber"),
    ("Noche de Paz completa.pdf",                       "Noche de paz",                       "Frank Gruber"),
    ("Noche_de_Paz_Pentatonix.pdf",                     "Noche de paz",                       "Frank Gruber"),
    ("Sanctus Mozart.pdf",                              "Sanctus Benedictus (Misa KV49)",     "W.A. Mozart"),
    ("SanctusMisaKV49.pdf",                             "Sanctus Benedictus (Misa KV49)",     "W.A. Mozart"),
    ("Benedictus_KV_49_Mozart.pdf",                     "Sanctus Benedictus (Misa KV49)",     "W.A. Mozart"),
    ("Perosi sanctus y benedictus.pdf",                 "Benedictus",                         "Lorenzo Perosi"),
    ("Missa Pointificalis Prima de Lorenzo Perosi.pdf", "Benedictus",                         "Lorenzo Perosi"),
    ("El_Rabadan_villancico.pdf",                       "El Rabadán",                         "Tradicional de Extremadura"),
    ("AleluyaMesiascortobodas.pdf",                     "Hallelujah (Messiah)",               "George Frideric Handel"),
    ("Cantata 147 Bach.pdf",                            "Jesu, joy of man's desiring",        "Johann Sebastian Bach"),
    ("O vosvomnes de Victoria.pdf",                     "O Vos omnes",                        "Tomas Luis de Victoria"),
    ("Sancta_Maria_schweitzer-johannes-sancta-maria-3189-106.pdf", "Santa María",            "A. Schweisser"),
    ("Ave Maria de Soler.pdf",                          "Ave María",                          "Tomás Luis de Victoria"),
    ("valva.ave-maria.pdf",                             "Ave María",                          "Tomás Luis de Victoria"),
    ("Jesu_dulcis_memoria. Victoria.pdf",               "Ave María",                          "Tomás Luis de Victoria"),
    ("Gloria in excelsis de Vivaldi-SATB.pdf",          "Gloria",                             "Antonio Vivaldi"),
    ("Angels_Gloria.pdf",                               "Gloria",                             "Antonio Vivaldi"),
    ("MIsa de Difuntos Agnus Dei.pdf",                  "Agnus Dei",                          "Dante Andreo"),
    ("Lacrymosa de Mozart.pdf",                         "Lacrymosa",                          "W.A. Mozart"),
    ("La Virgen es panadera- Albert Alcaraz.pdf",       "Te llevaré",                         "Albert Alcaraz"),
    ("mangelis.pdf",                                    "Panis Angelicus",                    "César Franck"),
]

# ---------- PDFs → obras NUEVAS (no están en la BD) ----------
# (pdf_filename, title, composer, era, genre, language, voice_format)
NEW_WORKS = [
    ("ALFONSINA-Y-EL-MAR-ArielRamirez-Arr.VivianTabbush.pdf",
        "Alfonsina y el Mar", "Ariel Ramírez", "Siglo XX", "Canción", "Español", "SATB"),
    ("Maitechu mia.pdf",
        "Maitechu mía", "Jesús Guridi", "Siglo XX", "Canción vasca", "Euskera", "SATB"),
    ("Maitechu_mia_Alonso.pdf",
        "Maitechu mía", "Jesús Guridi", "Siglo XX", "Canción vasca", "Euskera", "SATB"),
    ("ZORONGO - F. Vila - LA m 4 V.pdf",
        "Zorongo", "Federico Vila", "Siglo XX", "Canción popular", "Español", "SATB"),
    ("A LA NANITA NANA.pdf",
        "A la nanita nana", "Tradicional española", "Tradicional", "Villancico", "Español", "SATB"),
    ("AL FILO DE MEDIA NOCHE.pdf",
        "Al filo de media noche", "Anónimo", "Contemporáneo", "Religioso", "Español", "SATB"),
    ("SALVE REGINA Hilarion Eslava.pdf",
        "Salve Regina", "Hilarión Eslava", "Romanticismo", "Religioso", "Latín", "SATB"),
    ("Confutatis de Mozart.pdf",
        "Confutatis (Réquiem)", "W.A. Mozart", "Clasicismo", "Réquiem", "Latín", "SATB"),
    ("Verbena de la Paloma.pdf",
        "La Verbena de la Paloma", "Tomás Bretón", "Romanticismo", "Zarzuela", "Español", "SATB"),
    ("UKUTHULA bis.PDF",
        "Ukuthula", "Tradicional sudafricana", "Tradicional", "Spiritual", "Zulú", "SATB"),
    ("Oh happy day feten.pdf",
        "Oh Happy Day", "Edwin Hawkins (arr.)", "Contemporáneo", "Gospel", "Inglés", "SATB"),
    ("HAIL HOLY QUEEN M. Shaimann (1).pdf",
        "Hail Holy Queen", "M. Shaimann", "Contemporáneo", "Religioso", "Inglés", "SATB"),
    ("Habanera Don Gil de Alcala.pdf",
        "Habanera (Don Gil de Alcalá)", "Manuel Penella", "Siglo XX", "Zarzuela", "Español", "SATB"),
    ("Himno Centenario de Covadonga.pdf",
        "Himno Centenario de Covadonga", "Tradicional", "Tradicional", "Himno", "Español", "SATB"),
    ("NinnaNannaRussa.pdf",
        "Ninna Nanna Russa", "Tradicional rusa", "Tradicional", "Nana", "Ruso", "SATB"),
    ("ALMA DE DIOS Cancion Hungara JoseSerrano.pdf",
        "Alma de Dios (Canción húngara)", "José Serrano", "Romanticismo", "Zarzuela", "Español", "SATB"),
    ("Albinoni adagio coral.pdf",
        "Adagio (arr. coral)", "Tomaso Albinoni", "Barroco", "Instrumental", "Latín", "SATB"),
    ("garcia-munoz.cantata-extremena-de-la-vera-baja.pdf",
        "Cantata extremeña de la Vera Baja", "García Muñoz", "Contemporáneo", "Cantata", "Español", "SATB"),
    ("garcia-munoz.cantata-extremena-de-la-vera-baja (1).pdf",
        "Cantata extremeña de la Vera Baja", "García Muñoz", "Contemporáneo", "Cantata", "Español", "SATB"),
    ("CORO DE LA AMISTAD.pdf",
        "Coro de la Amistad", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("Coro de repatriados.pdf",
        "Coro de los Repatriados", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("coro repratiados.pdf",
        "Coro de los Repatriados", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("Coro de romanticos.pdf",
        "Coro de los Románticos", "Anónimo", "Romanticismo", "Popular", "Español", "SATB"),
    ("Los vareadores baritono y coro.pdf",
        "Los vareadores", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("Pro Defunctis Introitus.pdf",
        "Pro Defunctis (Introitus)", "Anónimo", "Barroco", "Religioso", "Latín", "SATB"),
    ("Graduale.pdf",
        "Graduale", "Anónimo", "Contemporáneo", "Religioso", "Latín", "SATB"),
    ("Fuga_Bella-coro-de-pobres.pdf",
        "La Bella y el Pobre (Fuga)", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("Wana_Baraka.pdf",
        "Wana Baraka", "Tradicional africana", "Tradicional", "Spiritual", "Swahili", "SATB"),
    ("Por mayo era por mayo.pdf",
        "Por mayo era por mayo", "Tradicional española", "Renacimiento", "Romance", "Español", "SATB"),
    ("Benedicta_es_tu_2nd_of_3_Motetes-Eslava.pdf",
        "Benedicta es tu", "Hilarión Eslava", "Romanticismo", "Motete", "Latín", "SATB"),
    ("Ave_Maria_1st_of_3_Motete_Eslava.pdf",
        "Ave María (Motete)", "Hilarión Eslava", "Romanticismo", "Motete", "Latín", "SATB"),
    ("Ave Maria de Hilarion Eslava.pdf",
        "Ave María (Motete)", "Hilarión Eslava", "Romanticismo", "Motete", "Latín", "SATB"),
    ("Ave Maria de Caccini Bis.pdf",
        "Ave Maria", "Giulio Caccini", "Renacimiento", "Motete", "Latín", "SATB"),
    ("Ave Maria de Soler.pdf",      # also in direct but re-add as new if Soler not in DB separately
        "Ave María", "Padre Soler", "Barroco", "Motete", "Latín", "SATB"),
    ("MIsa de Difuntos Kyrie.pdf",
        "Misa de Difuntos - Kyrie", "Anónimo", "Tradicional", "Réquiem", "Latín", "SATB"),
    ("MIsa de Difuntos Requiem.pdf",
        "Misa de Difuntos - Introitus", "Anónimo", "Tradicional", "Réquiem", "Latín", "SATB"),
    ("MIsa de Difuntos Santus.pdf",
        "Misa de Difuntos - Sanctus", "Anónimo", "Tradicional", "Réquiem", "Latín", "SATB"),
    ("Dime niño.pdf",
        "Dime niño", "Anónimo", "Contemporáneo", "Villancico", "Español", "SATB"),
    ("Maria_la_portuguesa_Cano.pdf",
        "María la portuguesa", "Cano", "Contemporáneo", "Popular", "Español", "SATB"),
    ("AlmaCoryVida.pdf",
        "Alma, corazón y vida", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("silent-night-pentatonix.pdf",
        "Silent Night (arr. Pentatonix)", "Franz Gruber (arr.)", "Contemporáneo", "Villancico", "Inglés", "SATB"),
    ("la del soto del parral_1.pdf",
        "La del Soto del Parral", "Soutullo y Vert", "Romanticismo", "Zarzuela", "Español", "SATB"),
    ("Bach Du Lebensfurst Jesu Christ.pdf",
        "Du Lebensfürst, Herr Jesu Christ", "J.S. Bach", "Barroco", "Coral", "Alemán", "SATB"),
    ("Verbun Caro.pdf",
        "Verbum Caro", "Anónimo", "Renacimiento", "Motete", "Latín", "SATB"),
    ("SANCTUS Los planetas-Holst.pdf",
        "Sanctus (Los Planetas)", "Gustav Holst", "Siglo XX", "Orquestal-coral", "Latín", "SATB"),
    ("Missa_Angelis.pdf",
        "Missa de Angelis", "Canto gregoriano", "Medieval", "Gregoriano", "Latín", "SATB"),
    ("AleluyaMesiascortobodas.pdf",
        "Hallelujah (Mesías, versión bodas)", "G.F. Handel", "Barroco", "Oratorio", "Inglés", "SATB"),
    ("Sanctus de Plaestrina.pdf",
        "Sanctus (Missa Papae Marcelli)", "Giovanni Pierluigi da Palestrina", "Renacimiento", "Misa", "Latín", "SATB"),
    ("bellalola.pdf",
        "Bella Lola", "Anónimo", "Contemporáneo", "Popular", "Español", "SATB"),
    ("contrapunto.pdf",
        "Contrapunto", "Anónimo", "Contemporáneo", "Ejercicio", "Español", "SATB"),
    ("ZORONGO - F. Vila - LA m 4 V.pdf",
        "Zorongo", "Federico Vila", "Siglo XX", "Canción popular", "Español", "SATB"),
    ("Maitechu_mia_Alonso.pdf",
        "Maitechu mía (arr. Alonso)", "Jesús Guridi", "Siglo XX", "Canción vasca", "Euskera", "SATB"),
    ("ALFONSINA-Y-EL-MAR-ArielRamirez-Arr.VivianTabbush.pdf",
        "Alfonsina y el Mar", "Ariel Ramírez", "Siglo XX", "Canción", "Español", "SATB"),
]

# ----------------------------------------------------------------

def get_or_create_edition(cur, work_id):
    row = cur.execute('SELECT id FROM editions WHERE work_id=?', (work_id,)).fetchone()
    if row:
        return row[0]
    eid = str(uuid.uuid4())
    cur.execute('INSERT INTO editions (id, work_id, publisher) VALUES (?,?,?)',
                (eid, work_id, 'Edición Principal'))
    return eid

def add_pdf_asset(cur, edition_id, pdf_src: Path):
    edition_dir = UPLOADS / edition_id
    edition_dir.mkdir(parents=True, exist_ok=True)
    dest_name = str(uuid.uuid4()) + ".pdf"
    dest_path = edition_dir / dest_name
    shutil.copy2(pdf_src, dest_path)
    asset_id = str(uuid.uuid4()).replace('-', '')
    cur.execute('''INSERT OR IGNORE INTO assets
        (id, edition_id, asset_type, file_url, original_filename, processing_status)
        VALUES (?,?,?,?,?,?)''',
        (asset_id, edition_id, 'SCORE_PDF', str(dest_path), pdf_src.name, 'OK'))

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

ok = skipped = created = 0
seen_works = {}  # title+composer → work_id (cache for new works)

print("=== IMPORTACIÓN DIRECTA ===\n")
for pdf_file, title, composer in DIRECT_IMPORTS:
    pdf_src = PDF_DIR / pdf_file
    if not pdf_src.exists():
        print(f"  [FALTA]  {pdf_file}")
        skipped += 1
        continue
    row = cur.execute('SELECT id FROM works WHERE title=? AND composer=?', (title, composer)).fetchone()
    if not row:
        print(f"  [NO BD]  {pdf_file} → '{title}' / '{composer}'")
        skipped += 1
        continue
    work_id    = row['id']
    edition_id = get_or_create_edition(cur, work_id)
    add_pdf_asset(cur, edition_id, pdf_src)
    print(f"  ✓  {pdf_file[:55]:<55} → {title[:35]}")
    ok += 1

print(f"\n=== OBRAS NUEVAS ===\n")
# Deduplicate new works by (title, composer)
processed_new = set()
for pdf_file, title, composer, era, genre, language, vf in NEW_WORKS:
    pdf_src = PDF_DIR / pdf_file
    if not pdf_src.exists():
        print(f"  [FALTA]  {pdf_file}")
        skipped += 1
        continue

    # Skip if same title+composer was already handled as a DIRECT import
    if cur.execute('SELECT id FROM works WHERE title=? AND composer=?', (title, composer)).fetchone():
        # Work already in BD (direct import handled it), just attach
        row = cur.execute('SELECT id FROM works WHERE title=? AND composer=?', (title, composer)).fetchone()
        edition_id = get_or_create_edition(cur, row['id'])
        add_pdf_asset(cur, edition_id, pdf_src)
        print(f"  ✓ (existente)  {pdf_file[:50]:<50} → {title}")
        ok += 1
        continue

    work_key = (title, composer)
    if work_key not in seen_works:
        # Create new work
        work_id = str(uuid.uuid4())
        cur.execute('''INSERT INTO works (id, title, composer, era, genre, language, voice_format, choir_id)
                       VALUES (?,?,?,?,?,?,?,?)''',
                    (work_id, title, composer, era, genre, language, vf, CHOIR_ID))
        seen_works[work_key] = work_id
        created += 1
        print(f"  + NUEVA  '{title}' — {composer}")
    else:
        work_id = seen_works[work_key]

    edition_id = get_or_create_edition(cur, work_id)
    add_pdf_asset(cur, edition_id, pdf_src)
    print(f"  ✓  {pdf_file[:55]:<55} → {title[:35]}")
    ok += 1

conn.commit()
conn.close()

print(f"\n{'='*60}")
print(f"  PDFs importados : {ok}")
print(f"  Obras nuevas    : {created}")
print(f"  Omitidos        : {skipped}")
print(f"  Total works BD  : ", end="")
conn2 = sqlite3.connect(DB_PATH)
print(conn2.execute("SELECT COUNT(*) FROM works").fetchone()[0])
print(f"  Total assets BD : ", end="")
print(conn2.execute("SELECT COUNT(*) FROM assets WHERE asset_type='SCORE_PDF'").fetchone()[0])
conn2.close()
