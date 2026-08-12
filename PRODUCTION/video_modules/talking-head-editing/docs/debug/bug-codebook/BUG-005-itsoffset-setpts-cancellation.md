# BUG-005 — `-itsoffset` + `setpts=PTS-STARTPTS` cancellation

**Phase:** 3 (A-roll Overlay), 5 (Assembly)
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

All A-roll overlays appear at t=0 simultaneously, stacking on top of each other. The video opens with all 6+ glass cards visible at once for ~5 seconds, then they all disappear. Late A-roll positions are completely empty.

## Root Cause

When an FFmpeg input uses `-itsoffset N`, FFmpeg shifts the input's PTS by N. When the filter graph then applies `setpts=PTS-STARTPTS`, it subtracts the first PTS — which now equals N. The two operations cancel: `(PTS_original + N) - N = PTS_original`. All frames reset to t=0.

This is a subtle interaction: each operation is correct in isolation. Together they nullify.

## Detection Signature

Match if ALL of:
- Phase 3 or Phase 5
- FFmpeg command contains BOTH `-itsoffset` AND `setpts=PTS-STARTPTS` on the same input
- Output video shows multiple overlays at t=0 simultaneously

Regex check on command:
```regex
-itsoffset\s+[\d\.]+\s+-i\s+[^\s]+(\.mov|\.mp4).*setpts=PTS-STARTPTS
```

Visual check: open output, scrub to t=0–5s. If multiple A-roll glass cards visible → BUG-005.

## Fix

Replace `-itsoffset {N}` + `setpts=PTS-STARTPTS` with `setpts=PTS+{N}/TB` in the filter:

**Before (wrong):**
```bash
ffmpeg -i base.mp4 \
  -itsoffset 4.103 -i ar_00.mov \
  -itsoffset 9.273 -i ar_01.mov \
  -filter_complex "
    [1:v]setpts=PTS-STARTPTS[ov0];
    [2:v]setpts=PTS-STARTPTS[ov1];
    [0:v][ov0]overlay=0:0[v0];
    [v0][ov1]overlay=0:0[v1]
  "
```

**After (correct):**
```bash
ffmpeg -i base.mp4 \
  -i ar_00.mov \
  -i ar_01.mov \
  -filter_complex "
    [1:v]setpts=PTS+4.103/TB[ov0];
    [2:v]setpts=PTS+9.273/TB[ov1];
    [0:v][ov0]overlay=0:0:eof_action=pass[v0];
    [v0][ov1]overlay=0:0:eof_action=pass[v1]
  "
```

**Key changes:**
- Remove `-itsoffset N` from inputs.
- Replace `setpts=PTS-STARTPTS` with `setpts=PTS+{N}/TB` per input.
- Add `eof_action=pass` to each overlay (see BUG-009).

## Why this fix works

`setpts=PTS+N/TB` adds N seconds to every frame's presentation timestamp without any STARTPTS subtraction. The base video is at PTS=0..duration; the overlay's frames are shifted to start at PTS=N. The `overlay` filter places overlay frame X on base frame at the matching PTS.

## Special note — B-rolls use the OTHER pattern

For B-rolls (Phase 5 Step 2), use `-itsoffset N` WITHOUT any `setpts=PTS-STARTPTS` filter. That combination works for B-rolls because they have no PTS subtraction undoing the offset.

**B-roll pattern (correct):**
```bash
-itsoffset 4.128 -i br_00_trim.mp4
... [1:v]scale=1080:1920[br0]; [0:v][br0]overlay=0:0:enable='...':eof_action=pass
```

The difference: B-rolls use `enable=` for time-range gating, A-rolls use `setpts` shift directly. Both are valid; mixing the mechanisms breaks both.

## References

- WORKFLOW.md lines 1247–1257 (Assembly Rule 3)
- `docs/rules/assembly-rules.md` Rule 3
- `docs/rules/aroll-overlay-rules.md` (Composite section)

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-007-ffmpeg-consumes-inputs-from-zero|BUG-007]] (B-roll pattern) · [[BUG-009-missing-eof-action-pass|BUG-009]] (always pair with eof_action)
**Phase:** [[../../rules/assembly-rules|assembly-rules]] · [[../../rules/aroll-overlay-rules|aroll-overlay-rules]]
