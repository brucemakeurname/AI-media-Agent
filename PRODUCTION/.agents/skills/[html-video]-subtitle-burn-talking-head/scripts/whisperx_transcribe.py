#!/usr/bin/env python3
"""
Word-level transcription via faster-whisper's native word timestamps → JSON output.
Usage: python whisperx_transcribe.py <audio_path> <output.json>
Output: [{"word": "...", "start": 0.0, "end": 0.3}, ...]
"""
import sys
import json
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: whisperx_transcribe.py <audio> <output.json>", file=sys.stderr)
        sys.exit(2)

    audio_path, output_json = sys.argv[1], sys.argv[2]

    from faster_whisper import WhisperModel  # type: ignore

    # Native word_timestamps (Whisper's own cross-attention alignment) instead of
    # a separate wav2vec2 forced-aligner: the Vietnamese wav2vec2 aligner
    # (nguyenvulebinh/wav2vec2-base-vi-vlsp2020, used by whisperx.align()) was
    # found to emit near-zero confidence scores on real narration audio and
    # compress each sentence's words into a small fraction of its true spoken
    # duration — the root cause of subtitles racing far ahead of the voice.
    model_name = os.environ.get("WHISPER_MODEL", "large-v3")
    language = os.environ.get("WHISPER_LANGUAGE", "vi")
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(
        audio_path, language=language, word_timestamps=True, vad_filter=True,
    )

    words: list[dict] = []
    for seg in segments:
        for w in seg.words:
            text = w.word.strip()
            if text and w.end > w.start:
                words.append({
                    "word": text,
                    "start": float(w.start),
                    "end": float(w.end),
                })

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f"OK: {len(words)} words -> {output_json}")

if __name__ == "__main__":
    main()
