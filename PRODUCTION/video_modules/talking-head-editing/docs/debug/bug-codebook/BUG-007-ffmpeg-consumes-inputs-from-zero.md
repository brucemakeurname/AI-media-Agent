# BUG-007 — FFmpeg consumes inputs from t=0 regardless of `enable=`

**Phase:** 5 (Assembly)
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

In the final assembly output, a B-roll appears as a STATIC FROZEN IMAGE during its scheduled time window — not as the rendered moving B-roll clip. The frame shown is the LAST frame of the B-roll (often near-black or the final motion-end pose). Earlier B-rolls show correctly; later B-rolls show as still frames.

## Root Cause

FFmpeg consumes all input streams in PARALLEL starting from t=0 of the timeline, regardless of any `enable='between(t,...)'` expression in the filter graph. The `enable` expression only controls when an overlay is APPLIED — it does not control when the input is READ.

If a B-roll is 5 seconds long and its `enable` window starts at t=40s, the B-roll has been entirely consumed by t=5s. From t=5s onward, the input stream provides only its last frame (or EOF, depending on filter settings). When the `enable` window fires at t=40s, the only available content is that frozen last frame.

## Detection Signature

Match if ALL of:
- Phase 5 in progress
- FFmpeg command uses `enable='between(t,X,Y)'` for B-roll overlays
- Command does NOT use `-itsoffset` per B-roll input
- Output video: late B-rolls appear as static images at their scheduled time

Regex check:
```regex
-i\s+broll_renders/br_\d+(_trim)?\.mp4(?!.*-itsoffset)
```
AND
```regex
overlay=.*enable='between\(t,
```

Visual: scrub to second/third B-roll position. If you see a static frame instead of motion → BUG-007.

## Fix

Add `-itsoffset {start_sec}` before EACH B-roll input. This delays FFmpeg's read of that input so its frame 0 maps to the scheduled timeline position.

**Wrong:**
```bash
ffmpeg -i base.mp4 \
  -i br_00_trim.mp4 \
  -i br_01_trim.mp4 \
  ...
  -filter_complex "
    [1:v]scale=1080:1920[br0];
    [2:v]scale=1080:1920[br1];
    [0:v][br0]overlay=0:0:enable='between(t,4.128,9.200)'[v0];
    [v0][br1]overlay=0:0:enable='between(t,13.505,17.238)'[v1];
    ...
  "
```

**Correct:**
```bash
ffmpeg -i base.mp4 \
  -itsoffset 4.128  -i br_00_trim.mp4 \
  -itsoffset 13.505 -i br_01_trim.mp4 \
  ...
  -filter_complex "
    [1:v]scale=1080:1920[br0];
    [2:v]scale=1080:1920[br1];
    [0:v][br0]overlay=0:0:enable='between(t,4.128,9.200)':eof_action=pass[v0];
    [v0][br1]overlay=0:0:enable='between(t,13.505,17.238)':eof_action=pass[v1];
    ...
  "
```

**Key:** `-itsoffset` must appear BEFORE the corresponding `-i` flag. Each B-roll input gets its own `-itsoffset` matching its `enable` start.

Also: always add `eof_action=pass` (see BUG-009).

## Why this fix works

`-itsoffset N -i file.mp4` shifts the input's PTS timeline by N seconds. The input's frame 0 is now presented at PTS=N. FFmpeg's parallel-consumption is still happening, but each input's internal clock is offset so the right frame is available when the overlay's `enable` window fires.

## Why this happens — FFmpeg design

FFmpeg's filter graph is fundamentally a pipeline: every input is decoded in parallel at the rate the filter consumes. `enable` is a GATE, not a TRIGGER. The decoder doesn't "wait" for `enable` to fire. This is by design — it allows efficient streaming filter chains for live use cases. `-itsoffset` is the official way to delay an input.

## References

- WORKFLOW.md lines 1172–1196 (Assembly Rule 1)
- `docs/rules/assembly-rules.md` Rule 1

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-005-itsoffset-setpts-cancellation|BUG-005]] (different pattern for A-roll) · [[BUG-009-missing-eof-action-pass|BUG-009]] (must pair)
**Phase:** [[../../rules/assembly-rules|assembly-rules]]
