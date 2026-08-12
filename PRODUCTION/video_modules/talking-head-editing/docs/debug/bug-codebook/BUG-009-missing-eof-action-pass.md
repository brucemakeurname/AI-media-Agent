# BUG-009 — Missing `eof_action=pass` causes last-frame ghosting

**Phase:** 3, 5
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

After an A-roll or B-roll overlay ends, the LAST FRAME of that overlay remains visible for the rest of the video. Subsequent talking-head footage is covered by a frozen overlay (a glass card frozen mid-fade, or a B-roll's end frame).

In severe cases: chained overlays all freeze on their last frame, so the final video has multiple frozen overlays stacked from the moment each ends.

## Root Cause

FFmpeg's `overlay` filter has a parameter `eof_action` controlling what happens when the overlay stream reaches EOF. Default is `repeat` (in some FFmpeg versions) which holds the last frame indefinitely. The base stream continues, but the overlay filter keeps compositing the frozen final frame onto everything.

`eof_action=pass` tells the filter: when the overlay ends, pass through to the base stream (do not composite the last frame anymore).

## Detection Signature

Match if ALL of:
- Phase 3 or Phase 5
- FFmpeg overlay command does NOT include `:eof_action=pass`
- Output video: any overlay's last frame is visible past its intended end time

Regex check:
```regex
overlay=[^:]*(?:enable='[^']*')?(?!.*:eof_action=pass)[^[]
```

Visual: scrub to ~0.5s after any overlay ends. If the last frame is still on screen → BUG-009.

## Fix

Add `:eof_action=pass` to EVERY `overlay=` filter call:

**Wrong:**
```
[0:v][br0]overlay=0:0:enable='between(t,4.128,9.200)'[v0]
```

**Correct:**
```
[0:v][br0]overlay=0:0:enable='between(t,4.128,9.200)':eof_action=pass[v0]
```

Apply to:
- B-roll overlays in Phase 5 Step 2
- A-roll overlays in Phase 3 composite + Phase 5
- Subtitle overlay in Phase 5 Step 3

## Why this fix works

`eof_action=pass` makes the overlay filter behave like a switch:
- During overlay's active window: composite overlay frame on base frame.
- After overlay's EOF: emit base frame untouched.

The base video (main footage + audio) continues uninterrupted. The overlay simply stops contributing.

## Common confusion

`enable='between(t,X,Y)'` and `eof_action=pass` serve different purposes:
- `enable=` controls when the filter is ACTIVE for output composition.
- `eof_action=` controls what happens when the input stream is exhausted.

A clip can be enabled but exhausted — that's exactly the freeze condition. Both controls are needed.

## Recommended default

When in doubt, always set `eof_action=pass` on every overlay filter. There is no downside: if the overlay is shorter than the base, it stops cleanly; if equal length, the parameter has no effect.

## References

- WORKFLOW.md lines 1190–1196 (mentioned in Assembly Rule 1)
- `docs/rules/assembly-rules.md` Rules 1, 3
- `docs/rules/aroll-overlay-rules.md` (Composite section)

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-005-itsoffset-setpts-cancellation|BUG-005]] · [[BUG-007-ffmpeg-consumes-inputs-from-zero|BUG-007]]
**Phase:** [[../../rules/assembly-rules|assembly-rules]] · [[../../rules/aroll-overlay-rules|aroll-overlay-rules]]
