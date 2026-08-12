# PROTOCOL — Shared Pipeline Integration Rules

> Single source of truth for how every skill and agent in the talking-head editing pipeline interacts with the rest of the system. Every skill in the v6 pipeline references this file in its "Pipeline Integration" section.

---

## v6 Pipeline Phases

| Phase | Owner Agent | Skill(s) | Output Contract |
|---|---|---|---|
| **0** Rough Cut | `video-editor` | `rough-cut-video` (universal) | `footage/main_clean.mp4` + transcripts |
| **1** Semantic Cut + Zoom | `video-editor` | inline LLM reasoning per `rules/` | `segments/cut_plan.json` + `zoom_plan.json` + zoomed segments |
| **2** B-roll Design | `motion-video-designer` → `sfx-artist` | `motion-video-designer` | `broll_renders/` + `broll_timestamp.json` + `broll_sfx_timestamp.json` |
| **3** A-roll Overlay | `motion-video-designer` → `sfx-artist` | `design-motion-overlay` | `aroll_renders/` + `aroll_footage.mp4` + `aroll_sfx_timestamp.json` |
| **5** Assembly + Subtitles | `video-editor` + `sfx-artist` | `video-editor` + `subtitle-designer` | `output/{project_id}_final.mp4` |

Phase 4 (subtitles) is merged into Phase 5. The `subtitle-designer` skill is invoked from inside Phase 5 by the video-editor agent.

---

## Master Skill Entry Point

The pipeline runs as one command:
```
/edit-talking-head-video {project_path}
```
This orchestrates all 6 phases by dispatching the 3 agents (`video-editor`, `motion-video-designer`, `sfx-artist`) in the correct order with appropriate manifest checks between phases.

A standalone Phase 0 run is also supported via `/rough-cut-video {project_path}` for use by other master skills (future `edit-vlog-video`, `edit-podcast-clip`).

---

## Rules Source of Truth

All decision rules live in `talking-head-editing/docs/rules/`:
- `rough-cut-rules.md` — Phase 0
- `segment-rules.md` — Phase 1 semantic cut
- `zoom-rules.md` — Phase 1 zoom assignment
- `broll-selection-rules.md` — Phase 2 B-roll
- `aroll-overlay-rules.md` — Phase 3 A-roll
- `assembly-rules.md` — Phase 5 assembly

Each skill MUST read its phase's rules file at session start. Rules files are versioned; skills should never inline-duplicate rule content.

---

## Anti-Self-Fix Doctrine

**No agent in this pipeline attempts to fix its own errors.** All three pipeline agents (`video-editor`, `motion-video-designer`, `sfx-artist`) are forbidden from retrying with modified parameters, guessing fix patterns, or applying heuristic workarounds.

**Why:** Every error pattern this pipeline has encountered (BUG-001 through BUG-010) had a non-obvious root cause and a specific deterministic fix. An agent guessing has near-zero chance of landing the correct fix and a high chance of producing silent corruption (output that LOOKS right but is misaligned, drift-accumulated, or visually broken).

The debug-video-pipeline agent owns this knowledge. Use it.

---

## Error Protocol (mandatory)

On ANY error (non-zero exit, missing expected output, schema validation fail, render_verified false, ffprobe duration mismatch, etc.):

### Step 1 — Stop. Do not retry.

Do NOT modify the command and re-run. Do NOT switch to a different approach. Do NOT continue to the next step.

### Step 2 — Log the error

Append to `{project_path}/logs/edit_errors.log`:
```
[{ISO 8601}] PHASE {N} FAILED
Stage: {stage_name}
Command: {full command}
Stderr: {stderr}
Exit code: {N}
Expected output: {path}
Actual output present: {bool}
---
```

### Step 3 — Write error_report.json

To `{project_path}/logs/error_report.json`:
```json
{
  "project_id": "{slug}",
  "phase": "rough-cut | semantic-cut | broll-design | aroll-overlay | assembly",
  "stage": "{specific-stage-name}",
  "command": "{full ffmpeg/script command}",
  "stderr": "{captured stderr}",
  "exit_code": N,
  "expected_output": "{path}",
  "actual_output_present": false,
  "attempted_at": "ISO 8601",
  "additional_context": {}
}
```

### Step 4 — Invoke debug agent

```
Agent(
  subagent_type="debug-video-pipeline",
  prompt="<full content of error_report.json>"
)
```

The agent returns the path to a written `logs/fix_plan.json` along with a 1-sentence summary.

### Step 5 — Apply fix exactly

Read `logs/fix_plan.json`. For each step in `fix_steps`:
- Execute exactly as specified.
- Substitute `params_to_substitute` from your context.
- Do NOT improvise. Do NOT skip steps. Do NOT reorder.

After applying, run the `verification` checks. If all pass → proceed with the phase. If any fail → re-invoke debug agent with an updated error_report.

### Step 6 — Handle unknown errors

If `fix_plan.json` contains `"unknown_error": true`:
- DO NOT continue.
- Set `manifest.edit_status: "failed"` with `failed_phase` and `failed_stage`.
- Write a clear handoff in `logs/edit_errors.log` for human review.
- Exit the skill/agent cleanly.

A human reviews the unknown error, extends the bug codebook if appropriate, then resets the manifest to re-run.

---

## Idempotency

Every phase reads `manifest.json` first.

- If `manifest.phase_N.completed_at` exists AND all expected outputs are on disk → skip phase and exit successfully.
- To force re-run: caller deletes the canonical output of that phase + resets `manifest.phase_N` to empty.

This keeps the pipeline cheap to resume after partial completion or after a human applies fixes.

---

## Manifest Contract

`{project_path}/manifest.json` is the shared state file. Schema:
```json
{
  "edit_status": "pending | in-progress | complete | failed",
  "phase": "rough-cut | semantic-cut | broll-design | aroll-overlay | assembly | complete",
  "project_id": "{slug}",
  "failed_phase": null,
  "failed_stage": null,

  "phase_0": { "completed_at": "ISO", "exclude_regions_count": N, "removed_pct": 0.0 },
  "phase_1": { "completed_at": "ISO", "segments_count": N },
  "phase_2": { "completed_at": "ISO", "brolls_count": N },
  "phase_3": { "completed_at": "ISO", "clusters_count": N },
  "phase_5": { "completed_at": "ISO", "final_duration_sec": 0.0 },

  "errors": [],
  "warnings": []
}
```

Every phase updates only its own `phase_N` block + the top-level `edit_status` / `phase` fields. Phases do NOT touch other phases' blocks.

---

## Quick Bug Lookup Heat Map

When you see one of these symptoms, you almost certainly need to invoke debug-video-pipeline:

| Symptom | Likely BUG |
|---|---|
| Cuts at wrong words / Gemini timestamps wrong | BUG-001 |
| Opening sentence subject missing | BUG-002 |
| SRT drifts in second half of video | BUG-003 / BUG-006 |
| B-roll lands early in late half | BUG-004 |
| All A-roll overlays stack at t=0 | BUG-005 |
| Using cut_plan.json duration for math | BUG-006 |
| B-roll shows static frame instead of motion | BUG-007 |
| B-roll bleeds into next cut | BUG-008 |
| Last frame of overlay frozen over later content | BUG-009 |
| WhisperX transcribed "Midori" / "Cling" / wrong brand | BUG-010 |

**The agent invokes debug-video-pipeline. The agent does NOT try the fix itself.**

---

## Cross-References

- Pipeline spec: [[docs/WORKFLOW-template]]
- Case study: [[docs/case-studies/proj_teleprompter_01]]
- Rules: `docs/rules/*.md`
- Bug codebook: `docs/debug/bug-codebook/`
- Owner agents: `talking-head-editing/.claude/agents/video-editor.md` · `motion-video-designer.md` · `sfx-artist.md`
- Debug agent: `talking-head-editing/.claude/agents/debug-video-pipeline.md`
- Master skill: `talking-head-editing/.claude/skills/edit-talking-head-video/SKILL.md`

## Graph

**Parent:** [[docs/WORKFLOW-template|WORKFLOW-template]]
**Codebook:** [[docs/debug/bug-codebook/README|bug-codebook README]]
