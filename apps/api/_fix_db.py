import sqlite3

columns_to_add = [
    ("max_users", "INTEGER DEFAULT 50"),
    ("social_address", "VARCHAR"),
    ("director_name", "VARCHAR"),
    ("director_phone", "VARCHAR"),
    ("subdirector_name", "VARCHAR"),
    ("subdirector_phone", "VARCHAR"),
    ("president_name", "VARCHAR"),
    ("president_phone", "VARCHAR"),
    ("president_has_whatsapp", "BOOLEAN DEFAULT 0"),
    ("president_email", "VARCHAR"),
    ("secretary_name", "VARCHAR"),
    ("secretary_phone", "VARCHAR"),
    ("secretary_has_whatsapp", "BOOLEAN DEFAULT 0"),
    ("secretary_email", "VARCHAR"),
    ("treasurer_name", "VARCHAR"),
    ("treasurer_phone", "VARCHAR"),
    ("treasurer_has_whatsapp", "BOOLEAN DEFAULT 0"),
    ("treasurer_email", "VARCHAR"),
    ("other_info", "VARCHAR"),
    ("logo_url", "VARCHAR"),
    ("cover_photo_url", "VARCHAR")
]

conn = sqlite3.connect("corales.db")
c = conn.cursor()

for col, dtype in columns_to_add:
    try:
        c.execute(f"ALTER TABLE choirs ADD COLUMN {col} {dtype}")
        print(f"Added column {col}")
    except sqlite3.OperationalError as e:
        print(f"Skipping {col}: {e}")

conn.commit()
conn.close()
print("Done fixing db")
