"""Vertex AI image generation client using Google service account auth.

Replaces the old Gemini API client. Uses aiplatform.googleapis.com (NOT generativelanguage.googleapis.com).
MUST use v1beta1 endpoint. MUST use global endpoint (not regional).
"""

from __future__ import annotations

import asyncio
import base64
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import aiohttp

# --- cost ledger (telemetry side-channel; import failure must never matter) ---
try:
    import sys as _sys
    for _up in Path(__file__).resolve().parents:
        _cand = _up / "DOCS" / "Token-Cost-Optimizing" / "cost-ledger"
        if _cand.is_dir():
            _sys.path.insert(0, str(_cand))
            break
    import cost_ledger as _cost_ledger
except Exception:
    _cost_ledger = None

# Service account key path — each workflow has its own copy
SERVICE_ACCOUNT_KEY = Path("D:/1. SOLOFLOWS/INHOUSE TEAMS/2. Production/_archive-media-hubs/4. Design Hub/solo-flows-free-gen-v1-15896bb3db79.json")

# Vertex AI config
# NOTE: Pro (gemini-3-pro-image) returns image ONLY at location=global.
# Regional locations (us-central1) return text-only for Pro. Verified 2026-07-08.
PROJECT_ID = "solo-flows-free-gen-v1"
LOCATION = "global"
BASE_URL = f"https://aiplatform.googleapis.com/v1beta1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models"

# Model IDs (GA — dropped the -preview suffix. Nano Banana Pro / Nano Banana 2)
MODEL_FLASH = "gemini-3.1-flash-image"
MODEL_PRO = "gemini-3-pro-image"


@dataclass
class ImageResponse:
    image_b64: str
    mime_type: str
    text: str
    generation_time_ms: int
    model: str
    usage: dict | None = None


class VertexAIImageClient:
    """Async client for Vertex AI image generation via Gemini Flash/Pro.

    Uses service account OAuth (not API key). Supports reference images
    and multi-turn editing.
    """

    def __init__(
        self,
        key_file: str | Path | None = None,
        max_retries: int = 3,
        base_delay: float = 2.0,
        max_delay: float = 60.0,
    ) -> None:
        self._key_file = Path(key_file) if key_file else SERVICE_ACCOUNT_KEY
        self._max_retries = max_retries
        self._base_delay = base_delay
        self._max_delay = max_delay
        self._session: aiohttp.ClientSession | None = None
        self._token: str | None = None
        self._token_expiry: float = 0

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=300),
            )
        return self._session

    async def _get_token(self) -> str:
        """Get OAuth2 token from service account key file."""
        if self._token and time.time() < self._token_expiry - 60:
            return self._token

        import jwt

        with open(self._key_file) as f:
            key_data = json.load(f)

        now = int(time.time())
        payload = {
            "iss": key_data["client_email"],
            "scope": "https://www.googleapis.com/auth/cloud-platform",
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600,
        }
        signed_jwt = jwt.encode(payload, key_data["private_key"], algorithm="RS256")

        session = await self._get_session()
        async with session.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": signed_jwt,
            },
        ) as resp:
            token_data = await resp.json()
            if "access_token" not in token_data:
                raise RuntimeError(f"Failed to get OAuth token: {token_data}")
            self._token = token_data["access_token"]
            self._token_expiry = now + token_data.get("expires_in", 3600)
            return self._token

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    def select_model(self, complexity_score: int) -> str:
        """Select model based on complexity score (1-10).

        Flash (score 1-6): UGC, stories, reels, drafts, single subject
        Pro (score 7-10): editorial, brand deals, text in image, multiple people, VFX
        """
        if complexity_score <= 6:
            return MODEL_FLASH
        return MODEL_PRO

    async def generate_image(
        self,
        prompt: str,
        *,
        model: str | None = None,
        complexity_score: int = 5,
        reference_images: list[tuple[str, str]] | None = None,
        previous_turns: list[dict[str, Any]] | None = None,
        aspect_ratio: str = "16:9",
        image_size: str = "2K",
    ) -> ImageResponse:
        """Generate an image via Vertex AI.

        Args:
            prompt: JSON string or plain text prompt.
            model: Model ID override. If None, selected by complexity_score.
            complexity_score: 1-10, used to pick model if model is None.
            reference_images: List of (base64_data, mime_type) tuples.
            previous_turns: Previous conversation turns for multi-turn editing.
            aspect_ratio: e.g. "16:9", "9:16", "1:1", "3:4".
            image_size: e.g. "1K", "2K", "4K".

        Returns:
            ImageResponse with the last (best) image from the response.
        """
        model = model or self.select_model(complexity_score)
        token = await self._get_token()

        url = f"{BASE_URL}/{model}:generateContent"

        parts: list[dict[str, Any]] = [{"text": prompt}]
        if reference_images:
            for img_b64, mime in reference_images:
                parts.append({"inline_data": {"mime_type": mime, "data": img_b64}})

        contents = list(previous_turns or [])
        contents.append({"role": "user", "parts": parts})

        payload = {
            "contents": contents,
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"],
                "imageConfig": {
                    "aspectRatio": aspect_ratio,
                    "imageSize": image_size,
                },
            },
        }

        t0 = time.perf_counter()
        body = await self._post_with_retry(url, payload, token)
        elapsed = int((time.perf_counter() - t0) * 1000)

        resp = self._parse_response(body, elapsed, model)
        if _cost_ledger:
            u = resp.usage or {}
            img_tok = next((m.get("tokenCount") for m in u.get("candidatesTokensDetails", [])
                            if m.get("modality") == "IMAGE"), None)
            if img_tok is None:
                img_tok = u.get("candidatesTokenCount", 0)
            _cost_ledger.log(
                model, "nano-banana-image-gen",
                f"{model}|image_tokens", "image_tokens", img_tok,
                wall_time_s=round(elapsed / 1000, 1),
                extra={"aspect_ratio": aspect_ratio, "image_size": image_size},
            )
        return resp

    async def _post_with_retry(
        self, url: str, payload: dict, token: str
    ) -> dict[str, Any]:
        session = await self._get_session()
        import random

        for attempt in range(self._max_retries + 1):
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }
            async with session.post(url, json=payload, headers=headers) as resp:
                body = await resp.json()

                if resp.status == 200:
                    return body

                if resp.status == 401:
                    # Token expired, refresh and retry
                    self._token = None
                    token = await self._get_token()
                    continue

                if resp.status == 429 or resp.status >= 500:
                    retry_after = resp.headers.get("Retry-After")
                    if retry_after:
                        delay = float(retry_after)
                    else:
                        delay = min(
                            self._base_delay * (2**attempt) + random.uniform(0, 1),
                            self._max_delay,
                        )
                    await asyncio.sleep(delay)
                    continue

                error_msg = body.get("error", {}).get("message", str(body))
                raise VertexAIError(resp.status, error_msg)

        raise VertexAIError(0, f"Exhausted {self._max_retries + 1} attempts")

    def _parse_response(
        self, body: dict, elapsed_ms: int, model: str
    ) -> ImageResponse:
        candidates = body.get("candidates", [])
        if not candidates:
            raise VertexAIError(0, "No candidates in Vertex AI response")

        parts = candidates[0].get("content", {}).get("parts", [])
        text_parts = []
        last_image_b64 = ""
        last_mime = "image/jpeg"

        # Iterate ALL parts — model returns thinking text before image.
        # Take LAST image (best/final version).
        for part in parts:
            if "text" in part:
                text_parts.append(part["text"])
            elif "inlineData" in part:
                last_image_b64 = part["inlineData"]["data"]
                last_mime = part["inlineData"].get("mimeType", "image/jpeg")
            elif "inline_data" in part:
                last_image_b64 = part["inline_data"]["data"]
                last_mime = part["inline_data"].get("mime_type", "image/jpeg")

        if not last_image_b64:
            raise VertexAIError(
                0, f"No image in response. Text: {' '.join(text_parts)}"
            )

        return ImageResponse(
            image_b64=last_image_b64,
            mime_type=last_mime,
            text=" ".join(text_parts),
            generation_time_ms=elapsed_ms,
            model=model,
            usage=body.get("usageMetadata", {}),
        )


class VertexAIError(Exception):
    def __init__(self, status: int, message: str) -> None:
        self.status = status
        self.message = message
        super().__init__(f"Vertex AI Error {status}: {message}")
