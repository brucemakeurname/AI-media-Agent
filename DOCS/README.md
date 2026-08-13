# Ultimate Sup AI Media Social — Documentation Map

Last updated: 2026-08-11

> This directory documents the active workspace. For a task-local production contract, the active `Ticket.md` and the relevant BASE/PRODUCTION authority take precedence.

## Read First

1. [`../AGENTS.md`](../AGENTS.md) — workspace-wide safety, market, claim, and handoff rules.
2. [`../BASE/BASE-STRUCTURE.md`](../BASE/BASE-STRUCTURE.md) — BASE sector index.
3. [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md) — production runtime and dispatch rules.
4. [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) — practical location and ownership reference.
5. The active production unit's `Ticket.md` — approved deliverable, facts, offer, language, CTA, and acceptance criteria.

## Documentation Set

| File | Use it for |
| --- | --- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Durable scope, precedence, approval, and storage decisions. |
| [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) | Current workspace tree, ownership, and canonical output location. |
| [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) | Pre-flight, routing, claim-safety, and handoff checklist. |
| [`PROGRESS.md`](PROGRESS.md) | Current structural implementation state and remaining actions. |
| [`BLOCKERS.md`](BLOCKERS.md) | Active workspace blockers and named next owners. |
| [`product/README.md`](product/README.md) | Product-source scope and publication guardrails. |
| [`WORKFLOW-HANDOFF-DELIVERABLES.md`](WORKFLOW-HANDOFF-DELIVERABLES.md) | Video Creative handoff package: Notion input, GOAL/skill contract, repository, and test-output artifacts. |
| [`WORKFLOW-VERIFICATION-CHECKLIST.md`](WORKFLOW-VERIFICATION-CHECKLIST.md) | Supervisor guide to independently set up, replay, and accept a Video Creative workflow. |

## BASE Authorities

- [`../BASE/BRAND KITs/BRAND-KIT-STRUCTURE.md`](../BASE/BRAND%20KITs/BRAND-KIT-STRUCTURE.md) governs reusable assets, retailer brand guidance, and prompt/template libraries.
- [`../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`](../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md) governs all new social-media production units.
- [`../BASE/STRATEGIES/storage-structure.md`](../BASE/STRATEGIES/storage-structure.md) governs marketing strategy and ticket staging.

New social production uses `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`. The date folder is self-contained: `Ticket.md`, final deliverables, `caption.md` when applicable, `manifest.json`, and `node/` for all working artifacts. Preserve historical flat campaign folders; do not create new ones.

## Production Runtime

- [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md) is the runtime authority; [`../PRODUCTION/CLAUDE.md`](../PRODUCTION/CLAUDE.md) delegates to it.
- `../PRODUCTION/.agents/skills/`, `.claude/agents/`, and `.codex/agents/` contain the production skill and role adapters.
- `../PRODUCTION/goal/` is the production-goal library.
- `../PRODUCTION/video_modules/` contains `flowkit/`, `Applio/`, `hyperframes/`, and `talking-head-editing/`; read each module's nested instructions before using it.
- `../PRODUCTION/env.local` is local-only credential material. Never print, copy, commit, or upload its values.

## Brand and Product Sources

- `../BASE/BRAND KITs/UltimateSup/` holds current retailer assets, voice, guidelines, and reusable elements.
- `../BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/UltimateSup/Homepage sup 8.8.26/` contains 11 paired JPG/JSON homepage layouts. Historical visible copy, offers, and prices are not current facts.
- `../DOCS/product/` holds working product references. It does not independently approve external-facing claims.

## Maintenance Rules

- Update the governing authority and this documentation map together when a durable workspace path, storage contract, role, or runtime changes.
- Do not duplicate detailed module instructions here; link to the authority instead.
- Record unresolved workspace-wide issues in [`BLOCKERS.md`](BLOCKERS.md), then remove them once resolved and note the outcome in [`PROGRESS.md`](PROGRESS.md).

## Graph

[`../AGENTS.md`](../AGENTS.md) · [`../BASE/BASE-STRUCTURE.md`](../BASE/BASE-STRUCTURE.md) · [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md) · [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) · [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md)
