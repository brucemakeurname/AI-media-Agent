---
name: "[html-video]-thumbnail-signal"
description: Confirms a designer-generated thumbnail.png landed in time (generated in parallel with render, not after), or falls back to writing a Design Hub signal file if it didn't. Final skill in the [html-video]-* industry-news video pipeline.
---

# [html-video]-thumbnail-signal

The designer role generates `thumbnail.png` (via `creative-direction` + `gpt-img-2-gen`) in
parallel with the HyperFrames render + `[html-video]-subtitle-burn-industry-news` steps, not after — this skill
just confirms it landed.

## Usage

```bash
npx tsx 05-thumbnail-signal.ts <path/to/script.json>
```

If `thumbnail.png` already exists next to `script.json`, logs confirmation and does nothing else.
If it's missing (designer didn't finish in time), writes `thumbnail-needed.json` — the old
post-render Design Hub pickup signal — as a fallback. Marks `thumbnail_burned: true` in
`progress.json` either way.

## Depends on

`[html-video]-script-lock/scripts/lib/progress.ts` — cross-skill relative import.

## Graph

[[../[html-video]-subtitle-burn-industry-news/SKILL|subtitle-burn-industry-news (runs before this)]]
