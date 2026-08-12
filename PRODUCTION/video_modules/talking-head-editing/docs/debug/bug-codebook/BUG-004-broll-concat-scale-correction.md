# BUG-004 — B-roll concat scale correction required

**Phase:** 5 (Assembly)
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

After Phase 5 B-roll overlay pass, B-rolls in the later half of the video land EARLY — they overlay onto the wrong spoken words. Late-video B-rolls may cut off prematurely or appear during the wrong sentence.

For proj_teleprompter_01: br_08 placed at concat-sum position 64.031s actually needed to be at 67.139s (3.1s drift over 9 B-rolls).

## Root Cause

Two layers of drift compound between `cut_plan.json` planned timestamps and final assembly:
1. **Per-segment keyframe padding** (BUG-003) — each re-encoded segment is 33–61ms longer.
2. **Concat re-encode overhead** — when `ffmpeg -f concat ... -c:v libx264` re-encodes the joined segments, the encoder adds ~1–2 extra frames per segment join (B-frame flushing) to maintain GOP structure.

After fixing Layer 1 with `ffprobe` (BUG-003), there is STILL drift from Layer 2 — sum of ffprobed individual durations is LESS than the actual concatenated output duration.

## Detection Signature

Match if ALL of:
- Phase 5 in progress, computing B-roll `itsoffset` values
- Sum of ffprobed individual zoomed-segment durations ≠ ffprobed `base_zoomed.mp4` (or `aroll_footage.mp4`) duration
- Ratio `actual_concat / sum_individual` is between 1.005 and 1.10 (typical re-encode inflation)

Programmatic check:
```js
const sum_individual = segments.reduce((s, seg) => s + ffprobe(seg), 0);
const actual_concat = ffprobe('aroll_renders/base_zoomed.mp4');
const scale = actual_concat / sum_individual;
if (scale > 1.001) {
  FLAG_AS_BUG_004
}
```

## Fix

1. After Phase 1 completes and `base_zoomed.mp4` is built, run `scripts/compute-exact-timestamps.js`:
   ```bash
   node scripts/compute-exact-timestamps.js
   ```
2. The script does both layers in one pass:
   - ffprobes each `seg_NNN_zoom.mp4` for actual duration
   - Accumulates concat positions: `concat_start[N] = sum(individual[0..N-1])`
   - ffprobes `base_zoomed.mp4` for actual concatenated duration
   - Computes `scale = actual_concat / sum_individual`
   - Writes corrected positions: `final_itsoffset[N] = concat_start[N] × scale`
3. Output: `broll_renders/broll_concat_exact.json` with `{itsoffset, enable_start, enable_end}` per B-roll.
4. Use these values directly in Phase 5 FFmpeg overlay command. Do NOT recompute.

## Why this fix works

Scale-correcting all B-roll positions uniformly compensates for the encoder's per-join inflation. Because the inflation is roughly uniform across the file (each join adds similar overhead), a single multiplier maps the "sum of individual" timeline to the "actual concat" timeline.

The factor varies per project (codec settings, segment count, source FPS, B-frame settings). Never hardcode. Always measure fresh.

For proj_teleprompter_01: scale = 71.267 / 67.968 = 1.0485. Different project = different factor.

## Why this is fatal (not warning)

Without scale correction, B-rolls in the second half of the video are visibly misaligned with the talking head's spoken words. A B-roll about "GPUs" appearing while the speaker says "social media" is a hard production defect — not a minor sync issue.

## References

- WORKFLOW.md lines 1260–1312 (in `sample/`)
- `talking-head-editing/scripts/compute-exact-timestamps.js`
- `docs/rules/assembly-rules.md` Rule 4

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-003-zoom-reencode-keyframe-drift|BUG-003]] (Layer 1 per-segment drift)
**Phase:** [[../../rules/assembly-rules|assembly-rules]]
