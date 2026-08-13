"""Direct Flow API endpoints — for manual operations outside the queue."""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agent.services.flow_client import get_flow_client

router = APIRouter(prefix="/flow", tags=["flow"])


class RawRequest(BaseModel):
    """Dev-only escape hatch for probing undocumented Flow endpoints (added 2026-08-07).

    Bypasses the ENDPOINTS/models.json convenience layer — caller supplies the full
    aisandbox-pa.googleapis.com path and body directly. Use for reverse-engineering only,
    not production call sites (those should get a proper typed method once confirmed).
    """
    path: str  # e.g. "/v1/flow/uploadAudio" (no host, no ?key=)
    method: str = "POST"
    body: dict = {}
    captcha_action: Optional[str] = None


class GenerateImageRequest(BaseModel):
    prompt: str
    project_id: str
    aspect_ratio: str = "IMAGE_ASPECT_RATIO_PORTRAIT"
    user_paygate_tier: str = "PAYGATE_TIER_ONE"
    character_media_ids: Optional[list[str]] = None


class GenerateVideoRequest(BaseModel):
    start_image_media_id: str
    prompt: str
    project_id: str
    scene_id: str
    aspect_ratio: str = "VIDEO_ASPECT_RATIO_PORTRAIT"
    end_image_media_id: Optional[str] = None
    user_paygate_tier: str = "PAYGATE_TIER_ONE"


class GenerateVideoTextRequest(BaseModel):
    prompt: str
    project_id: str
    scene_id: str
    aspect_ratio: str = "VIDEO_ASPECT_RATIO_PORTRAIT"
    duration_s: int = 4  # one of 4, 6, 8, 10 — see generate_video_text docstring
    user_paygate_tier: str = "PAYGATE_TIER_ONE"


class GenerateVideoRefsRequest(BaseModel):
    reference_media_ids: list[str]
    prompt: str
    project_id: str
    scene_id: str
    aspect_ratio: str = "VIDEO_ASPECT_RATIO_PORTRAIT"
    user_paygate_tier: str = "PAYGATE_TIER_ONE"


class GenerateVideoRefsOmniRequest(BaseModel):
    reference_media_ids: list[str]
    prompt: str
    project_id: str
    scene_id: str
    aspect_ratio: str = "VIDEO_ASPECT_RATIO_PORTRAIT"
    duration_s: int = 4  # one of 4, 6, 8, 10 — see generate_video_refs_omni docstring
    user_paygate_tier: str = "PAYGATE_TIER_ONE"


class UpscaleVideoRequest(BaseModel):
    media_id: str
    scene_id: str
    aspect_ratio: str = "VIDEO_ASPECT_RATIO_PORTRAIT"
    resolution: str = "VIDEO_RESOLUTION_4K"


class UploadImageRequest(BaseModel):
    file_path: str  # absolute path to local image file
    project_id: str = ""
    file_name: str = "image.png"


class CheckStatusRequest(BaseModel):
    operations: list[dict]


class EditImageRequest(BaseModel):
    prompt: str
    source_media_id: str
    project_id: str
    aspect_ratio: str = "IMAGE_ASPECT_RATIO_PORTRAIT"
    user_paygate_tier: str = "PAYGATE_TIER_ONE"


@router.post("/raw")
async def raw_request(body: RawRequest):
    """Dev-only: probe an arbitrary aisandbox-pa.googleapis.com path. See RawRequest docstring."""
    from agent.config import GOOGLE_FLOW_API, GOOGLE_API_KEY
    from agent.services.headers import random_headers
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    sep = "&" if "?" in body.path else "?"
    url = f"{GOOGLE_FLOW_API}{body.path}{sep}key={GOOGLE_API_KEY}"
    result = await client._send("api_request", {
        "url": url,
        "method": body.method,
        "headers": random_headers(),
        "body": body.body,
        "captchaAction": body.captcha_action,
    }, timeout=30)
    return result


@router.get("/status")
async def extension_status():
    """Check if extension is connected."""
    client = get_flow_client()
    return {
        "connected": client.connected,
        "flow_key_present": client._flow_key is not None,
    }


@router.get("/credits")
async def get_credits():
    """Get user credits from Google Flow."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.get_credits()
    if result.get("error"):
        raise HTTPException(502, result["error"])
    return result.get("data", result)


@router.post("/generate-image")
async def generate_image(body: GenerateImageRequest):
    """Generate image directly (bypasses queue)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.generate_images(**body.model_dump())
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/generate-video")
async def generate_video(body: GenerateVideoRequest):
    """Submit video generation (returns operations for polling)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.generate_video(**body.model_dump(exclude_none=True))
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/generate-video-text")
async def generate_video_text(body: GenerateVideoTextRequest):
    """Submit Omni Flash text-to-video generation (no image input)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.generate_video_text(**body.model_dump())
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/generate-video-refs-omni")
async def generate_video_refs_omni(body: GenerateVideoRefsOmniRequest):
    """Submit Omni Flash reference-to-video generation (character/product consistency)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.generate_video_refs_omni(**body.model_dump())
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/generate-video-refs")
async def generate_video_refs(body: GenerateVideoRefsRequest):
    """Submit r2v video generation from reference images."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.generate_video_from_references(**body.model_dump())
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/upscale-video")
async def upscale_video(body: UpscaleVideoRequest):
    """Submit video upscale (returns operations for polling)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.upscale_video(**body.model_dump())
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/check-status")
async def check_status(body: CheckStatusRequest):
    """Check video generation status."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.check_video_status(body.operations)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    return result.get("data", result)


@router.post("/refresh-urls/{project_id}")
async def refresh_project_urls(project_id: str):
    """Bulk refresh all media URLs for a project via per-media get_media calls."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.refresh_project_urls(project_id)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    return result


class DownloadVideoRequest(BaseModel):
    media_id: str                 # generation media_id; append _upsampled yourself for 1080p, or set upscaled=True
    save_path: str                # absolute local path to write the .mp4 to
    upscaled: bool = False        # if True, resolves "<media_id>_upsampled" (the 1080p blob)


@router.get("/media-url/{media_id}")
async def media_url(media_id: str):
    """Resolve a finished video media_id to its signed CDN URL (flow-content.google, signature-
    authed, no token needed). For 1080p pass "<media_id>_upsampled". Replaces the retired
    get_media/encodedVideo byte path — see docs/omni-discovery-log.md §7."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.get_media_download_url(media_id)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    url = (result.get("result") or {}).get("url")
    if not url:
        raise HTTPException(502, f"No CDN url resolved: {result}")
    return {"media_id": media_id, "url": url}


@router.post("/download-video")
async def download_video(body: DownloadVideoRequest):
    """Full automated download: resolve the signed CDN URL for a finished/upscaled video and
    stream its bytes to `save_path`. The final step of the 2026-08-13 pipeline fix — makes
    "generate → upscale → download 1080p" fully headless (no manual Flow-UI click). See
    docs/omni-discovery-log.md §7."""
    import httpx
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")

    name = f"{body.media_id}_upsampled" if body.upscaled else body.media_id
    result = await client.get_media_download_url(name)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    url = (result.get("result") or {}).get("url")
    if not url:
        raise HTTPException(502, f"No CDN url resolved: {result}")

    os.makedirs(os.path.dirname(os.path.abspath(body.save_path)), exist_ok=True)
    total = 0
    try:
        async with httpx.AsyncClient(timeout=120, follow_redirects=True) as hc:
            async with hc.stream("GET", url) as resp:
                if resp.status_code >= 400:
                    raise HTTPException(502, f"CDN fetch failed: HTTP {resp.status_code}")
                with open(body.save_path, "wb") as f:
                    async for chunk in resp.aiter_bytes(65536):
                        f.write(chunk)
                        total += len(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, f"CDN download error: {e}")

    if total < 1024:
        raise HTTPException(502, f"Downloaded only {total} bytes — likely not a real video")
    return {"media_id": name, "save_path": body.save_path, "bytes": total, "url": url}


@router.get("/media-status/{media_id}")
async def media_status(media_id: str, project_id: str):
    """Check generation/upscale status via the real, currently-live Flow endpoint
    (`v1/video:batchCheckAsyncVideoGenerationStatus`, `{"media": [{"name", "projectId"}]}`
    shape) — use this instead of `/media/{media_id}` (broken since 2026-08-13, see
    docs/omni-discovery-log.md §6/§7). For an upscale job, pass `<media_id>_upsampled`.
    Does not return playable bytes/URL, only status + metadata.
    """
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.check_media_status(media_id, project_id)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    status = result.get("status", 200)
    if isinstance(status, int) and status >= 400:
        raise HTTPException(status, result.get("data", "Media not found"))
    return result.get("data", result)


@router.get("/media/{media_id}")
async def get_media(media_id: str):
    """Get media metadata + fresh signed URL from Google Flow.

    Returns the raw response which should contain a fresh fifeUrl/servingUri.
    Use this to refresh expired GCS signed URLs.
    """
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.get_media(media_id)
    if result.get("error"):
        raise HTTPException(502, result["error"])
    status = result.get("status", 200)
    if isinstance(status, int) and status >= 400:
        raise HTTPException(status, result.get("data", "Media not found"))
    return result.get("data", result)


@router.get("/native-log")
async def native_log():
    """Dev-only: dump the extension's passive request sniffer log (last 50 requests to
    aisandbox-pa.googleapis.com, including ones Flow's own web UI fires natively — not just
    ones this agent proxies). Added 2026-08-07 for Omni discovery, exposed here 2026-08-13 to
    re-capture the real media-polling contract after GET /v1/media/{id} started 400ing.
    """
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.get_native_log()
    if result.get("error"):
        raise HTTPException(502, result["error"])
    return result.get("result", result)


@router.post("/edit-image")
async def edit_image(body: EditImageRequest):
    """Edit an existing image using IMAGE_INPUT_TYPE_BASE_IMAGE (bypasses queue)."""
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    result = await client.edit_image(
        body.prompt, body.source_media_id, body.project_id,
        aspect_ratio=body.aspect_ratio,
        user_paygate_tier=body.user_paygate_tier,
    )
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    return result.get("data", result)


@router.post("/upload-image")
async def upload_image(body: UploadImageRequest):
    """Upload a local image file to Google Flow and get a media_id."""
    import base64, mimetypes
    client = get_flow_client()
    if not client.connected:
        raise HTTPException(503, "Extension not connected")
    try:
        with open(body.file_path, "rb") as f:
            image_bytes = f.read()
    except FileNotFoundError:
        raise HTTPException(404, f"File not found: {body.file_path}")
    b64 = base64.b64encode(image_bytes).decode()
    mime = mimetypes.guess_type(body.file_path)[0] or "image/png"
    result = await client.upload_image(b64, mime_type=mime, project_id=body.project_id, file_name=body.file_name)
    if result.get("error") or (isinstance(result.get("status"), int) and result["status"] >= 400):
        raise HTTPException(result.get("status", 502), result.get("error", result.get("data")))
    media_id = result.get("_mediaId")
    return {"media_id": media_id, "raw": result.get("data", result)}
