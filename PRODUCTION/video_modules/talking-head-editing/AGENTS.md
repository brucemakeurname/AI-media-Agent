# talking-head-editing - Agent Registry

Repo-level registry for the talking-head editing pipeline. Video Hub runs this workspace through **Codex CLI**. Legacy `.claude/` mirrors remain on disk for compatibility, but Codex is the operational default.

This file is the single entry point for any Codex-driven work on this pipeline.

---

## Runtime Compatibility

This pipeline is operated from Codex CLI. Legacy `.claude/` mirrors stay available for compatibility and migration support.

| Runtime | Skills root | Agents root | Auto-loaded context |
|---|---|---|---|
| **Codex CLI** | `skills/` | `agents/` | `AGENTS.md` (this file) |
| **Legacy compatibility** | `.claude/skills/` | `.claude/agents/` | `CLAUDE.md` + this file |

The two roots hold mirrored content. For Video Hub dispatch, use `skills/` and `agents/` first.

---

## Startup Rule

When a task matches the talking-head editing pipeline, load these in order:

1. `skills/edit-talking-head-video/SKILL.md`
2. `docs/WORKFLOW-template.md`
3. `PROTOCOL.md`
4. `docs/debug/bug-codebook/README.md`

Use this pipeline only for:
- single-speaker talking-head or teleprompter footage
- vertical social output (`1080x1920`)
- raw footage editing, not AI-generated clip rendering

Do not use this pipeline for:
- `veo3-render/` generation tasks
- multi-clip montage or pre-edited footage
- podcast or vlog workflows unless they explicitly adopt the shared `rough-cut-video` phase

---

## Master Skill

### `edit-talking-head-video`

- Codex path: `skills/edit-talking-head-video/SKILL.md`
- Legacy mirror: `.claude/skills/edit-talking-head-video/SKILL.md`
- Role: master orchestrator for the full talking-head editing pipeline
- Invocation: run from a Codex session rooted in this workspace and follow `skills/edit-talking-head-video/SKILL.md`
- CLI: `codex --yolo`
- Scope:
  - Phase 0: rough cut
  - Phase 1: semantic cut + zoom
  - Phase 2: B-roll design
  - Phase 2b: B-roll SFX
  - Phase 3: A-roll overlay
  - Phase 3b: A-roll SFX
  - Phase 5a: BGM selection
  - Phase 5: final assembly + subtitles

---

## Related Skills

These skills are part of the `edit-talking-head-video` execution graph and should be treated as its local dependency set.

| Skill | Codex path | Legacy mirror | Used by | Purpose |
|---|---|---|---|---|
| `rough-cut-video` | `skills/rough-cut-video/SKILL.md` | `.claude/skills/rough-cut-video/SKILL.md` | `video-editor` | Universal Phase 0 cleanup + transcript build |
| `motion-video-designer` | `skills/motion-video-designer/SKILL.md` | `.claude/skills/motion-video-designer/SKILL.md` | `motion-video-designer` | Phase 2 B-roll composition design |
| `design-motion-overlay` | `skills/design-motion-overlay/SKILL.md` | `.claude/skills/design-motion-overlay/SKILL.md` | `motion-video-designer` | Phase 3 A-roll overlay design |
| `sfx-artist` | `skills/sfx-artist/SKILL.md` | `.claude/skills/sfx-artist/SKILL.md` | `sfx-artist` | Phase 2/3 SFX + Phase 5 BGM |
| `subtitle-designer` | `skills/subtitle-designer/SKILL.md` | `.claude/skills/subtitle-designer/SKILL.md` | `video-editor` | Subtitle overlay inside final assembly |
| `video-editor` | `skills/video-editor/SKILL.md` | `.claude/skills/video-editor/SKILL.md` | `video-editor` | Phase 5 execution and ffmpeg assembly |
| `cleanup-completed-project` | `skills/cleanup-completed-project/SKILL.md` | `.claude/skills/cleanup-completed-project/SKILL.md` | operator | Post-approval folder cleanup (~7GB to <250MB) |

---

## Active Agents In This Pipeline

### Primary agents

| Agent | Codex path | Legacy mirror | Owns | Triggered by |
|---|---|---|---|---|
| `video-editor` | `agents/video-editor.md` | `.claude/agents/video-editor.md` | Phase 0, Phase 1, Phase 5 | `edit-talking-head-video` |
| `motion-video-designer` | `agents/motion-video-designer.md` | `.claude/agents/motion-video-designer.md` | Phase 2, Phase 3 | `edit-talking-head-video` |
| `sfx-artist` | `agents/sfx-artist.md` | `.claude/agents/sfx-artist.md` | Phase 2b, Phase 3b, Phase 5a | `edit-talking-head-video` |

### Debug agent

| Agent | Codex path | Legacy mirror | Role | Triggered by |
|---|---|---|---|---|
| `debug-video-pipeline` | `agents/debug-video-pipeline.md` | `.claude/agents/debug-video-pipeline.md` | Deterministic bug diagnosis via bug codebook | `video-editor`, `motion-video-designer`, `sfx-artist` |

---

## Dispatch Map

Use this ownership map when deciding which agent/skill pair to run.

| Phase | Agent | Skill |
|---|---|---|
| 0 - Rough Cut | `video-editor` | `rough-cut-video` |
| 1 - Semantic Cut + Zoom | `video-editor` | inline agent logic + `docs/rules/segment-rules.md` + `docs/rules/zoom-rules.md` |
| 2 - B-roll Design | `motion-video-designer` | `motion-video-designer` |
| 2b - B-roll SFX | `sfx-artist` | `sfx-artist` |
| 3 - A-roll Overlay | `motion-video-designer` | `design-motion-overlay` |
| 3b - A-roll SFX | `sfx-artist` | `sfx-artist` |
| 5a - BGM Selection | `sfx-artist` | `sfx-artist` |
| 5 - Assembly + Subtitles | `video-editor` | `video-editor` + `subtitle-designer` |

---

## Codex Dispatch Rules

Codex has no native subagent system. Two supported patterns:

1. Single-session persona switching.
   The main Codex session reads the agent `.md` file for the current phase, adopts that persona inline, executes the phase, then switches to the next phase owner.

2. Spawned child sessions via `codex exec`.
   Recommended for `debug-video-pipeline` or when you need stricter isolation.

```bash
codex exec --prompt "$(cat agents/debug-video-pipeline.md)\n\n---\n\nError report:\n$(cat logs/error_report.json)"
```

The child session writes `logs/fix_plan.json` and exits. Parent reads the plan and applies it.

3. Error doctrine still applies.
   Codex sessions must use the debug path on pipeline errors instead of guessing fixes inline.

---

## Error Doctrine

- No pipeline agent self-fixes ffmpeg or render logic.
- All pipeline failures route to `debug-video-pipeline`.
- Human review is required when the debug agent returns `unknown_error`.
- Full protocol: `PROTOCOL.md`.

---

## Related Knowledge Base

- `CLAUDE.md` - legacy mirrored knowledge base entry
- `docs/WORKFLOW-template.md` - 6-phase pipeline spec
- `PROTOCOL.md` - anti-self-fix + error protocol
- `docs/rules/` - per-phase decision rules
- `docs/debug/bug-codebook/` - BUG-NNN entries
- `docs/case-studies/proj_teleprompter_01.md` - canonical case study

---

## Graph

**Master skill:** `skills/edit-talking-head-video/SKILL.md` · `.claude/skills/edit-talking-head-video/SKILL.md`
**Agents (Codex):** `agents/video-editor.md` · `agents/motion-video-designer.md` · `agents/sfx-artist.md` · `agents/debug-video-pipeline.md`
**Agents (Legacy mirrors):** `.claude/agents/video-editor.md` · `.claude/agents/motion-video-designer.md` · `.claude/agents/sfx-artist.md` · `.claude/agents/debug-video-pipeline.md`
**Knowledge base:** `CLAUDE.md` · `docs/` · `PROTOCOL.md`
