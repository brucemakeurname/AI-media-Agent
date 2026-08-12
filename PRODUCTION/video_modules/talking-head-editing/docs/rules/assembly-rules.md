# assembly-rules — Phase 5 Assembly Logic

> Four critical rules governing final assembly. Every one of these was learned the hard way during the proj_teleprompter_01 build. Violating any of them silently produces visually broken output.

---

## Layer Stack

```
Base:    aroll_renders/aroll_footage.mp4     ← Phase 3 output (base_zoomed + A-roll overlays baked)
Layer 1: B-rolls — full-frame overlay at concat_exact timestamps
Layer 2: Subtitles — word-pop serif overlay (built in Phase 5)
Audio:   original audio + SFX mix + background music
```

Final output: `output/{project_id}_final.mp4` (H.264 + AAC, target ±2s of expected duration).

---

## Rule 1 — Always use `-itsoffset` per B-roll input

**Never rely on `enable='between(t,...)'` alone for B-roll placement.**

**Problem:** FFmpeg consumes ALL input streams in parallel from t=0, regardless of any `enable` expression. By the time `enable` fires for a B-roll that starts at t=40s, the 5s clip has already been fully consumed — only its last (black) frame remains, appearing as a static image.

**Wrong:**
```bash
ffmpeg -i assembled.mp4 \
  -i broll_renders/br_05.mp4 \
  -filter_complex "[1:v]scale=1080:1920[br5]; [0:v][br5]overlay=0:0:enable='between(t,40.807,46.213)'" \
  ...
```
After ~5 seconds, br_05 is exhausted. From t=5s onward it shows only the last frame. When enable fires at t=40.807s, that frozen last frame is what's overlaid.

**Correct — `-itsoffset` delays stream read to B-roll's actual start time:**
```bash
ffmpeg -i assembled.mp4 \
  -itsoffset 40.807 -i broll_renders/br_05_trim.mp4 \
  -filter_complex "[1:v]scale=1080:1920[br5]; [0:v][br5]overlay=0:0:enable='between(t,40.807,46.213)':eof_action=pass" \
  ...
```

`-itsoffset` shifts the input timeline so frame 0 of br_05 maps to t=40.807s. The B-roll plays its full length starting exactly when needed.

**Always add `:eof_action=pass`** on every overlay so when the B-roll finishes, the filter passes through to the next layer rather than blocking.

---

## Rule 2 — Pre-trim B-rolls to exact slot duration

**Problem:** A B-roll's `render_duration` may exceed its `slot_duration` in the concat timeline (e.g., br_NN renders 5.267s but its slot is only 5.072s). The overflow bleeds into the next cut, covering A-roll talking-head content that should be visible.

**Fix — pre-trim each B-roll before the overlay pass:**
```bash
ffmpeg -y -i broll_renders/br_NN.mp4 \
  -t {clip_trim} \
  -c:v libx264 -crf 18 -an \
  broll_renders/br_NN_trim.mp4
```

`clip_trim = min(render_duration, slot_duration_in_concat)` — always the smaller of the two.

Use `br_NN_trim.mp4` (NOT the original `br_NN.mp4`) in the overlay command. If `render_duration ≤ slot_duration`, trimming is unnecessary — use the original.

**Decision table:**
| Condition | Action |
|---|---|
| `render_duration > slot_duration` | Pre-trim → use `_trim.mp4` |
| `render_duration ≤ slot_duration` | Use original `br_NN.mp4` |

---

## Rule 3 — A-roll overlays use `setpts=PTS+offset/TB`, NEVER `-itsoffset + setpts=PTS-STARTPTS`

**This rule is specific to A-roll MOV overlays (Phase 3 output composited in Phase 5).**

**Problem:** `-itsoffset N -i overlay.mov` combined with a `setpts=PTS-STARTPTS` in the filter graph cancels each other — STARTPTS becomes the offset, then subtracting STARTPTS resets all frames back to t=0. All overlays appear at t=0 simultaneously and overlap.

**Wrong:**
```bash
ffmpeg -i base.mp4 \
  -itsoffset 4.103 -i ar_00.mov \
  -filter_complex "[1:v]setpts=PTS-STARTPTS[ov0]; [0:v][ov0]overlay=0:0[v0]"
```

**Correct — `setpts=PTS+{offset}/TB` directly in filter:**
```bash
ffmpeg -i base.mp4 \
  -i ar_00.mov \
  -filter_complex "
    [1:v]setpts=PTS+4.103/TB[ov0];
    [0:v][ov0]overlay=0:0:eof_action=pass[v0]
  "
```

**Two parts to this rule:**
1. `setpts=PTS+{offset}/TB` — delays the overlay's PTS to the correct timeline position. Never combine with `-itsoffset` on the same input.
2. `eof_action=pass` — when the MOV overlay ends, the filter passes through the base. Without it, the last frame of the overlay is held indefinitely, causing the glass card content to ghost over subsequent footage.

**Why different from B-roll (Rule 1):**
B-roll uses `-itsoffset` + raw `overlay` (no `setpts` filter) — that combination works because no PTS subtraction undoes the offset. A-roll filters add `setpts=PTS+offset/TB` instead of `-itsoffset` because the filter chain logic differs (and avoiding the dual-mechanism cancellation).

---

## Rule 4 — ffprobe + scale correction for concat timestamps

**Never use `cut_plan.json` nominal durations for downstream concat timestamps. Always measure with `ffprobe`.**

**Two layers of drift accumulate:**

### Layer A — Keyframe boundary padding per segment

Each re-encoded `_zoom.mp4` segment is consistently 33–61ms longer than `cut_plan.json` planned, because FFmpeg pads to the next keyframe boundary at 30fps (~0.033s/segment). Over many segments this accumulates to multi-second drift.

**Fix — ffprobe every zoomed segment:**
```js
const actualDur = parseFloat(
  execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "${zoomFile}"`).toString().trim()
);
```
Sum these actuals to get accurate concat positions.

### Layer B — Re-encode overhead at concat joins

When N segments are re-encoded via `ffmpeg -f concat ... -c:v libx264`, the encoder adds ~1–2 extra frames per segment join (B-frame flushing). This inflates the output BEYOND the sum of individual segment durations.

**Fix — measure scale factor:**
```
scale = actual_demo_aroll_duration / sum_of_ffprobed_segment_durations
```

Apply scale uniformly to all B-roll concat-position timestamps:
```
itsoffset_N = concat_start_N × scale
```

**Both layers required.** Skipping either layer causes B-rolls to land early in the final third of the video.

**Implementation:** `scripts/compute-exact-timestamps.js` automates both layers — ffprobes all segments, computes positions, applies scale correction, writes `broll_renders/broll_concat_exact.json`.

**Scale factor is PROJECT-SPECIFIC.** Measure fresh per project. Do NOT hardcode any project's scale value.

---

## Subtitle Build (Phase 4 work, executed in Phase 5)

Word-pop serif overlay built from `whisperx_word_transcript.json`. One `clip` per word.

| Property | Value |
|---|---|
| Position (horizontal) | Centered (`left: 50%; transform: translateX(-50%)`) |
| Position (vertical) | Center + 200px down → `top: 1160px` (for 1080×1920) |
| Font | Playfair Display, italic, 72px |
| Color | `rgba(255,255,255,0.92)` |
| Stroke | `-webkit-text-stroke: 0.5px rgba(0,0,0,0.6)` |
| Text shadow | `0 1px 8px rgba(0,0,0,0.70)` |
| Container | `text-align: center`, no background pill |
| Timing | Per-word from `whisperx_word_transcript.json` |
| Effect | Per word: fade in 0.06s + fade out 0.05s — NO line groups |

**Key behavior — one word at a time:**
Each word is an independent clip. It appears exactly when spoken and disappears when the next word starts. No two words visible simultaneously. Like lyric cards.

**Word gap handling:**
- Gap < 0.25s between consecutive words → no pad
- Gap ≥ 0.25s within a sentence → add 0.08s pad to current word's `data-duration` (avoid flash of empty screen mid-sentence)
- Gap ≥ 0.45s between sentences → leave screen empty (natural breath)

Render: `npm run render -- --format mov` → `subtitles/subtitle_overlay.mov` (ProRes 4444, `yuva444p12le`).

Composite via overlay with `eof_action=pass` onto `assembled_broll.mp4` → `assembled_sub.mp4`.

---

## SFX + Music Mix (final step)

**Inputs:**
- `broll_renders/broll_sfx_timestamp.json`
- `aroll_renders/aroll_sfx_timestamp.json`
- (optional) `audio/background_music.mp3`

**FFmpeg pattern:**
```bash
ffmpeg -y -i output/assembled_sub.mp4 \
  -i sfx_1.mp3 -i sfx_2.mp3 ... \
  -stream_loop -1 -i music/bg.mp3 \
  -filter_complex "
    [0:a]volume=0.85[main];
    [1:a]adelay={ms}|{ms},volume={vol}[s0];
    ...
    [music_in:a]atrim=end={duration},
                afade=t=in:st=0:d=1.5,
                afade=t=out:st={dur-1.5}:d=1.5,
                volume=0.12[music];
    [main][s0]...[sN][music]amix=inputs={N+2}:normalize=0:duration=first[aout]
  " \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -ar 44100 \
  output/{project_id}_final.mp4
```

**Volume rules:**
- Main audio: 0.85
- B-roll entry SFX (swoosh/pop): 0.35–0.40
- A-roll cluster entry SFX (pop/tick): 0.20–0.28
- Background music: 0.10–0.12 (atmospheric only)

---

## Output Validation

1. `output/{project_id}_final.mp4` exists
2. `ffprobe` confirms H.264 + AAC, duration > 5s, within ±2s of expected
3. File size > 1MB
4. `output/thumbnail-needed.json` written

Update `manifest.json`: `edit_status: "complete"` + per-phase completion timestamps + metrics.

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[rough-cut-rules|rough-cut-rules]] · [[segment-rules|segment-rules]] · [[zoom-rules|zoom-rules]] · [[broll-selection-rules|broll-selection-rules]] · [[aroll-overlay-rules|aroll-overlay-rules]]
**Bug refs:** BUG-005 (setpts/itsoffset cancellation) · BUG-007 (B-roll consume from t=0) · BUG-008 (B-roll overflow) · BUG-004 (scale correction)
