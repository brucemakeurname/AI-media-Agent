# rough-cut-rules — Phase 0 Logic

> Abstract rules for the universal `rough-cut-video` skill. Applies to talking-head, vlog, podcast clip, or any single-speaker recording.

---

## Purpose

Remove unusable footage from a raw recording so only clean continuous speech remains. Output one consolidated video file where every second contains meaningful content, plus a word-level transcript aligned to that file.

---

## Exclusion Reason Tags

| Tag | Description |
|---|---|
| `stumble` | Speaker starts a word/phrase then resets. Restart is the keeper. |
| `repeat` | Same phrase said twice (or more). Keep the last (cleanest) take only. |
| `false_start` | Speaker began a sentence then restarted from the beginning. Cut the entire false-start phrase. |
| `wrong_pronunciation` | Mispronounced word, not self-corrected by speaker. |
| `wrong_intonation` | Sentence ends with wrong rise/fall — unconfident or robotic. |
| `silence` | Dead air > 0.5s (thinking pause, hesitation). |
| `gap_50pct` | Pacing — cut first 50% of an inter-sentence silence ≥ 0.6s. |
| `noise` | Background noise spike, cough, chair scrape, etc. |
| `off_script` | Speaker deviated significantly from teleprompter/script. |

---

## Rule 1 — Cut the words, not just the gap

When removing a false-start, cut from the start of the bad WORDS to the start of the clean word — not just the silence between them.

```
WRONG: [false_start "why nine"] [GAP_CUT_ONLY] [clean "why 99%"]
                                    ^^ only this deleted — bad words remain audible

RIGHT: [false_start "why nine" + gap] [clean "why 99%"]
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ all of this deleted
```

**Why:** Cutting only the gap leaves the bad words audible. The viewer hears "why nine why 99% of you..." — sounds like a stutter, breaks performance.

## Rule 2 — Identical word preservation

When the false-start word is IDENTICAL to the first word of the clean restart, do NOT cut past the gap midpoint. Cut to a point that leaves enough audio for the clean instance to survive.

**Example pattern:**
```
Original: [Everyone is (false)] [..gap N seconds..] [Everyone is shouting (clean)]
Cut to (false-end + ~50% of gap): leaves enough audio for clean "Everyone" before "is"
```

**Detection:** Compare the first word(s) of the false-start phrase against the first word(s) after the gap. If they match → apply this rule.

## Rule 3 — Gemini timestamps require calibration

Gemini 2.5 Flash compresses audio time non-linearly. NEVER use Gemini timestamps directly. Always apply linear interpolation against WhisperX anchors.

**Calibration procedure:**
1. Pick 3+ WhisperX words spread across the audio (start, middle, end).
2. Find the corresponding word in Gemini's output → record `(gemini_time, actual_time)` anchor.
3. Apply piecewise linear interpolation: `scale_gemini(g) → actual`.
4. NEVER assume Gemini's timestamps are real audio time.

Calibration anchors are PROJECT-SPECIFIC. Recompute per project.

## Rule 4 — Gap-50pct only covers sentence gaps ≥ 0.6s

The 50% gap reduction cuts the first half of pauses ≥ 0.6s between sentences (WhisperX sentence boundaries). Shorter intra-sentence pauses are preserved as natural speech rhythm.

**Why first half not second:** The second half of a gap is the breath INTO the next sentence — cutting it makes the sentence-start feel rushed/clipped.

## Rule 5 — Source file is the original, never a clean version

Always read `exclude_regions` timestamps against the ORIGINAL raw recording. Phase 0 maps those timestamps through `exclude_regions` to produce `main_clean.mp4`. Never derive new exclude_regions from `main_clean.mp4` — its timeline is downstream of the cuts, not upstream.

## Rule 6 — Speed factor applied last, once

The speed factor (default 1.2×) is applied in ONE step at the very end of Phase 0, after concat. It is NEVER applied again in later phases. All segment timestamps in later phases are already in the sped-up final timeline.

**Why 1.2× not more:** 1.2× is the maximum that preserves natural-sounding speech. 1.3× and above starts to sound mechanical and loses intonation quality. Adjust only if the speaker's natural cadence is unusually slow.

## Rule 7 — Silence trim buffers

When trimming leading silence: keep `PRE_WORD_BUF = 0.10s` before the first word.
When trimming trailing silence: keep `POST_WORD_BUF = 0.15s` after the last word.

This preserves natural breath and word-decay, preventing audio that sounds "clipped."

## Rule 8 — Why re-transcribe after cut

After Phase 0 cuts + speed-up, all original-timeline timestamps are stale. Always re-run WhisperX directly on `main_clean.mp4` to get ground-truth word-level timestamps for the cleaned file.

**Never derive transcripts via timestamp transformation.** The transformation (`orig_to_final()`) accumulates drift in the final third of the recording. Direct transcription on the final file = zero drift, 1:1 alignment.

## Rule 9 — Include-region inversion

Compute include_regions from exclude_regions:
```
sort exclude_regions by .from
include[0] = (0, exclude[0].from)
include[i] = (exclude[i-1].to, exclude[i].from)
include[N] = (exclude[N-1].to, source_duration)
```
Drop any include region shorter than 0.2s (artefact slivers between adjacent exclusions).

## Rule 10 — Quality gate

If total excluded duration > 40% of source: halt and flag for operator review. Excessive removal usually means wrong source file, very bad take, or analysis errors. Re-record may be needed.

Log to `logs/rough_cut.log`:
```
Total source duration:    {N}s
Total excluded duration:  {N}s ({pct}%)
Total included duration:  {N}s
Speed factor applied:     {N}×
Final duration:           {N}s
```

---

## Pipeline Order (canonical)

1. WhisperX on raw source → `logs/transcript.json`
2. Gemini analysis on raw audio → `logs/gemini_analysis.json`
3. Calibrate Gemini timestamps → real audio time
4. Build `exclude_regions` (operator marks + auto-detected) → `analysis.json`
5. Apply gap-50pct rule to inter-sentence silences ≥ 0.6s
6. Invert exclude_regions → include_regions (drop < 0.2s)
7. FFmpeg extract include parts with `-c copy`
8. FFmpeg concat parts with `-c copy` → `main_clean_raw.mp4`
9. Apply speed factor (default 1.2×) → `main_clean.mp4` (re-encode required)
10. Re-run WhisperX on `main_clean.mp4` → `logs/whisperx_clean/main_clean.json`
11. Build `whisperx_word_transcript.json` + `sentence_transcript.json`
12. Optional verification: burn word subtitles onto clean video → `whisperx_word_check.mp4`

---

## Outputs (Required for Phase 1)

| File | Role |
|---|---|
| `footage/main_clean.mp4` | Cleaned, speed-adjusted video |
| `logs/whisperx_word_transcript.json` | Word-level timestamps aligned to main_clean.mp4 |
| `logs/sentence_transcript.json` | Sentence structure for semantic cut decisions |
| `logs/analysis.json` | Master config recording all Phase 0 decisions |

All four must exist and be verified before Phase 1 begins.

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[segment-rules|segment-rules]] · [[zoom-rules|zoom-rules]] · [[assembly-rules|assembly-rules]]
**Case study reference:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/case-studies/proj_teleprompter_01|proj_teleprompter_01]] (22 exclude_regions example)
