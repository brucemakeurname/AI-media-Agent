"""Sample runnable generator for the nano-banana-image-gen skill.

Verified working 2026-07-08 against project solo-flows-free-gen-v1.
Standalone (no aiohttp/jwt) — uses google-auth + requests only.

Key facts baked in (see SKILL.md Hard Rules):
- location MUST be `global`: Pro returns 200 but TEXT-ONLY at regional locations.
- Model IDs are GA (no `-preview`): gemini-3-pro-image / gemini-3.1-flash-image.
- v1beta1 + imageConfig inside generationConfig + responseModalities [TEXT, IMAGE].

Usage:
    python example_generate.py                 # runs the Hanoi-street demo below
    # or import generate() from another script.
"""

import base64
import json
import os
import time

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

# --- cost ledger (telemetry side-channel; import failure must never matter) ---
try:
    import sys as _sys
    from pathlib import Path as _P
    for _up in _P(__file__).resolve().parents:
        _cand = _up / "DOCS" / "Token-Cost-Optimizing" / "cost-ledger"
        if _cand.is_dir():
            _sys.path.insert(0, str(_cand))
            break
    import cost_ledger as _cost_ledger
except Exception:
    _cost_ledger = None

# --- Config -----------------------------------------------------------------
KEY = "D:/1. SOLOFLOWS/INHOUSE TEAMS/2. Production/_archive-media-hubs/4. Design Hub/solo-flows-free-gen-v1-15896bb3db79.json"
PROJECT = "solo-flows-free-gen-v1"
LOCATION = "global"  # do NOT change — Pro returns text-only at regional locations
MODEL_PRO = "gemini-3-pro-image"       # Nano Banana Pro — editorial, text, polish
MODEL_FLASH = "gemini-3.1-flash-image"  # Nano Banana 2 — UGC, drafts, speed


def _token() -> str:
    creds = service_account.Credentials.from_service_account_file(
        KEY, scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    creds.refresh(Request())
    return creds.token


def generate(
    prompt: str,
    out_dir: str,
    *,
    model: str = MODEL_PRO,
    aspect_ratio: str = "9:16",
    image_size: str = "4K",
    reference_images: list[tuple[str, str]] | None = None,
) -> str:
    """Generate one image. Returns the saved file path.

    Args:
        prompt: JSON string (preferred) or plain text — see SKILL.md Step 2.
        out_dir: directory to write the JPEG into (created if missing).
        model: MODEL_PRO or MODEL_FLASH.
        aspect_ratio: e.g. "9:16", "1:1", "16:9", "3:4".
        image_size: "1K" | "2K" | "4K".
        reference_images: optional list of (base64_data, mime_type) tuples.
    """
    os.makedirs(out_dir, exist_ok=True)
    url = (
        f"https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT}"
        f"/locations/{LOCATION}/publishers/google/models/{model}:generateContent"
    )

    parts: list[dict] = [{"text": prompt}]
    for img_b64, mime in reference_images or []:
        parts.append({"inline_data": {"mime_type": mime, "data": img_b64}})

    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect_ratio, "imageSize": image_size},
        },
    }

    t0 = time.time()
    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {_token()}", "Content-Type": "application/json"},
        json=payload,
        timeout=300,
    )
    if r.status_code != 200:
        raise RuntimeError(f"Vertex AI {r.status_code}: {r.text[:500]}")

    body = r.json()
    resp_parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    img_b64, text = None, []
    for p in resp_parts:  # model emits thinking text before image — take the last image
        data = p.get("inlineData") or p.get("inline_data")
        if data:
            img_b64 = data["data"]
        elif "text" in p:
            text.append(p["text"])
    if not img_b64:
        raise RuntimeError(f"No image in response. Text: {' '.join(text)[:400]}")

    path = os.path.join(out_dir, f"gen_{int(time.time())}.jpeg")
    with open(path, "wb") as f:
        f.write(base64.b64decode(img_b64))
    print(f"SAVED {path} ({os.path.getsize(path)} bytes) in {time.time() - t0:.1f}s via {model}")
    if _cost_ledger:
        u = body.get("usageMetadata", {})
        img_tok = next((m.get("tokenCount") for m in u.get("candidatesTokensDetails", [])
                        if m.get("modality") == "IMAGE"), None)
        if img_tok is None:
            img_tok = u.get("candidatesTokenCount", 0)
        _cost_ledger.log(
            model, "nano-banana-image-gen",
            f"{model}|image_tokens", "image_tokens", img_tok,
            wall_time_s=round(time.time() - t0, 1),
            extra={"aspect_ratio": aspect_ratio, "image_size": image_size},
        )
    return path


# --- Demo: Hanoi Old Quarter street, 9:16 (the run from 2026-07-08) ----------
if __name__ == "__main__":
    brief = {
        "project_info": {
            "theme": "Old Quarter Hanoi street life at golden hour",
            "color_palette": "#C9722E ochre, #6E7B4B moss, #2B2B2B charcoal, #E8D9B5 warm cream, #8A3B2E terracotta",
        },
        "main_subject": {
            "type": "Street scene",
            "detail": "a narrow Hanoi Old Quarter street, weathered mustard-yellow colonial facades with green shutters, tangled overhead electrical wires, a woman in conical non la carrying a bamboo shoulder pole with baskets of flowers, parked motorbikes, small plastic stools outside a pho shop, a cyclo passing",
            "style": "documentary street photography, 35mm",
        },
        "composition_elements": {
            "text": "none",
            "items": [
                "foreground: cracked wet pavement with reflections",
                "midground: flower-seller with shoulder pole",
                "background: receding row of tube houses fading into warm haze",
            ],
        },
        "lighting_and_atmosphere": {
            "type": "late-afternoon golden hour, warm 3200K low sun raking down the street",
            "effect": "long soft shadows, warm backlight rim on the conical hat, gentle atmospheric haze and dust in the light",
        },
        "technical_specs": {
            "render_style": "Leica M6 with 35mm f/2 Summicron, Kodak Portra 800",
            "resolution": "4k",
        },
        "negative_prompt": "plastic skin, waxy, over-smooth, over-saturated, airbrushed, HDR look, cartoon, 3D render, watermark, deformed hands, extra fingers, NOT retouched, NOT airbrushed, over-clean, fake, cgi",
    }
    prompt = json.dumps(brief, ensure_ascii=False, indent=2) + (
        "\nSubtle real-world wear: scuffed walls, peeling paint, uneven pavement, "
        "35mm film grain visible, slight chromatic aberration, natural vignetting, "
        "slightly desaturated with lifted blacks."
    )
    generate(prompt, "./output/hanoi-street", model=MODEL_PRO, aspect_ratio="9:16", image_size="4K")
