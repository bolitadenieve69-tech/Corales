
import os
import httpx
import time
from typing import Optional, Dict, Any
from core.config import settings

class SupabaseStorage:
    """
    Minimalist Supabase Storage client using httpx.
    Avoids native SDK dependencies to bypass build issues.
    """
    def __init__(self):
        self.url = f"{settings.SUPABASE_URL}/storage/v1"
        self.key = settings.SUPABASE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}"
        }

    def upload_file(self, bucket: str, remote_path: str, local_path: str) -> str:
        """Uploads a file to a Supabase bucket."""
        url = f"{self.url}/object/{bucket}/{remote_path}"
        
        with open(local_path, 'rb') as f:
            content = f.read()
            
        with httpx.Client() as client:
            # Note: We use upsert=true by default for simplicity in Corales
            response = client.post(
                url, 
                content=content, 
                headers={**self.headers, "x-upsert": "true"}
            )
            response.raise_for_status()
            return f"{bucket}/{remote_path}"

    def get_public_url(self, bucket: str, remote_path: str) -> str:
        """Gets a public URL (assumes bucket is public)."""
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{remote_path}"

    def get_signed_url(self, bucket: str, remote_path: str, expires_in: int = 3600) -> str:
        """Generates a signed URL for private access."""
        url = f"{self.url}/object/sign/{bucket}/{remote_path}"
        with httpx.Client() as client:
            response = client.post(
                url,
                json={"expiresIn": expires_in},
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            # The API returns a relative path, we prepend the base URL
            signed_url = f"{settings.SUPABASE_URL}/storage/v1{data['signedURL']}"
            return signed_url

    def delete_file(self, bucket: str, remote_path: str):
        """Deletes a file."""
        url = f"{self.url}/object/{bucket}/{remote_path}"
        with httpx.Client() as client:
            response = client.delete(url, headers=self.headers)
            # 404 is acceptable during deletion
            if response.status_code != 404:
                response.raise_for_status()
