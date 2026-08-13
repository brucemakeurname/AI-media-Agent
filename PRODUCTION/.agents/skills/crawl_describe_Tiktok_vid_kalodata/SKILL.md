---
name: crawl_describe_Tiktok_vid_kalodata
description: Download and deeply describe hand-picked reference videos from direct Kalodata MP4 URLs (live.kalocdn.com). Process one URL at a time into a per-keyframe shooting-script reference and keep the source MP4 beside it in BASE/BRAND KITs/6. Script_Template/. Uses a resumable checklist; no third-party downloader API, F12, browser-session extraction, or auto-discovery required.
---

# crawl_describe_Tiktok_vid_kalodata

Turns a **hand-picked list of direct Kalodata MP4 video URLs** into richly described, per-keyframe
shooting-script references in `BASE/BRAND KITs/6. Script_Template/`. This is the direct-video
manual-curation path: the human selects the videos worth studying and provides their direct
Kalodata CDN video URLs (`https://live.kalocdn.com/video/{video_id}.mp4?...`).

Owned by the **researcher** role (`.claude/agents/researcher.md`).

## Scope guardrails

- **Direct Kalodata MP4 URLs only.** A valid URL starts with `https://live.kalocdn.com/video/` and
  contains `{video_id}.mp4`. Skip anything that is private, deleted, non-MP4, or an invalid format;
  record the reason in the checklist.
- **One video at a time, strictly sequential.** Do not batch-download, parallelize, or fan out
  the URL list. Fully download, verify, describe, save, and mark one item before starting the next.
- Direct download via standard HTTP `curl`; no third-party downloader API or extra credentials required.
- Do not print, commit, or copy signed query token values into markdown references or reports unnecessarily.
- The source video is a reference asset. Do not reuse its dialogue, captions, music, product
  claims, logos, or creator likeness in campaign output. Paraphrase observed copy and narration.

## Input — direct Kalodata video URL list

The user supplies a list file containing one direct Kalodata MP4 URL per line. Optional `niche` and
`format` hints may be supplied beside each URL, but are confirmed from the footage before saving:

```yaml
- video: https://live.kalocdn.com/video/{{video_id}}.mp4?key={{signed_key}}&time={{expiry_epoch_ms}}
  niche: Fitness             # optional
  format: product-demo       # optional
```

No browser DevTools, cookie extraction, or extra token setup required.

## Step 0 — Load list + open/repair progress checklist

Progress file: `BASE/BRAND KITs/6. Script_Template/_crawl-progress.md`.

1. If it exists, resume from the first unchecked item. Trust `[x]` marks and do not download or
   describe an already completed item.
2. If it does not exist, create it from the user's list:

```markdown
# Crawl progress — started {{YYYY-MM-DD HH:MM}} — {{N}} Kalodata videos
Source list: {{list file path}}

- [ ] {{video_id}} — status: pending
```

Update the checklist after every video. It is the source of truth for resumability.

## Per-video loop — process only the first unchecked item

### Step 1 — Validate URL + fetch direct source video

1. Confirm the URL is a direct Kalodata MP4 URL (`https://live.kalocdn.com/video/{video_id}.mp4...`)
   and derive `{video_id}` from the filename segment before `.mp4`. If invalid, mark `skipped (invalid Kalodata video URL)` and continue.
2. Create staging directory `node/staging/kalodata-{{video_id}}/`.
3. Download the video directly to `node/staging/kalodata-{{video_id}}/source.mp4`:

```bash
curl --fail --location --silent --show-error \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "{{direct_kalodata_url}}" \
  -o node/staging/kalodata-{{video_id}}/source.mp4
```

4. Verify `source.mp4` exists, is an MP4 file, and has non-zero size. If download fails, mark `blocked (Kalodata download failed)`.

### Step 2 — Verify + extract

- Project tools runtime: `PRODUCTION/video_modules/hyperframes/.venv-tools` (wrappers in `~/.local/bin`).
- Verify `source.mp4` is an MP4 and has non-zero size. If `ffprobe` is available, verify actual
  duration, resolution, and both video/audio streams; otherwise record the missing tool as a
  blocker and retain the raw video for human QA.
- Extract iconic reference keyframes with `ffmpeg` when available:
  - **Interval:** Sample candidate keyframes every 3 seconds (0s, 3s, 6s, ...).
  - **Deduplication:** Compare each candidate with the last accepted keyframe. If the two look
    materially the same—same framing, subject pose, product/text state, and scene composition—
    discard the later candidate and evaluate the next 3-second candidate. Keep a frame only for a
    visually distinct moment, scene, or transition.
  - Store accepted frames in `node/staging/kalodata-{{video_id}}/iconic-frames/`, named with their
    timestamps, so they remain usable as visual-reference assets in later workflow steps.
- When audio tooling is available, extract mono 16 kHz WAV and transcribe through `whisperx`:

```bash
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 \
  whisperx audio.wav --model small --language {{vi|en}} --output_format json \
  --compute_type int8 --output_dir wx
```

  `segments: []` is valid for music/text-only videos; record `Dialogue / VO: none` and do not
  retry. Time-sync frames to nearby transcript segments before describing.

### Step 3 — Watch + describe (deep pass)

Write the reference using the canonical schema:
`BASE/BRAND KITs/6. Script_Template/_shooting-script-template.md`.

For every scene, capture the fine-grained fields required by the schema:

- `Product presence`: product entry/exit, angle, prominence, handling, and timing.
- `Element motion`: subject, product, text, props, camera movement, and movement from → to.
- `VFX`: effect, affected element, and visual purpose.
- `On-screen text`: **paraphrased** meaning, position, hierarchy, animation, and persistence.
- `Dialogue / VO`: **paraphrased** rhetorical structure, never a verbatim transcript.
- `Emphasis / Pacing`: cut rate, dominant beat, claim repetition, and attention reset.
- `Transition out` and `Keyframes`: use the accepted iconic frames as reference; include each
  frame's timestamp/file name in the Keyframe line for a visually distinct moment.

Also complete `script_mode` (`narrative`, `message-stack`, `tutorial-usecase`, or `hybrid`),
`## CTA Analysis`, and `## Conversion Mechanics`.

### Step 4 — Save entry + retain source MP4

Create a niche folder when needed. Use these final paths:

```text
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}.md
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}.mp4
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}-keyframes/
```

- `{content-slug}` is a hand-written, two-to-five-word creator/product label.
- Move the verified `source.mp4` and accepted `iconic-frames/` folder beside the Markdown reference.
- Discard only rejected keyframe candidates, WAV, transcript scratch files, and temporary montage after the Markdown reference passes visual QA.

### Step 5 — Mark progress

Change the item to:

```markdown
- [x] {{video_id}} — status: done → {{final .md filename}}
```

Then continue with the next unchecked item only.

## Step 6 — Finish the batch

When every item is resolved (`done` or `skipped`), delete
`BASE/BRAND KITs/6. Script_Template/_crawl-progress.md`. Report one concise line per video with
niche, format, script mode, final filename, or skip reason.

## Do / Don't

- **DO** download directly from the `live.kalocdn.com` URL into `source.mp4`.
- **DO** preserve the verified source MP4 beside the reference Markdown for human QA.
- **DO** verify the saved file is video data before calling it complete.
- **DO** save accepted 3-second iconic keyframes in the reference directory and discard the later
  candidate when it is visually redundant with the last accepted keyframe.
- **DON'T** process URLs in parallel, copy source text verbatim, or reuse source creative/product facts without separate approval.

## Graph

**Owner role:** [[../.claude/agents/researcher|researcher]]  
**Canonical schema:** [[../../../BASE/BRAND KITs/6. Script_Template/_shooting-script-template|shooting-script template]]  
**Direct-Ads-Library sibling:** [[../crawl_describe_TiktokAds_Template/SKILL|crawl_describe_TiktokAds_Template]]
