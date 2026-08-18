---
name: "[html-video]-audio-mix"
description: Concatenates per-beat voice mp3s, mixes semantic/explicit SFX per scene, and mixes brand/mood BGM under the narration for the industry-news HTML video pipeline. Third skill in the [html-video]-* sequence, runs after voice synthesis.
---

# [html-video]-audio-mix

Owns the SFX/BGM asset libraries (`scripts/assets/sfx/`, `scripts/assets/bgm/`) and the ffmpeg
mixing mechanics (`scripts/lib/audio-tools.ts`).

## Usage

```bash
npx tsx 03-mix-audio.ts <path/to/script.json>
```

Requires `[html-video]-voice-synthesis` to have already produced `voice/beat-*.mp3` files next to
`script.json`. Concats them (0.3s gap between scenes, 0.15s within a 2-beat scene), picks SFX per
scene (explicit `scene.sfx` override, or semantic keyword match against beat voiceText, or a
template-default fallback — see `scripts/lib/sfx-selector.ts`), picks BGM (brand library first via
`scripts/lib/bgm-selector.ts`'s `pickBrandBgm`, else mood-folder fallback via `pickBgm`, mixed with
sidechain ducking). Writes `voice.mp3` (final mixed) + `voice-raw.mp3` (unmixed, needed by
`[html-video]-subtitle-burn-industry-news`'s timing pass) next to `script.json`. Marks `sfx_bgm_mixed: true` in
`progress.json`. Total duration must land in [45s, 180s] (warns, does not fail, if outside).

## AI-scene post-concat adapter

For `ai-ugc-short-video` and `ai-clone-short-video`, use the audio already carried by the
watermark-clean concatenated MP4 as the voice base. Write `node/audio-spec.json` with ordered
scene timing (`startSec`, `durationSec`), `voiceText`, optional explicit `sfx`, and optional BGM
settings, then run:

```bash
npx tsx 04-mix-ai-scene-audio.ts node/concat_nowm.mp4 node/audio-spec.json node/final-audio.mp4
```

The adapter keeps the video stream, mixes deterministic semantic/explicit SFX, selects brand BGM
first (mood fallback second), ducks BGM under voice, and writes `audio-mix-report.json` beside the
output. Leave BGM disabled unless `Ticket.md` or Part C explicitly requests it.

## Depends on

`[html-video]-script-lock/scripts/lib/script-schema.ts` and `.../progress.ts` — cross-skill
relative import.

## Graph

[[../[html-video]-voice-synthesis/SKILL|voice-synthesis (runs before this)]] ·
[[../[html-video]-subtitle-burn-industry-news/SKILL|subtitle-burn-industry-news (runs after this)]]
