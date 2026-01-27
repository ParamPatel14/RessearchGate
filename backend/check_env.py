
from app.core.config import settings
import sys

print(f"SECRET_KEY present: {bool(settings.SECRET_KEY)}")
print(f"GOOGLE_CLIENT_ID present: {bool(settings.GOOGLE_CLIENT_ID)}")
print(f"GITHUB_CLIENT_ID present: {bool(settings.GITHUB_CLIENT_ID)}")

if not settings.SECRET_KEY:
    sys.exit(1)
