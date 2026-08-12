---
name: edit-talking-head-video
description: "Master skill — full talking-head editing pipeline. Edits a raw teleprompter/talking-head recording into a fast-paced, social-ready vertical clip (1080×1920 TikTok/Reels). Orchestrates 6 phases by dispatching 3 agents (video-editor, motion-video-designer, sfx-artist). Phase 0 invokes the universal rough-cut-video skill. Phase 1 is semantic cut + zoom by video-editor. Phases 2 and 3 are B-roll and A-roll motion design. Phase 5 is final assembly with subtitles, B-roll overlay, and SFX/BGM mix. Errors are routed to the debug-video-pipeline agent — no agent self-fixes. Use only for single-speaker talking-head footage."
metadata:
  version: 1.0.0
  pipeline_version: v6
---

# edit-talking-head-video — Master Pipeline

The single entry point for editing a raw talking-head recording into the final social-ready output.

## Invocation

```
/edit-talking-head-video {project_path}
```

`{project_path}` = absolute path to a project folder set up per the input contract below.

## Scope

✅ Single-speaker talking-head / teleprompter recording (any length up to ~5 minutes raw)
✅ Vertical output (1080×1920) for TikTok / Reels / Shorts
✅ Multi-language source (Vietnamese, English — auto-detected from brief)
✅ Mixed cuts pace (~1.5–2s segments via semantic split)
✅ Optional B-roll, A-roll glass overlays, word-pop subtitles, SFX, BGM

❌ Multi-clip compositions or pre-edited footage (use a different skill)
❌ AI-generated video (use `veo3-render` workflow)
❌ Color grading or film effects (out of scope)
❌ Vlog or podcast clip — for those, the future `edit-vlog-video` / `edit-podcast-clip` skills will share the `rough-cut-video` Phase 0 sub-skill

---

## Input Contract

```
{project_path}/
├── footage/{source}.mp4         ← raw talking-head recording (required)
├── brief.json                   ← project metadata (required)
└── manifest.json                ← { "edit_status": "pending" }
```

`brief.json` schema (see `talking-head-editing/docs/WORKFLOW-template.md` Input Contract section for full details).

**Optional inputs:**
- `analysis.json` with operator-marked `exclude_regions` (skips Phase 0 auto-detect)
- `audio/bgm_candidates/*.mp3` (operator-selected music — sfx-artist will pick from these)

---

## Output Contract

```
{project_path}/
├── output/
│   ├── {project_id}_final.mp4   ← final deliverable
│   └── thumbnail-needed.json    ← signal to Design Hub
├── manifest.json                ← edit_status: "complete"
└── logs/edit_errors.log         ← empty or warnings only
```

---

## Required Reading Before Execution

You (the master skill orchestrator) must read at session start:
1. `talking-head-editing/docs/WORKFLOW-template.md` — pipeline phase overview
2. `talking-head-editing/PROTOCOL.md` — anti-self-fix doctrine, error protocol, manifest contract
3. `talking-head-editing/docs/debug/bug-codebook/README.md` — bug heat map

These docs are SHARED with the 3 agents and 4 sub-skills. Reading them once at master level avoids re-reads per phase.

---

## Pipeline Orchestration

### Pre-flight Checks

Before any phase dispatch:
1. Verify `{project_path}/footage/{source}.mp4` exists and is a valid video (ffprobe).
2. Verify `brief.json` parses and has required fields (`project_id`, `language`).
3. Read `manifest.json`. If `edit_status: "complete"` AND `output/{project_id}_final.mp4` exists → skip and return success.
4. If `edit_status: "failed"` → halt + tell operator to review `logs/edit_errors.log` before re-running.
5. Set `manifest.edit_status: "in-progress"` + `manifest.phase: "rough-cut"`.

### Phase Dispatch Sequence

The 6 phases are dispatched as follows. Each dispatch waits for completion before proceeding.

#### Phase 0 — Rough Cut (video-editor)

```
Agent(
  subagent_type="video-editor",
  prompt="Execute Phase 0 (Rough Cut) for project {project_path}. Read PROTOCOL.md + rules/rough-cut-rules.md. Invoke /rough-cut-video {project_path}. Update manifest.phase_0 on completion. Halt on quality-gate violation (>40% removed)."
)
```

Wait for completion. Read manifest:
- If `manifest.phase_0.completed_at` exists → proceed to Phase 1
- If `manifest.edit_status: "failed"` → halt + return error to caller

#### Phase 1 — Semantic Cut + Zoom (video-editor)

```
Agent(
  subagent_type="video-editor",
  prompt="Execute Phase 1 (Semantic Cut + Zoom) for project {project_path}. Read rules/segment-rules.md + rules/zoom-rules.md. Produce cut_plan.json, zoom_plan.json, seg_NNN.mp4, zoomed/seg_NNN_zoom.mp4. Update manifest.phase_1."
)
```

Wait + verify.

#### Phase 2 — B-roll Design (motion-video-designer)

```
Agent(
  subagent_type="motion-video-designer",
  prompt="Execute Phase 2 (B-roll Design) for project {project_path}. Read rules/broll-selection-rules.md. Apply 5-pass algorithm. Render 8–10 B-roll clips. Write broll_timestamp.json with render_verified flags."
)
```

Wait + verify.

#### Phase 2b — B-roll SFX (sfx-artist)

```
Agent(
  subagent_type="sfx-artist",
  prompt="Execute Phase 2 SFX for project {project_path}. Read broll_renders/broll_timestamp.json + each composition's index.html. Assign entry + accent SFX per B-roll. Write broll_sfx_timestamp.json."
)
```

Wait + verify.

#### Phase 3 — A-roll Overlay (motion-video-designer)

```
Agent(
  subagent_type="motion-video-designer",
  prompt="Execute Phase 3 (A-roll Overlay) for project {project_path}. Read rules/aroll-overlay-rules.md. Detect clusters, select overlay types, render ProRes 4444 MOV, build aroll_footage.mp4 with overlays baked. Write aroll_timestamp.json."
)
```

Wait + verify.

#### Phase 3b — A-roll SFX (sfx-artist)

```
Agent(
  subagent_type="sfx-artist",
  prompt="Execute Phase 3 SFX for project {project_path}. Read aroll_timestamp.json + each composition. Assign lighter overlay SFX (entry 0.20–0.30, accent 0.12–0.18, no swoosh). Write aroll_sfx_timestamp.json."
)
```

Wait + verify.

#### Phase 5a — BGM Selection (sfx-artist)

```
Agent(
  subagent_type="sfx-artist",
  prompt="Phase 5 prep — select royalty-free instrumental BGM for project {project_path}. Match the video mood from brief.json topic. Download to audio/bgm.mp3. Write audio/bgm_manifest.json with volume + fade spec."
)
```

Wait + verify.

#### Phase 5 — Assembly + Subtitles (video-editor)

```
Agent(
  subagent_type="video-editor",
  prompt="Execute Phase 5 (Assembly + Subtitles) for project {project_path}. Verify all upstream outputs render_verified. Run compute-exact-timestamps. Pre-trim overflowing B-rolls. Apply B-rolls with -itsoffset per BUG-007. Invoke /subtitle-designer for subtitle overlay. Composite + SFX/BGM mix. Output {project_id}_final.mp4."
)
```

Wait + verify.

### Post-flight Validation

After Phase 5 completes:
1. Verify `output/{project_id}_final.mp4` exists, ffprobe valid, duration > 5s, file size > 1MB.
2. Verify `output/thumbnail-needed.json` exists.
3. Verify `logs/edit_errors.log` has no FATAL entries (warnings OK).
4. Set `manifest.edit_status: "complete"` + `manifest.phase: "complete"`.

Return success report to caller (CMO / Hub / operator).

---

## Error Handling (Master Level)

If any agent returns failure (manifest.edit_status: "failed"):
1. Read `logs/edit_errors.log` last entry and `logs/error_report.json`.
2. Read `logs/fix_plan.json` if present (set by debug-video-pipeline).
3. **Master skill does NOT apply fixes itself.** The owning agent already had the chance + invoked debug agent. If we got here, the debug agent returned `unknown_error` or the fix didn't resolve.
4. Halt the pipeline. Return to caller with:
   - `failed_phase`
   - `failed_stage`
   - `error_summary` (one-line)
   - `next_steps` (always: "human review of error_report.json + bug-codebook")

**The master skill never bypasses the debug agent doctrine.** If a fix is needed, a human extends the bug-codebook with a new BUG-NNN entry, then re-runs.

---

## Idempotency

- Master skill checks `manifest.json` first. If `edit_status: "complete"` → exit success without re-running.
- Each phase agent checks its own `manifest.phase_N.completed_at` and skips if outputs are present.
- To force a clean re-run: operator deletes `manifest.json` and `output/` folder.
- To re-run from a specific phase: operator deletes `manifest.phase_N`+ later phase entries + their outputs, then re-invokes the master skill.

---

## Success Output

```
[edit-talking-head-video] {project_id}

Phase 0 (Rough Cut):       ✅ {N} exclude_regions, {X}s → {Y}s, {Z}% removed
Phase 1 (Semantic Cut):    ✅ {N} segments, zoom distribution: {100: A, 105: B, ...}
Phase 2 (B-roll Design):   ✅ {N} B-roll clips, templates: {list}, SFX: {N} assigned
Phase 3 (A-roll Overlay):  ✅ {N} clusters, types: {list}, SFX: {N} assigned
Phase 5 (Assembly):        ✅ Subtitles + SFX + BGM mixed, final duration: {N}s

Output: {project_path}/output/{project_id}_final.mp4
Size:   {M} MB
Duration: {N}s (target: {brief.target_duration_sec ± 5s})
Thumbnail signal: output/thumbnail-needed.json (Design Hub will pick up)

Manifest: edit_status = complete
```

## Failure Output

```
[edit-talking-head-video] {project_id} FAILED

Failed phase: {N} ({phase_name})
Failed stage: {stage_name}
Agent: {agent_name}
Matched bug: {BUG-NNN or "unknown_error"}
Error report: {project_path}/logs/error_report.json
Fix plan: {project_path}/logs/fix_plan.json

Next steps:
  1. Review error_report.json
  2. Compare against bug-codebook/ — extend if pattern is new
  3. Apply fix per fix_plan.json (or implement extended fix from new BUG entry)
  4. Reset manifest.phase_{N} block
  5. Re-invoke /edit-talking-head-video {project_path}

Manifest: edit_status = failed
```

---

## Tools Required on Machine

The skill itself only orchestrates. The owned agents + sub-skills require:
- ffmpeg / ffprobe (PATH)
- WhisperX 3.8.5+ (Python CLI)
- Gemini 2.5 Flash via Vertex AI (service account)
- Node.js (for `scripts/` files)
- npx HyperFrames 0.6.4+ (motion render)
- Three.js CDN (B-roll 3D templates) — no install, loaded at render time

---

## Related Skills & Agents

**Owned agents (dispatched by this skill):**
- `video-editor` — Phases 0, 1, 5
- `motion-video-designer` — Phases 2, 3
- `sfx-artist` — Phase 2/3/5 SFX + BGM

**Sub-skills:**
- `rough-cut-video` (universal Phase 0)
- `motion-video-designer` skill (Phase 2 inside motion-video-designer agent)
- `design-motion-overlay` (Phase 3 inside motion-video-designer agent)
- `sfx-artist` skill (inside sfx-artist agent)
- `subtitle-designer` (Phase 5 sub-step inside video-editor agent)
- `video-editor` skill (Phase 5 main, inside video-editor agent)

**Debug agent (invoked by owned agents on error):**
- `debug-video-pipeline` — reads bug-codebook, returns fix_plan.json

---

## Graph

**Parent:** [[../../../talking-head-editing/docs/WORKFLOW-template|WORKFLOW-template]] · [[../../../talking-head-editing/PROTOCOL|PROTOCOL]]
**Sub-skill (universal):** [[../rough-cut-video/SKILL|rough-cut-video]]
**Owned agents:** [[../../agents/video-editor|video-editor]] · [[../../agents/motion-video-designer|motion-video-designer]] · [[../../agents/sfx-artist|sfx-artist]]
**Debug agent:** [[../../agents/debug-video-pipeline|debug-video-pipeline]]
**Rules:** [[../../../talking-head-editing/docs/rules/rough-cut-rules|rough-cut-rules]] · [[../../../talking-head-editing/docs/rules/segment-rules|segment-rules]] · [[../../../talking-head-editing/docs/rules/zoom-rules|zoom-rules]] · [[../../../talking-head-editing/docs/rules/broll-selection-rules|broll-selection-rules]] · [[../../../talking-head-editing/docs/rules/aroll-overlay-rules|aroll-overlay-rules]] · [[../../../talking-head-editing/docs/rules/assembly-rules|assembly-rules]]
**Case study:** [[../../../talking-head-editing/docs/case-studies/proj_teleprompter_01|proj_teleprompter_01]]
**Bug codebook:** [[../../../talking-head-editing/docs/debug/bug-codebook/README|bug-codebook README]]
