# BUG-006 — ffprobe-actual vs cut_plan nominal duration

**Phase:** 1, 3, 5
**Severity:** fatal (silent corruption)
**First observed:** proj_teleprompter_01

## Symptom

Downstream timestamps consistently lag. Subtitles drift, A-roll cluster math is off, SFX fires after the cut it was meant to mark. The error grows with segment count — first 10 segments look fine; last 30 are visibly off.

## Root Cause

Any code that reads `cut_plan.json` `segments[i].duration` and accumulates positions is using NOMINAL planned durations. The actual encoded MP4 segments are longer (BUG-003 keyframe padding + BUG-004 concat overhead). Accumulating planned values produces a timeline that diverges from reality with every additional segment.

This is the meta-bug behind BUG-003 and BUG-004. They are specific manifestations; BUG-006 is the underlying anti-pattern: **never trust the plan for measurements; always measure**.

## Detection Signature

Match if ANY of:
- Any script reads `.segments[*].duration` from `cut_plan.json` or `zoom_plan.json` and uses the value for timeline accumulation (not just human-readable display)
- A downstream phase has timestamps that drift linearly with segment index
- `ffprobe` of any single zoomed segment differs from its `cut_plan.json` planned duration by > 0.02s

Grep check:
```bash
grep -rn "cut_plan" scripts/ | grep -i "duration"
# any result that's not a display/log line → SUSPECT
```

## Fix

1. Audit every script that reads `cut_plan.json` or `zoom_plan.json`. For each:
   - If duration is used only for display/logging → OK
   - If duration is used for timeline math → REPLACE with `ffprobe` of the corresponding MP4 file
2. Standard ffprobe duration call:
   ```js
   const dur = parseFloat(
     execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${file}"`).toString().trim()
   );
   ```
3. Cache ffprobe results in a JSON sidecar (e.g., `segments/actual_durations.json`) to avoid repeated `ffprobe` calls — each call is ~30ms but adds up over 65 segments × multiple phases.
4. For Phase 5 B-roll positions: use `scripts/compute-exact-timestamps.js` which already does this correctly.

## Why this fix works

`ffprobe` reads encoded file metadata — it sees the actual frame count and timebase. This is the only ground truth for video duration. The plan JSON is a request to the encoder; the encoder's output is what actually plays.

## Why this is silent corruption (worst category)

There is no error, no exit code, no stderr. The pipeline completes "successfully" and produces an MP4. Only on review does the misalignment become visible. By that point, days of work may need rework.

Pipelines must enforce this defensively: any script touching `cut_plan.json` duration field should be required to also call `ffprobe` and compare. If they differ by > 0.01s, prefer `ffprobe`.

## References

- WORKFLOW.md lines 858–866 (Phase 3 ffprobe rule)
- WORKFLOW.md lines 1260–1295 (Assembly Rule 4)
- `docs/rules/assembly-rules.md` Rule 4
- BUG-003 (Layer 1 — per-segment), BUG-004 (Layer 2 — concat join)

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-003-zoom-reencode-keyframe-drift|BUG-003]] · [[BUG-004-broll-concat-scale-correction|BUG-004]]
