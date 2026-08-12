# Ultimate Sup AI Media Social — Architecture

Last updated: 2026-08-11

> Durable architectural decisions for Ultimate Sup social-media production.

## Top-Level Design

1. **Workspace scope:** Ultimate Sup social-media production for the Singapore market, including Shopee Singapore and SGD commerce content.
2. **Authority hierarchy:** `AGENTS.md` sets workspace rules; `BASE/BASE-STRUCTURE.md` governs BASE sectors; `PRODUCTION/AGENT.md` governs runtime execution; the active `Ticket.md` governs the deliverable.
3. **Execution separation:** `BASE/` stores brand sources, strategy, and campaign output. `PRODUCTION/` stores local roles, skills, goals, credentials, and video applications.

## Storage Contract

All new social-media work uses:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
├── Ticket.md
├── manifest.json
├── caption.md                  # When applicable
├── [final deliverable].jpg/.png/.mp4
└── node/                       # Prompts, drafts, logs, QA, and handoffs
```

- The date folder contains exactly one independent content unit; use a `-2`, then `-3`, suffix for same-day units.
- Write `manifest.json` only after required final files exist and the proportional checks pass.
- `archived/` is historical storage only. Preserve flat legacy campaign folders, but do not create new ones.
- `BASE/BRAND KITs/` is read-only for normal campaign work.

## Production Runtime

- `PRODUCTION/AGENT.md` is the runtime authority; `PRODUCTION/CLAUDE.md` delegates to it.
- `PRODUCTION/.agents/skills/`, `.claude/agents/`, and `.codex/agents/` hold the production skill and role adapters.
- `PRODUCTION/goal/` supplies social-format workflow templates.
- `PRODUCTION/video_modules/` contains `flowkit/`, `Applio/`, `hyperframes/`, and `talking-head-editing/`. Follow a module's nested instructions and keep its intermediates inside the module unless the active goal says otherwise.
- `PRODUCTION/env.local` is local-only credential material. Never print, copy, upload, or commit its values.

## Role Topology

The normal production sequence is `content-executive` → `designer` and/or `video-editor` → `notion-publisher`.

- `content-executive` owns brief interpretation, captions, scripts, and copy-gap responses.
- `designer` owns visual direction, static assets, thumbnails, and visual QA.
- `video-editor` owns approved-script video production and technical video QA.
- `researcher` owns reference and template research, not final campaign copy.
- `notion-publisher` owns authorized publishing handoff and final `manifest.json` completion.

## Product Claim Governance

- The default market is Singapore. Use SGD and Shopee Singapore context unless the active ticket explicitly says otherwise.
- Verify external-facing product facts in this order: active `Ticket.md` and written approval; current label/approved Singapore listing; product-owner confirmation.
- `DOCS/product/` is working reference material, not automatic publication approval. Do not make medical, cure, HSA, clinical-proof, guaranteed-outcome, or unsupported comparative claims.

## Graph

[`README.md`](README.md) · [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) · [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) · [`../AGENTS.md`](../AGENTS.md) · [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md)
