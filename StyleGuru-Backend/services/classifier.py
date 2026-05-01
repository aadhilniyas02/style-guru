"""Local clothing-type classifier.

Fine-tuned EfficientNet-B0 on a filtered Fashion Product Images dataset
(8 apparel classes) with a Sri Lankan traditional wear subset. Runs on CPU
in ~50-150 ms per image — 40x faster than calling Claude Vision, and free.

Used by `services.vision.analyze_clothing` as the primary signal for
`clothing_type`. When confidence is below `MIN_CONFIDENCE`, the caller
should fall back to Claude Vision's prediction instead.
"""

from __future__ import annotations

import asyncio
import io
import os
from functools import lru_cache
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

# ---------- Configuration ----------

_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "clothing_classifier.pth"

# Minimum softmax probability required to trust the classifier's prediction.
# Below this, the caller should fall back to Claude Vision.
MIN_CONFIDENCE = 0.60

# Classes NOT covered by this classifier — the app still supports these via
# Claude Vision fallback (the classifier was trained on 8 apparel classes only).
UNSUPPORTED_CLASSES = {"shoes", "accessory", "skirt", "dress"}


# ---------- Lazy model loading ----------


@lru_cache(maxsize=1)
def _load_model() -> tuple[nn.Module, list[str], transforms.Compose, torch.device]:
    """Load the trained EfficientNet-B0 checkpoint once on first inference.

    Cached with lru_cache so repeat calls are no-ops. Loads on CPU by default —
    the backend runs on small dynos without GPUs.
    """
    if not _MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Clothing classifier weights not found at {_MODEL_PATH}. "
            "Expected a .pth file produced by the training notebook."
        )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Recreate the architecture: EfficientNet-B0 with final layer sized to our classes.
    ckpt = torch.load(_MODEL_PATH, map_location=device, weights_only=False)
    class_names: list[str] = ckpt["class_names"]

    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, len(class_names))
    model.load_state_dict(ckpt["model_state_dict"])
    model.to(device).eval()

    img_size = ckpt.get("img_size", 224)
    mean = ckpt.get("mean", [0.485, 0.456, 0.406])
    std = ckpt.get("std", [0.229, 0.224, 0.225])

    transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])

    return model, class_names, transform, device


# ---------- Inference ----------


def _classify_sync(image_bytes: bytes) -> tuple[str, float]:
    """Synchronous classification. Returns (clothing_type, confidence 0-1)."""
    model, class_names, transform, device = _load_model()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0]
        confidence, idx = torch.max(probs, dim=0)

    return class_names[idx.item()], float(confidence.item())


async def classify_clothing(image_bytes: bytes) -> tuple[str, float]:
    """Classify clothing type from raw image bytes.

    Runs the torch inference in a worker thread so it doesn't block FastAPI's
    event loop. Returns ``(clothing_type, confidence)`` — caller decides whether
    to trust it based on ``MIN_CONFIDENCE``.
    """
    return await asyncio.to_thread(_classify_sync, image_bytes)


def is_confident(confidence: float, clothing_type: str) -> bool:
    """Decide whether to trust the classifier's prediction over Claude's.

    The classifier was only trained on 8 apparel classes, so shoes/accessory
    (which exist in the app's enum but not the training set) will never appear
    here — we just enforce the confidence floor.
    """
    return confidence >= MIN_CONFIDENCE and clothing_type not in UNSUPPORTED_CLASSES
