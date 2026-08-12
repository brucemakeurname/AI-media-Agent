---
name: subtitle-designer
description: "Use when executing Phase 4 Subtitles in a top-heading-edit project. Invoked by motion-video-designer. Reads whisperx_word_transcript.json, groups words into display lines, builds a full-duration transparent HyperFrames composition with word-pop + color-highlight effect, renders as WebM alpha, writes subtitle_manifest.json."
metadata:
  version: 1.0.0
---

# Subtitle Designer Skill

Phase 4 of the top-heading-edit pipeline. You are still the motion-video-designer — this skill loads the Phase 4 subtitle rules.

**Always invoke `/hyperframes` before writing the composition HTML.**

---

## How Phase 4 Differs from Phase 2 / 3

| | Phase 2 B-roll | Phase 3 Overlay | Phase 4 Subtitle |
|---|---|---|---|
| Source data | `cut_plan.json` | `cut_plan.json` + `broll_timestamp.json` | `whisperx_word_transcript.json` |
| Grouping | Per slot | Per A-roll cluster | Per display line (3–5 words) |
| Duration | Per slot (3–6s) | Per cluster | Full video duration |
| Frame zone | Full 1080×1920 | Top or bottom 1/3 | Subtitle zone: centered, ~72% from top |
| Background | Opaque | Transparent | Transparent |
| Output | `.mp4` | `.webm` alpha | `.webm` alpha |
| Manifest | `broll_timestamp.json` | `aroll_timestamp.json` | `subtitle_manifest.json` |

---

## Paths

| Resource | Path |
|---|---|
| Word transcript | `{project_path}/logs/whisperx_word_transcript.json` |
| Subtitle output | `{project_path}/subtitles/` |
| Composition | `{project_path}/subtitles/subtitle_comp/` |
| Render | `{project_path}/subtitles/subtitle_overlay.webm` |
| Manifest | `{project_path}/subtitles/subtitle_manifest.json` |
| Package reference | `{project_path}/test-broll/package.json` + `hyperframes.json` |

---

## Phase 4 Execution Checklist

- [ ] Read `whisperx_word_transcript.json` — load all words with `word`, `start`, `end`, `score`
- [ ] Group words into display lines (gap-based line breaks)
- [ ] Build HyperFrames composition with word-level clip elements
- [ ] Apply GSAP word-pop + color-highlight animations
- [ ] Lint (`npm run check`) — 0 errors
- [ ] Render transparent (`npm run render -- --transparent`)
- [ ] Write `subtitle_manifest.json`

---

## Step 1: Load Word Transcript

`whisperx_word_transcript.json` structure:
```json
{
  "words": [
    { "word": "But", "start": 0.391, "end": 0.551, "score": 0.92 },
    { "word": "no", "start": 0.571, "end": 0.671, "score": 0.95 },
    ...
  ]
}
```

Filter out any word with `score < 0.5` (low-confidence hallucinations). Log filtered count.

---

## Step 2: Group Words into Display Lines

A **line break** occurs when the gap between consecutive words is ≥ 0.25s, OR when a line would exceed 5 words.

```
line_start = words[i].start
line_end   = words[j].end  (last word in the group)
line_duration = line_end - line_start
```

Each line: `{ "line_id": N, "start": float, "end": float, "duration": float, "words": [...] }`

Give each line a small **context buffer**: extend `line_end` by 0.08s so the last word's fade-out is not clipped.

---

## Step 3: Composition Structure

### Canvas + Body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    html, body {
      width: 1080px; height: 1920px;
      margin: 0; padding: 0;
      overflow: hidden;
      background: transparent;
      font-family: 'Inter', sans-serif;
    }
    /* Subtitle zone anchor — all line groups position here */
    #subtitle-zone {
      position: absolute;
      left: 0; width: 1080px;
      top: 1310px;          /* ~68% from top — above TikTok UI zone */
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
</head>
<body data-composition-id="subtitle-{project_id}" data-duration="{total_duration}" data-width="1080" data-height="1920">
  <div id="subtitle-zone">
    <!-- line groups injected here -->
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script>/* timeline below */</script>
</body>
</html>
```

### Line Group Element

One `<div class="clip line-group">` per display line, containing one `<span class="word">` per word:

```html
<div class="clip line-group"
     id="line-{N}"
     data-start="{line.start}"
     data-duration="{line.duration + 0.08}"
     data-track-index="{N}"
     style="
       display: inline-flex;
       gap: 10px;
       align-items: center;
       background: rgba(0,0,0,0.45);
       border-radius: 10px;
       padding: 10px 24px;
       opacity: 0;
     ">
  <span class="word"
        id="w-{word_global_index}"
        data-word-start="{word.start}"
        data-word-end="{word.end}"
        style="
          font-size: 42px;
          font-weight: 700;
          color: rgba(255,255,255,0.70);
          text-shadow: 0 2px 14px rgba(0,0,0,0.9);
          display: inline-block;
          transform-origin: center bottom;
        ">{word.word}</span>
  <!-- repeat for each word in line -->
</div>
```

**Important:** `data-track-index` must be unique across ALL clip elements (line groups AND individual word spans if they are also clips). If words are controlled purely by GSAP (not `class="clip"`), only the line group needs `class="clip"`. Use this simpler approach:

- Line group: `class="clip"` — HyperFrames controls visibility of the whole line
- Words inside: plain `<span>` — GSAP controls individual word animation within the line's active window

---

## Step 4: GSAP Timeline

```js
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
window.__timelines["subtitle-{project_id}"] = tl;

// For each line group: fade in the pill
// For each word in the line: pop + color highlight at word.start (relative to video start)
```

### Line group: fade in/out

```js
// Fade in the pill at line start
tl.to(`#line-${N}`, { opacity: 1, duration: 0.08 }, lineStart);
// Fade out the pill at line end
tl.to(`#line-${N}`, { opacity: 0, duration: 0.08 }, lineEnd + 0.05);
```

### Word pop + color highlight

For each word at absolute time `word.start`:

```js
// Pop in — word scales up, turns Electric Blue
tl.fromTo(`#w-${globalIdx}`,
  { scale: 0.82, color: 'rgba(255,255,255,0.70)' },
  { scale: 1.0,  color: '#1F7FFE', duration: 0.07, ease: 'back.out(1.5)' },
  word.start
);

// Color returns to white after the word's duration (next word takes over)
tl.to(`#w-${globalIdx}`,
  { color: 'rgba(255,255,255,0.70)', duration: 0.06 },
  word.end - 0.06   // start fade back just before the word ends
);
```

**Word timing note:** `word.start` and `word.end` are absolute video timestamps — use them directly as position values in the GSAP timeline (no offset needed since the composition duration matches the full video).

### No overlapping tweens on the same property

Only one word per line should be in the "active blue" state at any given time. The color-return tween at `word.end - 0.06` ensures this. Verify there's no gap between words in the same line that would leave all words white simultaneously (acceptable gap ≤ 0.25s by the line-break rule).

---

## Step 5: Brand Kit

Apply only color + typography (same narrow scope as Phase 2/3):

- Active word color: `#1F7FFE` (Electric Blue — Solo Flows primary)
- Inactive word color: `rgba(255,255,255,0.70)`
- Font: Inter 700
- Pill background: `rgba(0,0,0,0.45)` — keeps subtitles legible on any video background

No other brand kit rules apply — layout is dictated by subtitle UX requirements.

---

## Step 6: Composition Init

```bash
mkdir -p subtitles/subtitle_comp
cp test-broll/package.json subtitles/subtitle_comp/
cp test-broll/hyperframes.json subtitles/subtitle_comp/
```

Edit `hyperframes.json`:
```json
{
  "compositions": [
    {
      "id": "subtitle-{project_id}",
      "file": "index.html",
      "width": 1080,
      "height": 1920,
      "fps": 30,
      "duration": {total_video_duration_seconds}
    }
  ]
}
```

```bash
cd subtitles/subtitle_comp
npm install --silent
npm run check     # 0 errors required
```

---

## Step 7: Render

```bash
npm run render -- --transparent
```

Move output to `subtitles/subtitle_overlay.webm`.

**Fallback** if `--transparent` unavailable:
```html
<body style="background: #00FF00;">  <!-- chromakey green -->
```
```bash
npm run render
# output → subtitles/subtitle_overlay.mp4
```
Log `"chromakey_fallback": true` in manifest.

Verify: ffprobe confirms duration matches total video duration (±0.5s).

---

## Step 8: Write subtitle_manifest.json

```json
{
  "project": "{project_id}",
  "generated_by": "motion-video-designer",
  "generated_at": "{ISO 8601}",
  "phase": "4-subtitles",
  "effect": "word-pop-color-highlight",
  "brand_color": "#1F7FFE",
  "total_words": 216,
  "words_filtered_low_confidence": 0,
  "total_lines": 48,
  "total_duration_sec": 87.512,
  "composition_dir": "subtitles/subtitle_comp",
  "render": "subtitles/subtitle_overlay.webm",
  "chromakey_fallback": false,
  "render_verified": true
}
```

---

## Quality Rules

1. Every word with `score ≥ 0.5` must appear in the composition — none skipped
2. No two line groups visible simultaneously — `line_end + 0.08` must not overlap `next_line_start`
3. Active word color `#1F7FFE` must be visible for the full word duration (don't fade before `word.end`)
4. Pill background on every line group — no naked text on transparent background
5. No `Math.random()`, no `Date.now()` — all timings come from transcript JSON
6. `data-track-index` must be unique across all `class="clip"` elements

---

## Completion Signal

```
Phase 4 Subtitles complete.
Total words: {N} ({M} filtered low-confidence)
Total display lines: {L}
Output: subtitles/subtitle_overlay.webm
Manifest: subtitles/subtitle_manifest.json

Ready for Phase 5 Assembly.
```

---

## Pipeline Integration (v6)

This skill runs inside **Phase 5 (Assembly)** of the v6 talking-head editing pipeline. Phase 4 has been merged into Phase 5 — subtitles are built during assembly, not as a separate phase. Required reading at session start:

- Pipeline overview: `talking-head-editing/docs/WORKFLOW-template.md`
- **Logic rules:** `talking-head-editing/docs/rules/assembly-rules.md` (Subtitle Build section)
- **Error protocol:** `talking-head-editing/PROTOCOL.md`
- Bug knowledge: `talking-head-editing/docs/debug/bug-codebook/`

**Owner agent:** `video-editor` (this skill is invoked from inside Phase 5).
**Output format:** ProRes 4444 MOV (`yuva444p12le`) — NOT WebM. WebM has unreliable alpha output (BUG-009-related render).

### Anti Self-Fix Rule

On ANY error (HyperFrames render fail, ffprobe alpha-channel check fail, word count mismatch with transcript, etc.):

1. STOP. Do NOT retry. Do NOT change render format mid-flight.
2. Write `logs/error_report.json` per PROTOCOL.md schema.
3. Invoke `Agent(subagent_type="debug-video-pipeline", prompt=<error_report content>)`.
4. Apply returned `fix_plan.json` EXACTLY.
5. If `unknown_error: true` → halt + manifest.edit_status=failed.

**Likely BUG hits:** BUG-009 (missing eof_action=pass on subtitle overlay composite).

## Graph

**Parent:** [[../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] · [[../../../talking-head-editing/PROTOCOL|PROTOCOL]]
**Rules:** [[../../../talking-head-editing/docs/rules/assembly-rules|assembly-rules]]
**Owner agent:** [[../../agents/video-editor|video-editor]]
**Debug:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
**Related skills:** [[../design-motion-overlay/SKILL|design-motion-overlay]] · [[../motion-video-designer/SKILL|motion-video-designer]]
