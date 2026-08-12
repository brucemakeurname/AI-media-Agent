---
name: top-heading-edit
description: "[DEPRECATED — superseded by edit-talking-head-video skill] Old v2 Remotion-based pipeline for talking-head TikTok edits. Do NOT use for new projects. For the current v6 pipeline (rules + bug-codebook + 3 agents + debug agent), use /edit-talking-head-video instead. This skill is kept for historical reference and existing project resumes only."
metadata:
  version: 2.0.0
  status: deprecated
  superseded_by: edit-talking-head-video
  deprecated_at: "2026-05-16"
---

# ⚠️ DEPRECATED — Top Heading Video Edit (v2)

> **Status:** Deprecated as of 2026-05-16. **Superseded by:** `/edit-talking-head-video` (v6 pipeline).
>
> **For new projects:** use `/edit-talking-head-video {project_path}`. See `talking-head-editing/.claude/skills/edit-talking-head-video/SKILL.md`.
>
> **Why deprecated:** This skill uses Remotion-based assembly with 7 phases, no rules/ separation, no bug-codebook, and embeds agent-self-fix behavior. The v6 pipeline (rules-driven, anti-self-fix doctrine, debug-video-pipeline agent) replaces all of it.
>
> **What still works here:** The scripts in `remotion-composite/remotion/scripts/` are referenced by historical projects. Do not delete this skill until those projects are migrated or archived.

---

Edits a raw teleprompter/talking-head MP4 into a TikTok-ready short with jump cuts, zoom, subtitles, SFX, B-roll, and cinematic grade. 9:16, ~1-2 second cuts, fast pace.

## When to Use

- Input: single-camera talking-head or teleprompter recording (any length up to 25MB audio equivalent)
- Output: polished short-form video at 1080×1920, h264, ready for TikTok/Reels/Shorts
- Do NOT use for multi-clip compositions or scripted video with pre-edited footage

---

## Prerequisites

Before starting, verify:

1. **Source video** at `public/source/source.mp4`
2. **Background music** at `public/audio/bg-music.mp3` (theme-matched, instrumental)
3. **Font** at `public/fonts/UTMBebas.ttf`
4. **ffmpeg** on PATH
5. **`.env`** has `OPENAI_API_KEY=sk-...`
6. **SFX collection** accessible (default: `G:\My Drive\1. BRAND RESOURCE\6. SFX`)
7. `npm install` already run in `remotion-composite/remotion/`

---

## Architecture Overview

```
source.mp4
    │
    ├─ Step 1: scripts/transcribe.js     → public/cuts/transcript.json
    │          (Whisper word-level timestamps, 128kbps stereo audio)
    │
    ├─ Step 2: scripts/analyse.js        → public/cuts/analysis.json
    │          (GPT-4o reads transcript + ffmpeg dB data, decides:
    │           major sections, transition times, b-roll moments, SFX peaks)
    │
    ├─ Step 3: scripts/detect-cuts.js    → public/cuts/cuts.json
    │          (silence gaps + force-split + isTransition from analysis)
    │
    ├─ Step 4: scripts/copy-sfx.js       → public/sfx/user/ (once only)
    │
    ├─ Step 5: scripts/assign-assets.js  → enriched cuts.json
    │          (zoom pool, SFX, illustration theme, b-roll from analysis)
    │
    ├─ Step 6: scripts/download-illustrations.js → public/illustrations/
    │
    ├─ Step 7: scripts/generate-broll.js → public/broll/
    │
    └─ Step 8: npx remotion render       → testN/final.mp4
```

---

## Key Design Decisions

### SFX: Every Cut Gets a Sound, Transitions Get the Shutter

Every segment (every 1-2s cut) plays a random SFX from the user's collection — full variety throughout the video.

**Exception:** Major section transitions use the **Shutter SFX specifically** (`sfx-18.mp3` = "Shutter sound.mp3"), paired with the `<ShutterFlash>` visual effect.

```
Minor cut  →  random SFX from pool (all 25 files)  +  no flash
Major cut  →  Shutter SFX only                      +  ShutterFlash visual
```

This keeps SFX energy high and varied across the whole video, while the shutter combination marks structural moments distinctly.

### Cuts: Analysis-Driven, Not Algorithmic

The pipeline first transcribes, then **analyses the content** before deciding where to cut. GPT-4o reads the full transcript and identifies:
- Where the script has major topic shifts (transition times)
- Which moments are most visual and suited for B-roll
- What the script's major sections are

These decisions then inform detect-cuts.js (which segment is a transition) and assign-assets.js (which segments get B-roll).

Audio dB silence detection (`ffmpeg silencedetect`) runs in parallel to catch gaps that Whisper may timestamp-align slightly differently.

### B-roll: Replaces Video, Audio Continues

B-roll images/video go **on top** of the `<Video>` element at full opacity, completely replacing the talking-head visually for that segment. The `<Video>` underneath still renders and provides source audio sync. Never interrupt or replace the source audio.

### Zoom: Constant Per Segment

Scale does NOT animate within a segment. The "punch" is the instant change at the cut. Values: `[1.0, 1.05, 1.08, 1.12, 1.15, 1.20]`, seeded random per segment ID.

---

## Step-by-Step Workflow

### Step 1: Transcribe

```bash
node scripts/transcribe.js
```

Extracts **128kbps stereo 44100Hz** audio (not 32kbps mono — quality matters for Whisper word accuracy). Calls OpenAI Whisper with `verbose_json` + `timestamp_granularities[]=word`.

Output: `public/cuts/transcript.json`

Verify:
```bash
node --input-type=module -e "
import {readFileSync} from 'fs';
const t = JSON.parse(readFileSync('public/cuts/transcript.json','utf8'));
console.log('Words:', t.words.length);
console.log('Text:', t.text);
"
```

If word count is below ~80% of expected: source audio is too quiet — normalize first with `ffmpeg -i source.mp4 -af loudnorm audio-hq.mp3`.

---

### Step 2: Analyse

```bash
node scripts/analyse.js
```

Two-part analysis:

**Part A — Audio silence detection (ffmpeg):**
Runs `silencedetect` to find gaps ≥ 0.6s where the speaker paused. This gives objective timestamps for cuts and confirms Whisper's gaps.

**Part B — Content analysis (GPT-4o):**
Sends the full transcript (with timestamps) to GPT-4o with this task:

> Analyze the script. Identify:
> 1. `major_sections` (3–6): each with title, start_time, end_time, one-sentence description
> 2. `transition_times`: exact seconds of major section boundaries
> 3. `broll_moments`: segments where a visual concept would enhance the speech — each with start_time, end_time, keyword, why it's visual
> 4. `emphasis_moments`: short emotionally punchy phrases (e.g. "It doesn't.") that must be preserved and not trimmed

Output: `public/cuts/analysis.json`

```json
{
  "major_sections": [
    { "title": "The Problem", "start_time": 0, "end_time": 12.5, "description": "AI-generated content gets criticized as soulless" },
    { "title": "The Golden Age", "start_time": 12.5, "end_time": 28.0, "description": "We are entering an era of pure imagination" }
  ],
  "transition_times": [12.5, 28.0, 46.3, 61.0],
  "broll_moments": [
    { "start_time": 28.0, "end_time": 36.0, "keyword": "logistics camera lighting", "description": "90% energy on logistics — show equipment/studio" },
    { "start_time": 36.0, "end_time": 44.0, "keyword": "execution instant", "description": "AI executes instantly — show speed/tech" }
  ],
  "emphasis_moments": [
    { "time": 10.2, "phrase": "It doesn't.", "reason": "Emphatic rebuttal — preserve exactly" }
  ],
  "silence_gaps": [
    { "start": 10.5, "end": 11.3, "duration": 0.8 }
  ]
}
```

Review the analysis before proceeding. If the GPT section assignments look wrong, edit `analysis.json` manually.

---

### Step 3: Detect Cuts

```bash
node scripts/detect-cuts.js
```

Uses analysis.json to inform decisions:
- **Transition times** from analysis → segments whose silence gap is within 1.5s of a `transition_time` get `isTransition: true`
- **Emphasis moments** from analysis → these segments get `isEmphasis: true` and are protected from force-splitting even if short
- **Force-split** still applies: any segment > 1.8s splits at word boundaries (these pieces get `isTransition: false`)
- **Filler removal**: "um", "uh", "ah", "like", "so", "right", "okay" stripped
- **Repetition removal**: 2+ word phrases repeated within 10s window

Target: 30–50 segments for a 60–90s video.

Verify:
```bash
node --input-type=module -e "
import {readFileSync} from 'fs';
const c = JSON.parse(readFileSync('public/cuts/cuts.json','utf8'));
c.forEach(s => {
  const dur = (s.end - s.start).toFixed(2) + 's';
  const flags = [s.isTransition ? 'TRANSITION' : '', s.isEmphasis ? 'EMPHASIS' : ''].filter(Boolean).join(' ');
  console.log('SEG ' + String(s.id).padStart(2) + ' (' + dur + ') ' + flags + ': ' + s.words.map(w=>w.word).join(' '));
});
"
```

---

### Step 4: Copy SFX Collection (first run only)

```bash
node scripts/copy-sfx.js
```

Copies user's SFX folder to `public/sfx/user/sfx-NN.mp3`. Normalizes all files to –14 LUFS. Writes `public/sfx/user/manifest.json`.

Only re-run if the SFX collection changes.

---

### Step 5: Assign Assets

```bash
node scripts/assign-assets.js
```

Reads both `cuts.json` and `analysis.json`. Per segment:

| Field | Logic |
|-------|-------|
| `zoomScale` | Random from `[1.0, 1.05, 1.08, 1.12, 1.15, 1.20]`, seeded by `seg.id` |
| `sfxFile` | `isTransition=true` → `sfx-18.mp3` (Shutter sound); otherwise random from all 25 files |
| `hasBroll` | `true` if segment overlaps an `analysis.broll_moments` entry |
| `brollSource` | `'unsplash'` (70%) or `'dalle'` (30%), seeded random |
| `illustrationTheme` | Longest non-filler word from segment → keyword→theme map |

---

### Step 6: Download Illustrations

```bash
node scripts/download-illustrations.js
```

Generates vivid colored SVG files (fills, gradients, 200×200 viewBox) per theme into `public/illustrations/theme-{name}.svg`. Self-contained — no network required.

To add a new theme: add keyword→theme mapping in `assign-assets.js` and add SVG in `download-illustrations.js`.

---

### Step 7: Generate B-roll

```bash
node scripts/generate-broll.js
```

For each `hasBroll: true` segment, fetches from Unsplash (70%) or generates via DALL-E 3 (30%). Uses the `keyword` from `analysis.broll_moments` (more accurate than the auto-extracted keyword). Falls back to the other source on failure.

Output: `public/broll/seg-N.jpg`

---

### Step 8: Render

Preview first (optional but fast):
```bash
npm run studio
# Open http://localhost:3000 — scrub through timeline
```

Render:
```bash
npx remotion render VideoEditor --output testN/final.mp4 --codec h264 --pixel-format yuv420p --crf 18
```

Use `--crf 26` for quick test renders, `--crf 18` for delivery.

---

## Remotion Component Reference

### Render order inside each `<Sequence>` (bottom → top):

```
1. <ZoomLayer> wrapping <Video>     ← talking head, constant zoom, provides audio
2. <BrollLayer>                     ← B-roll image ON TOP (if hasBroll), covers video fully
3. <CinematicGrade>                 ← vignette + lifted shadows always
4. <ShutterFlash>                   ← ONLY if seg.isTransition === true
5. <Audio sfxFile endAt=24>         ← SFX burst on every cut (0.8s)
6. <IllustrationLayer>              ← SVG icon overlay, 200px
```

Global (outside Sequences):
```
7. <SubtitleLayer>                  ← word-pop on global composition frame
8. <Audio bg-music.mp3>             ← music with 1s fade-in, 2s fade-out
```

### Component files

| Component | File | Notes |
|-----------|------|-------|
| `VideoEditor` | `src/VideoEditor.tsx` | Root, orchestrates all layers |
| `ZoomLayer` | `src/components/ZoomLayer.tsx` | Constant scale, no animation within segment |
| `SubtitleLayer` | `src/components/SubtitleLayer.tsx` | UTM Bebas, spring pop per word, groups 4 words |
| `ShutterFlash` | `src/components/ShutterFlash.tsx` | White flash — conditional on `seg.isTransition` |
| `CinematicGrade` | `src/components/CinematicGrade.tsx` | Vignette overlay |
| `IllustrationLayer` | `src/components/IllustrationLayer.tsx` | SVG icon, 200px, spring 0.5→1.0, fades after 90 frames |
| `BrollLayer` | `src/components/BrollLayer.tsx` | Full-opacity image, Ken Burns zoom+pan |

---

## cuts.json Segment Schema

```typescript
{
  id: number;
  start: number;            // source video time (seconds)
  end: number;
  startFrame: number;       // source video frame
  endFrame: number;
  frames: number;           // composition frame count
  frameStart: number;       // global composition start frame
  isTransition: boolean;    // true = major section boundary (shutter SFX + flash)
  isEmphasis: boolean;      // true = protected from trimming (emphatic phrases)
  zoomScale: number;        // 1.0 | 1.05 | 1.08 | 1.12 | 1.15 | 1.20
  zoomMax: number;          // alias for zoomScale
  sfxFile: string;          // "sfx/user/sfx-18.mp3" on transitions, random otherwise
  illustrationTheme: string;
  illustrationSvg: string;  // "illustrations/theme-rocket.svg"
  hasBroll: boolean;
  brollSource: 'unsplash' | 'dalle' | null;
  brollImage: string | null; // "broll/seg-3.jpg"
  words: Word[];
}
```

---

## Tuning Parameters

| Parameter | Location | Default | Change when |
|-----------|----------|---------|-------------|
| `SILENCE_GAP` | detect-cuts.js | `0.8s` | Raise if short phrases cut; lower if too many cuts |
| `TARGET_MAX_DURATION` | detect-cuts.js | `1.8s` | Lower for faster pace |
| `MIN_SEG_DURATION` | detect-cuts.js | `0.2s` | Lower to preserve very short phrases |
| `REPEAT_MIN_WORDS` | detect-cuts.js | `2` | Lower to 1 to catch single-word stumbles |
| Music volume | VideoEditor.tsx | `0.12` | Up if music feels weak |
| SFX volume | VideoEditor.tsx | `0.45` | Up/down to taste |
| SFX burst | VideoEditor.tsx | `endAt=24` (0.8s) | Up for longer SFX tails |
| Icon size | IllustrationLayer.tsx | `200px` | Up for more visual impact |

---

## Output Naming Convention

```
testN/final.mp4     ← working iterations (never overwrite, always new number)
output/final.mp4    ← approved delivery copy
```

---

## Full Run Order

```bash
# Full pipeline (first time or source changed):
node scripts/transcribe.js
node scripts/analyse.js           # review analysis.json before next steps
node scripts/detect-cuts.js
node scripts/copy-sfx.js          # once only
node scripts/assign-assets.js
node scripts/download-illustrations.js
node scripts/generate-broll.js
npx remotion render VideoEditor --output testN/final.mp4 --codec h264 --pixel-format yuv420p --crf 18

# Re-cut only (transcript unchanged):
node scripts/analyse.js
node scripts/detect-cuts.js
node scripts/assign-assets.js
node scripts/download-illustrations.js
node scripts/generate-broll.js
npx remotion render VideoEditor --output testN/final.mp4 --codec h264 --pixel-format yuv420p --crf 18

# Quick draft render:
npx remotion render VideoEditor --output testN/draft.mp4 --codec h264 --crf 26
```
