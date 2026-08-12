# Ultimate Sup AI Media Social — Folder Structure

Last updated: 2026-08-11

> Read [`../BASE/BASE-STRUCTURE.md`](../BASE/BASE-STRUCTURE.md) before touching `BASE/`, and [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md) before dispatching production work.

## Workspace Map

```text
.
├── AGENTS.md
├── BASE/
│   ├── BASE-STRUCTURE.md
│   ├── BRAND KITs/
│   │   ├── BRAND-KIT-STRUCTURE.md
│   │   ├── 1. Creative_Prompt_Template/
│   │   ├── 2. HTML_Creative_Prompt_Template/
│   │   ├── 3. HTML_Video_Preset/
│   │   ├── 4. Photoshoot_Prompt_Template/
│   │   ├── 5. Video_Prompt_Template/
│   │   ├── 6. Script_Template/
│   │   └── UltimateSup/
│   ├── CAMPAIGNs/
│   │   ├── CAMPAIGNs-STRUCTURE.md
│   │   ├── UltimateSup Campaign/
│   │   ├── UltimateSup Plus Campaign/
│   │   ├── UltimateAqua Campaign/
│   │   ├── AllenMan Campaign/
│   │   └── archived/
│   └── STRATEGIES/
│       └── storage-structure.md
├── DOCS/
├── .agents/skills/             # Shared root runtime library
├── .claude/                    # Root Claude configuration
├── .codex/agents/              # Root Codex adapters
└── PRODUCTION/
    ├── AGENT.md
    ├── CLAUDE.md
    ├── .agents/skills/         # Production skill library
    ├── .claude/agents/         # Production Claude role definitions
    ├── .codex/agents/          # Production Codex adapters
    ├── goal/                   # Production-goal files
    ├── video_modules/
    │   ├── flowkit/
    │   ├── Applio/
    │   ├── hyperframes/
    │   └── talking-head-editing/
    └── env.local               # Local secret; never expose its values
```

## BASE Sectors

| Path | Purpose | Read/write rule |
| --- | --- | --- |
| `BASE/BRAND KITs/` | Reusable retailer assets, brand guidance, and prompt/template libraries. | Read-only for ordinary campaign work. Update only with an explicit library/brand-kit task. |
| `BASE/CAMPAIGNs/` | Active and historical Ultimate Sup social-media production. | Write campaign outputs only in the canonical production-unit tree. |
| `BASE/STRATEGIES/` | Marketing strategy, planning, and ticket staging. | Follow `storage-structure.md`; production reads approved inputs only. |

## Canonical Campaign Unit

All **new** social-media work belongs in:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/

├── Ticket.md
├── manifest.json
├── caption.md                  # When applicable
├── [final deliverable].jpg     # When applicable
├── [final deliverable].png     # When applicable
├── [final deliverable].mp4     # When applicable
└── node/
```

Default to `UltimateSup Plus Campaign` for AI Media assets unless the ticket or requester specifies another IP.

- Use the exact IP, platform, and format folders in `CAMPAIGNs-STRUCTURE.md`.
- Use the scheduled publish date for `[Date Folder]`; otherwise use the creation date. For multiple independent units on one date, suffix `-2`, then `-3`.
- Keep all prompts, source maps, drafts, QA, logs, generation records, and handoffs in `node/`.
- Write `manifest.json` last, only after required finals exist and proportional verification passes.
- Keep historical flat campaign-slug folders intact, but do not use that layout for new work.

## Production Runtime

`PRODUCTION/` is a self-contained execution runtime. Its `AGENT.md` is authoritative for role order, production goals, storage, and module use.

| Path | Use |
| --- | --- |
| `PRODUCTION/.agents/skills/` | Read the relevant `SKILL.md` before using a production skill. |
| `PRODUCTION/.claude/agents/` | Canonical production role profiles. |
| `PRODUCTION/.codex/agents/` | Native Codex adapters for those roles. |
| `PRODUCTION/goal/` | Select the goal that matches the requested social format. |
| `PRODUCTION/video_modules/` | Local application root; each module owns its nested dependencies and instructions. |
| `PRODUCTION/env.local` | Local credential file; never print, copy, commit, upload, or document secret values. |

## Video Modules

| Module | Purpose | Handling rule |
| --- | --- | --- |
| `flowkit/` | AI video creation. | Follow its nested `AGENTS.md` and `CLAUDE.md`. |
| `Applio/` | Voice conversion. | Treat as a nested Git repository. |
| `hyperframes/` | Programmatic HTML/video composition. | Follow its nested project instructions. |
| `talking-head-editing/` | Talking-head editing pipeline. | Follow its nested `AGENTS.md`, `CLAUDE.md`, and protocol. |

## Ownership

- `content-executive` owns captions, creative briefs, scripts, and copy-gap responses.
- `designer` owns visual direction, static assets, thumbnails, and visual QA.
- `video-editor` owns approved-script video production and technical video QA.
- `researcher` owns reference and template research, not final campaign copy.
- `notion-publisher` owns authorized publishing handoff and final manifest completion.

## Graph

[`README.md`](README.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) · [`../BASE/BASE-STRUCTURE.md`](../BASE/BASE-STRUCTURE.md) · [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md)
