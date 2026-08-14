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

**Never stage under `node/staging/` (PRODUCTION-root or campaign-unit) — this skill has no
campaign unit to begin with (it's a `researcher`-owned library builder, run standalone), and a
staging dir there is dead clutter nobody cleans up.** All working files live inside this skill's
own destination tree, `BASE/BRAND KITs/6. Script_Template/`, from the very first byte.

1. Confirm the URL is a direct Kalodata MP4 URL (`https://live.kalocdn.com/video/{video_id}.mp4...`)
   and derive `{video_id}` from the filename segment before `.mp4`. If invalid, mark `skipped (invalid Kalodata video URL)` and continue.
2. Create the working directory **inside the destination library**, not a scratch path elsewhere:
   `BASE/BRAND KITs/6. Script_Template/.staging/kalodata-{{video_id}}/`. The leading dot keeps it
   out of casual directory listings; Step 4 below deletes it once the final niche-folder move
   completes, so it never persists as visible clutter.
3. Download the video directly to `BASE/BRAND KITs/6. Script_Template/.staging/kalodata-{{video_id}}/source.mp4`:

```bash
curl --fail --location --silent --show-error \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  "{{direct_kalodata_url}}" \
  -o "BASE/BRAND KITs/6. Script_Template/.staging/kalodata-{{video_id}}/source.mp4"
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
  - Store accepted frames in `BASE/BRAND KITs/6. Script_Template/.staging/kalodata-{{video_id}}/iconic-frames/`,
    named with their timestamps, so they remain usable as visual-reference assets in later
    workflow steps.
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

**Grounding contract — read before writing anything.** Every field below must be directly
verifiable in a specific accepted keyframe (cite its filename/timestamp) or in the actual
`whisperx` transcript segment — never inferred from the video's genre/niche or copied from a
generic product-demo template. A 2026-08-14 incident on this exact skill produced a reference
(`Fitness-product-demo-kalodata-mutant-big-greens-...md`) that described "a green smoothie" with
"creator speaks in an authentic conversational voice" for a source video that was actually a
**different product** (a pink protein powder, not a green smoothie), shot **hands-only with no
face ever visible**, against **one unchanging kitchen backdrop** for the full 24s — the written
description was fabricated, not observed, and every downstream step (shooting script → sequence
script → Omni render) compounded the drift until the final clone showed an on-camera talking
creator in a different apartment. Do not repeat this: open every accepted keyframe image and
confirm each claim against actual pixels before writing it down; run `whisperx` on the extracted
audio and quote/paraphrase only what it actually transcribed (silence/ambient-only audio is a
valid, common outcome — record `Dialogue / VO: none (ambient/SFX only)` rather than inventing a
narration).

For every scene, capture the fine-grained fields required by the schema:

- `Product presence`: product entry/exit, angle, prominence, handling, and timing. Confirm the
  exact product name/flavor/packaging visible in-frame — do not assume it matches the ticket's
  target brand/product; the source's actual product is reference-only and gets swapped later.
- `Element motion`: subject, product, text, props, camera movement, and movement from → to.
- `VFX`: effect, affected element, and visual purpose.
- `On-screen text`: **paraphrased** meaning, position, hierarchy, animation, and persistence.
- `Dialogue / VO`: **paraphrased** rhetorical structure, sourced from the actual `whisperx`
  transcript — never a verbatim transcript, and never fabricated when the transcript is empty.
- `Emphasis / Pacing`: cut rate, dominant beat, claim repetition, and attention reset.
- `Transition out` and `Keyframes`: use the accepted iconic frames as reference; include each
  frame's timestamp/file name in the Keyframe line for a visually distinct moment.
- **`Subject visibility` (new, mandatory, whole-video field, not per-beat)**: one of
  `on-camera talking` (a person's face is visible speaking to camera at some point),
  `hands-only` (hands/arms visible manipulating product, face never shown — the common ASMR/
  product-demo pattern), `product-only` (no person, just the product/surface), or `mixed` (state
  exactly which beats show a face vs. which are hands-only). Base this strictly on what the
  accepted keyframes actually show — if no keyframe contains a visible face, the answer is
  `hands-only`, full stop, regardless of whether the audio track has a voiceover.
- **`Audio mode` (new, mandatory, whole-video field)**: one of `on-camera dialogue` (speech is
  synced to a visibly talking mouth), `voiceover narration` (speech plays over B-roll/hands-only
  footage with no speaking mouth on screen — this is the common case when `Subject visibility` is
  `hands-only` and the transcript is non-empty), `ambient/SFX only` (no speech), or `on-screen
  text only` (captions carry the message, no speech). Do not conflate `voiceover narration` with
  `on-camera talking` — they require very different downstream treatment (a voiceover can be kept
  as VO over new B-roll footage of the swapped brand/product; it must never be rewritten into an
  on-camera talking-head scene unless the source genuinely showed one).
- **`Background/Location continuity` (new, mandatory, whole-video field)**: `single location`
  (same room/surface/backdrop identifiable in every accepted keyframe — the common case for a
  short product demo) or `multi-location` (state which beats change location/set). Compare
  backdrop details (counter material, wall/backsplash, visible objects) across every accepted
  keyframe, not just a visual impression.

Also complete `script_mode` (`narrative`, `message-stack`, `tutorial-usecase`, or `hybrid`),
`## CTA Analysis`, and `## Conversion Mechanics`.

### Structural fidelity contract this reference hands downstream

`Subject visibility`, `Audio mode`, and `Background/Location continuity` are **hard constraints**
that `write-shooting-script` and `write-ai-ugc-video-sequence-script` must preserve when adapting
this reference for a new brand/product/creator — exactly as `[social]_[ai-clone-short-video].md`'s
own Structural Fidelity Contract section requires. Only brand identity, product, exact copy, and
(if the source is `hands-only`/`voiceover narration`) an unseen narrator's voice may be swapped;
a `hands-only` + `voiceover narration` source must never be rewritten into an on-camera talking
creator, and a `single location` source must never be rewritten into a multi-location shoot. If a
downstream step needs to deviate from these fields, that is a fidelity violation to flag, not a
silent creative choice.

### Step 4 — Save entry + retain source MP4

Create a niche folder when needed (this is a per-brand/per-niche library folder — e.g. `Fitness/`
— reuse an existing one if the brand/niche already has a folder; only create a new one if it
genuinely does not exist yet). Use these final paths:

```text
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}.md
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}.mp4
BASE/BRAND KITs/6. Script_Template/{biz_niche}/{biz_niche}-{content_format}-kalodata-{content-slug}-{video_id}-keyframes/
```

- `{content-slug}` is a hand-written, two-to-five-word creator/product label.
- Move (not copy) the verified `source.mp4` and accepted `iconic-frames/` folder out of
  `.staging/kalodata-{{video_id}}/` and into the niche folder beside the Markdown reference.
- Discard rejected keyframe candidates, WAV, transcript scratch files, and temporary montage after
  the Markdown reference passes visual QA.
- **Delete the now-empty `BASE/BRAND KITs/6. Script_Template/.staging/kalodata-{{video_id}}/`
  directory** once the move is confirmed (`rmdir` or `rm -rf` after verifying the destination
  files exist and are non-empty) — the staging dir must never be the final resting place of any
  artifact, and must never leak into `PRODUCTION/node/` or any campaign unit's `node/`. A
  downstream `write-shooting-script`/`write-ai-ugc-video-sequence-script` step that needs these
  keyframes reads them from this final `{biz_niche}/...-keyframes/` path, never from `.staging/`.

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
