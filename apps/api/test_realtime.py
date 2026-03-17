
import sqlite3
import uuid
from datetime import datetime

# NB: This script assumes you are still on SQLite for local dev
# but the recipient would see it in Supabase if you are connected.

def send_test_notification():
    print("--- 🔔 Prueba de Realtime (Notificación) ---")
    print("Este script inserta un mensaje de prueba en la tabla 'directfeedback'.")
    print("Si tienes el frontend abierto con useRealtime, deberías ver el log.")
    
    # We'll just generate the SQL or use the existing DB
    # For now, let's just print the SQL to be run in Supabase
    
    msg_id = uuid.uuid4().hex
    sender_id = "test-sender"
    recipient_id = "test-recipient"
    choir_id = "test-choir"
    content = f"¡Prueba de Realtime! Enviado a las {datetime.now().strftime('%H:%M:%S')}"
    
    sql = f"""
INSERT INTO directfeedback (id, sender_id, recipient_id, choir_id, content, created_at, updated_at)
VALUES ('{msg_id}', '{sender_id}', '{recipient_id}', '{choir_id}', '{content}', now(), now());
    """
    
    print("\nEjecuta esto en tu SQL Editor de Supabase para disparar el Realtime:")
    print(sql)

if __name__ == "__main__":
    send_test_notification()
