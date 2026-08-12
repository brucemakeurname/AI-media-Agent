---
name: video-editor
description: "Phase 5 Assembly skill. Reads all upstream phase outputs, verifies readiness, concatenates zoomed segments, overlays B-rolls and transparent A-roll/subtitle overlays, places white-flash section transitions, mixes SFX + background music, outputs final MP4."
metadata:
  version: 1.0.0
---

# Video Editor Skill

Phase 5 — final assembly. All creative work is done. This skill is pure execution: verify ingredients, run ffmpeg, deliver output.

---

## Paths

| Resource | Path |
|---|---|
| Cut plan | `{project_path}/segments/cut_plan.json` |
| Zoomed segments | `{project_path}/segments/zoomed/seg_NNN_zoom.mp4` |
| B-roll clips | `{project_path}/broll_renders/br_*.mp4` |
| B-roll manifest | `{project_path}/broll_renders/broll_timestamp.json` |
| B-roll SFX | `{project_path}/broll_renders/broll_sfx_timestamp.json` |
| A-roll overlays | `{project_path}/aroll_renders/ar_*.webm` |
| A-roll manifest | `{project_path}/aroll_renders/aroll_timestamp.json` |
| A-roll SFX | `{project_path}/aroll_renders/aroll_sfx_timestamp.json` |
| Subtitle overlay | `{project_path}/subtitles/subtitle_overlay.webm` |
| Subtitle manifest | `{project_path}/subtitles/subtitle_manifest.json` |
| BGM manifest | `{project_path}/audio/bgm_manifest.json` |
| SFX pool root | `D:\1. SOLOFLOWS\INHOUSE TEAMS\2. Media Team\5. Video Hub\hyperframe-video-gen\assets\sfx\` |
| Output | `{project_path}/output/{project_id}_final.mp4` |

---

## Execution Checklist

- [ ] **Step 1** — Readiness check: verify all files exist and `render_verified: true`
- [ ] **Step 2** — Build assembled timeline: calculate each segment's start time in assembled video
- [ ] **Step 3** — Identify section transition timestamps in assembled timeline
- [ ] **Step 4** — Concatenate zoomed segments → `assembled_main.mp4`
- [ ] **Step 5** — Overlay B-rolls (full-frame) → `assembled_broll.mp4`
- [ ] **Step 6** — Composite transparent overlays (A-roll + subtitle) → `assembled_overlays.mp4`
- [ ] **Step 7** — Apply section transitions (white flash) → `assembled_transitions.mp4`
- [ ] **Step 8** — Mix audio: main + SFX (B-roll + A-roll) + BGM → `output/{project_id}_final.mp4`
- [ ] **Step 9** — Validate output

---

## Step 1: Readiness Check

Read all manifests. For each B-roll entry check `render_verified: true`. Check subtitle and A-roll the same way. Read `bgm_manifest.json` and verify the music file exists.

If anything fails: **halt** and print exactly what is missing and which phase owns it. Do not proceed with partial ingredients.

Also read `subtitle_manifest.json` to note `chromakey_fallback` flag — affects Step 6 composite method.

---

## Step 2: Build Assembled Timeline

The assembled main video is the 65 zoomed segments played consecutively. Each segment's start time in the assembled video is the **cumulative sum of all preceding ffprobe-actual durations**.

```bash
# Get actual duration of each zoomed segment
for i in $(seq -w 0 64); do
  ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 \
    segments/zoomed/seg_${i}_zoom.mp4
done
```

Build `assembled_timeline.json`:
```json
{
  "segments": [
    { "id": 0, "assembled_start": 0.000, "assembled_end": 0.684, "actual_duration": 0.684 },
    { "id": 1, "assembled_start": 0.684, "assembled_end": 1.317, "actual_duration": 0.633 },
    ...
  ],
  "total_duration": 87.512
}
```

**Important:** Always use ffprobe actual durations, not `cut_plan.json` planned durations. Re-encoded segments are 33–61ms longer due to keyframe padding (see Phase 1 SRT drift note).

---

## Step 3: Section Transition Timestamps

The 4 section boundaries (from `analysis.json`) map to these segments in `cut_plan.json`:

| Section | Segment ID | Segment text | Assembled start (from Step 2) |
|---|---|---|---|
| → Number 1 | seg 009 | "Number one," | computed in Step 2 |
| → Number 2 | seg 018 | "Number two," | computed in Step 2 |
| → Number 3 | seg 030 | "Number three," | computed in Step 2 |
| → Number 4 | seg 050 | "number four is the identity." | computed in Step 2 |

Extract `assembled_start` for segments 9, 18, 30, 50 from the timeline built in Step 2. These 4 timestamps are the flash insertion points: `[T1, T2, T3, T4]`.

---

## Step 4: Concatenate Main Video

Build `segments/concat_zoom.txt`:
```
file 'zoomed/seg_000_zoom.mp4'
file 'zoomed/seg_001_zoom.mp4'
...
file 'zoomed/seg_064_zoom.mp4'
```

```bash
ffmpeg -f concat -safe 0 -i segments/concat_zoom.txt \
  -c:v libx264 -crf 18 -preset fast \
  -c:a aac -ar 44100 \
  assembled_main.mp4
```

Verify: ffprobe duration matches `assembled_timeline.total_duration` (±0.3s).

---

## Step 5: Overlay B-rolls (Full Frame)

B-rolls replace the visual entirely at their timestamp. Audio always comes from the main video.

```bash
ffmpeg -i assembled_main.mp4 \
  -i broll_renders/br_00.mp4 \
  -i broll_renders/br_01.mp4 \
  ... \
  -filter_complex "
    [1:v]scale=1080:1920,setsar=1[br0];
    [2:v]scale=1080:1920,setsar=1[br1];
    ...
    [0:v][br0]overlay=0:0:enable='between(t,{br00.start},{br00.end})'[v0];
    [v0][br1]overlay=0:0:enable='between(t,{br01.start},{br01.end})'[v1];
    ...
    [vN-1][brN]overlay=0:0:enable='between(t,{brNN.start},{brNN.end})'[vfinal]
  " \
  -map "[vfinal]" -map 0:a \
  -c:v libx264 -crf 18 -preset fast -c:a copy \
  assembled_broll.mp4
```

`broll.start` and `broll.end` are taken directly from `broll_timestamp.json` — these timestamps are already in the assembled video timeline (they came from `cut_plan.json` which is the assembled timeline).

---

## Step 6: Composite Transparent Overlays

Apply A-roll overlays and subtitle overlay. Use WebM alpha composite (preferred) or chromakey fallback.

### A-roll overlays

Check `aroll_timestamp.json` — each cluster has `"chromakey_fallback": true/false`.

**Alpha path (chromakey_fallback: false):**
```bash
ffmpeg -i assembled_broll.mp4 \
  -i aroll_renders/ar_00.webm \
  -i aroll_renders/ar_01.webm \
  ... \
  -filter_complex "
    [0:v][1:v]overlay=0:0:enable='between(t,{ar00.start},{ar00.end})'[v0];
    [v0][2:v]overlay=0:0:enable='between(t,{ar01.start},{ar01.end})'[v1];
    ...
  " \
  -map "[vN]" -map 0:a -c:v libx264 -crf 18 -c:a copy \
  assembled_aroll.mp4
```

**Chromakey fallback path (chromakey_fallback: true):**
```bash
# Add chromakey filter before overlay
[1:v]chromakey=0x00FF00:0.1:0.0[ar0_ck];
[0:v][ar0_ck]overlay=0:0:enable='between(t,{ar00.start},{ar00.end})'[v0];
```

### Subtitle overlay (full duration)

Check `subtitle_manifest.json` for `chromakey_fallback`.

**Alpha path:**
```bash
ffmpeg -i assembled_aroll.mp4 \
  -i subtitles/subtitle_overlay.webm \
  -filter_complex "[0:v][1:v]overlay=0:0[vout]" \
  -map "[vout]" -map 0:a -c:v libx264 -crf 18 -c:a copy \
  assembled_subtitles.mp4
```

**Chromakey fallback:**
```bash
-filter_complex "
  [1:v]chromakey=0x00FF00:0.1:0.0[sub_ck];
  [0:v][sub_ck]overlay=0:0[vout]
"
```

---

## Step 7: Section Transitions (White Flash)

Apply a 0.1s white flash at each of the 4 section boundary timestamps `[T1, T2, T3, T4]` from Step 3.

```bash
ffmpeg -i assembled_subtitles.mp4 \
  -f lavfi -i "color=c=white:s=1080x1920:rate=30" \
  -filter_complex "
    [1:v]
      fade=t=in:st=0:d=0.05:alpha=1,
      fade=t=out:st=0.05:d=0.05:alpha=1
    [flash];
    [0:v]
      [flash]overlay=0:0:enable='between(t,{T1},{T1}+0.10)',
      [flash]overlay=0:0:enable='between(t,{T2},{T2}+0.10)',
      [flash]overlay=0:0:enable='between(t,{T3},{T3}+0.10)',
      [flash]overlay=0:0:enable='between(t,{T4},{T4}+0.10)'
    [vout]
  " \
  -map "[vout]" -map 0:a -c:v libx264 -crf 18 -c:a copy \
  assembled_transitions.mp4
```

**Note:** The flash filter chain must be written as a proper ffmpeg filter_complex — the shorthand above is pseudocode. In practice, build each flash as a separate labeled pad:

```
[1:v]fade=t=in:st=0:d=0.05,fade=t=out:st=0.05:d=0.05[f];
[0:v][f]overlay=0:0:enable='between(t,T1,T1+0.1)'[v1];
[v1][f]overlay=0:0:enable='between(t,T2,T2+0.1)'[v2];
[v2][f]overlay=0:0:enable='between(t,T3,T3+0.1)'[v3];
[v3][f]overlay=0:0:enable='between(t,T4,T4+0.1)'[v4]
```

---

## Step 8: Audio Mix

Combine: main audio + B-roll SFX + A-roll SFX + background music.

### Build SFX list

From `broll_sfx_timestamp.json`: each sfx entry has `offset_sec` relative to its B-roll's `start`. Convert to absolute assembled time:
```
absolute_offset = broll.start + sfx.offset_sec
delay_ms = round(absolute_offset * 1000)
```

From `aroll_sfx_timestamp.json`: same conversion using `cluster.start + sfx.offset_sec`.

### Read BGM manifest

```json
{
  "file": "audio/bgm.mp3",
  "volume": 0.12,
  "fade_in_sec": 1.5,
  "fade_out_sec": 2.0
}
```

### ffmpeg audio mix

```bash
ffmpeg -i assembled_transitions.mp4 \
  -i {sfx_pool}/transition/swoosh.mp3 \
  -i {sfx_pool}/emphasis/pop.mp3 \
  ... \
  -stream_loop -1 -i audio/bgm.mp3 \
  -filter_complex "
    [0:a]volume=1.0[main];

    [1:a]adelay={delay1_ms}|{delay1_ms},volume={vol1}[s1];
    [2:a]adelay={delay2_ms}|{delay2_ms},volume={vol2}[s2];
    ...

    [last_sfx_input:a]
      atrim=end={total_duration},
      afade=t=in:st=0:d={fade_in},
      afade=t=out:st={total_duration - fade_out}:d={fade_out},
      volume={bgm_volume}
    [music];

    [main][s1][s2]...[music]
      amix=inputs={total_inputs}:normalize=0:duration=first
    [aout]
  " \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -ar 44100 -b:a 192k \
  output/{project_id}_final.mp4
```

**Volume levels:**
- Main audio: 1.0
- B-roll SFX: as specified in `broll_sfx_timestamp.json` (0.38–0.42 entry, 0.20–0.25 accent)
- A-roll SFX: as specified in `aroll_sfx_timestamp.json` (0.20–0.30, lower than B-roll)
- BGM: from `bgm_manifest.json` (typically 0.10–0.15)

---

## Step 9: Validate Output

```bash
ffprobe -v error \
  -show_entries format=duration,size \
  -show_entries stream=codec_name,codec_type \
  -of default=noprint_wrappers=1 \
  output/{project_id}_final.mp4
```

**Pass criteria:**
- `codec_name=h264` (video) + `codec_name=aac` (audio)
- `duration` within ±1.0s of `assembled_timeline.total_duration`
- `size` > 5MB

On failure: diagnose from intermediate files. Check which step produced the bad output by ffprobing each intermediate (`assembled_main.mp4`, `assembled_broll.mp4`, etc.).

---

## Intermediate Files

```
{project_path}/
├── assembled_main.mp4          ← Step 4: 65 zoomed segments concatenated
├── assembled_broll.mp4         ← Step 5: B-rolls overlaid
├── assembled_aroll.mp4         ← Step 6a: A-roll overlays composited
├── assembled_subtitles.mp4     ← Step 6b: subtitle overlay composited
├── assembled_transitions.mp4   ← Step 7: section flash transitions added
├── assembled_timeline.json     ← Step 2: per-segment assembled timestamps
└── output/
    └── {project_id}_final.mp4  ← Step 8: final with audio mix
```

Intermediate files may be deleted after successful validation to save disk space.

---

## Error Recovery

| Error | Diagnosis |
|---|---|
| `assembled_main.mp4` wrong duration | ffprobe each zoomed segment — find the outlier |
| B-roll overlay misaligned | Verify `broll.start` against `assembled_timeline` — B-roll timestamps may reference cut_plan time, not actual assembled time if segments have duration drift |
| Transparent overlay not compositing | Check if file is actually WebM with alpha (`ffprobe -show_streams`) — may need to re-render with `--transparent` |
| Audio desync | Rebuild `delay_ms` values from scratch using actual assembled timeline, not planned durations |
| Chromakey leaving green fringe | Adjust similarity: `chromakey=0x00FF00:0.15:0.05` |

---

## Graph

**Workflow:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW|WORKFLOW]]
**Agent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/video-editor|Video Editor]]
**Upstream skills:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/skills/motion-video-designer|motion-video-designer]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/skills/design-motion-overlay|design-motion-overlay]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/skills/subtitle-designer|subtitle-designer]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/.claude/agents/sfx-artist|sfx-artist]]
