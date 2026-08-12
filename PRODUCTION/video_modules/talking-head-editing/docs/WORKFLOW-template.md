# WORKFLOW-template — Talking-Head Editing Pipeline

> **Abstract pipeline spec.** This document defines the 6-phase pipeline for converting a raw talking-head/teleprompter recording into a social-ready vertical clip (1080×1920, TikTok/Reels). It is reusable for any project; project-specific values live in case studies and in per-project `analysis.json`.

**Use this with:** the `edit-talking-head-video` skill (master orchestrator) + 3 agents (`video-editor`, `motion-video-designer`, `sfx-artist`) + 1 debug agent (`debug-video-pipeline`).

---

## Input Contract

Every project must provide a folder with:

```
{project_path}/
├── footage/
│   └── {source}.mp4                 ← raw talking-head recording (any duration)
├── brief.json                       ← project metadata (influencer, platform, language, topic)
└── manifest.json                    ← { "edit_status": "pending" }
```

`brief.json` schema:
```json
{
  "project_id": "{slug}",
  "title": "{display title}",
  "influencer": "{name}",
  "platform": "TikTok | Reels | Shorts",
  "format": "Vertical 1080x1920",
  "topic": "{topic}",
  "language": "vi | en",
  "style": "social",
  "target_duration_sec": 60,
  "notes": "{optional free text}"
}
```

`manifest.json` is updated by each phase. See **Manifest Contract** below.

---

## Output Contract

```
{project_path}/output/{project_id}_final.mp4
{project_path}/output/thumbnail-needed.json
{project_path}/manifest.json   ← edit_status: "complete"
```

Validation: ffprobe confirms H.264 video + AAC audio, duration > 5s, file size > 1MB.

---

## Pipeline Overview — 6 Phases

| Phase | Name | Agent | Skill called | Output |
|---|---|---|---|---|
| **0** | Rough Cut | `video-editor` | `rough-cut-video` (universal) | `footage/main_clean.mp4` + transcripts |
| **1** | Semantic Cut + Zoom | `video-editor` | (inline LLM reasoning per `rules/`) | `segments/cut_plan.json` + `zoom_plan.json` + zoomed segments |
| **2** | B-roll Design | `motion-video-designer` → `sfx-artist` | `motion-video-designer` | `broll_renders/` + `broll_timestamp.json` + `broll_sfx_timestamp.json` |
| **3** | A-roll Overlay | `motion-video-designer` → `sfx-artist` | `design-motion-overlay` | `aroll_renders/` + `aroll_footage.mp4` + `aroll_sfx_timestamp.json` |
| **4** | Subtitles | (merged into Phase 5) | `subtitle-designer` | `subtitles/subtitle_overlay.mov` |
| **5** | Assembly | `video-editor` + `sfx-artist` | `video-editor` | `output/{project_id}_final.mp4` |

**Cross-phase:** `sfx-artist` invoked twice (after Phase 2 B-rolls, after Phase 3 A-rolls). Background music decided in Phase 5.

**On error in any phase:** the agent halts and invokes the `debug-video-pipeline` agent. See **Error Protocol** below.

---

## Phase 0 — Rough Cut (Universal)

**Owner:** `video-editor` agent → calls `rough-cut-video` skill.

**Goal:** Remove unusable footage (stumbles, false starts, repeats, long silences). Apply pacing (gap reduction + speed factor). Produce clean continuous video + word-level transcript.

**Inputs:**
- `footage/{source}.mp4`
- (optional) `analysis.json` with operator-supplied `exclude_regions`

**Logic:** `rules/rough-cut-rules.md`

**Pipeline steps:**
1. Run WhisperX on raw source → `logs/transcript.json` (word-level timestamps)
2. Run Gemini 2.5 Flash audio analysis → `logs/gemini_analysis.json` (false_start / stumble / repeat candidates)
3. Calibrate Gemini timestamps against WhisperX anchors → real audio time
4. Build `exclude_regions` in `analysis.json` (merge operator marks + auto detections)
5. Apply gap reduction (default 50%) to inter-sentence silences ≥ 0.6s
6. Invert exclude_regions → include_regions
7. FFmpeg extract parts → concat with `-c copy` → `main_clean_raw.mp4`
8. Apply speed factor (default 1.2×) via `setpts` + `atempo` → `main_clean.mp4`
9. Re-run WhisperX **directly on `main_clean.mp4`** → ground-truth word transcript
10. Build `whisperx_word_transcript.json` (216-word format) + `sentence_transcript.json`

**Outputs:**
- `footage/main_clean.mp4` (cleaned, speed-adjusted)
- `logs/analysis.json` (all decisions recorded)
- `logs/whisperx_word_transcript.json`
- `logs/sentence_transcript.json`

**Quality gate:** Halt and flag for operator review if >40% of source was excluded.

**Why universal:** Phase 0 is the same procedure for any video format (talking-head, vlog, podcast clip). It is published as a standalone skill that other master skills (future `edit-vlog-video`, `edit-podcast-clip`) can call.

---

## Phase 1 — Semantic Cut + Zoom

**Owner:** `video-editor` agent (LLM-decide phase — uses Claude reasoning).

**Goal:** Read the transcript, decide cut boundaries based on meaning + rhythm, assign per-segment zoom levels, produce ready-to-assemble segments.

**Inputs:**
- `footage/main_clean.mp4`
- `logs/whisperx_word_transcript.json`
- `logs/sentence_transcript.json`

**Logic refs:**
- `rules/segment-rules.md` (max 5 words, enumeration items, section headers, emphasis isolation, semantic completeness)
- `rules/zoom-rules.md` (5 zoom levels, first/last 105%, no-consecutive-same, enumeration ascending, tension-and-release)

**Steps:**

### 1.1 Semantic Cut Planning (LLM)
Claude reads transcripts and produces `segments/cut_plan.json` applying segment rules. Each segment has `id, start, end, duration, text, reason`.

### 1.2 FFmpeg Cut
`scripts/cut-segments.js` reads `cut_plan.json` and cuts each segment:
```
ffmpeg -ss {start} -i main_clean.mp4 -t {duration} \
  -c:v libx264 -crf 18 -preset fast -c:a aac -ar 44100 \
  -avoid_negative_ts make_zero -y segments/seg_{NNN}.mp4
```

### 1.3 Zoom Plan (LLM)
Claude reads `cut_plan.json` and writes `segments/zoom_plan.json` applying zoom rules. Each segment gets a zoom level (100/105/110/115/120) + type + reason.

### 1.4 Apply Zoom
`scripts/zoom-merge-check.js` applies center-crop+scale per segment → `segments/zoomed/seg_{NNN}_zoom.mp4`.

**Outputs:**
- `segments/cut_plan.json`
- `segments/zoom_plan.json`
- `segments/seg_{NNN}.mp4` (N segments)
- `segments/zoomed/seg_{NNN}_zoom.mp4` (N zoomed segments) — these are the assembly base

**Verification artifact (for human review only):** `footage/zoom_check.mp4` — merged zoomed segments with subtitles showing text + zoom%.

---

## Phase 2 — B-roll Design

**Owners:** `motion-video-designer` (slot selection + render) → `sfx-artist` (SFX assignment).

**Goal:** Decide which sentences deserve B-roll visualization. Render each B-roll as a HyperFrames composition. Assign SFX per B-roll.

**Inputs:**
- `segments/cut_plan.json`
- `logs/sentence_transcript.json`
- HyperFrames Motion Template library (path: `motion-researcher/output/Motion Video Template/MOC.md`)

**Logic refs:** `rules/broll-selection-rules.md` (5-pass algorithm: group → score+visualizability gate → select slots → template matching → visual asset protocol)

**Output per B-roll slot:**
- `broll_renders/br_{N}_comp/` — HyperFrames project
- `broll_renders/br_{N}.mp4` — rendered clip (3–6s, 1080×1920, 30fps)

**Manifests:**
- `broll_renders/broll_timestamp.json` — slot + render + template + segments_covered + `render_verified: true`
- `broll_renders/broll_sfx_timestamp.json` — per-broll entry SFX + optional accent

**Target:** 8–10 B-roll slots for a 60–90s video.

---

## Phase 3 — A-roll Overlay

**Owners:** `motion-video-designer` (cluster detection + overlay design) → `sfx-artist`.

**Goal:** All segments NOT covered by B-roll are grouped into clusters. Each cluster gets one transparent HyperFrames overlay (glass card / comparison / stat hero / etc.) on the bottom 1/3 of the frame.

**Inputs:**
- `broll_renders/broll_timestamp.json`
- `segments/cut_plan.json`
- `segments/zoomed/` (for actual duration probing)

**Logic refs:** `rules/aroll-overlay-rules.md` (cluster detection, overlay type selection, design language, line splitting + per-word timing, ProRes 4444 render)

**Steps:**
1. Detect clusters (consecutive segments between B-rolls). Skip clusters with single segment < 1.0s.
2. For each cluster: choose overlay type (glass card / comparison / stat hero / ranked list / data table / logo card / process flow).
3. Build HyperFrames composition with `data-composition-id`, transparent background, bottom-1/3 positioning.
4. Render `npm run render -- --format mov` → ProRes 4444 `yuva444p12le`.
5. Compute `asm_start` from ffprobed actual zoomed-segment durations (NEVER from `cut_plan.json`).
6. Composite all overlays onto `base_zoomed.mp4` → `aroll_footage.mp4` (Phase 3 deliverable).

**Outputs:**
- `aroll_renders/ar_{N}_comp/` per cluster
- `aroll_renders/ar_{N}.mov` (ProRes 4444 alpha)
- `aroll_renders/base_zoomed.mp4` (concat of zoomed segments)
- `aroll_renders/aroll_footage.mp4` (H.264 base with overlays baked — viewable)
- `aroll_renders/aroll_timestamp.json`
- `aroll_renders/aroll_sfx_timestamp.json`

---

## Phase 4 — Subtitles

**Merged into Phase 5.** Built during Assembly. See Phase 5 Step 2.

---

## Phase 5 — Assembly (Final)

**Owners:** `video-editor` (orchestration) + `sfx-artist` (audio mix).

**Goal:** Stack all layers onto base, add subtitles, mix SFX + music, produce final MP4.

**Layer Stack:**
```
Base:    aroll_renders/aroll_footage.mp4     ← from Phase 3
Layer 1: B-rolls — full-frame overlay at concat_exact timestamps
Layer 2: Subtitles — word-pop serif overlay (built in this phase)
Audio:   original + SFX mix + background music
```

**Inputs:**
- `aroll_renders/aroll_footage.mp4`
- `broll_renders/br_{N}.mp4` (or `_trim.mp4` versions)
- `broll_renders/broll_timestamp.json`
- `logs/whisperx_word_transcript.json` (for per-word subtitles)
- `broll_renders/broll_sfx_timestamp.json` + `aroll_renders/aroll_sfx_timestamp.json`

**Logic refs:** `rules/assembly-rules.md` (4 critical rules: `-itsoffset` per B-roll, pre-trim, A-roll setpts pattern, ffprobe scale correction)

**Steps:**

### Step 1 — Compute exact timestamps + Pre-trim B-rolls
- Run `scripts/compute-exact-timestamps.js` → `broll_renders/broll_concat_exact.json` (ffprobe + scale correction)
- For each B-roll where `render_duration > slot_duration`: pre-trim to `min(render_duration, slot_dur)` → `br_{N}_trim.mp4`

### Step 2 — Apply B-rolls
FFmpeg overlay all B-rolls onto `aroll_footage.mp4` using `-itsoffset` per input + `enable='between(t,...)'` + `eof_action=pass` → `output/assembled_broll.mp4`.

### Step 3 — Build + Composite Subtitle Overlay (Phase 4 work)
- Build HyperFrames subtitle comp from `whisperx_word_transcript.json` — one `clip` per word, fade in 0.06s + fade out 0.05s.
- Render ProRes 4444 MOV → `subtitles/subtitle_overlay.mov`.
- Overlay onto assembled_broll.mp4 → `output/assembled_sub.mp4`.

### Step 4 — SFX + Music Mix
- Build adelay+volume per SFX from both sfx_timestamp manifests.
- Optional background music with afade in/out at low volume (0.10–0.12).
- amix all → final audio → `output/{project_id}_final.mp4`.

### Step 5 — Thumbnail Signal
Write `output/thumbnail-needed.json` (for Design Hub).

**Validation:**
- File exists, ffprobe valid H.264 + AAC, duration > 5s, within ±2s expected.
- Update `manifest.json`: `edit_status: "complete"` + metrics.

---

## File Map (Standardized)

```
{project_path}/
├── footage/
│   ├── {source}.mp4                          ← raw (never modify)
│   ├── main_clean_raw.mp4                    ← Phase 0 concat pre-speed (intermediate)
│   ├── main_clean.mp4                        ← Phase 0 FINAL — input for all later phases
│   ├── rough/                                ← Phase 0 part_NNN.mp4 + concat.txt
│   ├── whisperx_word_check.mp4               ← Phase 0 verification (optional)
│   └── zoom_check.mp4                        ← Phase 1 verification (optional)
├── logs/
│   ├── analysis.json                         ← master config
│   ├── gemini_analysis.json                  ← Phase 0
│   ├── transcript.json                       ← Phase 0 WhisperX on original
│   ├── rough_cut.log                         ← Phase 0 cut log
│   ├── whisperx_clean/main_clean.json        ← Phase 0 WhisperX on cleaned
│   ├── whisperx_word_transcript.json         ← Phase 0 → Phase 1 input
│   ├── sentence_transcript.json              ← Phase 0 → Phase 1 input
│   └── edit_errors.log                       ← appended by every phase
├── scripts/                                  ← reusable from skill assets
│   ├── combine_analysis.py
│   ├── cut-segments.js
│   ├── zoom-merge-check.js
│   ├── build-transcripts.js
│   ├── burn-whisperx-check.js
│   └── compute-exact-timestamps.js
├── segments/
│   ├── cut_plan.json                         ← Phase 1
│   ├── zoom_plan.json                        ← Phase 1
│   ├── seg_NNN.mp4                           ← Phase 1
│   └── zoomed/seg_NNN_zoom.mp4               ← Phase 1 assembly base
├── broll_renders/
│   ├── br_NN_comp/                           ← Phase 2 HyperFrames projects
│   ├── br_NN.mp4                             ← Phase 2 rendered
│   ├── br_NN_trim.mp4                        ← Phase 5 pre-trimmed (only when overflow)
│   ├── broll_timestamp.json
│   ├── broll_sfx_timestamp.json
│   └── broll_concat_exact.json               ← Phase 5 ffprobe-exact + scale-corrected
├── aroll_renders/
│   ├── ar_NN_comp/                           ← Phase 3 HyperFrames projects
│   ├── ar_NN.mov                             ← Phase 3 ProRes 4444 alpha
│   ├── base_zoomed.mp4                       ← Phase 3 concat of zoomed segments
│   ├── aroll_footage.mp4                     ← Phase 3 deliverable (base + overlays baked)
│   ├── aroll_timestamp.json
│   └── aroll_sfx_timestamp.json
├── subtitles/
│   ├── subtitle_comp/                        ← Phase 5 Step 3
│   └── subtitle_overlay.mov                  ← Phase 5 Step 3
├── output/
│   ├── assembled_broll.mp4                   ← Phase 5 Step 2
│   ├── assembled_sub.mp4                     ← Phase 5 Step 3
│   ├── {project_id}_final.mp4                ← Phase 5 FINAL
│   └── thumbnail-needed.json
├── brief.json
└── manifest.json
```

---

## Manifest Contract

`manifest.json` is updated by each phase. Schema:

```json
{
  "edit_status": "pending | in-progress | complete | failed",
  "phase": "rough-cut | semantic-cut | broll-design | aroll-overlay | assembly | complete",
  "project_id": "{slug}",

  "phase_0": { "completed_at": "ISO", "exclude_regions_count": N, "removed_pct": 0.0 },
  "phase_1": { "completed_at": "ISO", "segments_count": N, "zoom_levels_distribution": {...} },
  "phase_2": { "completed_at": "ISO", "brolls_count": N, "templates_used": [...] },
  "phase_3": { "completed_at": "ISO", "clusters_count": N, "overlay_types": [...] },
  "phase_5": { "completed_at": "ISO", "final_duration_sec": 0.0, "file_size_mb": 0.0 },

  "errors": [],
  "warnings": []
}
```

**Idempotency:** Any phase reads manifest first. If `phase_N.completed_at` exists and all expected outputs are on disk, skip. Re-run only if `manifest.json` is reset to `pending` or an output is missing.

---

## Error Protocol

**No agent attempts to self-fix any error.** This is enforced at agent prompt level.

**On any error (FFmpeg non-zero exit, missing file, schema validation fail, etc.):**

1. STOP. Do NOT retry. Do NOT modify command parameters.
2. Append to `logs/edit_errors.log`:
   ```
   [{ISO}] PHASE {N} FAILED
   Stage: {stage_name}
   Command: {full_command}
   Stderr: {stderr}
   Exit code: {code}
   Expected output: {expected_file}
   ---
   ```
3. Write `logs/error_report.json`:
   ```json
   {
     "project_id": "{slug}",
     "phase": "{phase_name}",
     "stage": "{stage_name}",
     "command": "{full_command}",
     "stderr": "{stderr}",
     "exit_code": N,
     "expected_output": "{path}",
     "attempted_at": "ISO"
   }
   ```
4. Invoke debug agent:
   ```
   Agent(subagent_type="debug-video-pipeline", prompt="<error_report.json content>")
   ```
5. Read returned `logs/fix_plan.json` from debug agent.
6. Apply fix EXACTLY as specified — no improvisation.
7. If debug returns `unknown_error: true` → halt + write `manifest.json: edit_status: failed` + flag for human.

See `debug/bug-codebook/` for the full bug list and fix patterns.

---

## Manifest of Tools & Scripts Required

| Tool | Purpose | Phase |
|---|---|---|
| `ffmpeg` | All video/audio operations | 0, 1, 2, 3, 5 |
| `ffprobe` | Actual duration measurement | 1, 3, 5 |
| `whisperx` (Python CLI) | Word-level transcription | 0 |
| `Gemini 2.5 Flash` via Vertex AI | False-start / stumble / repeat detection | 0 |
| `hyperframes` (npx) | Motion graphics rendering | 2, 3, 5 |
| `Three.js` (CDN) | 3D B-roll templates (isometric / orbits) | 2 |
| Node scripts (`scripts/`) | Cut, zoom, transcripts, exact timestamps | 0, 1, 5 |

---

## What This Pipeline Does NOT Do

- AI-generated video (use `veo3-render` workflow)
- Color grading (out of scope)
- Social publishing (use Communication Team)
- Film grain / vignette / fade-to-black (removed by design)
- Cross-fade transitions (all cuts are hard cuts)

---

## Graph

**Logic:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Phase0-raw-cut-logic|Phase0-raw-cut-logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Segment logic|Segment logic]] · [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/Zoom segment logic|Zoom segment logic]]
**Case study:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/case-studies/proj_teleprompter_01|proj_teleprompter_01]]
**Master skill:** `talking-head-editing/.claude/skills/edit-talking-head-video/SKILL.md` (Step 8)
**Phase 0 skill (universal):** `talking-head-editing/.claude/skills/rough-cut-video/SKILL.md` (Step 4)
**Owning agents:** `video-editor`, `motion-video-designer`, `sfx-artist`, `debug-video-pipeline`
