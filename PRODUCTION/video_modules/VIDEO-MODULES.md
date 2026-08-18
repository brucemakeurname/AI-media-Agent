# Video Modules Runtime

This is the dependency registry for the social video goals. Run from the workspace root:

```bash
source PRODUCTION/video_modules/runtime.sh
PRODUCTION/video_modules/preflight.sh
```

| Module | Local path | State | Used by |
|---|---|---|---|
| Flowkit | `PRODUCTION/video_modules/flowkit` | source + Python 3.12 venv; health must report `extension_connected: true` | project, refs, Omni video, 1080p upscale |
| GeminiWatermarkTool | `PRODUCTION/video_modules/GeminiWatermarkTool` | read-only git reference repo | watermark provenance/reference |
| VeoWatermarkRemover | `PRODUCTION/video_modules/VeoWatermarkRemover/GeminiWatermarkTool-Video` | executable macOS video binary | per-scene watermark removal |
| Applio | `PRODUCTION/video_modules/Applio` | local voice-conversion module with model files | approved voice strategy when selected |
| WhisperX | `PRODUCTION/video_modules/WhisperX/models` | local `large-v3` ASR + Vietnamese alignment pack, installed through Python API | WhisperX word timestamps and optional forced alignment |
| Hyperframes tools | `PRODUCTION/video_modules/hyperframes/.venv-tools` | Python tools venv with WhisperX and `pyvi` | WhisperX runtime and Vietnamese segmentation |
| Talking-head editing | `PRODUCTION/video_modules/talking-head-editing` | local editing module | compatible post-production references |

The SFX/BGM library and TypeScript runtimes remain skill-owned under
`PRODUCTION/.agents/skills/[html-video]-audio-mix/scripts/`. They are checked by preflight through
the local `tsx` binaries. `ffmpeg` is resolved from the Hyperframes tool environment; `ffprobe` is
optional because duration helpers fall back to `ffmpeg` when the host does not ship `ffprobe`.

For `new_generation`, a Flowkit failure is blocking. Do not use footage, scenes, or renders from
another campaign as a fallback.
