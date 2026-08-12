# BUG-003 — SRT drift from zoom re-encode keyframe padding

**Phase:** 1 (Semantic Cut + Zoom)
**Severity:** warning (becomes fatal if uncorrected downstream)
**First observed:** proj_teleprompter_01

## Symptom

After applying zoom (`scripts/zoom-merge-check.js`) to each segment, the SRT or any downstream timeline built using `cut_plan.json` durations is misaligned. Words appear too early in the second half of the video. Over 65 segments, accumulated drift is +3.16s.

Visual symptom: subtitles flash before the corresponding spoken word; later half of video has progressively worse subtitle sync.

## Root Cause

When each segment is re-encoded (crop + scale → H.264), FFmpeg pads each output to the next keyframe boundary at 30fps. The padding adds 33–61ms per segment (one frame). The plan JSON has nominal durations from the original cut — it does not include this padding.

If any downstream process uses `seg.duration` from `cut_plan.json` to accumulate positions, every segment after the first is wrong by the accumulated keyframe padding.

## Detection Signature

Match if ALL of:
- Phase 1 has completed (`segments/zoomed/` exists with ≥1 zoom file)
- Any script accesses `cut_plan.json` field `.segments[*].duration` for accumulation purposes
- `ffprobe` of `segments/zoomed/seg_NNN_zoom.mp4` returns duration ≠ `cut_plan.json segments[NNN].duration` (typically +0.03–0.06s diff per segment)

Programmatic check:
```bash
for f in segments/zoomed/seg_*_zoom.mp4; do
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"
done > actual_durations.txt
diff_total = sum(actual) - sum(cut_plan.duration)
# if abs(diff_total) > 0.5s → BUG-003
```

## Fix

1. Always use `ffprobe` actual durations when building any SRT, concat timeline, or downstream timestamp:
   ```js
   const actual = parseFloat(
     execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${zoomFile}"`).toString().trim()
   );
   ```
2. Re-run `scripts/zoom-merge-check.js` if it generated the SRT — verify it calls `ffprobe` and does NOT fall back to `seg.duration`.
3. Use `scripts/fix-zoom-srt.js` to regenerate SRT from ffprobed actuals.
4. For Phase 3 A-roll cluster math: use ffprobed cluster duration, not `cut_plan.json` sum.

**Never hardcode the +3.16s drift.** It varies by segment count, codec settings, source FPS. Always measure fresh.

## Why this fix works

`ffprobe` reads the actual encoded duration from the file's metadata — it sees the keyframe-padded value. Using this as the source of truth eliminates drift at its origin. The compute happens once per phase that needs timestamps; cost is minimal (microseconds per file).

## Related — Layer 2 Drift (concat re-encode overhead)

After concatenating segments with `-c:v libx264`, the encoder adds ~1–2 more frames per join (B-frame flushing). This is a SEPARATE drift layer covered by BUG-004 (scale correction).

Both BUG-003 and BUG-004 must be fixed together to get accurate B-roll placement in Phase 5.

## References

- WORKFLOW.md lines 395–398 (in `sample/`)
- `talking-head-editing/scripts/compute-exact-timestamps.js`
- `docs/rules/zoom-rules.md` (Encoding Drift Warning section)

## Graph

**Index:** [[README|bug-codebook README]]
**Related:** [[BUG-004-broll-concat-scale-correction|BUG-004]] (concat layer drift)
**Phase:** [[../../rules/zoom-rules|zoom-rules]]
