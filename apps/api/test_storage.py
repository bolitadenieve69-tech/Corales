
import os
import sys
from pathlib import Path

# Add app directory to sys.path
sys.path.append(str(Path(__file__).parent))

from services.storage import storage_service
from core.config import settings

def test_upload():
    print("--- 🧪 Prueba de Almacenamiento Supabase ---")
    
    if settings.STORAGE_MODE != "supabase":
        print(f"⚠️ El modo de almacenamiento actual es '{settings.STORAGE_MODE}'.")
        print("Cambiando temporalmente a 'supabase' para la prueba...")
        storage_service.mode = "supabase"
    
    # Check variables
    print(f"URL: {settings.SUPABASE_URL}")
    print(f"Bucket: {settings.S3_BUCKET}")
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("❌ ERROR: Faltan las variables SUPABASE_URL o SUPABASE_KEY.")
        return

    # Create a dummy file
    test_filename = "prueba_supabase.txt"
    with open(test_filename, "w") as f:
        f.write("Esta es una prueba de carga desde Corales API a Supabase Storage.")
    
    try:
        print(f"Subiendo {test_filename}...")
        remote_path = f"tests/{test_filename}"
        result_key = storage_service.upload_file(test_filename, remote_path)
        print(f"✅ ¡Carga exitosa! Key guardada: {result_key}")
        
        print("Generando URL firmada (expira en 60s)...")
        signed_url = storage_service.get_file_url(result_key, expires_in=60)
        print(f"🔗 URL: {signed_url}")
        
    except Exception as e:
        print(f"❌ ERROR durante la prueba: {e}")
    finally:
        # Cleanup local file
        if os.path.exists(test_filename):
            os.remove(test_filename)

if __name__ == "__main__":
    test_upload()
