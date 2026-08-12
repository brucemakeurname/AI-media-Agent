# Ultimate Sup AI Media Social — Quick Reference

Last updated: 2026-08-11

> Pre-flight operational checklist and routing reference.

## Read Order

1. `AGENTS.md` and `PRODUCTION/AGENT.md`
2. `BASE/BASE-STRUCTURE.md`, then the active sector's authority
3. The active production unit's `Ticket.md`
4. `DOCS/product/README.md` and the relevant approved product source
5. `BASE/BRAND KITs/UltimateSup/` for retailer brand assets, voice, and guidance

## Ticket Intake

Do not start production until `Ticket.md` specifies:

- Product/SKU and flavour or variant.
- Platform, format, objective, audience, language, CTA, and deadline.
- Price, offer, or gift details when visible in creative.
- Approved factual source, brand assets, and review requirement.

## Reusing a Creative Template

1. Select the matching JPG/JSON pair in `BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/UltimateSup/Homepage sup 8.8.26/`.
2. Read `template_controls` and attach every required `REF_*` asset in `reference_elements.assets`.
3. Replace only documented `{{...}}` fields with approved campaign data.
4. Keep the fixed composition; set exact visible copy, SGD price, date, offer, and CTA in post-production.
5. Treat all visible commercial details in reference images as historical until approved in the active ticket.

## Output Location

Save each new unit in:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
```

- Default to `UltimateSup Plus Campaign` for AI Media assets unless the ticket or requester specifies another IP.

- Keep `Ticket.md`, final assets, `caption.md` when applicable, and `manifest.json` at the unit root.
- Keep prompts, source maps, drafts, QA, logs, and handoffs in `node/`.
- Do not create new flat campaign-slug folders or write campaign output to `BASE/BRAND KITs/`.
- Never expose values from `PRODUCTION/env.local`.

## Production Routing

| Task | Primary owner | Required output |
| --- | --- | --- |
| Brief, caption, hook, script | `content-executive` | `caption.md`, `script.md`, or `node/creative-brief.md` |
| Static visual, carousel, thumbnail | `designer` | Final asset plus visual QA in `node/` |
| Video sequence, voice, render | `video-editor` | Final `.mp4` plus video QA in `node/` |
| Reference or competitor research | `researcher` | Dated source evidence in `node/` |
| Authorized final handoff | `notion-publisher` | Final delivery state and `manifest.json` |

## Claim Safety Shortcut

Stop for review if copy states or implies a disease treatment/cure, guaranteed outcome, HSA approval, clinical proof, competitor superiority, or an unapproved price, offer, certification, rating, testimonial, or nutrition fact.

## Verification Commands

```bash
# Check structural authorities
ls -la AGENTS.md BASE/BASE-STRUCTURE.md BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md PRODUCTION/AGENT.md

# Inspect production skills and local video modules
find PRODUCTION/.agents/skills -mindepth 1 -maxdepth 1 -type d | sort
find PRODUCTION/video_modules -mindepth 1 -maxdepth 1 -type d | sort
```

## Graph

[`README.md`](README.md) · [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) · [`PROGRESS.md`](PROGRESS.md)
