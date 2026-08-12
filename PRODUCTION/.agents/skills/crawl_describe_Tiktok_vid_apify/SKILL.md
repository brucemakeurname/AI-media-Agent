---
name: crawl_describe_Tiktok_vid_apify
description: Download and deeply describe hand-picked public TikTok videos from direct post URLs through Apify TikTok Video Downloader. Process one URL at a time into a per-keyframe shooting-script reference and keep the source MP4 beside it in BASE/BRAND KITs/6. Script_Template/. Uses a resumable checklist; no F12, browser-session extraction, Ads Library page, or auto-discovery required.
---

# crawl_describe_Tiktok_vid_apify

Turns a **hand-picked list of public TikTok post URLs** into richly described, per-keyframe
shooting-script references in `BASE/BRAND KITs/6. Script_Template/`. This is the direct-video
manual-curation path: the human selects the videos worth studying and provides their canonical
TikTok post URLs; Apify retrieves the downloadable MP4.

Owned by the **researcher** role (`.claude/agents/researcher.md`).

## Scope guardrails

- **Public TikTok post URLs only.** A canonical URL has the form
  `https://www.tiktok.com/@{handle}/video/{video_id}`. Skip anything that is private, deleted,
  a profile URL, an Ads Library/Creative Center URL, or any non-TikTok URL; record the reason in
  the checklist.
- **One video at a time, strictly sequential.** Do not batch-download, parallelize, or fan out
  the URL list. Fully download, verify, describe, save, and mark one item before starting the next.
- Use `api-ninja/tiktok-video-downloader` through the Apify REST API. `APIFY_API_TOKEN` must be
  loaded from `PRODUCTION/env.local`; never print, paste, commit, upload, or add its value to a
  report, output file, or Notion page.
- The source video is a reference asset. Do not reuse its dialogue, captions, music, product
  claims, logos, or creator likeness in campaign output. Paraphrase observed copy and narration.

## Input — direct TikTok URL list

The user supplies a list file containing one public TikTok post URL per line. Optional `niche` and
`format` hints may be supplied beside each URL, but are confirmed from the footage before saving:

```yaml
- video: https://www.tiktok.com/@ultimatesupsingapore/video/7672664087678995732
  niche: Fitness             # optional
  format: product-demo       # optional
- video: https://www.tiktok.com/@creator/video/1234567890123456789
```

No browser DevTools, cookie extraction, page HTML parsing, or manually copied CDN URL is required.

## Step 0 — Load list + open/repair progress checklist

Progress file: `BASE/BRAND KITs/6. Script_Template/_crawl-progress.md`.

1. If it exists, resume from the first unchecked item. Trust `[x]` marks and do not download or
   describe an already completed item.
2. If it does not exist, create it from the user's list:

```markdown
# Crawl progress — started {{YYYY-MM-DD HH:MM}} — {{N}} TikTok videos
Source list: {{list file path}}

- [ ] {{video_id}} — {{post url}} — status: pending
```

Update the checklist after every video. It is the source of truth for resumability.

## Per-video loop — process only the first unchecked item

### Step 1 — Validate URL + fetch Apify metadata and source video

1. Confirm the URL is a canonical public TikTok post URL and derive `{video_id}` from `/video/{id}`.
   If invalid, mark `skipped (invalid/non-public TikTok post URL)` and continue.
2. Load the credential without printing it:

```bash
set -a
source PRODUCTION/env.local
set +a
test -n "$APIFY_API_TOKEN"
```

3. Call the downloader with `videoUrls` and `ttl: "none"`:

```bash
curl --fail --silent --show-error \
  -H "Authorization: Bearer $APIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  "https://api.apify.com/v2/acts/api-ninja~tiktok-video-downloader/run-sync-get-dataset-items?timeout=180" \
  --data '{"videoUrls":["{{post_url}}"],"ttl":"none"}' \
  > node/staging/tiktok-{{video_id}}/apify-result.json
```

4. Require `code: 0` and extract `data.play` as the no-watermark MP4 link. If `data.play` is
   absent, the run is unsuccessful, or the content is not a video, mark `blocked (Apify no MP4)`;
   retain `apify-result.json` for diagnosis and do not guess/rebuild a CDN URL.
5. Download only that returned `data.play` link into
   `node/staging/tiktok-{{video_id}}/source.mp4`, with `Referer: https://www.tiktok.com/` and a
   standard desktop User-Agent. Apify returns signed links that expire; if the download fails,
   re-run this step to obtain a new `data.play`, then retry once.

### Step 2 — Verify + extract

- Project tools runtime: `PRODUCTION/video_modules/hyperframes/.venv-tools` (wrappers in `~/.local/bin`).
Verify `source.mp4` is an MP4 and has non-zero size. If `ffprobe` is available, verify actual
  duration, resolution, and both video/audio streams; otherwise record the missing tool as a
  blocker and retain the raw video for human QA.
- Extract frames with `ffmpeg` when available: cap at approximately 100 frames, width ≤512 px,
  with an adaptive sampling density. Build a montage first, then extract individual frames only
  where on-screen copy, product detail, or a transition needs closer inspection.
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
- `Transition out` and `Keyframes`: one Keyframe line for each visually distinct moment.

Also complete `script_mode` (`narrative`, `message-stack`, `tutorial-usecase`, or `hybrid`),
`## CTA Analysis`, and `## Conversion Mechanics`.

### Step 4 — Save entry + retain source MP4

Create a niche folder when needed. Use these final paths:

```text
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-tiktok-{content-slug}-{video_id}.md
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-tiktok-{content-slug}-{video_id}.mp4
```

- `{content-slug}` is a hand-written, two-to-five-word creator/product label.
- Move the verified `source.mp4` beside the Markdown reference.
- Keep `apify-result.json` only in staging or as an internal trace record; it must not contain the
  API token. Discard extracted frames, WAV, transcript scratch files, and montage after the Markdown
  reference passes visual QA.

### Step 5 — Mark progress

Change the item to:

```markdown
- [x] {{video_id}} — {{post url}} — status: done → {{final .md filename}}
```

Then continue with the next unchecked item only.

## Step 6 — Finish the batch

When every item is resolved (`done` or `skipped`), delete
`BASE/BRAND KITs/6. Script_Template/_crawl-progress.md`. Report one concise line per video with
niche, format, script mode, final filename, or skip reason.

## Do / Don't

- **DO** use Apify's `data.play` field for the download, not the TikTok page URL, cover URL,
  subtitle URL, `wmplay`, or a manually constructed CDN URL.
- **DO** use `ttl: "none"` unless the user explicitly requests persistent Apify storage and accepts
  its storage cost.
- **DO** preserve the verified source MP4 beside the reference Markdown for human QA.
- **DO** verify the saved file is video data before calling it complete; HTML error pages and subtitle
  files can use misleading `.mp4` URLs.
- **DON'T** use Apify auto-discovery; this skill works only from the user's hand-picked direct URLs.
- **DON'T** process URLs in parallel, expose `APIFY_API_TOKEN`, copy source text verbatim, or reuse
  source creative/product facts without separate approval.

## Graph

**Owner role:** [[../.claude/agents/researcher|researcher]]  
**Canonical schema:** [[../../../BASE/BRAND KITs/6. Script_Template/_shooting-script-template|shooting-script template]]  
**Direct-Ads-Library sibling:** [[../crawl_describe_TiktokAds_Template/SKILL|crawl_describe_TiktokAds_Template]]  
**Apify auto-discovery sibling:** [[../crawl_SocialAds_Template_apify/SKILL|crawl_SocialAds_Template_apify]]
