"""SHA-256 checksum computation for asset idempotency (Tarea 11.2)."""

import hashlib


def compute_sha256(file_path: str) -> str:
    """Compute the SHA-256 hash of a file.
    
    Reads the file in 8KB chunks to handle large files efficiently.
    Returns the hex digest string.
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()
