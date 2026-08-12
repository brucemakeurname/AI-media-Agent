# BUG-001 — Gemini timestamp non-linear compression

**Phase:** 0 (Rough Cut)
**Severity:** fatal
**First observed:** proj_teleprompter_01

## Symptom

After applying exclude_regions from Gemini's analysis directly (without calibration), the resulting `main_clean.mp4` has bad cuts:
- Wrong words removed
- Clean phrases destroyed
- False starts left in
- Duration nowhere near expected

`logs/rough_cut.log` shows cuts at timestamps that don't correspond to the actual audio events.

## Root Cause

Gemini 2.5 Flash compresses audio time non-linearly. Its returned timestamps are NOT real audio time — they live in a compressed Gemini-internal time space. The compression ratio varies across the audio (roughly 4× faster than real time at the start, drifting at different rates through the middle and end).

Direct use of Gemini timestamps as FFmpeg seek points will cut at the wrong places.

## Detection Signature

Match if ALL of:
- Phase is Phase 0
- `analysis.json` was built using `gemini_analysis.json` timestamps without scaling
- Resulting `main_clean.mp4` duration deviates from `(source_duration − sum_of_exclude_regions) / speed_factor` by more than ±1.0s
- OR `combine_analysis.py` has no `scale_gemini` function

Stderr pattern: usually none (Phase 0 succeeds technically, output is just wrong).

Visual check: open `main_clean.mp4`, listen for cut artifacts at wrong word boundaries.

## Fix

1. Identify 3+ anchor pairs by finding WhisperX words that correspond to Gemini's reported timestamps:
   - At start of recording (e.g., g=0.0 → actual=0.0)
   - One in middle third
   - One in final third
2. Add `scale_gemini(g_time)` function to `combine_analysis.py` doing piecewise linear interpolation between anchors:
   ```python
   def scale_gemini(g):
       for i in range(len(anchors)-1):
           g0, a0 = anchors[i]
           g1, a1 = anchors[i+1]
           if g0 <= g <= g1:
               return a0 + (g - g0) * (a1 - a0) / (g1 - g0)
       # extrapolate past last anchor
       ...
   ```
3. Re-run `combine_analysis.py`. Confirm the produced `exclude_regions` align with WhisperX word boundaries (each `from` / `to` should be within ±0.2s of a real word boundary).
4. Re-run Phase 0 from Step 7 (FFmpeg extract).

## Why this fix works

Three anchors capture both the start-of-recording compression rate AND the drift across the recording. Piecewise linear interpolation between anchors is accurate enough for cut boundaries (±100ms tolerance is acceptable since we then snap to nearest WhisperX word gap via `nearest_gap_before()`).

## References

- WORKFLOW.md lines 99–107 (in `sample/`)
- `talking-head-editing/scripts/combine_analysis.py`
- `docs/rules/rough-cut-rules.md` Rule 3

## Graph

**Index:** [[README|bug-codebook README]]
**Phase:** [[../../rules/rough-cut-rules|rough-cut-rules]]
