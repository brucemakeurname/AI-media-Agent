import sys
import json

audio_path, output_json = sys.argv[1], sys.argv[2]
device = "cpu"

import whisperx

model = whisperx.load_model("small", device, compute_type="int8")
audio = whisperx.load_audio(audio_path)
result = model.transcribe(audio, batch_size=16)
language = result.get("language", "en")
print(f"Detected language: {language}", file=sys.stderr)

words = []
try:
    model_a, metadata = whisperx.load_align_model(language_code=language, device=device)
    aligned = whisperx.align(
        result["segments"], model_a, metadata, audio, device,
        return_char_alignments=False,
    )
    for w in aligned.get("word_segments", []):
        text = str(w.get("word", "")).strip()
        if text and "start" in w and "end" in w:
            words.append({"text": text, "start": float(w["start"]), "end": float(w["end"])})
except Exception as e:
    print(f"Align failed ({e}), falling back to segment-level split", file=sys.stderr)
    for seg in result.get("segments", []):
        seg_words = seg["text"].strip().split()
        if not seg_words:
            continue
        dur = (float(seg["end"]) - float(seg["start"])) / len(seg_words)
        for i, w in enumerate(seg_words):
            words.append({
                "text": w,
                "start": float(seg["start"]) + i * dur,
                "end": float(seg["start"]) + (i + 1) * dur,
            })

with open(output_json, "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print(f"OK: {len(words)} words -> {output_json}", file=sys.stderr)
