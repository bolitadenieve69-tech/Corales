import sqlite3

columns_to_add = [
    ("avatar_url", "VARCHAR"),
    ("bio", "VARCHAR"),
    ("favorite_voice", "VARCHAR"),
    ("dni", "VARCHAR"),
    ("phone", "VARCHAR"),
    ("has_whatsapp", "BOOLEAN DEFAULT 0"),
    ("address", "VARCHAR")
]

conn = sqlite3.connect("corales.db")
c = conn.cursor()

for col, dtype in columns_to_add:
    try:
        c.execute(f"ALTER TABLE users ADD COLUMN {col} {dtype}")
        print(f"Added column {col}")
    except sqlite3.OperationalError as e:
        print(f"Skipping {col}: {e}")

conn.commit()
conn.close()
print("Done fixing users table")
