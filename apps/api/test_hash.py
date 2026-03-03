import sys
import os
sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.security import get_password_hash

try:
    h = get_password_hash("test")
    print(f"Success: {h}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
