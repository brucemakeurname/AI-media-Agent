# talking-head-editing — Knowledge Base

> Knowledge base for the talking-head editing pipeline. Skills + agents live at `talking-head-editing/.claude/`. This folder holds rules, bug knowledge, case studies, and the template spec.

## Quick Map

| File / Folder | Purpose |
|---|---|
| `docs/WORKFLOW-template.md` | Abstract pipeline spec (6 phases, agent ownership, file map, manifest contract) |
| `PROTOCOL.md` | Shared anti-self-fix rules, error protocol, debug agent invocation pattern |
| `docs/rules/` | LLM-input logic per phase: rough-cut, segment, zoom, broll-selection, aroll-overlay, assembly |
| `docs/debug/bug-codebook/` | 11 BUG-NNN entries — debug-video-pipeline agent reads these to produce fix_plan.json |
| `docs/case-studies/proj_teleprompter_01.md` | Navigator + key numerical anchors from the original blueprint project |
| `sample/` | Archived first-run project files (WORKFLOW.md + raw artifacts). Do NOT read during pipeline execution — context bloat with no production value. Reference only if debugging a case-study incident. |
| `test/proj_template/` | Test scaffolding — drop a source.mp4 + tweak brief.json to run the pipeline |
| `docs/_deprecated/` | Old v3 docs superseded by the new structure. Do not reference from new work |

## Entry Point

To edit a talking-head video, do NOT run anything from this folder directly. Invoke the master skill from any Codex CLI session:

```
/edit-talking-head-video {project_path}
```

Master skill at: `talking-head-editing/skills/edit-talking-head-video/SKILL.md`

## Owners

- **video-editor agent** — Phases 0, 1, 5 (`talking-head-editing/.claude/agents/video-editor.md`)
- **motion-video-designer agent** — Phases 2, 3
- **sfx-artist agent** — Phase 2/3/5 SFX + BGM
- **debug-video-pipeline agent** — error diagnosis (reads `docs/debug/bug-codebook/`)

## What Changed from v3 (May 2026)

- v3 had 7 phases (Phase 4 standalone subtitles); v6 merges Phase 4 into Phase 5
- Logic files moved into `docs/rules/` folder (cleaner separation from implementation)
- Bug knowledge extracted into `docs/debug/bug-codebook/` (10 entries)
- Master orchestrator skill `edit-talking-head-video` replaces ad-hoc invocation
- Phase 0 became universal — `rough-cut-video` skill is reusable for vlog, podcast, etc.
- All agents forbidden from self-fixing — debug-video-pipeline owns error diagnosis

For the old v3 spec, see `docs/_deprecated/CLAUDE_v3.md`.

## Output Relocation (Solo Flows contract)

Produce all intermediate + final files inside this module (its own working dir + deps).
When the final video/artifact is done, MOVE it to the campaign output path passed by the PROMPT:
  {output_dir}/video/  (e.g. BASE/CAMPAIGNs/{brand}/{date}/{ticket_id}/video/)
Leave intermediates in-module. Only the final deliverable is relocated.

## Graph

**Pipeline spec:** [[docs/WORKFLOW-template]]
**Protocol:** [[PROTOCOL]]
**Bug codebook:** [[docs/debug/bug-codebook/README|bug-codebook README]]
**Case study:** [[docs/case-studies/proj_teleprompter_01|proj_teleprompter_01]]
**Parent hub:** [[../CLAUDE|Video Hub]]
