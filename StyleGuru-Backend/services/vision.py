"""Hybrid clothing image analyzer.

Architecture:
  - Local EfficientNet-B0 classifier (services.classifier) → clothing_type
  - Anthropic Claude Vision → all other attributes (colors, fabric, pattern, fit, tags, ...)

The classifier runs in parallel with the Claude call. If the classifier's
confidence is high enough, its label overrides whatever Claude predicts for
clothing_type — giving us fast, free, trained-on-our-data classification.
If confidence is low (or the item is outside the 8 trained classes, like
shoes/accessory), we fall back to Claude's clothing_type.
"""

from __future__ import annotations

import asyncio
import base64
import io
import json
import os
import logging

import anthropic
from dotenv import load_dotenv
from PIL import Image

from services.classifier import classify_clothing, is_confident

load_dotenv(override=True)

_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
_logger = logging.getLogger(__name__)

_ANALYSIS_PROMPT = """Analyze this clothing item image and return a JSON object with these exact fields:

{
  "clothing_type": one of ["shirt", "tshirt", "trousers", "shorts", "shoes", "jacket", "traditional"],
  "specific_label": the most precise name (e.g. "polo shirt", "slim-fit jeans", "kurta", "batik shirt", "chelsea boots"),
  "colors": array of 1-5 dominant hex color codes of the garment (e.g. ["#1a2b3c", "#ffffff"]),
  "formality": one of ["casual", "smart-casual", "formal"],
  "pattern": one of ["plain", "striped", "checked", "printed"] — use "printed" for floral, geometric, or any other print,
  "season": one of ["all", "summer", "winter"],
  "fabric": primary fabric type (e.g. "cotton", "denim", "linen", "polyester", "wool", "silk", "batik", "knit"),
  "fit": one of ["slim", "regular", "relaxed", "oversized", "fitted"],
  "tags": array of 3-6 descriptive style tags useful for outfit matching (e.g. ["office-ready", "versatile", "breathable", "smart-casual", "modest"])
}

Classification rules (READ CAREFULLY):
- This app is for men's wardrobes. Do NOT use "dress" or "skirt" — they are not valid categories. Long bottom-wear (jeans, chinos, trousers, joggers, slacks) is always "trousers", regardless of color or how dark the silhouette appears.
- "shirt" = COLLARED, button-front (or partial button-front like a polo). Includes formal shirts, polos, oxford shirts, batik shirts, henley with buttons.
- "tshirt" = NO collar OR no full button placket. Pull-over tee, crew neck, V-neck, scoop neck, plain tee, graphic tee, tank top. If there is no collar and no buttons, it is a tshirt — not a shirt.
- When in doubt between shirt and tshirt: look for buttons. Buttons → shirt. No buttons → tshirt.
- "traditional" = kurta, sarong, lungi, batik full set, anything explicitly South Asian traditional.

Context for accurate analysis:
- App is for Sri Lankan men in Colombo (tropical climate, 27-33°C year-round).
- Recognize South Asian garments: kurta (long tunic), sarong (wrapped waist cloth), batik shirt, lungi.
- Batik = smart-casual in Sri Lankan context.
- Sarong/lungi = casual or traditional.
- For season: most items are "all" in tropical climate; "winter" only for heavy wool/thick coats.
- Be precise about colors — use the actual garment color, not the background.

Return ONLY the JSON object. No explanation, no markdown fences."""


def _to_jpeg(image_bytes: bytes) -> bytes:
    """Convert any image format to JPEG for reliable Claude API compatibility."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=90)
    return out.getvalue()


def _call_claude_sync(jpeg_bytes: bytes) -> dict:
    """Blocking Claude Vision call. Run via asyncio.to_thread from async caller."""
    image_b64 = base64.standard_b64encode(jpeg_bytes).decode("utf-8")

    response = _client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_b64,
                        },
                    },
                    {"type": "text", "text": _ANALYSIS_PROMPT},
                ],
            }
        ],
    )

    text = response.content[0].text.strip()

    # Strip markdown code fences if Claude adds them
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                text = part
                break

    return json.loads(text)


async def analyze_clothing(image_bytes: bytes, content_type: str | None = None) -> dict:
    """Analyze a clothing item image using a hybrid local+LLM pipeline.

    The local EfficientNet-B0 classifier and Claude Vision run concurrently.
    The classifier's label wins for ``clothing_type`` when confident;
    otherwise we defer to Claude. All other attributes come from Claude.
    """
    jpeg_bytes = _to_jpeg(image_bytes)

    default_label = "accessory"
    classifier_task = asyncio.create_task(classify_clothing(jpeg_bytes))
    has_claude_key = bool(os.getenv("ANTHROPIC_API_KEY", "").strip())
    claude_task = asyncio.to_thread(_call_claude_sync, jpeg_bytes) if has_claude_key else None

    if claude_task is None:
        cls_result = await asyncio.gather(classifier_task, return_exceptions=True)
        classifier_result = cls_result[0]
        if isinstance(classifier_result, Exception):
            cls_label, cls_confidence = default_label, 0.0
        else:
            cls_label, cls_confidence = classifier_result

        return {
            "clothing_type": cls_label,
            "specific_label": cls_label,
            "colors": ["#808080"],
            "formality": "casual",
            "pattern": "plain",
            "season": "all",
            "fabric": "unknown",
            "fit": "regular",
            "tags": ["local-classifier", "manual-review"],
            "classifier_source": "local_no_claude_key",
            "classifier_confidence": round(cls_confidence, 3),
            "classifier_label": cls_label,
        }

    classifier_result, claude_result = await asyncio.gather(
        classifier_task, claude_task, return_exceptions=True
    )

    if isinstance(classifier_result, Exception):
        _logger.exception("Local classifier failed", exc_info=classifier_result)
        cls_label, cls_confidence = default_label, 0.0
    else:
        cls_label, cls_confidence = classifier_result

    if isinstance(claude_result, Exception):
        _logger.warning("Claude Vision failed; falling back to local classifier: %s", claude_result)
        claude_data: dict = {}
    else:
        claude_data = claude_result

    # Decide whose clothing_type wins.
    if is_confident(cls_confidence, cls_label) or not claude_data:
        clothing_type = cls_label
        classifier_source = "local" if claude_data else "local_claude_error"
    else:
        clothing_type = claude_data.get("clothing_type", "shirt")
        classifier_source = "claude_fallback"

    # Coerce disallowed categories (men's-app rule: no skirt/dress/accessory).
    # The local classifier sometimes mislabels long dark trousers as "skirt";
    # this remap is the final guarantee that won't reach the frontend or DB.
    _CATEGORY_REMAP = {"skirt": "trousers", "dress": "traditional", "accessory": "shirt"}
    if clothing_type in _CATEGORY_REMAP:
        clothing_type = _CATEGORY_REMAP[clothing_type]

    # Heuristic: collarless/button-less tops are tshirts, not shirts.
    # Catches the "t-shirt detected as shirt" case when the classifier wins.
    specific = (claude_data.get("specific_label") or "").lower()
    if clothing_type == "shirt" and any(
        kw in specific for kw in ("t-shirt", "tshirt", "t shirt", " tee", "tee shirt", "tank")
    ):
        clothing_type = "tshirt"

    # Guard against invalid pattern values that would violate DB check constraint
    _VALID_PATTERNS = {"plain", "striped", "checked", "printed"}
    raw_pattern = claude_data.get("pattern", "plain")
    pattern = raw_pattern if raw_pattern in _VALID_PATTERNS else "printed"

    return {
        "clothing_type": clothing_type,
        "specific_label": claude_data.get("specific_label", "item"),
        "colors": claude_data.get("colors", ["#808080"]),
        "formality": claude_data.get("formality", "casual"),
        "pattern": pattern,
        "season": claude_data.get("season", "all"),
        "fabric": claude_data.get("fabric", "unknown"),
        "fit": claude_data.get("fit", "regular"),
        "tags": claude_data.get("tags", []),
        # Debug/telemetry fields — harmless if the frontend ignores them.
        "classifier_source": classifier_source,
        "classifier_confidence": round(cls_confidence, 3),
        "classifier_label": cls_label,
    }
