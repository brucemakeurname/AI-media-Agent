---
name: ffmpeg-upscale-video
description: Deterministic local fallback upscale for downloaded vertical video when Flowkit upscale is unavailable.
---

# ffmpeg-upscale-video

Use only when Flowkit's 1080p upscale fails or is unavailable. Run after the scene is downloaded
and before watermark removal. The fallback keeps the source aspect ratio inside a 1080×1920
portrait canvas, uses Lanczos scaling, and never overwrites the downloaded input.

```bash
python scripts/upscale_video.py node/scenes/scene_01_download.mp4 node/scenes/scene_01_1080p_raw.mp4
```

Record `upscale_engine: ffmpeg-fallback`, source, output, and the Flowkit error in the unit's
`node/handoff.md` or manifest. Do not silently mix Flowkit and ffmpeg outputs without recording
which engine produced each scene.
