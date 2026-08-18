---
name: "[html-video]-subtitle-burn-talking-head"
description: Transcribes voice audio with faster-whisper word timestamps and burns Vietnamese multi-word ASS subtitles via ffmpeg, with approved-text correction, tokenizer-aware grouping, a hard five-token cap, and lower-quarter placement.
---

# [html-video]-subtitle-burn-talking-head

Uses the same native faster-whisper word timestamp engine and caption presets, but tuned for
Vietnamese social video:

The local model pack lives in `PRODUCTION/video_modules/WhisperX/models`. The production caller
uses the Python API with `WHISPER_LOCAL_FILES_ONLY=1`; the WhisperX CLI is not required.

| | This skill (talking-head) | `[html-video]-subtitle-burn-industry-news` |
|---|---|---|
| Words shown at once | 1–5 visible tokens, tokenizer-aware | 3-4 (gap/max-word grouped) |
| Vertical position | `SUB_Y_RATIO=0.75` — lower quarter from top | 1/3 of frame height up from bottom |
| Typical use | talking-head / drama-cartoon / AI scene video | graphic/typography news-style video |

Position rationale: `SUB_Y_RATIO=0.75` places the one-line burst in the lower quarter from the top,
leaving the face and upper action clear while keeping the caption inside the portrait safe area.

## Usage

```bash
npx tsx 04-burn-subtitles.ts <video.mp4> <audio.mp3> <output.mp4> [style]
```

`style` is one of `hormozi | mrbeast | karaoke | minimal | bounce | classic` (default `hormozi`).
Set `SEGMENT_MODE=smart MAX_TOKENS=5 SUB_Y_RATIO=0.75` for Vietnamese. Set
`APPROVED_TEXT_PATH=node/timing/approved-voice.txt` after concat to replace ASR spelling with the
approved script while preserving WhisperX timestamps; a token-count mismatch stops the burn for
human review rather than inventing timings.

## Graph

[[../[html-video]-subtitle-burn-industry-news/SKILL|[html-video]-subtitle-burn-industry-news (sibling, source of the shared caption-styles.json + transcription fix)]] ·
[[../../../VIDEO_MODULES/talking-head-editing/CLAUDE|talking-head-editing (intended caller — Phase 5 assembly)]] ·
[[../../../VIDEO_MODULES/talking-head-editing/docs/debug/bug-codebook/BUG-011-whisperx-align-timestamp-collapse|BUG-011 (the whisperx timestamp fix this skill inherits)]]
