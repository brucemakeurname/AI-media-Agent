# BUG-008 — B-roll render_duration exceeds slot_duration (overflow)

**Phase:** 5 (Assembly)
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

A B-roll bleeds into the NEXT cut. Talking-head content that should be visible right after the B-roll is covered by the lingering tail of the B-roll's motion. Sometimes the next B-roll starts while the previous one is still showing.

## Root Cause

A B-roll's HyperFrames render produces a clip of `render_duration` seconds. The Phase 2 `slot_duration` was decided from the source content (`end − start` of the chosen sentence). When the renderer's output is longer than the slot (because of fade-out hold, padding, or template adaptation):

```
render_duration = 5.267s
slot_duration   = 5.072s
overflow        = 0.195s
```

In Phase 5, if you use `enable='between(t, start, start + slot_duration)'` BUT the clip plays its full render_duration, the overlay's `enable` window closes early — but only if `eof_action=pass` is set AND the input doesn't continue rendering. The safer approach is to pre-trim the clip itself.

Without pre-trim, the overflow region either:
- Covers the next cut's frames (if eof_action is `repeat`)
- Disappears abruptly mid-motion (if eof_action is `pass` but the motion's fade-out hasn't completed)

## Detection Signature

Match if ALL of:
- Phase 5 in progress
- `broll_timestamp.json` has any entry where `render_duration > slot_duration`
- `broll_renders/br_NN_trim.mp4` does NOT exist for those overflow entries

Programmatic check:
```js
for (const broll of broll_timestamps) {
  if (broll.render_duration > broll.slot_duration + 0.05) {
    if (!fileExists(`broll_renders/br_${broll.id}_trim.mp4`)) {
      FLAG_AS_BUG_008(broll);
    }
  }
}
```

## Fix

For each overflow B-roll, pre-trim to `min(render_duration, slot_duration)`:

```bash
ffmpeg -y -i broll_renders/br_NN.mp4 \
  -t {clip_trim} \
  -c:v libx264 -crf 18 -an \
  broll_renders/br_NN_trim.mp4
```

`clip_trim = min(render_duration, slot_duration)`.

Then use `br_NN_trim.mp4` (not `br_NN.mp4`) in the Phase 5 overlay command.

**For B-rolls without overflow** (`render_duration ≤ slot_duration`):
- Either skip trimming and use original `br_NN.mp4`, OR
- Create `br_NN_trim.mp4` as a copy for consistency (allows the Phase 5 command to always reference `_trim` paths)

Most pipelines choose the second option for code simplicity:
```bash
ffmpeg -y -i br_NN.mp4 -t {clip_trim} -c:v libx264 -crf 18 -an br_NN_trim.mp4
```

## Why this fix works

Pre-trimming hard-caps the B-roll's output duration at the source. Whatever happens downstream (overlay enable windows, eof_action behavior), the clip cannot exceed `slot_duration`. This makes Phase 5 timing deterministic regardless of the renderer's quirks.

Setting `-an` (no audio) is correct — B-rolls never contribute audio to the final mix. The main video provides the audio track.

## Why `-crf 18` not `-c copy`

`-c copy` does demux-only trim that snaps to keyframes — can produce a file slightly longer or shorter than `-t` requested. `-crf 18` re-encodes to exact `-t` duration. The re-encode cost is trivial (3–6s clip).

## References

- WORKFLOW.md lines 1200–1229 (Assembly Rule 2)
- `docs/rules/assembly-rules.md` Rule 2

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-007-ffmpeg-consumes-inputs-from-zero|BUG-007]] (always combined with itsoffset)
**Phase:** [[../../rules/assembly-rules|assembly-rules]]
