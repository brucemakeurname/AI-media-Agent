# BUG-010 — WhisperX mishears tool/brand names

**Phase:** 0 (Rough Cut), 1 (Semantic Cut)
**Severity:** warning
**First observed:** proj_teleprompter_01 ("Midori" / "Nano Banana Bro")

## Symptom

After Phase 0 transcription, the transcript contains misspelled or wrong tool/brand names. Examples observed:
- "Midori" instead of "MidJourney"
- "Nano Banana Bro" instead of "Nano Banana"
- "Cling" instead of "Kling"
- "Lluma" instead of "Luma"

This causes:
1. Phase 1 segment text shows the wrong name → final subtitles wrong
2. Phase 2 B-roll Visual Asset Protocol searches for the wrong logo
3. Phase 3 A-roll cluster text has wrong brand reference

A naive Phase 0 process might mark these as `wrong_pronunciation` and try to cut them. Doing so removes valid speech.

## Root Cause

WhisperX's language model has bias toward common English vocabulary. Recent or specialty proper nouns (AI tool brands released 2023+) are unknown — the model picks the closest phonetic match from its vocabulary. The speaker said the correct word; the transcript captured a wrong one.

## Detection Signature

Match if ANY of:
- Phase 0 produced a transcript containing a word that fails dictionary lookup but matches a known brand by phonetic similarity (Levenshtein distance ≤ 3 from known brand list)
- Operator review flags a transcript word as a known tool name despite the transcript showing something else
- `analysis.json` has `semantic_notes` entry mentioning a mishearing

Programmatic check (requires brand list):
```js
const known_brands = ['MidJourney', 'Kling', 'Luma', 'Nano Banana', 'Sora', 'Runway', ...];
for (const word of transcript.words) {
  for (const brand of known_brands) {
    if (levenshtein(word.text.toLowerCase(), brand.toLowerCase()) <= 3
        && word.text.toLowerCase() !== brand.toLowerCase()) {
      FLAG_AS_BUG_010({word, suspected_brand: brand});
    }
  }
}
```

## Fix

This is NOT an automatic fix. It requires operator review.

1. Do NOT mark mishearings as `wrong_pronunciation` in `exclude_regions` — the audio is correct, only the transcript is wrong.
2. Add `semantic_notes` entry in `analysis.json` documenting the mishear:
   ```json
   {
     "semantic_notes": [
       {
         "time": 69.46,
         "transcript_says": "Midori",
         "speaker_actually_said": "MidJourney",
         "note": "WhisperX mishear — do not cut, do not flag as pronunciation error."
       }
     ]
   }
   ```
3. For Phase 1: when writing `cut_plan.json`, use the CORRECT brand name in the `text` field, not the WhisperX transcript verbatim. Note in `reason`: "Brand name corrected from WhisperX mishear."
4. For Phase 2 (B-roll Visual Asset Protocol): always search for the corrected brand name, never the transcript spelling.
5. For Phase 3 (A-roll captions): use corrected brand name.
6. For Phase 5 (subtitles): subtitles can either show the corrected name OR the transcript verbatim — decide based on style (verbatim is more honest to the source; corrected is more readable).

## Why this is a warning, not fatal

The audio is correct. The video output looks and sounds fine to the viewer. The bug surfaces only in:
- Visual searches that look for the wrong logo
- Subtitle text accuracy

A pipeline that processes these correctly produces correct output. A pipeline that flags it as a `wrong_pronunciation` and cuts the audio is WORSE than ignoring the mishear — it destroys valid speech.

## Brand List Maintenance

Maintain a project-specific brand list in `analysis.json`:
```json
"known_brands": ["MidJourney", "Kling", "Luma", "Nano Banana", "Veo", "Sora"]
```

This list is consulted by Phase 0 (to skip false `wrong_pronunciation` flags) and by Phases 2/3 (to substitute correct names).

## References

- WORKFLOW.md lines 519–524 (semantic_notes)
- WORKFLOW.md `seg_039` "Nano Banana Pro" example
- `docs/rules/rough-cut-rules.md` (Exclusion Reason Tags)

## Graph

**Index:** [[README|bug-codebook README]]
**Phase:** [[../../rules/rough-cut-rules|rough-cut-rules]] · [[../../rules/segment-rules|segment-rules]]
