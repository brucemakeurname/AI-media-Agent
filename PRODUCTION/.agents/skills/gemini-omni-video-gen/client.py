"""Vertex AI Gemini Omni Flash video generation client.

Gemini Omni Flash uses a DIFFERENT API surface than Veo — the `interactions`
resource, not `publishers/google/models/{model}:predictLongRunning` or
`:generateContent`. Calling the Veo-style endpoint for this model returns a
misleading 404 "does not have access" even when the project IS entitled —
verified 2026-07-20 (see CLAUDE.md "Hard Rules").

Auth: same service-account JSON as nano-banana-image-gen / gemini-veo-3.1-video-gen
(project solo-flows-free-gen-v1).
"""

from __future__ import annotations

import base64
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

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

SERVICE_ACCOUNT_KEY = (
    Path(__file__).parent.parent
    / "nano-banana-image-gen/solo-flows-free-gen-v1-15896bb3db79.json"
)

MODEL_OMNI_FLASH_PREVIEW = "gemini-omni-flash-preview"  # Public Preview, verified working
MODEL_OMNI_FLASH = "gemini-omni-flash"                  # GA per catalog, not yet invocation-tested

LOCATION = "global"  # MUST be global — us-central1 / regional 404s for this model
BASE_URL = "https://aiplatform.googleapis.com/v1beta1"

VideoTask = Literal["text_to_video", "image_to_video", "reference_to_video", "edit"]


class OmniError(Exception):
    def __init__(self, status: int, message: str) -> None:
        self.status = status
        self.message = message
        super().__init__(f"Gemini Omni Error {status}: {message}")


@dataclass
class OmniVideoResult:
    video_bytes: bytes
    mime_type: str
    interaction_id: str
    thought_summary: str | None
    usage: dict = field(default_factory=dict)


class OmniVertexClient:
    """Sync client for Gemini Omni Flash video generation via the `interactions` API.

    Usage:
        client = OmniVertexClient()
        result = client.generate_video("A cat walks on a beach at sunset", aspect_ratio="9:16")
        Path("clip.mp4").write_bytes(result.video_bytes)
    """

    def __init__(self, key_file: str | Path | None = None) -> None:
        self._key_file = Path(key_file) if key_file else SERVICE_ACCOUNT_KEY
        self._project = json.loads(self._key_file.read_text())["project_id"]
        self._token: str | None = None
        self._token_expiry: float = 0

    def _get_token(self) -> str:
        if self._token and time.time() < self._token_expiry - 60:
            return self._token
        creds = service_account.Credentials.from_service_account_file(
            str(self._key_file), scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        creds.refresh(Request())
        self._token = creds.token
        self._token_expiry = time.time() + 3500
        return self._token

    @staticmethod
    def _encode_image(path: str | Path) -> dict[str, str]:
        p = Path(path)
        data = base64.b64encode(p.read_bytes()).decode("ascii")
        ext = p.suffix.lower().lstrip(".")
        mime = "image/jpeg" if ext in {"jpg", "jpeg"} else f"image/{ext or 'png'}"
        return {"type": "image", "mime_type": mime, "data": data}

    def generate_video(
        self,
        prompt: str,
        *,
        model: str = MODEL_OMNI_FLASH_PREVIEW,
        aspect_ratio: str = "9:16",
        task: VideoTask | None = None,
        reference_images: list[str | Path] | None = None,
        timeout: int = 180,
    ) -> OmniVideoResult:
        """Generate a video clip via Gemini Omni Flash.

        Args:
            prompt: Text prompt. Can reference images by position using
                `<IMAGE_REF_0>`, `<IMAGE_REF_1>`, etc. (0-indexed, matching
                the order of `reference_images`).
            model: MODEL_OMNI_FLASH_PREVIEW (verified working) or
                MODEL_OMNI_FLASH (GA per catalog, untested here).
            aspect_ratio: "9:16" (portrait) or "16:9" (landscape, default per docs).
            task: "text_to_video" | "image_to_video" | "reference_to_video" | "edit".
                Optional — the model infers this from the input mix if omitted.
                Field accepted by the API (no validation error observed); the
                model's own behavior when explicitly set vs inferred has not
                been A/B tested.
            reference_images: 0+ image paths. Passed as separate `input` items
                BEFORE the text prompt, in order. Tested working with 2 images;
                docs claim up to ~6-7 — not verified at that count.
            timeout: request timeout in seconds. Video generation itself is
                synchronous in this API (no poll loop, unlike Veo's
                predictLongRunning) — the whole call blocks until done.

        Returns:
            OmniVideoResult with raw mp4 bytes.

        Raises:
            OmniError: on non-200 response or missing video content.
        """
        token = self._get_token()
        url = f"{BASE_URL}/projects/{self._project}/locations/{LOCATION}/interactions"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }

        input_items: list[dict[str, Any]] = []
        for img in reference_images or []:
            input_items.append(self._encode_image(img))
        input_items.append({"type": "text", "text": prompt})

        payload: dict[str, Any] = {
            "model": model,
            "input": input_items,
            "response_format": {"type": "video", "aspect_ratio": aspect_ratio},
        }
        if task:
            payload["generation_config"] = {"video_config": {"task": task}}

        resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
        if resp.status_code != 200:
            raise OmniError(resp.status_code, resp.text)

        body = resp.json()
        result = self._parse_result(body)
        if _cost_ledger:
            u = result.usage or {}
            vid_tok = next((m.get("tokens") for m in u.get("output_tokens_by_modality", [])
                            if m.get("modality") == "video"), None)
            if vid_tok is None:
                vid_tok = u.get("total_output_tokens", 0)
            _cost_ledger.log(
                model, "gemini-omni-video-gen",
                f"{model}|video_output_tokens", "output_tokens", vid_tok,
                extra={"interaction_id": result.interaction_id,
                       "total_tokens": u.get("total_tokens")},
            )
        return result

    @staticmethod
    def _parse_result(body: dict) -> OmniVideoResult:
        thought_text = None
        video_b64 = None
        mime = "video/mp4"

        for step in body.get("steps", []):
            if step.get("type") == "thought":
                parts = step.get("summary") or []
                if parts:
                    thought_text = parts[0].get("text")
            elif step.get("type") == "model_output":
                for item in step.get("content", []):
                    if item.get("mime_type", "").startswith("video/") and item.get("data"):
                        video_b64 = item["data"]
                        mime = item["mime_type"]
                    # NOTE: docs say outputs >4MB may come back as item["uri"]
                    # (gs://...) instead of inline `data` when the request sets
                    # a `delivery: "uri"` option. Not exercised here — every
                    # clip generated during verification was small enough for
                    # inline base64. If you see a `uri` field with no `data`,
                    # that path needs to be implemented (GCS download) before
                    # this client can handle it.

        if not video_b64:
            raise OmniError(0, f"No video content in response: {json.dumps(body)[:500]}")

        return OmniVideoResult(
            video_bytes=base64.b64decode(video_b64),
            mime_type=mime,
            interaction_id=body.get("id", ""),
            thought_summary=thought_text,
            usage=body.get("usage", {}),
        )

    def save_video(self, result: OmniVideoResult, out_path: str | Path) -> Path:
        out = Path(out_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(result.video_bytes)
        return out
