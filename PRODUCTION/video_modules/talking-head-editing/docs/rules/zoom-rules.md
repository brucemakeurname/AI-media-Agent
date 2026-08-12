# zoom-rules — Phase 1 Zoom Assignment Logic

> Rules governing `zoom_plan.json` production. Claude reads `cut_plan.json` and assigns a zoom level to every segment based on its semantic role.

Zoom is applied as **center crop + scale** per segment BEFORE merge. The zoom level is per-segment; it does not animate within a segment.

---

## What Zoom Means

"Zoom %" = how much the frame is scaled up. 100% = native. 115% = scaled up 15% from center → subject appears larger, more intimate.

Implementation: center crop + scale-back to native resolution.

```
factor = zoom% / 100
cw = W / factor          cx = (W - cw) / 2
ch = H / factor          cy = (H - ch) / 2
ffmpeg -vf "crop=cw:ch:cx:cy,scale=W:H:flags=lanczos"
```

| Zoom | Crop (1080×1920) | Visual Result |
|---|---|---|
| 100% | 1080×1920 (full) | No change |
| 105% | 1028×1829 | Barely noticeable — slight warmth |
| 110% | 982×1745 | Mild push-in — elevated energy |
| 115% | 939×1670 | Clear push-in — punch or verdict |
| 120% | 900×1600 | Hard push-in — peak moment |

---

## Zoom Levels by Semantic Type

| Level | Type | When to use |
|---|---|---|
| **100%** | Default | Narrative sentences, lead-in clauses, context phrases, transition setups, section headers (structural only) |
| **105%** | First / Last / Mild | First segment (always), last segment (always), positive reframes, connector phrases carrying mild weight |
| **110%** | Elevated | Key descriptors, contrast terms, antithesis first-half, CTA build verbs, secondary list items |
| **115%** | Emphasis | Thesis statements, punchy verdicts, punchlines, landing single nouns after a build, antithesis resolution |
| **120%** | Peak | Most important enumeration item (final or most significant), single-verb maximum isolation, comedic punchline spike |

---

## Hard Rules

### Rule 1 — First and Last: Always 105%

Segment `id=0` and the final segment are always **105%**. No exception.
- First segment: opens with mild warmth, not neutral (100 feels flat to start)
- Last segment: lands the CTA with authority without overcooking

### Rule 2 — No Consecutive Same Zoom

Two adjacent segments **cannot share the same zoom level**. Each cut must carry a perceptible visual shift — that shift IS the jump cut's energy.

Resolution: adjust the LOWER-WEIGHT segment by one step up or down.
```
conflict: 115 → 115   fix: 110 → 115   or   115 → 120 (if peak-worthy)
conflict: 100 → 100   fix: 100 → 105   or   105 → 100
```

### Rule 3 — Enumeration Ascending — 120 for Most Important

When a sentence lists items, each item is its own segment, and zoom ascends:

**3-item list standard:** `105 → 110 → 120` — 120 goes to the final or most important item.

**4-item list:** avoid flat ascending. Use `110 → 105 → 100 → 120` — descend through middle items, spike on punchline.

**Why:** A straight 105→110→115→120 over 4 items is too predictable. Dipping down before the final spike creates tension-and-release rhythm.

### Rule 4 — Section Headers Stay Neutral

"Number one,", "Number two,", "And finally,", etc. — always **100%** (reset to default). They should not compete with the thesis/punchline that follows.

**Exception:** A header that is ALSO a statement (e.g., "number four is the identity.") gets **105%** — slightly elevated because it carries its own weight.

### Rule 5 — Emphasis is 115%, Peak is 120%

- 115% = emphasis. Use freely for verdicts, punchlines, thesis closes.
- 120% = peak. Reserve for maximum-isolation moments and the most important enumeration item.

Do NOT use 120% for general emphasis — overuse destroys the hierarchy.

---

## Tension-and-Release Rhythm

The zoom sequence across a full section should breathe: **rise → peak → pull back**.

Example pattern (across 9 segments):
```
100 (header) → 115 (thesis) → 100 (narrative) → 105 → 115 (emphasis)
→ 100 → 105 → 100 (setup) → 115 (punchline)
```

This creates a pulse. The viewer feels the zoom even if they don't consciously see it. Avoid long runs at the same level or monotonic ascending — feels mechanical.

---

## Encoding Drift Warning

When zoom segments are re-encoded (crop + scale), each output file is slightly **longer** than the planned duration (FFmpeg pads to the next keyframe boundary at 30fps ≈ 0.033s per segment).

**Fix:** Always probe actual output durations with `ffprobe` before building any SRT or assembly timeline. Never use `seg.duration` from the plan JSON for downstream timestamp math.

See `assembly-rules.md` Rule 4 (ffprobe + scale correction).

---

## zoom_plan.json Schema

```json
{
  "source": "main_clean.mp4",
  "total_segments": 0,
  "generated_by": "claude-zoom-analysis-v{N}",
  "rules_applied": [
    "first-last-105",
    "no-consecutive-same",
    "enumeration-ascending",
    "section-headers-neutral",
    "emphasis-115-peak-120",
    "tension-and-release-rhythm"
  ],
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

**`type` enum values:**
`first` · `last` · `default` · `elevated` · `emphasis` · `emphasis_peak` · `header` · `transition` · `contrast` · `enumeration` · `enumeration_peak` · `emphasis_build`

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[rough-cut-rules|rough-cut-rules]] · [[segment-rules|segment-rules]] · [[assembly-rules|assembly-rules]]
