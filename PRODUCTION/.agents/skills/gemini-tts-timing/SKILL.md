---
name: gemini-tts-timing
description: Generate Google Gemini TTS audio per approved dialogue line and write a timing-lock.json before sequence planning.
---

# gemini-tts-timing

Use Google Gemini TTS (`gemini-2.5-flash-preview-tts`) as the timing authority for dialogue-bearing video.
This is a pre-production timing lock: it measures real line durations before the script is
split into 4/6/8/10-second video sequences.

## Usage

```bash
python3 scripts/gemini_tts_timing.py \
  node/timing/lines.json node/timing \
  --model "gemini-2.5-flash-preview-tts" \
  --voice "Puck"
```

`lines.json` is an ordered array of strings or `{ "id": "line_01", "text": "..." }`
objects. The helper writes one `line_*.wav` per line and `timing-lock.json` with exact
`duration_sec`, cumulative `in_sec`/`out_sec`, model, and voice.

The script loads `GEMINI_API_KEY` from environment or `env.local`.

## Contract

- Run before `write-shooting-script` assigns sequences.
- Never derive duration from character count or an LLM estimate when dialogue exists.
- Keep approved `text` unchanged in the lock; only the generated WAV is used for measurement.
