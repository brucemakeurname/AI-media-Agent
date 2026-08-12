# BUG-002 — Identical-word false start preservation

**Phase:** 0 (Rough Cut)
**Severity:** fatal
**First observed:** proj_teleprompter_01 ("Everyone" case)

## Symptom

After Phase 0 cleanup, the opening sentence (or any sentence where the speaker false-started and restarted with the SAME first word) is grammatically broken — the subject noun is missing.

Example: Original audio "Everyone is [false]. Everyone is shouting at you [clean]." After cleanup, the clean version's "Everyone" is also cut → output starts with "is shouting at you", which is broken.

## Root Cause

Standard false-start handling cuts from the start of the bad words to the START of the clean restart word (`gap_end + buffer`). When the false-start word is IDENTICAL to the first clean restart word, WhisperX may only have transcribed ONE instance — the one timestamped to the false start location. The clean instance lives "in the gap" but has no separate timestamp.

If the cut extends past the gap midpoint into the gap_end region, the clean "Everyone" audio (which lives there) is also removed.

## Detection Signature

Match if ALL of:
- Phase is Phase 0
- An `exclude_region` has `reason: false_start`
- The `gap_end_word` (first word AFTER the cut) is IDENTICAL to the first word of the false-start phrase
- OR: WhisperX transcript shows only ONE instance of the repeated word despite audio containing it twice

Detection from `analysis.json`:
```python
for region in exclude_regions:
    if region.reason == 'false_start':
        false_first_word = first_word_in(region.text)
        next_clean_word = whisperx.word_at(region.to + 0.05)
        if false_first_word.lower() == next_clean_word.lower():
            FLAG_AS_BUG_002
```

## Fix

1. For the matched region, do NOT cut to `gap_end - buffer`. Instead cut to a point that preserves the gap midpoint onward:
   ```
   region.to = false_start_words_end + (gap_duration × 0.55)
   ```
2. This leaves the latter ~45% of the gap intact — enough audio for the clean instance of the repeated word to survive.
3. Verify: after Phase 0 completes, listen to the opening (or affected) section. The clean restart should be intact.

**Heuristic for buffer math:**
- If `gap_duration < 1.0s`: cut to `false_start_end + 0.6 × gap_duration`
- If `gap_duration ≥ 1.0s`: cut to `false_start_end + 0.5 × gap_duration` (more breathing room available)

## Why this fix works

WhisperX records timestamps at the start of audio energy. When a word is said twice with a gap between, WhisperX timestamps the FIRST instance — the second instance is treated as continued energy in the same "word event". The clean second instance audio is physically present in the gap region. Cutting past the gap midpoint destroys it; cutting before preserves it.

The 55%/50% threshold is empirical — leaves enough audio decay for the clean word to render naturally without exposing the false-start tail.

## References

- WORKFLOW.md lines 163–171 ("The 'Everyone' False Start — Special Case")
- WORKFLOW.md lines 432–439 (Rule 2)
- `docs/rules/rough-cut-rules.md` Rule 2

## Graph

**Index:** [[README|bug-codebook README]]
**Phase:** [[../../rules/rough-cut-rules|rough-cut-rules]]
