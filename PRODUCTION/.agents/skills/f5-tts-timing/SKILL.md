---
name: f5-tts-timing
description: Generate local F5-TTS WAVs per approved dialogue line and write a timing-lock.json before sequence planning.
---

# f5-tts-timing

Use the locally installed F5-TTS model as the timing authority for dialogue-bearing video.
This is a pre-production timing lock: it measures real line durations before the script is
split into 4/6/8/10-second video sequences.

## Usage

```bash
source PRODUCTION/video_modules/runtime.sh
"$F5_TTS_PYTHON" \
  PRODUCTION/.agents/skills/f5-tts-timing/scripts/f5_tts_timing.py \
  node/timing/lines.json node/timing \
  --ref-audio "BASE/BRAND KITs/UltimateSup/voice/voice_1_male_10_mins.WAV" \
  --ref-text-file "BASE/BRAND KITs/UltimateSup/voice/transcript_voice_1_male.srt"
```

`lines.json` is an ordered array of strings or `{ "id": "line_1", "text": "..." }`
objects. The helper writes one `line_*.wav` per line and `timing-lock.json` with exact
`duration_sec`, cumulative `in_sec`/`out_sec`, reference paths, model, and device.

The helper imports the local `f5_tts.api.F5TTS`; it does not call Google/Vertex TTS. Keep the same
reference audio, reference transcript, model, and device for one ticket.

## Contract

- Run before `write-shooting-script` assigns sequences.
- Never derive duration from character count or an LLM estimate when dialogue exists.
- Keep approved `text` unchanged in the lock; only the generated WAV is used for measurement.
- If F5-TTS fails, stop and record the exact error; do not silently fall back to Google TTS.
- Generated WAV duration uses `soundfile`; non-WAV duration probing uses `FFPROBE_BIN` when available.
