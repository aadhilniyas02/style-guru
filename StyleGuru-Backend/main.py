from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
from services.cloudinary_service import upload_photo
from services.vision import analyze_clothing
from services.outfits import suggest_outfits

app = FastAPI(title="StyleGuru Backend", version="1.0.0")


def _is_placeholder(value: str) -> bool:
    lowered = value.lower()
    markers = (
        "your_key",
        "your-key",
        "your key",
        "sk-ant-your",
        "api_key",
        "api_secret",
        "cloud_name",
        "changeme",
        "replace_me",
    )
    return any(marker in lowered for marker in markers)


def _require_env_vars(*keys: str) -> None:
    missing: list[str] = []
    for key in keys:
        value = os.getenv(key, "").strip()
        if not value or _is_placeholder(value):
            missing.append(key)
    if missing:
        names = ", ".join(missing)
        raise HTTPException(
            status_code=503,
            detail=f"Server is missing required configuration: {names}. Set them in StyleGuru-Backend/.env and restart the backend.",
        )

# Allow all origins for development — lock down in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------


class OutfitRequest(BaseModel):
    wardrobe: list[dict]
    occasion: str
    weather_temp: int
    skin_tone: str = "medium"
    body_type: str = "average"
    setting: str = "outdoor"  # "indoor" | "outdoor"
    time_of_day: str = "day"  # "day" | "night"


# ---------- Endpoints ----------


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "StyleGuru Backend"}


@app.post("/analyze-item")
async def analyze_item(photo: UploadFile = File(...)):
    """Upload a clothing photo, analyze it locally, and return structured data."""
    try:
        _require_env_vars("CLOUDINARY_URL")

        # Read file bytes
        contents = await photo.read()
        if len(contents) > 10 * 1024 * 1024:  # 10 MB limit
            raise HTTPException(status_code=413, detail="File too large. Max 10MB.")

        # Generate unique filename
        ext = photo.filename.rsplit(".", 1)[-1] if photo.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"

        analysis = await analyze_clothing(contents)

        # Upload to Cloudinary after analysis so local classification stays free
        photo_url = upload_photo(contents, filename)

        return {
            "photo_url": photo_url,
            **analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/suggest-outfits")
async def get_outfit_suggestions(request: OutfitRequest):
    """Get 3 AI-powered outfit suggestions from the user's wardrobe."""
    try:
        _require_env_vars("ANTHROPIC_API_KEY")

        if not request.wardrobe:
            raise HTTPException(
                status_code=400, detail="Wardrobe is empty. Add some items first."
            )

        outfits = await suggest_outfits(
            wardrobe=request.wardrobe,
            occasion=request.occasion,
            weather_temp=request.weather_temp,
            skin_tone=request.skin_tone,
            body_type=request.body_type,
            setting=request.setting,
            time_of_day=request.time_of_day,
        )

        return {"outfits": outfits}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion failed: {str(e)}")
