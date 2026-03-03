import os
import boto3
from botocore.exceptions import ClientError
from core.config import settings
import shutil

class StorageService:
    def __init__(self):
        self.mode = settings.STORAGE_MODE
        if self.mode == "s3":
            # Cloudflare R2 requires a specific s3v4 signature version
            from botocore.config import Config
            s3_config = Config(
                signature_version='s3v4',
                max_pool_connections=50
            )
            
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                endpoint_url=settings.S3_ENDPOINT_URL if settings.S3_ENDPOINT_URL else None,
                region_name=settings.S3_REGION,
                config=s3_config
            )
            self.bucket = settings.S3_BUCKET

    def upload_file(self, local_path: str, remote_path: str) -> str:
        """Uploads a local file to storage and returns the URL or path."""
        if self.mode == "s3":
            try:
                self.s3_client.upload_file(local_path, self.bucket, remote_path)
                return remote_path # We store the key/path in the DB
            except ClientError as e:
                print(f"Error uploading to S3: {e}")
                raise e
        else:
            # Local mode: ensure target dir exists
            target_path = os.path.join("data/uploads", remote_path)
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            if os.path.abspath(local_path) != os.path.abspath(target_path):
                shutil.copy2(local_path, target_path)
            return target_path

    def download_file(self, remote_path: str, local_path: str):
        """Downloads a file from storage to a local path."""
        if self.mode == "s3":
            try:
                self.s3_client.download_file(self.bucket, remote_path, local_path)
            except ClientError as e:
                print(f"Error downloading from S3: {e}")
                raise e
        else:
            # Local mode: just copy
            if os.path.abspath(remote_path) != os.path.abspath(local_path):
                shutil.copy2(remote_path, local_path)

    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """Returns a URL where the file can be accessed. 
        In S3 mode, it returns a presigned URL.
        """
        if self.mode == "s3":
            try:
                # If we have a public URL override, use it (assumes public access)
                if settings.S3_PUBLIC_URL_OVERRIDE:
                    return f"{settings.S3_PUBLIC_URL_OVERRIDE.rstrip('/')}/{file_path}"
                
                # For R2/S3, generate a signed URL
                return self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket, 'Key': file_path},
                    ExpiresIn=expires_in
                )
            except ClientError as e:
                print(f"Error generating presigned URL: {e}")
                return ""
        else:
            # Local mode: returns the path relative to API or full path
            # The API will handle streaming via FileResponse
            return file_path

    def delete_file(self, file_path: str):
        if self.mode == "s3":
            self.s3_client.delete_object(Bucket=self.bucket, Key=file_path)
        else:
            if os.path.exists(file_path):
                os.remove(file_path)

storage_service = StorageService()
