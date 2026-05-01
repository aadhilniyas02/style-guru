import os
from dotenv import load_dotenv

load_dotenv(override=True)

# Must load_dotenv(override=True) BEFORE importing cloudinary so CLOUDINARY_URL is set
import cloudinary
import cloudinary.uploader

# Explicitly configure from the URL in case auto-detection ran before dotenv loaded
cloudinary_url = os.getenv("CLOUDINARY_URL", "")
if cloudinary_url:
    cloudinary.config(cloudinary_url=cloudinary_url)

def upload_photo(file_bytes: bytes, filename: str) -> str:
    """Upload a clothing photo to Cloudinary and return the secure URL."""
    result = cloudinary.uploader.upload(
        file_bytes,
        folder="styleguru/wardrobe",
        public_id=filename.rsplit(".", 1)[0],
        overwrite=True,
        resource_type="image",
        transformation=[
            {"width": 800, "height": 1067, "crop": "limit"},  # 3:4 max
            {"quality": "auto:good"},
            {"fetch_format": "auto"},
        ],
    )
    return result["secure_url"]
