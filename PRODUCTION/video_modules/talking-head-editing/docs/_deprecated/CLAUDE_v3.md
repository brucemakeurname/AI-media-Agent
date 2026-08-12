# talking-head-editing — CLAUDE.md

## Purpose

This workflow edits raw footage (cut/trim/assembly via FFmpeg) then composites a continuous transparent HyperFrames overlay on top — animated subtitles, stat cards, callouts, branding — running from the first frame to the last. B-roll resolves 50/50 between HyperFrames fullscreen images and internet-crawled media, overlaid on top of the running video (source audio never cuts). SFX fires at every cut point.

This workflow supersedes both `video-edit` (FFmpeg raw edit) and `remotion-composite` (Remotion post-production). Both archived in `7. Archive/remotion-composite-v1/`.

**Input:**
- `{project_path}/footage/` — raw video files
- `{project_path}/edit_instructions.json` — full edit spec (see format below)
- `{project_path}/brief.json` — project brief for context

**Output:** `{project_path}/output/{project_id}_final.mp4`

---

## Visual Architecture

```
┌─────────────────────────────────────┐  ← Layer 3: HyperFrames transparent overlay
│  [subtitle]  [callout]  [stat card] │    (full duration, transparent bg, elements cycle)
├─────────────────────────────────────┤  ← Layer 2: B-roll image overlay (at 35% of cuts)
│  [B-roll image covering frame]      │    (covers video visually, source audio continues)
├─────────────────────────────────────┤  ← Layer 1: Main video (always running)
│  [talking head / main footage]      │    (provides continuous audio track)
└─────────────────────────────────────┘
```

**Core rule:** The main video element never stops. Audio always comes from the main video. Visual layers stack on top.

---

## Overlay Modes

### fullscreen (B-roll)
Covers the full 1080×1920 frame at a cut point. Main video audio continues underneath.
- **50% of B-roll slots** → HyperFrames template render (hook, stat-hero, comparison, etc.)
- **50% of B-roll slots** → image crawled from internet, scaled to fill 1080×1920
- Assigned to **35% of all segments** (seeded random selection, not keyword-gated)
- If crawl fails → fallback to hyperframe, log warning

### transparent-overlay (HyperFrames continuous)
A single HyperFrame composition covering the entire video duration. Transparent background — background video always visible. Contains:
- Subtitle track (always present, from whisper transcription)
- Cycling animated elements (callout, stat-hero, branding) that appear/disappear every 3–5s

### banner-top / banner-bottom
Retained for brief-specified pinned banners only (not default). Same chromakey green spec as before.

---

## Edit Instructions Format

```json
{
  "version": "3.0",
  "project_id": "proj_abc",
  "output_resolution": "1080x1920",
  "output_fps": 30,
  "style": "social",

  "sequence": [
    {
      "id": "seg1",
      "type": "main",
      "source": "footage/main.mp4",
      "in_point": 0.0,
      "out_point": 12.0
    },
    {
      "id": "seg2",
      "type": "main",
      "source": "footage/main.mp4",
      "in_point": 12.0,
      "out_point": 24.0
    }
  ],

  "overlay": {
    "elements": [
      { "template": "callout", "statement": "Tăng trưởng 300%", "tag": "2025", "duration_sec": 4 },
      { "template": "stat-hero", "value": "3.2M", "label": "người dùng hoạt động", "duration_sec": 4 },
      { "template": "hook", "headline": "AI Platform #1", "subhead": "Việt Nam 2025", "duration_sec": 3 }
    ],
    "subtitle": {
      "enabled": true,
      "source": "auto",
      "style": "tiktok-bold"
    }
  },

  "broll_pool": [
    {
      "id": "br1",
      "source_strategy": "hyperframe",
      "template": { "template": "stat-hero", "value": "AI", "label": "Nền tảng influencer AI đầu tiên" }
    },
    {
      "id": "br2",
      "source_strategy": "crawl",
      "crawl_query": "AI technology Vietnam 2025",
      "crawl_type": "image"
    }
  ],

  "audio": {
    "sfx_enabled": true,
    "clip_audio_volume": 0.85
  },

  "exclude_regions": [
    { "source": "footage/main.mp4", "from": 4.2, "to": 7.8,  "reason": "stumble" },
    { "source": "footage/main.mp4", "from": 22.0, "to": 29.5, "reason": "repeat" }
  ],

  "auto_rough_cut": false
}
```

**Notes:**
- No `effects` block — film grain, vignette, noise overlay, fade overlay are removed.
- No `transitions` block — all cuts are standard cuts (no xfade, no crossfade, no fade-to-black).
- `broll_pool` defines available B-roll assets; the pipeline randomly assigns them to 35% of segments.
- `overlay.elements` cycle continuously throughout the video.
- `style: "social"` → TikTok/Reels; standard cuts are the default and only transition type.
- `exclude_regions` — operator-marked bad footage (silence, stumble, repeat, wrong pronunciation, wrong intonation). Processed in Phase 0 before normalization.
- `auto_rough_cut: true` — apply automatic detection (long silence + repeat detection via transcript) without operator review. Default false.

---

## Phase 0: Rough Cut — Remove Bad Footage

**Run this phase before normalizing.** The goal is to produce a clean `footage/main_clean.mp4` (or per-source clean files) that contains only usable speech. All downstream phases operate on clean footage only.

### 0.1 Operator-Provided Exclusion Marks (Primary Method)

The operator reviews raw footage and marks bad regions in `edit_instructions.json` under `exclude_regions`. This is the most accurate method and must always be checked first.

```json
{
  "exclude_regions": [
    { "source": "footage/main.mp4", "from": 4.2, "to": 7.8,  "reason": "stumble" },
    { "source": "footage/main.mp4", "from": 22.0, "to": 29.5, "reason": "repeat" },
    { "source": "footage/main.mp4", "from": 58.1, "to": 58.9, "reason": "wrong_pronunciation" },
    { "source": "footage/main.mp4", "from": 91.4, "to": 97.2, "reason": "wrong_intonation" }
  ]
}
```

**Reason tags:**
| Tag | Description |
|---|---|
| `silence` | Dead air / thinking pause longer than natural word gap |
| `stumble` | Speaker starts a word or phrase then resets |
| `repeat` | Same phrase or sentence said twice — keep only the last (better) take |
| `wrong_pronunciation` | Clearly mispronounced word, speaker did not self-correct |
| `wrong_intonation` | Sentence ends with wrong rise/fall, sounds unconfident or robotic |
| `noise` | Background noise spike, cough, chair scrape, etc. |
| `off_script` | Speaker deviated significantly from teleprompter content |

**Processing:** For each source, collect all `exclude_regions` sorted by `from`, invert to get `include_regions`, then extract and concatenate include regions:

```
ffmpeg -i footage/main.mp4
  -ss {include_start} -to {include_end} -c copy footage/rough/{source}_part_{n}.mp4

ffmpeg -f concat -safe 0 -i footage/rough/concat_{source}.txt
  -c copy footage/main_clean.mp4
```

Write `logs/rough_cut.log` with each excluded region, reason, and duration removed.

### 0.2 Automatic Detection (Fallback — when exclude_regions absent or incomplete)

If no `exclude_regions` are provided, run auto-detection to flag candidates for the most common issues. Write `logs/rough_cut_candidates.json` — the operator should review before proceeding. If `auto_rough_cut: true` in `edit_instructions.json`, apply automatically without review.

**Long silence removal** — dead air > 0.5s between words:
```
ffmpeg -i footage/main.mp4 -af "silencedetect=n=-40dB:d=0.5" -f null - 2>&1
```
Any `silence_start`→`silence_end` gap longer than 0.5s is flagged as `silence`. Gaps 0.25s–0.5s are preserved (natural breathing pauses between sentences).

**Repeat detection** — requires Whisper transcript:
```
whisper footage/main.mp4 --model medium --language vi --output_format json --output_dir logs/
```
Parse `logs/main.json` word timestamps. Flag any phrase (≥4 words) that appears twice within a 30s window as a `repeat` — exclude the first occurrence, keep the second (the re-read is always cleaner).

**Stumble detection** — very short speech bursts followed by a restart:
Segments shorter than 0.3s that are immediately followed by near-identical words in the transcript are flagged as `stumble`. Auto-remove.

### 0.3 Clean Footage Output

After Phase 0:
- `footage/main_clean.mp4` exists (or `footage/{source}_clean.mp4` per source)
- All downstream phases use `_clean.mp4` as input, not the original raw file
- If no exclusions were applied (no bad regions), `main_clean.mp4` = symlink or copy of original
- Log total duration removed in `logs/rough_cut.log`

**Quality gate:** If > 40% of source duration was excluded, halt and flag for operator review. Excessive removal may indicate wrong source file or a very bad take that needs to be re-recorded.

---

## Phase 1: Raw Edit

### 1.1 Prerequisites Check
- All `type: main` sources exist in `footage/`
- `edit_instructions.json` and `brief.json` present
- Every source passes ffprobe validation (valid video stream, duration > 0)
- `footage/main_clean.mp4` exists (produced by Phase 0) — use this as input for all Phase 1 operations
- Halt on any missing or invalid source — do not attempt partial edit

### 1.2 Normalize Source Footage
Convert all sources to consistent format:

```
ffmpeg -i {source} -c:v libx264 -crf 18 -c:a aac -ar 44100 -r 30
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30,setpts=PTS-STARTPTS"
  -af "asetpts=PTS-STARTPTS"
  normalized/{filename}.mp4
```

`-r 30` and `fps=30` are mandatory — xfade and overlay operations require identical frame rates. Always re-encode during normalization; never use `-c copy` here.

### 1.3 Cut Segments — Force-Split at 1.8s Max

For each `type: main` entry, detect word/silence boundaries then force-split any segment longer than 1.8s:

**Step 1 — Silence detection:**
```
ffmpeg -i normalized/{source} -af "silencedetect=n=-40dB:d=0.3" -f null - 2>&1
```
Parse `silence_start` / `silence_end` markers to find natural cut points within the in_point→out_point range.

**Step 2 — Force-split long gaps:**
Any sub-segment longer than **1.8 seconds** is split at the nearest word boundary (midpoint of the gap if no word boundary detected). `MIN_SEG_DURATION = 0.2s` — preserve short emphatic phrases.

**Step 3 — Cut each sub-segment:**
```
ffmpeg -i normalized/{source} -ss {in_point} -to {out_point} -c copy segments/seg_{id}_{n}.mp4
```
On FFmpeg error: retry once with `-c:v libx264 -c:a aac`. Second failure → halt and log.

**Expected output:** A 90–120s talking-head video produces ~40–60 segments.

Write `segments/cuts.json`:
```json
{
  "total_segments": 47,
  "segments": [
    { "id": "seg1_0", "source_seg": "seg1", "in": 0.0, "out": 1.62, "duration": 1.62 },
    { "id": "seg1_1", "source_seg": "seg1", "in": 1.62, "out": 3.21, "duration": 1.59 },
    ...
  ]
}
```

### 1.4 B-Roll Slot Assignment

Assign B-roll to **35% of all segments** using seeded random selection:
- Seed: `{project_id}` string hash (deterministic — same project always gets same assignment)
- Skip segments shorter than 0.5s (too short to display B-roll)
- Distribute B-roll pool items evenly across assigned slots; cycle through pool if slots > pool size

Write `segments/broll_assignments.json`:
```json
{
  "broll_slots": [
    { "segment_id": "seg1_3", "broll_id": "br1", "start_sec": 5.4 },
    { "segment_id": "seg1_7", "broll_id": "br2", "start_sec": 11.2 },
    ...
  ]
}
```

### 1.5 Audio Continuity Rules

- **No transitions.** All segment cuts are standard hard cuts — `cut` only, no xfade, no crossfade.
- **20ms audio crossfade at every cut point** to prevent pops:
  ```
  ffmpeg -i segA.mp4 -i segB.mp4
    -filter_complex "[0:a][1:a]acrossfade=d=0.02:c1=exp:c2=exp[aout]"
    -map 0:v -map "[aout]" joined_A_B.mp4
  ```
- **B-roll does not cut the audio.** The main video audio track plays continuously under every B-roll visual overlay (see Phase 3).

### 1.6 Minimum Segment Check

- Segments < 0.2s: drop silently and log.
- Segments 0.2s–0.5s: include, flag in log as short.
- Segments > 1.8s: must have been force-split in 1.3 — log as warning if any survive.

---

## Phase 2: B-Roll Resolution

### Strategy: `hyperframe`
1. Build single-scene HyperFrame composition using the `template` spec from `broll_pool`
2. Render: `npx hyperframes render --compositionDir broll_renders/br_{id}_comp --output broll_renders/br_{id}.mp4`
3. Normalize to 1080×1920 30fps h264 aac 44100Hz

### Strategy: `crawl`
1. WebSearch using `crawl_query`
2. Download first viable image via WebFetch
3. Convert image to video (full-frame fill + ken-burns, scale 1.0 → 1.03 — **subtle drift only**):

```
ffmpeg -loop 1 -i {image}
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
       zoompan=z='if(lte(zoom\,1.0)\,1.0\,min(zoom+0.0003\,1.03))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={fps*duration}:s=1080x1920,
       fps=30,setpts=PTS-STARTPTS"
  -t {duration} -c:v libx264 -crf 18 -c:a aac
  broll_renders/br_{id}.mp4
```

**Max zoom: 1.03 (3% drift).** No aggressive zoompan — subtle motion only for a clean, modern look.

4. On failure → fallback to `hyperframe`, log warning

---

## Phase 3: Assembly — Video Always Running

**Do NOT concatenate B-roll into the main video timeline.** The main video is assembled as one continuous file. B-roll is applied as a visual overlay in the filter_complex.

### 3.1 Assemble Main Video (Continuous)

Build `segments/concat_list.txt` from all segments in order (no B-roll entries):
```
file 'seg1_0.mp4'
file 'seg1_1.mp4'
file 'seg1_2.mp4'
...
```

Concatenate with 20ms audio crossfade at each join:
```
ffmpeg -f concat -safe 0 -i segments/concat_list.txt
  -c:v libx264 -c:a aac -crf 18 -r 30
  assembled.mp4
```

### 3.2 Apply B-Roll as Visual Overlay

Build the FFmpeg filter chain for all B-roll assignments. Each B-roll overlays the full frame at its `start_sec` timestamp for its duration:

```
ffmpeg -i assembled.mp4
  -i broll_renders/br_1.mp4
  -i broll_renders/br_2.mp4
  ...
  -filter_complex "
    [1:v]scale=1080:1920[br1];
    [2:v]scale=1080:1920[br2];
    [0:v][br1]overlay=0:0:enable='between(t,{start1},{end1})'[v1];
    [v1][br2]overlay=0:0:enable='between(t,{start2},{end2})'[v2];
    ...
  "
  -map "[vN]" -map 0:a
  -c:v libx264 -c:a copy -crf 18
  assembled_broll.mp4
```

**Key:** `-map 0:a` — audio is always the main video's audio track. B-roll clips provide visual only; their audio is never used.

---

## Phase 4: Continuous Transparent HyperFrames Overlay

A single HyperFrame HTML composition covering the full video duration. Elements cycle throughout — no dead air without an element on screen.

### 4.1 Generate Overlay Schedule

From `overlay.elements` and total video duration, build a full-coverage schedule:

```json
{
  "total_duration_sec": 93.4,
  "schedule": [
    { "template": "callout", "start": 0.0, "end": 4.0, "data": {...} },
    { "template": "stat-hero", "start": 4.5, "end": 8.5, "data": {...} },
    { "template": "hook", "start": 9.0, "end": 12.0, "data": {...} },
    { "template": "callout", "start": 12.5, "end": 16.5, "data": {...} },
    ...
  ]
}
```

Rules:
- Gap between elements: 0.5s (element exits, brief pause, next enters)
- Element duration: use `duration_sec` from spec; default 4s
- Cycle through `overlay.elements` list repeatedly until full duration covered
- Subtitle track is continuous (no gaps — see Phase 5)

### 4.2 Render Transparent HyperFrames Composition

Create `overlays/continuous_comp/index.html` with:
- `body { background: transparent; }` — **no solid background color**
- All scene container backgrounds: transparent or semi-transparent (`rgba(10,10,20,0.75)`)
- Elements use the schedule from 4.1 — each scene has `data-start` / `data-duration` matching the schedule
- Subtitle scenes interspersed throughout (see Phase 5)

**Preferred render — ProRes 4444 MOV (native alpha, pixel-perfect fades):**
```
npx hyperframes@0.6.4 render --format mov
```
Output: `renders/{name}.mov` — codec `prores`, pix_fmt `yuva444p12le` (12-bit alpha).

This is the correct approach. Fades, partial opacity, and smooth enter/exit transitions all composite perfectly because alpha is stored per-pixel at full precision. No green fringing.

Composite onto main video:
```
ffmpeg -i assembled_broll.mp4
  -itsoffset {overlay_start_sec}
  -i overlays/continuous_overlay.mov
  -filter_complex "[0:v][1:v]overlay=0:0[out]"
  -map "[out]" -map 0:a
  -c:v libx264 -crf 18 -c:a copy
  composited.mp4
```

**Fallback — WebM VP9 (if MOV not supported downstream):**
```
npx hyperframes@0.6.4 render --format webm
```
Note: `--format webm` may output `yuv420p` (no alpha) if the renderer does not detect a transparent background. Verify with `ffprobe` that `pix_fmt=yuva420p` before relying on it. If it outputs `yuv420p`, use MOV instead.

**Avoid — Chromakey green (#00FF00):** Semi-transparent pixels during fade-in/fade-out are not fully keyed, causing visible green fringing. Only use chromakey as a last resort when neither MOV nor WebM alpha is available.

### 4.3 Element Style Rules (Clean + Modern)

All HyperFrame elements in this workflow must follow:
- **No film grain** — elements must be clean vectors/text
- **No noise overlay** — removed
- **No full-frame fade overlays** — removed
- Background: `rgba(10,10,20,0.80)` pill or card — not full-frame opaque
- Fonts: Inter (headings 700–900), no decorative fonts
- Colors: white text, accent `#00ffcc` or brand color
- Animation: slide-in from bottom or fade-in — fast (0.3s), no slow fades
- Drop shadow on text for readability on any background: `text-shadow: 0 2px 8px rgba(0,0,0,0.8)`

---

## Phase 5: Subtitles (Always Required)

Subtitles are mandatory in every project. Style: TikTok-bold — high contrast, centered, readable on any background.

### 5.1 Transcription

If `overlay.subtitle.source: "auto"` — transcribe from assembled video audio using Whisper:
```
whisper assembled.mp4 --model medium --language vi --output_format srt --output_dir subtitles/
```

If a transcript SRT is provided in `footage/` — use it directly. Never skip subtitles.

### 5.2 Subtitle Injection into Overlay Composition

Add subtitle scenes to `overlays/continuous_comp/index.html` alongside the element schedule. Subtitle scenes:
- Position: 75% from top (above TikTok UI zone)
- Font: Inter 700, 36–42px, white
- Background: `rgba(0,0,0,0.55)` pill — 8px border-radius, 8px padding horizontal
- Max 2 lines, 38 chars per line
- Animation: fade-in 0.1s, hold, fade-out 0.1s at word boundaries
- Word-level highlight: current spoken word gets `color: #00ffcc`

### 5.3 Fallback — Burn Subtitles via FFmpeg

If HyperFrames overlay path fails, burn subtitles directly:
```
ffmpeg -i composited.mp4 -vf "subtitles=subtitles/{project_id}.srt:force_style='FontName=Inter,FontSize=38,Bold=1,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Shadow=1,Alignment=2,MarginV=200'" -c:a copy output/{project_id}_final.mp4
```

---

## Phase 6: SFX + Audio Mix

### 6.1 SFX at Every Cut Point

SFX fires at **every segment cut**, not just at overlay positions. Assign SFX from `hyperframe-video-gen/assets/sfx/` pool:

| Segment index | SFX file | Volume |
|---|---|---|
| Every cut | `transition/swoosh.mp3` or `emphasis/tick.mp3` (alternating) | 0.3 |
| At B-roll start | `transition/swoosh.mp3` | 0.4 |
| At overlay element entry | per template (see table below) | 0.4 |

Template SFX mapping:
| Template | SFX |
|---|---|
| `hook` | `transition/swoosh.mp3` |
| `stat-hero` | `emphasis/tick.mp3` |
| `callout` | `alert/notification.mp3` |
| `comparison` | `transition/swoosh.mp3` |
| `outro` | `outro/tada.mp3` |

Build full SFX mix:
```
ffmpeg -i composited.mp4
  -i sfx1.mp3 -i sfx2.mp3 ... -i sfxN.mp3
  -filter_complex "
    [0:a]volume={clip_audio_volume}[main];
    [1:a]adelay={cut1_ms}|{cut1_ms},volume=0.3[s1];
    [2:a]adelay={cut2_ms}|{cut2_ms},volume=0.3[s2];
    ...
    [main][s1][s2]...[sN]amix=inputs={N+1}:normalize=0:duration=first[aout]
  "
  -map 0:v -map "[aout]" -c:v copy -c:a aac -ar 44100
  output/{project_id}_final.mp4
```

### 6.2 Ambient Music (Optional)

Only if `audio.ambient` is specified in the brief. Default: no ambient music — clip audio + SFX only. If specified:
```
ffmpeg -i composited_sfx.mp4 -stream_loop -1 -i {ambient_source}
  -filter_complex "
    [1:a]atrim=end={total_duration},
         afade=t=in:st=0:d={fade_in},
         afade=t=out:st={total_dur-fade_out}:d={fade_out},
         volume={volume}[ambient];
    [0:a][ambient]amix=inputs=2:normalize=0[aout]
  "
  -map 0:v -map "[aout]" -c:v copy -c:a aac
  output/{project_id}_final.mp4
```

---

## Phase 7: Thumbnail Signal

Write `output/thumbnail-needed.json` — signals Design Hub to generate thumbnail:
```json
{
  "project_id": "{project_id}",
  "source_video": "output/{project_id}_final.mp4",
  "requested_at": "{UTC ISO timestamp}",
  "frame_hint_sec": 8,
  "status": "pending"
}
```

---

## Output Validation

1. File exists at `output/{project_id}_final.mp4`
2. ffprobe confirms: h264 video, aac audio, duration > 5s, duration within ±2s of expected total
3. File size > 1MB
4. Subtitle file exists at `subtitles/{project_id}.srt`

---

## Manifest Contract

Start: `{ "edit_status": "in-progress", "phase": "raw-edit" }`

Per-phase updates: `"phase": "broll-resolution" | "assembly" | "overlay" | "subtitles" | "audio" | "complete"`

On success:
```json
{
  "edit_status": "complete",
  "output": "output/{project_id}_final.mp4",
  "total_duration_sec": 93.4,
  "segments_cut": 47,
  "broll_slots_applied": 16,
  "overlay_elements_cycled": 23,
  "subtitles_included": true,
  "sfx_fires": 47,
  "completed_at": "ISO 8601 timestamp"
}
```

---

## Error Logging

All errors to `{project_path}/logs/edit_errors.log`:
```
[TIMESTAMP] PHASE {N} FAILED
Stage: {normalize|cut|force-split|broll_render|broll_crawl|assembly|overlay_render|composite|subtitles|audio|validation}
Source: {file that caused error}
Error: {error message}
Command: {ffmpeg command that failed}
Action: {retry|fallback|halt}
---
```

---

## Intermediate Files Structure

```
{project_path}/
├── footage/                      ← input raw clips (originals — never modified)
│   ├── main.mp4                  ← raw footage
│   ├── main_clean.mp4            ← Phase 0 output (bad regions removed)
│   └── rough/                    ← Phase 0 intermediate parts (concat pieces)
├── normalized/                   ← Phase 1.2 normalized sources (from main_clean.mp4)
├── segments/
│   ├── seg_{id}_{n}.mp4          ← Phase 1.3 force-split segments
│   ├── cuts.json                 ← segment manifest
│   ├── broll_assignments.json    ← 35% assignment map
│   └── concat_list.txt
├── broll_renders/                ← Phase 2 resolved B-roll clips
├── assembled.mp4                 ← Phase 3.1 main video (continuous)
├── assembled_broll.mp4           ← Phase 3.2 with B-roll overlays applied
├── overlays/
│   └── continuous_comp/          ← Phase 4 full-duration transparent overlay
│       ├── index.html
│       ├── styles.css
│       ├── animations.js
│       └── voice.mp3             ← silent audio placeholder
├── overlays/continuous_overlay.webm  ← rendered transparent overlay
├── composited.mp4                ← Phase 4 composited output
├── subtitles/{project_id}.srt    ← Phase 5 transcript
├── logs/
│   ├── rough_cut.log             ← Phase 0 excluded regions + durations removed
│   ├── rough_cut_candidates.json ← Phase 0 auto-detected candidates (if auto mode)
│   ├── edit_errors.log
│   └── continuity_warnings.log
└── output/
    ├── {project_id}_final.mp4
    └── thumbnail-needed.json
```

---

## What This Workflow Does NOT Do

- AI video generation from text (use `veo3-render`)
- Color grading (out of scope)
- Social publishing (use Communication Team)
- Film grain / noise overlay / vignette / fade overlay — **permanently removed from this workflow**

---

## Graph

**Context:** [[INHOUSE TEAMS/2. Media Team/CLAUDE|Media Team]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/hyperframe-video-gen/src/pipeline|hyperframe-video-gen pipeline]]
**Archived predecessor:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/7. Archive/remotion-composite-v1/CLAUDE|remotion-composite-v1]]
**Upstream:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/veo3-render/CLAUDE|veo3-render]] · Human captured footage
**Downstream:** [[INHOUSE TEAMS/2. Media Team/3. Communication Team/CLAUDE|Communication Team]]
**Reference:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/hyperframe-video-gen/src/render/script-schema|HyperFrames script-schema]] · [[BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]]
