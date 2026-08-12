---
name: "applio-brand-voice"
description: "Runs Voice Sync from an existing audio/video or Text-to-Sound (TTS + VC) using the trained Singapore male brand voice model in Applio. Ensures maximum similarity to the trained dataset while handling macOS/MPS OpenMP stability, F0 pitch alignment, and verification."
---

# applio-brand-voice

Synthesizes narration or converts source audio into the canonical Singapore male brand voice using the local Applio runtime in `PRODUCTION/video_modules/Applio`.

## Default Assets

- **Model (.pth):** `PRODUCTION/video_modules/Applio/logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m-7epoch-dataset-dominant.pth`
- **Index (.index):** `PRODUCTION/video_modules/Applio/logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m.index`
- **Reference Voice:** `BASE/BRAND KITs/UltimateSup/voice/voice_1_male_10_mins.WAV` (median F0: ~`130.8 Hz`)
- **Applio Python Runtime:** `PRODUCTION/video_modules/Applio/.venv/bin/python`

## Execution Rules (Dataset-Dominant Standard)

To maximize similarity to the trained Singapore dataset and prevent macOS ARM64 crashes:
1. **OpenMP Environment:** Always set `KMP_DUPLICATE_LIB_OK=TRUE OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 VECLIB_MAXIMUM_THREADS=1` when executing `core.py infer` or `core.py tts` with FAISS retrieval enabled (`index-rate > 0`).
2. **Index Influence:** Keep `--index-rate 0.90` (or `0.85` - `0.95`).
3. **Source Suppression:** Set `--volume-envelope 0.00` and `--protect 0.00` so source speaker prosody and dynamics do not overpower the trained dataset timbre.
4. **Pitch Extraction:** Default to `--f0-method crepe-tiny` and `--embedder-model contentvec`.

---

## Mode 1 — Text-to-Sound (TTS + Voice Conversion)

Use when converting a text script directly into the brand voice.

### Step 1 — Prepare the text script
- Prepare a clear text file or snippet (e.g. `node/script-tts.txt`).
- For Singlish or fast commercial delivery, expand numbers/acronyms (`27g` -> `twenty-seven grams`, `PVL ISO Gold` -> `P-V-L I-S-O Gold`) and use explicit punctuation for natural speech pauses.

### Step 2 — Run Applio TTS + VC
Run from `PRODUCTION/video_modules/Applio`:

```bash
cd PRODUCTION/video_modules/Applio
KMP_DUPLICATE_LIB_OK=TRUE OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 VECLIB_MAXIMUM_THREADS=1 \
  PATH="$PWD/.venv/bin:$PATH" .venv/bin/python core.py tts \
  --tts-file "<path_to_script_txt>" \
  --tts-text "<first_sentence_preview>" \
  --tts-voice "en-SG-WayneNeural" \
  --tts-rate 35 \
  --output-tts-path "<path_to_intermediate_tts_wav>" \
  --output-rvc-path "<path_to_final_brand_voice_wav>" \
  --pth-path "logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m-7epoch-dataset-dominant.pth" \
  --index-path "logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m.index" \
  --pitch 0 \
  --index-rate 0.90 \
  --volume-envelope 0.00 \
  --protect 0.00 \
  --f0-method crepe-tiny \
  --export-format WAV \
  --embedder-model contentvec
```

*Rates:* Use `--tts-rate 0` for standard pace (~125s for 270 words), `--tts-rate 15` for fast natural (~118s), and `--tts-rate 35` for commercial speed (~101s).

---

## Mode 2 — Voice Sync (Converting External Audio/Video Stream)

Use when converting an existing video/audio vocal track into the brand voice while preserving speech timing.

### Step 0 — Extract and Remux Video Audio
For a video source, use the local `ffmpeg` binary to make a mono 40 kHz working audio file before inference:

```bash
FFMPEG_BIN="/Users/test/miniforge3/envs/flowkit/bin/ffmpeg"
"$FFMPEG_BIN" -y -i "<source_video.mp4>" -vn -ac 1 -ar 40000 "<node/source-voice-40k.wav>"
```

After conversion, remux the converted WAV with the original visual stream; do not re-encode video:

```bash
"$FFMPEG_BIN" -y \
  -i "<source_video.mp4>" \
  -i "<final_brand_voice.wav>" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  "<final_brand_voice_video.mp4>"
```

### Step 1 — Measure Source Pitch
Run pitch measurement before conversion:

```bash
cd PRODUCTION/video_modules/Applio
.venv/bin/python -c "
import librosa, numpy as np
audio, sr = librosa.load('<path_to_source_wav_or_mp4>', sr=16000, mono=True)
f0, _, _ = librosa.pyin(audio, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C6'), sr=sr)
voiced = f0[~np.isnan(f0)]
source_median = float(np.median(voiced))
pitch_shift = int(round(12 * np.log2(130.8 / source_median)))
print(f'source_median_hz={source_median:.1f}, target_median_hz=130.8, recommended_pitch={pitch_shift}')
"
```

### Step 2 — Run Conversion
Run from `PRODUCTION/video_modules/Applio`:

```bash
cd PRODUCTION/video_modules/Applio
KMP_DUPLICATE_LIB_OK=TRUE OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 VECLIB_MAXIMUM_THREADS=1 \
  PATH="$PWD/.venv/bin:$PATH" .venv/bin/python core.py infer \
  --input-path "<path_to_source_wav>" \
  --output-path "<path_to_final_brand_voice_wav>" \
  --pth-path "logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m-7epoch-dataset-dominant.pth" \
  --index-path "logs/applio-brand-voice-v2-10m/applio-brand-voice-v2-10m.index" \
  --pitch <measured_pitch_shift> \
  --index-rate 0.90 \
  --volume-envelope 0.00 \
  --protect 0.00 \
  --f0-method crepe-tiny \
  --export-format WAV \
  --embedder-model contentvec
```

---

## Mandatory Verification & Quality Check

Before delivering output:
1. **File Integrity:** Confirm output file exists, is non-empty, and format is valid PCM WAV.
2. **Pitch Alignment Gate:** Output median F0 must land within `120.0 Hz` – `135.0 Hz` (target dataset median: `130.8 Hz`). If F0 > 140 Hz, pitch shift was under-applied; re-run with additional negative semitones.
3. **Sync Gate:** For video sync, the final MP4 duration must remain within `0.05s` of the source, with H.264 video copied and AAC audio present.
4. **Manifest Entry:** Record output details, sha256 checksum, pitch shift, index rate, and review status in `manifest.json`.

---

## Definition of Done

- Rendered audio matches brand voice timbre and pitch requirements (`120 Hz - 135 Hz`).
- Intermediate source audio and final deliverables are placed in appropriate production paths.
- Output has passed technical checks and claim safety review rules in `AGENTS.md`.
