---
name: "[html-video]-script-lock"
description: Validates and locks a beat-based script.json for the industry-news HTML video pipeline (hook/body/end scenes, each with 1-2 beats), writes script.txt, and tracks pipeline progress in progress.json. First skill in the [html-video]-* pipeline — content-executive/designer/video-editor roles author script.json against this skill's Zod contract before any other [html-video]-* skill runs.
---

# [html-video]-script-lock

Owns the `script.json` contract and the shared `progress.json` pipeline-state tracker that every
other `[html-video]-*` skill in this sequence reads/writes.

## Contract

`scripts/lib/script-schema.ts` — scenes are `hook | body | end`, each with 1-2 `beats` (hook always
2 beats: hook line + pull-up/antithesis; end has 1 beat for a CTA-required brief, 2 beats
[verdict + loop-back to hook] otherwise; body always 1 beat). Each beat: `voiceText`, `visualBrief`,
required `blueprintId` (locked by the video-editor role via `references/scene-type-blueprint-map.md`),
optional `imageIntent`, `estimatedTimingSec`. `metadata.targetDurationSec` (min 45) drives planning
scene count (`ceil(targetDurationSec / 3)`).

## Usage

```bash
npx tsx 01-init.ts <path/to/script.json>
```

Validates the script against the schema, writes `script.txt` (plain concatenated voiceText, for
CapCut/reference) next to it, and marks `script_locked: true` in `<same dir>/progress.json`.

```bash
npx tsx 06-mark-progress.ts <path/to/script.json> <step>
```

Generic progress-marking CLI for pipeline steps driven by raw Bash/CLI commands rather than a
dedicated skill script (used by the video-editor role directly for `scenes_built`, `verified`,
`rendered` — the HyperFrames build/lint/check/render steps have no dedicated `[html-video]-*` skill
of their own). `<step>` must be one of the 8 values in `scripts/lib/progress.ts`'s `PROGRESS_STEPS`.

## Depended on by

`[html-video]-voice-synthesis`, `[html-video]-audio-mix`, `[html-video]-subtitle-burn-industry-news`, and
`[html-video]-thumbnail-signal` all import `scripts/lib/script-schema.ts` and/or
`scripts/lib/progress.ts` from this skill via a relative cross-skill import (siblings under the
same `.claude/skills/` folder) — this is the shared-infrastructure skill of the 5.

## Graph

`../../goal/[social]_[industry-news-html-summery].md` — production goal that dispatches this skill first
