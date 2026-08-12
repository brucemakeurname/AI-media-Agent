# _deprecated — Files Superseded by v6 Pipeline

> Archived files from earlier pipeline versions. Do NOT reference these from new work. Kept for historical reference only.

| File | Superseded by | Why archived |
|---|---|---|
| `CLAUDE_v3.md` | `../CLAUDE.md` + `../WORKFLOW-template.md` | v3 spec described 7-phase pipeline; v6 merges Phase 4 into Phase 5. New CLAUDE.md is a thin pointer doc |
| `Phase0-raw-cut-logic.md` | `../rules/rough-cut-rules.md` | Refactored — removed project-specific paths, cleaned into pure abstract rules |
| `Segment logic.md` | `../rules/segment-rules.md` | Same — moved into rules/ folder with standardized naming |
| `Zoom segment logic.md` | `../rules/zoom-rules.md` | Same |
| `WORKFLOW_bk.md` | `../sample/WORKFLOW.md` (canonical) | Manual backup; the live source is in sample/ |
| `plan-v3.md` | (none — obsolete implementation plan) | v3 implementation plan; tasks all complete, replaced by current architecture |
| `old-claude-agents-commands/` | `../../.claude/agents/video-editor.md` (new) + `../../.claude/skills/edit-talking-head-video/SKILL.md` | Old `agents/video-editor.md` defined v2 5-phase scope (banner overlays with chromakey); old `commands/edit-video.md` was v2 slash command. Both replaced by Video Hub root-level definitions |

## Why Keep Them?

- Reference if a v6 decision proves wrong and we need to compare against v3 rationale
- Recovery if a v6 file is accidentally corrupted (use as starting point for rebuild)
- Audit trail — the team can see why specific docs were retired

## Cleanup Schedule

Re-evaluate after the first 3 successful production runs of `/edit-talking-head-video` on a non-blueprint project. If no v3 reference is needed, the folder can be deleted.
