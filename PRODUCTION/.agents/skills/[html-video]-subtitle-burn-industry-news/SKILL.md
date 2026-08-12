---
name: "[html-video]-subtitle-burn-industry-news"
description: Transcribes the mixed voice audio with faster-whisper (native word-level Vietnamese timestamps) and burns 3-4-word-burst styled ASS subtitles (6 selectable presets, active-word highlight) onto the rendered video via ffmpeg, for the industry-news HTML video pipeline. Runs after HyperFrames render, before thumbnail.
---

# [html-video]-subtitle-burn-industry-news

Bundles `whisperx_transcribe.py` (system Python, `PYTHON_BIN` env override — uses `faster-whisper`'s
native word timestamps, not whisperx's separate wav2vec2 aligner; see `BUG-011` in
`talking-head-editing/docs/debug/bug-codebook/` for why) and the ffmpeg ASS-burn mechanics
(`scripts/lib/subtitle-burner.ts`) — independent of the VoxCPM voice-cloning venv used by
`[html-video]-voice-synthesis`.

Captions display 3-4 words at a time (gap/max-word grouped), positioned at 1/3 of the frame height
up from the bottom edge, with one word highlighted per the active `style` (see
`scripts/lib/caption-styles.json` — 6 presets ported from `nicolaigaina/ai-video-captions`:
`hormozi | mrbeast | karaoke | minimal | bounce | classic`, default `hormozi`). Sibling skill
`[html-video]-subtitle-burn-talking-head` shares the same transcription engine and style presets but
shows one word at a time, positioned higher (3/7 from bottom) for footage with a human subject.

## Usage

```bash
npx tsx 04-burn-subtitles.ts <path/to/script.json>
```

Requires a rendered `renders/video-raw.mp4` (from `hyperframes render`, driven by the video-editor
role — not a `[html-video]-*` skill) and `voice-raw.mp3` (from `[html-video]-audio-mix`) to exist
next to `script.json`. Transcribes `voice-raw.mp3` → word-level JSON → ASS subtitle file → burns
onto `video-raw.mp4` → `renders/video.mp4`. Falls back to copying the raw render (with a warning) if
transcription is unavailable — `video.mp4` always exists either way. Marks `subtitles_burned: true`
in `progress.json` regardless of which path ran.

## Depends on

`[html-video]-script-lock/scripts/lib/progress.ts` — cross-skill relative import (progress marking
only; does not need the script schema).

## Graph

[[../[html-video]-audio-mix/SKILL|audio-mix (produces voice-raw.mp3 this skill needs)]] ·
[[../[html-video]-thumbnail-signal/SKILL|thumbnail-signal (runs after this)]] ·
[[../[html-video]-subtitle-burn-talking-head/SKILL|subtitle-burn-talking-head (sibling — same engine/styles, 1-word grouping + higher position)]]
