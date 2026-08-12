---
name: "[html-video]-subtitle-burn-talking-head"
description: Transcribes voice audio with faster-whisper (word-level Vietnamese timestamps) and burns ONE-WORD-AT-A-TIME styled ASS subtitles onto a talking-head video via ffmpeg. Sibling of [html-video]-subtitle-burn-industry-news — same 6 caption styles and transcription engine, different grouping (1 word vs 3-4) and vertical position tuned for a human subject in frame.
---

# [html-video]-subtitle-burn-talking-head

Forked from `[html-video]-subtitle-burn-industry-news` — same faster-whisper transcription
engine (`scripts/whisperx_transcribe.py`, fixed 2026-08-10 to use native word timestamps instead of
whisperx's wav2vec2 forced-aligner, see `BUG-011` in `talking-head-editing/docs/debug/bug-codebook/`)
and the same 6-style caption system (`scripts/lib/caption-styles.json`, ported from
`nicolaigaina/ai-video-captions`), but tuned for footage with a human subject:

| | This skill (talking-head) | `[html-video]-subtitle-burn-industry-news` |
|---|---|---|
| Words shown at once | 1 | 3-4 (gap/max-word grouped) |
| Vertical position | 3/7 of frame height up from the bottom edge | 1/3 of frame height up from the bottom edge |
| Typical use | talking-head / interview footage with a person in frame | graphic/typography news-style video, no human subject |

Position rationale: a single active word sits higher (closer to center, 3/7≈43% up from bottom) to
stay clear of any lower-third graphic overlay in `talking-head-editing`'s Phase 5 assembly, while
still being below the subject's face. The industry-news variant sits lower (1/3≈33% up from bottom,
closer to the frame edge) since that pipeline's own graphic elements (headline banners, etc.) occupy
the upper/middle frame.

## Usage

```bash
npx tsx 04-burn-subtitles.ts <video.mp4> <audio.mp3> <output.mp4> [style]
```

`style` is one of `hormozi | mrbeast | karaoke | minimal | bounce | classic` (default `hormozi`).
Standalone CLI — no cross-skill `progress.json` dependency (unlike the industry-news variant, which
integrates with `[html-video]-script-lock`'s progress tracking). Falls back to copying the raw video
(with a warning) if transcription or ffmpeg fail — the output path always exists either way.

## Graph

[[../[html-video]-subtitle-burn-industry-news/SKILL|[html-video]-subtitle-burn-industry-news (sibling, source of the shared caption-styles.json + transcription fix)]] ·
[[../../../VIDEO_MODULES/talking-head-editing/CLAUDE|talking-head-editing (intended caller — Phase 5 assembly)]] ·
[[../../../VIDEO_MODULES/talking-head-editing/docs/debug/bug-codebook/BUG-011-whisperx-align-timestamp-collapse|BUG-011 (the whisperx timestamp fix this skill inherits)]]
