---
name: "[html-video]-voice-synthesis"
description: Synthesizes one cloned-voice mp3 per beat (via the standalone voxcpm-voice-engine module) from a locked script.json produced by [html-video]-script-lock. Second skill in the [html-video]-* industry-news video pipeline.
---

# [html-video]-voice-synthesis

Synthesizes narration audio for every beat in a locked `script.json`, using the brand's cloned
voice via `VIDEO_MODULES/voxcpm-voice-engine/` (see that module's own `INTEGRATION.md`).

## Usage

```bash
npx tsx 02-synthesize-voice.ts <path/to/script.json>
```

Requires `[html-video]-script-lock`'s `01-init.ts` to have already run against this `script.json`
(schema-valid, every beat has a `blueprintId`). Writes one mp3 per beat to `voice/beat-<sceneId>-<beatIdx>.mp3`
next to `script.json` (0.3s gap between scenes, 0.15s within a 2-beat scene). Marks
`voice_synthesized: true` in `progress.json`.

## Depends on

- `[html-video]-script-lock/scripts/lib/script-schema.ts` (validation) and `.../progress.ts`
  (progress marking) — cross-skill relative import (sibling skills).
- `[html-video]-audio-mix/scripts/lib/audio-tools.ts`'s `getDurationSec` — cross-skill relative
  import.
- `VIDEO_MODULES/voxcpm-voice-engine/client/voxcpm-client.ts` — the standalone TTS engine.

## Graph

[[../[html-video]-script-lock/SKILL|script-lock (runs before this)]] ·
[[../[html-video]-audio-mix/SKILL|audio-mix (runs after this)]] ·
[[../../../VIDEO_MODULES/voxcpm-voice-engine/INTEGRATION|voxcpm-voice-engine]]
