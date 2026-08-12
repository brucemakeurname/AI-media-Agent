---
name: rough-cut-video
description: "Universal Phase 0 — produce a clean continuous video from a raw recording by removing stumbles, false starts, repeats, and long silences. Apply pacing (gap reduction + speed factor). Output: main_clean.mp4 + word-level WhisperX transcripts. Works for talking-head, vlog, podcast clip, or any single-speaker recording. Invoked directly or as sub-skill by edit-talking-head-video. Owner agent: video-editor."
metadata:
  version: 1.0.0
  phase: 0
  owner_agent: video-editor
  universal: true
---

# rough-cut-video — Phase 0 Universal Skill

Standard rough-cut procedure. Reusable for any video genre that requires removing bad takes and producing a word-aligned transcript.

## Invocation

```
/rough-cut-video {project_path}
```

`{project_path}` is the absolute path to a project folder containing:
- `footage/{source}.mp4` (the raw recording)
- `brief.json` (project metadata)
- `manifest.json` with `edit_status: "pending"`

## Logic Reference

This skill is a thin orchestrator. All decision rules live in:
- `talking-head-editing/docs/rules/rough-cut-rules.md` (must be read at session start)

Read that file FIRST. It contains the 10 hard rules (cut-the-words, identical-word preservation, Gemini calibration, gap-50pct, source-is-original, speed-applied-once, silence buffers, retranscribe-after-cut, include-region inversion, quality gate).

---

## Inputs

```
{project_path}/
├── footage/{source}.mp4           ← raw recording (required)
├── brief.json                     ← project metadata (required)
├── manifest.json                  ← { "edit_status": "pending" }
└── analysis.json (optional)       ← if operator pre-marked exclude_regions
```

## Outputs

```
{project_path}/
├── footage/
│   ├── main_clean_raw.mp4         ← concat before speed-up (intermediate)
│   ├── main_clean.mp4             ← FINAL Phase 0 output (speed-adjusted)
│   ├── rough/                     ← part_NNN.mp4 include slices + concat.txt
│   └── whisperx_word_check.mp4    ← verification (optional)
├── logs/
│   ├── analysis.json              ← master config, all decisions
│   ├── gemini_analysis.json       ← Gemini 2.5 Flash raw output
│   ├── transcript.json            ← WhisperX on raw source
│   ├── rough_cut.log              ← cut log
│   ├── whisperx_clean/main_clean.json ← WhisperX on cleaned video
│   ├── whisperx_word_transcript.json  ← Phase 1 input
│   └── sentence_transcript.json       ← Phase 1 input
└── manifest.json                  ← phase_0: { completed_at, removed_pct, exclude_regions_count }
```

## Pipeline Steps

### Step 1 — WhisperX on raw source

```bash
whisperx footage/{source}.mp4 --model large-v2 --language {brief.language} \
  --output_format json --output_dir logs/ --compute_type int8
mv logs/{source}.json logs/transcript.json
```

Verify: `logs/transcript.json` exists with `words` array, each having `start`, `end`, `score`.

### Step 2 — Gemini 2.5 Flash audio analysis

Extract audio for Gemini:
```bash
ffmpeg -y -i footage/{source}.mp4 -vn -ar 16000 -ac 1 logs/source_audio.mp3
```

Submit to Gemini 2.5 Flash via Vertex AI with prompt asking for `false_start`, `stumble`, `repeat` detection. Save raw output → `logs/gemini_analysis.json`.

### Step 3 — Calibrate Gemini timestamps (CRITICAL — see BUG-001)

Gemini uses non-linear compressed time. Build 3+ anchor pairs by matching Gemini-reported events to WhisperX word boundaries:
- `(g_time, actual_time)` at start, middle, end of recording

Implement `scale_gemini(g) → actual` as piecewise linear interpolation between anchors.

**Do NOT use Gemini timestamps directly.** Refer to BUG-001 if unsure.

### Step 4 — Build exclude_regions in analysis.json

Run `scripts/combine_analysis.py` which:
1. Maps each Gemini detection through `scale_gemini()` → real audio time
2. Snaps to nearest WhisperX inter-word gap via `nearest_gap_before()`
3. Applies BUG-002 rule: if false-start word == clean-restart word, cut to gap midpoint (not gap end)
4. Applies gap-50pct rule: any inter-sentence silence ≥ 0.6s → cut first 50% as `gap_50pct`
5. Writes complete `exclude_regions` array into `logs/analysis.json`

Output:
```json
{
  "exclude_regions": [
    { "from": 0.000, "to": 2.900, "reason": "false_start" },
    { "from": 8.453, "to": 8.763, "reason": "gap_50pct" },
    ...
  ],
  "pacing": { "gap_reduction": 0.5, "speed_factor": 1.2 },
  "calibration_anchors": [[0,0], [3.55,13.24], [22.30,98.06]]
}
```

### Step 5 — Invert to include_regions

```
sort exclude_regions by .from
include[0] = (0, exclude[0].from)
include[i] = (exclude[i-1].to, exclude[i].from)
include[N] = (exclude[N-1].to, source_duration)
```
Drop any include region < 0.2s.

### Step 6 — Quality gate

```
removed_pct = sum(exclude.duration) / source_duration
if removed_pct > 0.40:
  halt + flag for operator review
```

### Step 7 — Extract include parts

For each include region:
```bash
ffmpeg -y -ss {start} -to {end} -i footage/{source}.mp4 \
  -c:v libx264 -crf 18 -c:a aac \
  footage/rough/part_{n:03d}.mp4
```

### Step 8 — Concat parts

Write `footage/rough/concat.txt`:
```
file 'part_000.mp4'
file 'part_001.mp4'
...
```

```bash
ffmpeg -y -f concat -safe 0 -i footage/rough/concat.txt \
  -c copy footage/main_clean_raw.mp4
```

### Step 9 — Apply speed factor (LAST step)

```bash
ffmpeg -y -i footage/main_clean_raw.mp4 \
  -filter_complex "[0:v]setpts=PTS/{speed}[v];[0:a]atempo={speed}[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -crf 18 -preset fast -c:a aac -ar 44100 \
  footage/main_clean.mp4
```

Default `speed = 1.2`. Adjustable per brief.

### Step 10 — Re-transcribe on cleaned video

```bash
whisperx footage/main_clean.mp4 --model large-v2 --language {brief.language} \
  --output_format json --output_dir logs/whisperx_clean/ --compute_type int8
```

### Step 11 — Build word + sentence transcripts

Run `scripts/build-transcripts.js`:
- Read `logs/whisperx_clean/main_clean.json`
- Write `logs/whisperx_word_transcript.json` — array of `{word, start, end, score}`
- Write `logs/sentence_transcript.json` — array of `{id, text, start, end, duration, word_count, words}`

### Step 12 — Verification (optional but recommended)

Burn word subtitles onto cleaned video:
```bash
node scripts/burn-whisperx-check.js
```
Produces `footage/whisperx_word_check.mp4`. Operator reviews to confirm timestamp alignment.

### Step 13 — Update manifest + log

```json
manifest.phase_0 = {
  "completed_at": "{ISO}",
  "source_duration_sec": N,
  "exclude_regions_count": N,
  "removed_pct": 0.0,
  "final_duration_sec": N,
  "speed_factor": 1.2
}
```

Append to `logs/rough_cut.log`:
```
Total source duration:    {N}s
Total excluded duration:  {N}s ({pct}%)
Total included duration:  {N}s
Speed factor applied:     {N}×
Final duration:           {N}s
```

---

## Error Protocol — NO SELF-FIX

If ANY step produces a non-zero exit, missing output, or schema validation fail:

1. STOP. Do NOT retry or modify the command.
2. Append to `logs/edit_errors.log` with full context.
3. Write `logs/error_report.json`:
   ```json
   {
     "project_id": "{brief.project_id}",
     "phase": "rough-cut",
     "stage": "{step_name}",
     "command": "{full command}",
     "stderr": "{stderr}",
     "exit_code": N,
     "expected_output": "{path}",
     "actual_output_present": false,
     "attempted_at": "{ISO}"
   }
   ```
4. Invoke debug agent:
   ```
   Agent(subagent_type="debug-video-pipeline", prompt="<paste error_report.json>")
   ```
5. Read `logs/fix_plan.json` returned by debug agent.
6. Apply fix EXACTLY as specified. No improvisation.
7. If `fix_plan.json` has `unknown_error: true` → halt + write `manifest.edit_status: "failed"` + flag for human.

**Known bug detection cues — always invoke debug agent if you see these:**
- Cuts produced at timestamps not matching real audio events → BUG-001 (Gemini calibration)
- Opening sentence missing subject noun after cleanup → BUG-002 (identical-word preservation)
- Transcript contains word like "Midori", "Cling" near a known brand → BUG-010 (WhisperX mishear)
- Total removed > 40% of source → Quality Gate halt
- Re-transcription drifts at end of video → did you skip Step 10 retranscribe?

---

## Idempotency

If `manifest.phase_0.completed_at` exists AND all expected outputs are on disk → skip and exit successfully. Caller can detect skip via manifest unchanged.

To force re-run: delete `logs/whisperx_word_transcript.json` (the canonical Phase 0 output) and reset `manifest.phase_0`.

---

## Standardized Scripts

These scripts live at `talking-head-editing/scripts/` and are shared across all projects. Run them with `node talking-head-editing/scripts/<script> <project_path>` — never copy them per project.

| Script | Purpose |
|---|---|
| `combine_analysis.py` | Gemini → analysis.json mapping with calibration |
| `build-transcripts.js` | WhisperX clean → word + sentence transcripts |

---

## Brief Schema Reference

The skill reads from `brief.json`:
```json
{
  "project_id": "{slug}",
  "language": "vi | en",
  "rough_cut": {
    "speed_factor": 1.2,
    "gap_reduction": 0.5,
    "silence_threshold_db": -40,
    "min_silence_sec": 0.3,
    "gap_50pct_min_sec": 0.6
  }
}
```

All `rough_cut.*` fields are optional with the defaults shown.

---

## Related Skills & Agents

- **Owner agent:** `video-editor` (calls this skill in Phase 0)
- **Master skills using this skill:** `edit-talking-head-video` (and future `edit-vlog-video`, `edit-podcast-clip`)
- **Bug knowledge:** `talking-head-editing/docs/debug/bug-codebook/` — referenced via `debug-video-pipeline` agent

---

## Graph

**Parent template:** [[../../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]]
**Rules:** [[../../../../talking-head-editing/docs/rules/rough-cut-rules|rough-cut-rules]]
**Bug refs:** BUG-001 · BUG-002 · BUG-010
**Owner agent:** [[../../agents/video-editor|video-editor]]
**Debug:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
