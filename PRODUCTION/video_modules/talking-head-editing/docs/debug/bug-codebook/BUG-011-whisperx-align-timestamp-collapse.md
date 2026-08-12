# BUG-011 — WhisperX forced-alignment collapses Vietnamese word timestamps

**Phase:** 0 (Rough Cut)
**Severity:** fatal
**First observed:** industry-news 5-skill test render, 2026-08-08/09 — carried over to this codebook 2026-08-10 after root-causing the same dependency here (not yet reproduced on a talking-head project specifically)

## Symptom

Word-level timestamps in `logs/transcript.json` / `logs/whisperx_word_transcript.json` are bunched into a small fraction of each sentence's true spoken duration, sometimes with multi-second stretches where no words are recorded at all even though the speaker is talking. Downstream, this makes subtitles (Phase 4/5) race far ahead of the voice, or leaves gaps with no subtitle while the speaker is still talking. `score` values on the affected words are near-zero (e.g. ~0.01) instead of the normal ~0.9+.

## Root Cause

`rough-cut-video/SKILL.md` Steps 1 and 10 call the `whisperx` CLI directly with no `--no_align` flag, so it runs forced-alignment by default via a separate Vietnamese wav2vec2 model (`nguyenvulebinh/wav2vec2-base-vi-vlsp2020`, HuggingFace `Wav2Vec2ForCTC`). That model was found to emit near-zero-confidence CTC emissions on real Vietnamese narration audio. The forced-alignment backtrack (Viterbi path over the CTC trellis) then finds a degenerate low-cost path that compresses a whole sentence's characters into the first fraction of the segment's real duration instead of spreading them across it. This is independent of Whisper model size (`base` and `large-v3` both showed it) and independent of VAD `chunk_size` (it reproduces even on short ~4-8s segments, not just long ones).

Confirmed fix in the sibling pipeline `.claude/skills/[html-video]-subtitle-burn-industry-news/scripts/whisperx_transcribe.py` (2026-08-10): bypassing whisperx's separate aligner entirely and using `faster-whisper`'s own native `word_timestamps=True` (Whisper's built-in cross-attention word alignment, no separate wav2vec2 model) restored normal confidence (0.9+) and correct pacing on the exact audio that reproduced the bug.

## Detection Signature

Match if ANY of:
- Words in `logs/whisperx_word_transcript.json` have `score` < 0.1 for a run of 5+ consecutive words while the sentence around them is otherwise normal Vietnamese text (not noise/silence).
- A gap > 2s between consecutive word `end`/`start` inside what should be continuous narration (cross-check against `ffmpeg -af silencedetect` on the same audio — if silencedetect shows no real silence there, the gap is a transcript artifact, not real).
- Sum of all word durations in a sentence is far shorter than `(sentence.end - sentence.start)` from the raw ASR segment (i.e., words compressed into a fraction of the segment).

## Fix

This pipeline has NOT been patched yet (2026-08-10) — flagged here as a known risk for any Vietnamese-language talking-head project, not yet applied. When patched, follow the same approach already proven working:

1. Do not rely on the `whisperx` CLI's default alignment for word-level timestamps.
2. Replace Steps 1 and 10's `whisperx ... --output_format json` calls with a small wrapper script (mirroring `.claude/skills/[html-video]-subtitle-burn-industry-news/scripts/whisperx_transcribe.py`) that calls `faster_whisper.WhisperModel(...).transcribe(audio, word_timestamps=True, vad_filter=True)` directly and writes output in the same JSON shape `build-transcripts.js` / `subtitle-designer` already expect (`words: [{word, start, end, score}]`) so no downstream consumer needs to change.
3. Re-verify with the same method used in the 2026-08-10 fix: run on real project audio, check for near-zero-score runs and false gaps, burn subtitles onto a real render, and visually confirm several frames against expected words at their timestamps.

## Why this fix works

Whisper's own cross-attention word-timing (used when `word_timestamps=True` is passed to the ASR model itself) is trained end-to-end with the transcription task and does not depend on a separate, narrower fine-tuned Vietnamese CTC model that can silently produce garbage confidence on real-world audio. Removing the extra alignment stage removes the failure mode entirely rather than tuning around it (chunk_size tuning was tried first and did not fix it — see `.claude/skills/[html-video]-subtitle-burn-industry-news/scripts/whisperx_transcribe.py` git history / session notes for the failed intermediate attempts).

## References

- `.claude/skills/[html-video]-subtitle-burn-industry-news/scripts/whisperx_transcribe.py` (fixed version, source of the proven fix)
- `rough-cut-video/SKILL.md` Steps 1, 10 (unpatched call sites)
- `docs/WORKFLOW-template.md` line 83, 91 (Phase 0 WhisperX steps)
- BUG-010 (different WhisperX issue — mishearing brand names — not related to this timestamp bug)

## Graph

**Index:** [[README|bug-codebook README]]
**Phase:** [[../../rules/rough-cut-rules|rough-cut-rules]]
**Related:** [[BUG-010-whisperx-mishears-brand-names|BUG-010]]
