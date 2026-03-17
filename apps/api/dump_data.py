import sqlite3
import os
import json
from datetime import datetime

DB_PATH = "corales.db"
OUTPUT_PATH = "supabase_migration_data.sql"

def sqlite_to_postgres():
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'alembic_version';")
    tables = [row[0] for row in cursor.fetchall()]

    with open(OUTPUT_PATH, "w") as f:
        f.write("-- Supabase Migration Data Dump\n")
        f.write("-- Generated on: " + datetime.now().isoformat() + "\n\n")
        f.write("BEGIN;\n\n")

        for table in tables:
            print(f"Dumping table: {table}")
            f.write(f"-- Data for table: {table}\n")
            
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [info[1] for info in cursor.fetchall()]
            
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            if not rows:
                continue

            for row in rows:
                values = []
                for val in row:
                    if val is None:
                        values.append("NULL")
                    elif isinstance(val, bool):
                        values.append("true" if val else "false")
                    elif isinstance(val, int):
                        values.append(str(val))
                    elif isinstance(val, str):
                        # Escape single quotes for SQL
                        escaped = val.replace("'", "''")
                        values.append(f"'{escaped}'")
                    else:
                        values.append(f"'{val}'")
                
                col_names = ", ".join(columns)
                val_str = ", ".join(values)
                f.write(f"INSERT INTO {table} ({col_names}) VALUES ({val_str}) ON CONFLICT DO NOTHING;\n")
            
            f.write("\n")

        f.write("COMMIT;\n")

    conn.close()
    print(f"Successfully generated {OUTPUT_PATH}")

if __name__ == "__main__":
    sqlite_to_postgres()
