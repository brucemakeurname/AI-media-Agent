# Ultimate Sup AI Media — Production Runtime

`PRODUCTION/` is the self-contained runtime for Ultimate Sup social-media production. It holds local role definitions, skills, goal files, and video applications. Do not modify the workspace-root runtime configuration while working here.

## Read Order

1. This file.
2. `../AGENTS.md` for workspace-wide safety, market, claim, and delivery rules.
3. The applicable production goal in `goal/`.
4. The active campaign `Ticket.md` and `../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` before creating any campaign folder.
5. The selected role definition in `.claude/agents/` and skill in `.agents/skills/`.

## Runtime Layout

```text
PRODUCTION/
├── AGENT.md                    ← Runtime authority (this file)
├── CLAUDE.md                   ← Delegates to AGENT.md only
├── .agents/skills/             ← Local shared production skills
├── .claude/agents/             ← Claude role definitions
├── .claude/skills -> ../.agents/skills
├── .codex/agents/              ← Codex adapters for the same roles
├── goal/                       ← Goal files; replaces the legacy WORKFLOWS/ library
├── video_modules/              ← Local video applications; replaces legacy VIDEO_MODULE(S)
│   ├── flowkit/
│   ├── Applio/
│   ├── hyperframes/
│   └── talking-head-editing/
└── env.local                   ← Local credentials; never print, copy, or commit
```

`goal/` is the only production-goal library. `video_modules/` is the only local video-module root. Treat references to legacy `WORKFLOWS`, `VIDEO_MODULE`, or `VIDEO_MODULES` names in imported material as historical names for these two locations.

## Dispatch and Storage

- Select the goal file that matches the requested social format, then follow its filled fields and acceptance criteria.
- Take a goal-provided `output_dir` verbatim. Do not reinterpret it relative to `PRODUCTION/`.
- New campaign work belongs at `../BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/YYYY-MM-DD/` according to `CAMPAIGNs-STRUCTURE.md` (AI Media output defaults to `UltimateSup Plus Campaign` unless specified otherwise).
- A production unit starts with `Ticket.md`. Keep final deliverables at the unit root; keep prompts, drafts, QA, logs, and handoffs in `node/`.
- Write `manifest.json` only after the required deliverables exist and proportional verification passes. A missing manifest means the production unit is not complete.
- Do not overwrite approved assets. Create a dated revision folder when a replacement is required.

## Roles

| Role | Owns | Runs |
| --- | --- | --- |
| `content-executive` | Caption, creative brief, script, copy-gap responses | First for every production unit |
| `designer` | Visual direction, references, static assets, thumbnail, visual QA | When visuals or thumbnails are required |
| `video-editor` | Approved-script video production and video QA | When the goal requires video |
| `notion-publisher` | Approved publishing handoff and final manifest | Last, only when publishing is authorized |
| `researcher` | Reference-library research and enrichment | On demand; never produces campaign copy |

Run production roles sequentially: `content-executive` → `designer` and/or `video-editor` → `notion-publisher`. A role stops and records the exact blocker if its required input is missing.

## Video Modules

- Use the module selected by the goal and follow its nested `AGENTS.md` or `CLAUDE.md` before running it.
- `flowkit/`: video generation application.
- `Applio/`: local voice-conversion application and nested Git repository.
- `hyperframes/`: HTML/video composition and rendering.
- `talking-head-editing/`: talking-head editing pipeline.
- Keep module intermediates within the module unless the active goal explicitly requires them in the campaign unit. Relocate only approved final deliverables.

## Operating Rules

- Generated language defaults to the active ticket; never assume Vietnamese, English, product data, pricing, offers, claims, or CTAs.
- Do not post interim “starting” or “working” updates as a production-completion signal. `manifest.json` and any authorized publisher handoff are the completion gate.
- Never print, upload, copy, or commit `env.local` values.
- Preserve nested instructions and local dependencies in each video module.
- Verify file existence and format before handoff; verify claim, variant, and offer data against the active approved source.

## Graph

`../AGENTS.md` · `goal/` · `../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` · `.claude/agents/` · `.agents/skills/` · `video_modules/`
