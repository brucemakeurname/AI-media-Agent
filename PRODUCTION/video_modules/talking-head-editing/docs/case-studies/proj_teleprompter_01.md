# Case Study — proj_teleprompter_01

> First-of-its-kind execution of the talking-head editing pipeline. The full raw project log lives at `sample/WORKFLOW.md` (1316 lines) — do not read it during pipeline execution. This file is the navigator + key-learnings summary for future projects.

---

## Project Facts

| Field | Value |
|---|---|
| Project ID | `proj_teleprompter_01` |
| Source | `footage/Teleprompter-2026-17-01_23-07-28.mp4` |
| Source duration | 125.67s (talking head, English, vertical 1080×1920) |
| Final duration | 71.20s (output `proj_teleprompter_01_final.mp4`) |
| Pipeline duration | Manual + iterative across multiple sessions |
| Final output | `output/proj_teleprompter_01_final.mp4` (64MB, H.264) |
| Status | ✅ Complete — used as canonical blueprint |

## Pipeline Phase Result Snapshot

| Phase | Output | Notes |
|---|---|---|
| 0 — Rough Cut | `footage/main_clean_2.mp4` (87.51s) | 22 exclude_regions removed → 1.2× speed |
| 1 — Semantic Cut + Zoom | 65 segments · 65 zoomed segments | Phase 1 LLM decisions in `cut_plan.json`, `zoom_plan.json` |
| 2 — B-roll | 9 B-roll clips · `broll_timestamp.json` | 3 of them Three.js (br_01, br_05, br_08) |
| 3 — A-roll Overlay | 6 ProRes 4444 clips · `aroll_footage.mp4` | Glass card design — dark navy, cyan border |
| 5 — Assembly | `proj_teleprompter_01_final.mp4` | Subtitles baked here (Phase 4 merged into 5) |

## Where to find each artifact

```
sample/
├── footage/main_clean_2.mp4              ← Phase 0 output
├── logs/whisperx_word_transcript.json    ← Phase 0 transcript (Phase 1 input)
├── logs/sentence_transcript.json         ← Phase 0 sentences
├── logs/analysis.json                    ← master config: exclude_regions, broll_moments, pacing
├── logs/gemini_analysis.json             ← Gemini 2.5 Flash raw analysis (10 issues)
├── segments/cut_plan.json                ← Phase 1 semantic cuts (65)
├── segments/zoom_plan.json               ← Phase 1 zoom decisions (65)
├── segments/seg_NNN.mp4 + zoomed/        ← Phase 1 video segments
├── broll_renders/                        ← Phase 2: 9 br_NN.mp4 + comp dirs + timestamps
├── aroll_renders/                        ← Phase 3: 6 ar_NN.mov + base_zoomed.mp4 + aroll_footage.mp4
├── subtitles/subtitle_overlay.mov        ← Phase 5: word-pop serif overlay (ProRes 4444)
└── output/proj_teleprompter_01_final.mp4 ← Phase 5: final deliverable
```

## Key Numerical Anchors (specific to this project, NOT general)

- **Gemini→Actual timestamp calibration anchors:**
  - `g=0.0 → actual=0.0s`
  - `g=3.55 → actual=13.24s` (WhisperX word "why")
  - `g=11.95 → actual=47.07s` (WhisperX word "If")
  - `g=22.30 → actual=98.06s`
- **Speed factor:** 1.2× (chosen because preserves natural speech up to 1.2×)
- **Gap reduction:** 50% of silences ≥ 0.6s
- **22 exclude_regions** in `analysis.json` (false_start × 5 + repeat × 1 + gap_50pct × 16)
- **65 segments** in `cut_plan.json`
- **9 B-rolls + 6 A-roll clusters** (ar_04 skipped: single seg < 1.0s)
- **Scale correction factor:** 1.0485 = 71.267s actual / 67.968s sum-of-ffprobed
- **Segment re-encode keyframe drift:** 33–61ms per segment → +3.16s over 65 segments

## Special-case incidents (became Bug Codebook entries)

| Incident | Where in WORKFLOW.md | Codebook entry |
|---|---|---|
| Gemini compressed timestamps non-linear | lines 99–107 | BUG-001 |
| "Everyone" false-start identical to clean restart word | lines 163–171 | BUG-002 |
| Re-encoded segments longer than `cut_plan.json` planned (SRT drift) | lines 119–137 (Zoom logic), 395–398 (WORKFLOW) | BUG-003 |
| B-roll concat scale correction needed | lines 1260–1312 (Assembly Rule 4) | BUG-004 |
| `-itsoffset` + `setpts=PTS-STARTPTS` cancel each other | lines 1247–1257 (Assembly Rule 3) | BUG-005 |
| `ffprobe` actual vs `cut_plan.json` nominal | lines 858–866 | BUG-006 |
| FFmpeg consumes all inputs from t=0 regardless of `enable=` | lines 1172–1196 (Assembly Rule 1) | BUG-007 |
| B-roll `render_duration > slot_duration` overflow | lines 1200–1229 (Assembly Rule 2) | BUG-008 |
| Last frame of B-roll held without `eof_action=pass` | lines 1190–1196 | BUG-009 |
| Whisper mishears tool names (Midori → MidJourney) | lines 519–524 | BUG-010 |

## Reusability Caveat

This case study is fixed in time. The numerical anchors above (Gemini calibration, scale factor, 22 exclude_regions) are SPECIFIC to this source video. Any future talking-head project must derive its own values from fresh transcription, fresh Gemini analysis, and fresh ffprobe measurements.

The pipeline STRUCTURE is reusable; the project NUMBERS are not.

## Graph

**Context:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] (abstract pattern)
**Full project log:** `sample/WORKFLOW.md` (1316 lines — do not read during pipeline execution)
**Logic refs:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Zoom segment logic|Zoom segment logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Phase0-raw-cut-logic|Phase0-raw-cut-logic]]
