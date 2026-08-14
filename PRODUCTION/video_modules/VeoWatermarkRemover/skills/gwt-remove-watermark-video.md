# gwt-remove-watermark-video — Gemini/Veo video watermark removal

Removes the visible Gemini 3.5 "diamond" sparkle watermark (or legacy "Veo" text watermark) that
Google Flow/Vertex Omni/Veo burn into the bottom-right corner of every generated clip, via a
deterministic reverse-alpha-blending engine (no generative inpainting, no hallucination).

## Provenance

- Upstream source repo (image tool, C++/CMake, this is where the algorithm/method is documented
  and licensed): https://github.com/allenk/GeminiWatermarkTool — cloned read-only into
  `video_modules/GeminiWatermarkTool/` for reference/licensing (MIT) only. **Do not build this
  repo for video work** — its CMake target is the image-only tool.
- Actual video binary used by this skill: **`VeoWatermarkRemover`**, a sibling demo-release repo
  (https://github.com/allenk/VeoWatermarkRemover) that ships prebuilt cross-platform binaries only
  (no buildable source in this checkout). The upstream README is explicit that video support is
  "currently distributed via the standalone VeoWatermarkRemover demo repo" until it's stable
  enough to merge into the main tool.
- Installed binary: `video_modules/VeoWatermarkRemover/GeminiWatermarkTool-Video` — macOS
  Universal (arm64 + x86_64) Mach-O executable, downloaded from the `v0.6.5-demo` GitHub Release
  asset `GeminiWatermarkTool-macOS-Universal-Video.zip`. Already `chmod +x` and
  quarantine-cleared.

## Demo-build constraint — max ~10s per input clip

This is a `-demo` release build (see the release tag/asset name). Empirically confirmed
2026-08-14: an 8s 1080x1920 clip and a 10s 1080x1920 clip both processed successfully end-to-end
(191-192/192 and equivalent frame counts, no truncation, `+audio` passthrough intact). Treat
**10 seconds as the practical per-call ceiling** for this demo binary — this is exactly why it
must run **per-scene, before concat**, never on an already-concatenated multi-scene video: an
18s+ final video would exceed the ceiling in one call. Every `ai-clone-short-video` /
`ai-ugc-short-video` sequence is itself capped at 4/6/8/10s by the Omni packing rule, so a
per-scene call is always in-bounds by construction — no extra chunking logic is needed as long as
this step runs immediately after each scene's individual 1080p download, before any concat step.

Processing is slow relative to clip length — roughly 20-30s of wall time per 1s of 1080p input on
CPU (AI denoise pass is the bottleneck, ~1.2s/frame at 24fps). Budget ~3-5 minutes per scene.

## Usage — one call per scene, immediately after 1080p download

```bash
GWT="video_modules/VeoWatermarkRemover/GeminiWatermarkTool-Video"
"$GWT" --veo -i "node/scenes/scene_{N}_1080p_raw.mp4" -o "node/scenes/scene_{N}_1080p_nowm.mp4" -q
```

- `--veo` is mandatory — without it the tool runs its default **image** watermark path, which is
  wrong for a video input.
- `--mark auto` (default) auto-detects Gemini-3.5 diamond vs. legacy Veo text; do not hardcode
  `--mark diamond` unless a specific clip is confirmed legacy-only.
- Omit `--denoise`/`--sigma` unless a specific scene shows visible residue after removal — default
  AI denoise (`ai`, sigma 50) is already applied automatically in `--veo` mode per the observed log
  (`+dyn-alpha` + `+AI`).
- Exit code `0` = processed (including partial-skip frames, e.g. `191/192` when 1 frame's
  detection confidence didn't clear threshold — this is normal and not a failure). Exit `1` =
  no watermark detected on the whole clip (rare for Flow output, but not an error — pass the
  file through unchanged in that case, do not treat as blocking). Exit `2` = real failure (bad
  args/IO) — stop and record the exact stderr in the unit's `node/handoff.md`.

## Pipeline placement (mandatory — before concat, after upscale+download)

Insert as its own step between "download 1080p raw clip" and "remux Applio voice" (or between
download and concat, if voice remux happens after concat in a given goal's ordering — always
before the first step that merges scenes together):

```
generate (Omni) -> upscale (1080p) -> download raw -> [THIS STEP: remove watermark] -> remux voice -> concat -> ...
```

Save the watermark-clean output back into `node/scenes/` alongside (not replacing) the raw
download, so both are inspectable if QA needs to compare:
`node/scenes/scene_{N}_1080p_raw.mp4` (Omni's original, watermarked) stays;
`node/scenes/scene_{N}_1080p_nowm.mp4` (this step's output) becomes the input to every downstream
step (voice remux, concat, subtitles, BGM mix, thumbnail-prepend).

## QA — verify before trusting a scene is clean

Crop the bottom-right ~250x250px corner of one frame before and after (ffmpeg `crop=250:250:<W-250>:<H-250>`) and visually diff. A correctly processed frame shows continuous background texture with no sparkle/diamond icon and no visible seam/blur block where the mark was. Do not assume success from exit code alone — spot-check at least one frame per scene.

## Definition of Done

- Every scene's raw 1080p download has a corresponding `_nowm.mp4` sibling before concat runs.
- Spot-check crop confirms the watermark region is clean (no residual sparkle, no visible patch
  artifact) on at least one frame per scene.
- All watermark-removal intermediates live under the unit's `node/scenes/` — never at the unit
  root, never skipped silently.

## Graph

[[../../flowkit/skills/fk-omni-video-gen|fk-omni-video-gen (produces the raw clip this consumes)]] ·
[[../../../goal/[social]_[ai-clone-short-video]|ai-clone-short-video goal]] ·
[[../../../goal/[social]_[ai-ugc-short-video]|ai-ugc-short-video goal]]
