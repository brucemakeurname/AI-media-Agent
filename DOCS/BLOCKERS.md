# Ultimate Sup AI Media Social — Current Blockers

Last updated: 2026-08-11

> Track only active, actionable blockers. A blocker must name the missing input, its risk, and the next owner/action.

---

## Active Blockers

| Priority | Blocker | Risk | Owner / Next Action |
| --- | --- | --- | --- |
| P1 | No approved current Singapore product label/listing extract is stored with the workspace. | A social asset can repeat obsolete nutrition values, ingredients, certifications, price, variant, or promotion terms. | Product/brand owner: provide approved source before live content is produced. |
| P2 | The 11-pair Ultimate Sup homepage template library provides layout references, but no explicit Ultimate Sup voice, typography, logo-usage, or approved product-asset guide is present. | Copy and new visual assets can drift even when template structure is available. | Brand/AI Media owner: add approved text and asset guidance next to the existing creative templates. |
| P2 | Canonical role profiles in `.claude/agents/*.md` retain legacy references outside this repository. | Codex adapters may ask for missing files or use a language/workflow that conflicts with the Ultimate Sup project rules. | AI Media owner: reconcile each profile against `AGENTS.md` and `PRODUCTION/AGENT.md` before live agent dispatch. |

## Structure Notes

- The workspace reorganization is complete: new campaign work uses `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`.
- Existing flat campaign-slug folders, if encountered, are historical records only and are not a blocker to documentation work.
- `PRODUCTION/video_modules/` is now the active video-module root; module-specific blockers belong in the relevant nested project instructions.

## Resolution Rules

- Do not bypass a P1 blocker by fabricating product facts, a visual identity, or approval status.
- If a blocker is resolved, add a dated note to `PROGRESS.md` and remove it from this list.
- If an issue is task-local rather than workspace-wide, record it in the ticket's `node/` handoff notes instead.

## Graph

[`PROGRESS.md`](PROGRESS.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md)
