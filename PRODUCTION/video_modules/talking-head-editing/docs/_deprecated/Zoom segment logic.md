# Zoom Segment Logic — talking-head-editing

Rules governing how `zoom_plan.json` is produced. Claude reads `cut_plan.json` and
assigns a zoom level to every segment based on its semantic role in the script.

Zoom is applied as a **center crop + scale** on each individual segment *before*
any merge step. The zoom level is a per-segment property — it does not animate
within a segment.

---

## What Zoom Means Here

"Zoom %" refers to how much the frame is **scaled up**. 100% = native frame.
115% = scale up 15% from center → subject appears larger, more intimate.

This is implemented as a center crop then scale-back to native resolution:

```
crop = (W / factor) × (H / factor) centered
scale back → 1080 × 1920

factor = zoom% / 100
cw = 1080 / factor   cx = (1080 - cw) / 2
ch = 1920 / factor   cy = (1920 - ch) / 2
ffmpeg -vf "crop=cw:ch:cx:cy,scale=1080:1920:flags=lanczos"
```

| Zoom | Crop taken | Visual result |
|------|-----------|---------------|
| 100% | 1080×1920 (full) | No change |
| 105% | 1028×1829 | Barely noticeable — slight warmth |
| 110% | 982×1745 | Mild push-in — elevated energy |
| 115% | 939×1670 | Clear push-in — punch or verdict |
| 120% | 900×1600 | Hard push-in — peak moment |

---

## Zoom Levels by Semantic Type

| Level | Type | When to use |
|-------|------|-------------|
| **100%** | Default | Narrative sentences, lead-in clauses, context phrases, transition setups, section headers (structural, not emotional) |
| **105%** | First / Last / Mild elevation | First segment (always), last segment (always), positive reframes, connector phrases that carry mild weight |
| **110%** | Elevated | Key descriptors, contrast terms, antithesis first-half, CTA build verbs, secondary list items |
| **115%** | Emphasis | Thesis statements, punchy verdicts, punchlines, landing single nouns after a build, antithesis resolution |
| **120%** | Peak | Most important enumeration item (final or most significant), single-verb maximum isolation ("automate"), comedic punchline spike |

---

## Hard Rules

### Rule 1: First and Last Segments — Always 105%

Segment `id=0` and the final segment are always **105%**. No exception.
- First segment: 105% opens with mild warmth, not neutral (100 feels flat to start)
- Last segment: 105% lands the CTA with authority without overcooking

### Rule 2: No Consecutive Same Zoom

Two adjacent segments **cannot share the same zoom level**. Each cut must carry a
perceptible visual shift — that shift IS the jump cut's energy.

If the natural assignment produces a conflict, adjust the *lower-weight* segment by
one step up or down:
```
conflict: 115 → 115   fix: 110 → 115  or  115 → 120 (if it's a peak)
conflict: 100 → 100   fix: 100 → 105  or  105 → 100
```

### Rule 3: Enumeration Ascending — 120 for Most Important

When a sentence lists items, each item is its own segment, and zoom ascends:

**3-item list standard:** `105 → 110 → 120`
- 120 goes to the final or most important item

**4-item list (e.g. tool list):** avoid flat ascending — vary for rhythm:
- Pattern used: `110 → 105 → 100 → 120`
- Descend through the middle items, then spike on the punchline/most important

**Why:** A straight 105→110→115→120 over 4 items is too predictable.
Dipping down before the final spike creates tension-and-release rhythm.

### Rule 4: Section Headers Stay Neutral

"Number one,", "Number two,", "Number three,", "And finally," — these are structural
markers. They always get **100%** (reset to default). They should not compete
with the thesis/punchline that follows them.

Exception: "number four is the identity." (which is both header AND statement) gets
**105%** — slightly elevated because it's the final section opener and carries its
own weight.

### Rule 5: Emphasis Is 115%, Peak Is 120%

115% = emphasis. Use freely for verdicts, punchlines, thesis closes.
120% = peak. Reserve for maximum-isolation moments and the most important enumeration
item. Do NOT use 120% for general emphasis — overuse destroys the hierarchy.

---

## Tension-and-Release Rhythm

The zoom sequence across a full section should breathe: **rise → peak → pull back**.

Example (Section 1 numbers 9–17):
```
100 (header)  →  115 (thesis)  →  100 (narrative)  →  105 →  115 (emphasis)
→  100 →  105 →  100 (setup)  →  115 (punchline)
```

This creates a pulse. The viewer feels the zoom even if they don't consciously see it.

Avoid long runs at the same level or monotonic ascending — the cuts feel mechanical.

---

## FFmpeg SRT Drift Warning

When zoom segments are re-encoded (crop + scale), each output file is slightly
**longer** than the planned duration (FFmpeg pads to the next keyframe boundary
at 30fps ≈ 0.033s per segment). Over 65 segments this accumulated to **+3.16s**
of drift in testing.

**Fix:** Always probe actual output durations with `ffprobe` before building
the SRT timestamp accumulation. Never use `seg.duration` from the plan JSON for
SRT generation — use the measured actual.

```js
const actual = parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration \
      -of default=noprint_wrappers=1:nokey=1 "${zoomFile}"`).toString().trim()
);
```

This is already implemented in `scripts/zoom-merge-check.js` and `scripts/fix-zoom-srt.js`.

---

## zoom_plan.json Structure

```json
{
  "source": "main_clean_2.mp4",
  "total_segments": 65,
  "generated_by": "claude-zoom-analysis-v1",
  "rules_applied": [...],
  "segments": [
    {
      "id": 0,
      "start": 0.391, "end": 1.352, "duration": 0.961,
      "text": "Everyone is shouting",
      "zoom": 105,
      "type": "first",
      "reason": "First segment rule — always 105%"
    }
  ]
}
```

`type` values: `first` · `last` · `default` · `elevated` · `emphasis` · `emphasis_peak` ·
`header` · `transition` · `contrast` · `enumeration` · `enumeration_peak` · `emphasis_build`

---

## Graph

**Context:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW|WORKFLOW]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/CLAUDE|CLAUDE]]
**Related:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]]
**Data:** `Test/proj_teleprompter_01/segments/zoom_plan.json`
**Scripts:** `scripts/zoom-merge-check.js` · `scripts/fix-zoom-srt.js`
