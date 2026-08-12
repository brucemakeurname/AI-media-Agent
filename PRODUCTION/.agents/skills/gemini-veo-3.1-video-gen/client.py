"""Vertex AI Veo 3.1 video generation client.

Direct API access to Google's Veo models (NOT via Flow UI).
- Endpoint: aiplatform.googleapis.com (regional, us-central1).
- Auth: service account OAuth2 (same key as nano-banana-image-gen).
- Pattern: predictLongRunning -> poll fetchPredictOperation until done.

No anti-abuse banner, no isTrusted wall, no Chrome session. Pure HTTP.
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

SERVICE_ACCOUNT_KEY = Path(__file__).parent / "solo-flows-free-gen-v1-15896bb3db79.json"

PROJECT_ID = "solo-flows-free-gen-v1"
LOCATION = "us-central1"
BASE_URL = (
    f"https://{LOCATION}-aiplatform.googleapis.com/v1"
    f"/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models"
)

# Model IDs (2026) — verified accessible on project solo-flows-free-gen-v1, 2026-07-21
MODEL_VEO_31 = "veo-3.1-generate-001"                 # full quality + audio (GA, not -preview)
MODEL_VEO_31_FAST = "veo-3.1-fast-generate-001"       # Lite/Fast tier (GA, not -preview)
MODEL_VEO_30 = "veo-3.0-generate-001"                 # GA stable
MODEL_VEO_20 = "veo-2.0-generate-001"                 # legacy


@dataclass
class VideoResult:
    video_b64: str                # raw mp4 bytes, base64-encoded
    mime_type: str
    gcs_uri: str | None           # set if storageUri was passed
    duration_seconds: int
    generation_time_ms: int
    model: str
    operation_name: str


class VeoVertexError(Exception):
    def __init__(self, status: int, message: str) -> None:
        self.status = status
        self.message = message
        super().__init__(f"Veo Vertex Error {status}: {message}")


class VeoVertexClient:
    """Async client for Vertex AI Veo video generation.

    Usage:
        async with VeoVertexClient() as c:
            result = await c.generate_video("A cat walks on the beach", duration_seconds=4)
            Path("clip.mp4").write_bytes(base64.b64decode(result.video_b64))
    """

    def __init__(
        self,
        key_file: str | Path | None = None,
        poll_schedule: list[float] | None = None,
    ) -> None:
        self._key_file = Path(key_file) if key_file else SERVICE_ACCOUNT_KEY
        # Delays (seconds) before each poll attempt, in order. Calibrated against
        # real 8s/720p renders observed at 63.8s and 71.0s (2026-07-28 cost test):
        # first poll after 65s usually already catches it, second after +15s
        # (=80s) catches the slower case, third after +20s (=100s) is the last
        # try before giving up. Caps polling at 3 fetchPredictOperation calls
        # instead of one every 8s (was inflating Cloud Monitoring's invocation
        # count ~9-10x per video with no cost benefit — status polls don't
        # regenerate the video, they only ask if it's done).
        self._poll_schedule = poll_schedule or [65.0, 15.0, 20.0]
        self._session: aiohttp.ClientSession | None = None
        self._token: str | None = None
        self._token_expiry: float = 0

    async def __aenter__(self) -> "VeoVertexClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.close()

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=900),
            )
        return self._session

    async def _get_token(self) -> str:
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
            data = await resp.json()
            if "access_token" not in data:
                raise VeoVertexError(resp.status, f"OAuth token failed: {data}")
            self._token = data["access_token"]
            self._token_expiry = now + data.get("expires_in", 3600)
            return self._token

    @staticmethod
    def _encode_image(path: str | Path) -> dict[str, str]:
        p = Path(path)
        data = base64.b64encode(p.read_bytes()).decode("ascii")
        ext = p.suffix.lower().lstrip(".")
        mime = "image/jpeg" if ext in {"jpg", "jpeg"} else f"image/{ext or 'jpeg'}"
        return {"bytesBase64Encoded": data, "mimeType": mime}

    async def generate_video(
        self,
        prompt: str,
        *,
        model: str = MODEL_VEO_30,
        duration_seconds: int = 4,
        aspect_ratio: str = "9:16",
        resolution: str = "720p",
        sample_count: int = 1,
        generate_audio: bool = True,
        person_generation: str = "allow_adult",
        first_frame: str | Path | None = None,
        last_frame: str | Path | None = None,
        storage_uri: str | None = None,
        negative_prompt: str | None = None,
        seed: int | None = None,
    ) -> VideoResult:
        """Generate a video clip via Veo on Vertex AI.

        Args:
            prompt: Text prompt (English works best, Vietnamese accepted).
            model: Model ID. Default Veo 3.1 Fast (matches Flow's Lite tier).
            duration_seconds: 4 / 6 / 8 (Veo 3.1 supports up to 8s).
            aspect_ratio: "16:9", "9:16", "1:1".
            resolution: "720p" or "1080p".
            sample_count: 1-4 video samples to generate.
            generate_audio: Veo 3.x generates synchronized audio.
            person_generation: "allow_adult" | "allow_all" | "dont_allow".
            first_frame: Path to image used as starting keyframe.
            last_frame: Path to image used as ending keyframe (Veo 3.1 only).
            storage_uri: gs://bucket/path/ — if set, output goes to GCS,
                response includes gcs_uri instead of inline base64.
            negative_prompt: Things to avoid in the video.
            seed: Reproducibility seed.

        Returns:
            VideoResult with base64 mp4 (or gcs_uri).
        """
        instance: dict[str, Any] = {"prompt": prompt}
        if first_frame:
            instance["image"] = self._encode_image(first_frame)
        if last_frame:
            instance["lastFrame"] = self._encode_image(last_frame)

        parameters: dict[str, Any] = {
            "aspectRatio": aspect_ratio,
            "durationSeconds": duration_seconds,
            "sampleCount": sample_count,
            "resolution": resolution,
            "generateAudio": generate_audio,
            "personGeneration": person_generation,
        }
        if storage_uri:
            parameters["storageUri"] = storage_uri
        if negative_prompt:
            parameters["negativePrompt"] = negative_prompt
        if seed is not None:
            parameters["seed"] = seed

        payload = {"instances": [instance], "parameters": parameters}

        t0 = time.perf_counter()
        op_name = await self._start_operation(model, payload)
        result = await self._poll_operation(model, op_name)
        elapsed = int((time.perf_counter() - t0) * 1000)

        video = self._parse_result(result, op_name, model, duration_seconds, elapsed)
        if _cost_ledger:
            _cost_ledger.log(
                model, "gemini-veo-3.1-video-gen",
                f"{model}|{'audio' if generate_audio else 'no_audio'}",
                "video_seconds", duration_seconds,
                wall_time_s=round(elapsed / 1000, 1),
                extra={"operation": op_name},
            )
        return video

    async def _start_operation(self, model: str, payload: dict) -> str:
        token = await self._get_token()
        url = f"{BASE_URL}/{model}:predictLongRunning"
        session = await self._get_session()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        async with session.post(url, json=payload, headers=headers) as resp:
            body = await resp.json()
            if resp.status != 200:
                msg = body.get("error", {}).get("message", str(body))
                raise VeoVertexError(resp.status, msg)
            name = body.get("name")
            if not name:
                raise VeoVertexError(0, f"No operation name in response: {body}")
            return name

    async def _poll_operation(self, model: str, op_name: str) -> dict:
        token = await self._get_token()
        url = f"{BASE_URL}/{model}:fetchPredictOperation"
        session = await self._get_session()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        elapsed = 0.0
        for attempt, delay in enumerate(self._poll_schedule, start=1):
            await asyncio.sleep(delay)
            elapsed += delay
            async with session.post(
                url, json={"operationName": op_name}, headers=headers
            ) as resp:
                body = await resp.json()
                if resp.status != 200:
                    msg = body.get("error", {}).get("message", str(body))
                    raise VeoVertexError(resp.status, msg)
                if body.get("done"):
                    if "error" in body:
                        err = body["error"]
                        raise VeoVertexError(
                            err.get("code", 0), err.get("message", str(err))
                        )
                    return body
            if attempt < len(self._poll_schedule):
                continue
        raise VeoVertexError(
            0,
            f"Operation {op_name} not done after {len(self._poll_schedule)} polls "
            f"({elapsed:.0f}s) — Veo is taking longer than the calibrated schedule; "
            f"operation may still complete server-side, but this client gave up "
            f"polling. Re-run with a longer poll_schedule if this recurs.",
        )

    @staticmethod
    def _parse_result(
        body: dict, op_name: str, model: str, duration: int, elapsed_ms: int
    ) -> VideoResult:
        response = body.get("response", {})
        videos = response.get("videos") or response.get("predictions") or []
        if not videos:
            raise VeoVertexError(0, f"No videos in response: {body}")

        v = videos[0]
        video_b64 = v.get("bytesBase64Encoded", "")
        gcs_uri = v.get("gcsUri")
        mime = v.get("mimeType", "video/mp4")

        if not video_b64 and not gcs_uri:
            raise VeoVertexError(0, f"Video has neither bytes nor gcsUri: {v}")

        return VideoResult(
            video_b64=video_b64,
            mime_type=mime,
            gcs_uri=gcs_uri,
            duration_seconds=duration,
            generation_time_ms=elapsed_ms,
            model=model,
            operation_name=op_name,
        )

    async def save_video(self, result: VideoResult, out_path: str | Path) -> Path:
        """Decode + write the mp4 bytes to disk. Returns the written path."""
        if not result.video_b64:
            raise VeoVertexError(
                0, f"Video has no inline bytes (gcs_uri={result.gcs_uri}); download from GCS instead"
            )
        out = Path(out_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(base64.b64decode(result.video_b64))
        return out
