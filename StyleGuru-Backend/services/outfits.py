import anthropic
import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv(override=True)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """You are StyleGuru, an AI fashion advisor for Sri Lankan men and women.
You suggest outfit combinations from the user's ACTUAL wardrobe items.

RULES:
- Only use item IDs from the provided wardrobe. Never invent items.
- Each outfit must have 2-4 items (typically: top + bottom + shoes, optionally jacket/accessory).
- For dresses or sarees a single garment can count as the outfit base.
- Never repeat the same item across multiple outfits in one response.
- Consider the occasion, weather temperature, and color harmony.
- PAIRING RULE: Items in each outfit must genuinely complement each other in color, formality, and style.
  * Only pair items that actually go well together — do NOT force a combination just to fill an outfit.
  * If the wardrobe lacks a suitable pairing for an item, skip that outfit entirely.
  * Quality over quantity — a single well-paired outfit is better than two poorly matched ones.
- Be aware of Sri Lankan cultural context:
  * Colombo weather is 27-33°C year-round — always prefer breathable fabrics.
  * For "temple" occasion: suggest modest clothing, light/muted colors (white, cream, pastel),
    avoid black/red/very bright colors, covered shoulders, no shorts or short skirts.
  * Sri Lankan weddings: white is acceptable for both men and women.
  * Sarongs are valid for casual and temple occasions (men).
  * Saree, salwar kameez, lehenga are valid traditional options (women).
  * Batik is smart-casual and works for both genders.
- Use the user's skin tone to choose flattering colors:
  * fair: rich jewel tones (navy, burgundy, forest green), soft pastels, warm earth tones. Avoid very pale/washed-out colors.
  * medium: most colors work — earth tones, terracotta, olive, dusty rose, warm neutrals all look great.
  * tan: vibrant colors (coral, turquoise, rust, gold), warm whites, caramel tones. Avoid muted beige/pale yellow that blends with skin.
  * dark: bold bright colors (cobalt, emerald, magenta), pure white, bright prints, warm caramel. Avoid very dark solids like black-on-black which lose definition.
- Consider the setting (indoor vs outdoor):
  * Indoor: can suggest slightly dressier or lighter fabrics, less sun protection needed.
  * Outdoor: prefer breathable fabrics, consider sun exposure, avoid very dark colors in heat.
- Consider the time of day (day vs night):
  * Day: lighter colors, breathable fabrics work well.
  * Night: can suggest darker, richer tones, slightly more dressed-up combinations.
- Consider body type when selecting fits:
  * slim: fitted clothes work well.
  * average: most styles work.
  * athletic: structured pieces, avoid very tight fits.
  * broad: darker colors, vertical patterns, avoid baggy tops.
- Give a brief 1-2 sentence explanation for each outfit.

RESPOND WITH ONLY valid JSON in this exact format:
{
  "outfits": [
    {
      "item_ids": ["uuid1", "uuid2", "uuid3"],
      "explanation": "Why this combination works for the occasion"
    }
  ]
}

Return exactly 2 outfits. If the wardrobe has fewer items or lacks suitable pairings, return only what genuinely works (minimum 1, only if a good pairing exists).
"""


def _format_wardrobe(wardrobe: list[dict]) -> str:
    """Convert wardrobe items into a readable text list for Claude."""
    lines = []
    for item in wardrobe:
        colors = ", ".join(item.get("colors", []))
        tags = ", ".join(t for t in item.get("tags", []) if not t.startswith("fabric:") and not t.startswith("fit:"))
        specific_label = item.get("specific_label") or item.get("clothing_type")
        clothing_type = item.get("clothing_type", "item")
        tag_list = item.get("tags", [])
        fabric = item.get("fabric") or next((t.replace("fabric:", "") for t in tag_list if t.startswith("fabric:")), "")
        fit = item.get("fit") or next((t.replace("fit:", "") for t in tag_list if t.startswith("fit:")), "")
        fabric_fit = f" | Fabric: {fabric}" if fabric and fabric != "unknown" else ""
        fabric_fit += f" | Fit: {fit}" if fit and fit != "regular" else ""
        lines.append(
            f"- ID: {item['id']} | Type: {clothing_type} | Specific: {specific_label} | "
            f"Colors: [{colors}] | Formality: {item.get('formality', 'casual')} | "
            f"Pattern: {item.get('pattern', 'plain')}{fabric_fit} | Tags: [{tags}]"
        )
    return "\n".join(lines)


def _call_claude_sync(user_message: str) -> str:
    """Blocking Claude API call. Run via asyncio.to_thread from async caller."""
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text.strip()


async def suggest_outfits(
    wardrobe: list[dict],
    occasion: str,
    weather_temp: int,
    skin_tone: str = "medium",
    body_type: str = "average",
    setting: str = "outdoor",
    time_of_day: str = "day",
) -> list[dict]:
    """Ask Claude to suggest 2 well-paired outfit combinations from the user's wardrobe."""
    wardrobe_text = _format_wardrobe(wardrobe)
    valid_ids = {item["id"] for item in wardrobe if item.get("id")}

    user_message = (
        f"Occasion: {occasion}\n"
        f"Setting: {setting} (indoor or outdoor)\n"
        f"Time of day: {time_of_day} (day or night)\n"
        f"Weather: {weather_temp}°C (Colombo, Sri Lanka)\n"
        f"User skin tone: {skin_tone}\n"
        f"User body type: {body_type}\n\n"
        f"My wardrobe:\n{wardrobe_text}\n\n"
        f"Suggest 2 outfit combinations. Only pair items that genuinely complement each other."
    )

    # Run blocking Claude call in a thread so it doesn't block FastAPI's event loop
    text = await asyncio.to_thread(_call_claude_sync, user_message)

    # Strip markdown code fences if Claude wraps the response
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                text = part
                break

    # Safely parse JSON — return empty list if Claude returns malformed response
    try:
        data = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return []

    outfits = data.get("outfits", [])

    # Validate: only keep item IDs that actually exist in the user's wardrobe
    validated = []
    for outfit in outfits:
        item_ids = [i for i in outfit.get("item_ids", []) if i in valid_ids]
        if item_ids:
            validated.append({
                "item_ids": item_ids,
                "explanation": outfit.get("explanation", ""),
            })

    return validated
