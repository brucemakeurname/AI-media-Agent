# Ultimate Sup AI Media Social — AGENTS.md

**Auto-read by Codex when working in this directory.**

---

## What This Workspace Is

This is the AI Media Social workspace for **Ultimate Sup**, a Singapore sports-nutrition retailer. The team produces social creative, ecommerce content, livestream support material, and AI-assisted image/video assets for Singapore customers and channels such as Shopee Singapore (SGD currency).

See [`DOCS/README.md`](DOCS/README.md) for the project documentation map and current operational guides.

The current product knowledge base focuses on **Mutant Hardcore ISO Whey Protein**. Ultimate Sup is the retailer; Mutant is the product brand. Do not present this distinction incorrectly in copy or visual assets.

**Primary objective:** turn a complete campaign ticket into accurate, brand-safe, platform-ready social assets with a traceable review path.

---

## Workspace Structure

```text
.
├── AGENTS.md                  # Workspace-wide Codex project instructions
├── BASE/                       # Source library, strategy workspace, and campaign storage
│   ├── BASE-STRUCTURE.md       # Read before touching a BASE sector
│   ├── BRAND KITs/             # Read-only source library for normal production work
│   │   ├── BRAND-KIT-STRUCTURE.md
│   │   ├── 1. Creative_Prompt_Template/      # Image prompt and reference library
│   │   ├── 2. HTML_Creative_Prompt_Template/ # HTML/HyperFrames frame presets
│   │   ├── 3. HTML_Video_Preset/             # HTML motion presets
│   │   ├── 4. Photoshoot_Prompt_Template/    # Photoshoot references
│   │   ├── 5. Video_Prompt_Template/         # Video prompt references
│   │   ├── 6. Script_Template/               # TVC/UGC script references
│   │   └── UltimateSup/                      # Active retailer kit: assets, voice, guidance
│   ├── CAMPAIGNs/              # Canonical social-media production library
│   │   ├── CAMPAIGNs-STRUCTURE.md
│   │   ├── [IP] Campaign/[Platform]/[Format]/[Date Folder]/
│   │   │   ├── Ticket.md       # Approved brief and acceptance criteria
│   │   │   ├── manifest.json   # Written last; delivery/review status
│   │   │   ├── caption.md      # Final caption, when applicable
│   │   │   ├── [final files]   # Final .jpg/.png/.mp4 deliverables
│   │   │   └── node/           # Prompts, drafts, QA, logs, and handoffs
│   │   └── archived/           # Completed historical records
│   └── STRATEGIES/             # Marketing strategy and ticket-staging workspace
├── DOCS/
│   ├── README.md              # Documentation map
│   ├── ARCHITECTURE.md        # Architecture decisions
│   ├── FOLDER-STRUCTURE.md    # Folder layout & skill/agent inventory
│   ├── QUICK-REFERENCE.md     # Intake & verification checklist
│   ├── PROGRESS.md            # Rolling project status
│   ├── BLOCKERS.md            # Active blockers and owner actions
│   └── product/               # Product knowledge & claim governance
├── .agents/
│   └── skills/                 # Shared project skills (canonical)
├── .claude/
│   ├── agents/                 # Canonical Markdown agent profiles
│   └── skills -> ../.agents/skills  # Symlink to shared skills
├── .codex/
│   └── agents/                 # Native Codex subagent definitions (TOML)
├── PRODUCTION/                 # Self-contained production runtime
│   ├── AGENT.md                # Production runtime authority
│   ├── CLAUDE.md               # Delegates to AGENT.md
│   ├── .agents/skills/         # Production skills
│   ├── .claude/agents/         # Claude role definitions
│   ├── .codex/agents/          # Codex role adapters
│   ├── video_modules/          # Local video applications
│   │   ├── flowkit/            # Follow its nested AGENTS.md and CLAUDE.md
│   │   ├── Applio/             # Voice conversion; nested Git repository
│   │   ├── hyperframes/        # Programmatic video composition
│   │   └── talking-head-editing/ # Talking-head editing pipeline
│   ├── goal/                   # Goal files and workflow triggers
│   ├── env.local               # Local credentials; never expose values
│   └── .gitignore              # Production runtime ignore rules
└── DOCS/                       # Workspace documentation and claim governance
```

### Sources of Truth

Use these sources in this order. When they conflict, stop and flag the conflict rather than silently choosing one.

1. The current campaign `Ticket.md`, including its approved product, SKU/flavour, platform, offer, language, and CTA.
2. The current on-pack label, approved Singapore listing, and written approval from the product owner.
3. Product documentation in [`DOCS/product/`](DOCS/product/README.md).
4. Brand assets and creative references in `BASE/BRAND KITs/1. Creative_Prompt_Template/`.
5. Public research, limited to research deliverables or creative inspiration; never use it to invent product facts or claims.

See [`DOCS/FOLDER-STRUCTURE.md`](DOCS/FOLDER-STRUCTURE.md) for detailed layout and configuration rules.

Use `BASE/BRAND KITs/UltimateSup/` for Ultimate Sup assets, guidance, and voice. Use `BASE/BRAND KITs/1. Creative_Prompt_Template/` for reusable image prompt mechanisms and layouts. `cocoon VN/` is a cross-brand format/reference library only: never reuse its logo, products, pricing, claims, colours, or voice for Ultimate Sup.

The `BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/UltimateSup/Homepage sup 8.8.26/` library contains 11 paired JPG/JSON homepage templates. Select a matching pair by semantic filename; preserve its fixed layout, attach every required `REF_*` asset, and replace only documented `{{...}}` fields with current approved campaign data. Existing text, prices, vouchers, gifts, campaign dates, and claims inside reference images are historical visual examples, never current campaign facts. Generate the visual composition with the template, then set exact campaign copy, pricing, and offer text in post-production and verify it against the ticket.

### BASE Storage Contract

- Treat `BASE/BRAND KITs/` as a source library. Read its packshots, logos, templates, and references; do not overwrite, rename, or place campaign outputs there unless the user explicitly requests a brand-kit update.
- For new social-media work, use `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/` exactly as defined in `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md` (AI Media output defaults to `UltimateSup Plus Campaign` unless specified otherwise). Do not create a root-level `campaign/` folder or a new flat campaign-slug folder.
- Start each production unit with `Ticket.md`. Keep only final deliverables, `caption.md` when applicable, and `manifest.json` at the unit root; store prompts, source maps, generation logs, QA, drafts, and handoffs in `node/`.
- Use the scheduled publish date for `[Date Folder]`, otherwise the creation date. Use `YYYY-MM-DD-2`, then `YYYY-MM-DD-3` for independent same-day units. Never overwrite an approved output; create a new revision unit and update `manifest.json`.
- `PRODUCTION/env.local` is a local credential file. It may be sourced only to run an explicitly requested approved tool; never print, copy, commit, upload, or document its secret values.

---

## Strict Rules

### Rule 1: Think Before Producing

- Restate the deliverable, target platform, intended audience, and acceptance criteria before a multi-step task.
- Surface missing information and consequential assumptions. Do not silently infer SKU, flavour, price, product size, promotion, claim, or approval status.
- Prefer the smallest workflow that produces the requested asset. Do not create a pipeline, dashboard, or template unless asked.

### Rule 2: Never Expose Sensitive Data

- Never commit or paste API keys, passwords, cookies, private Notion data, customer information, or unpublished commercial terms.
- Keep local credentials in ignored configuration files only.
- Do not upload internal product documents, source assets, customer data, or private campaign briefs to an external service unless the task explicitly requires it and access is approved.

### Rule 3: Singapore Market Is Mandatory

- Use **Singapore**, **SGD**, **Shopee Singapore / shopee.sg**, and local audience context for retail, pricing, availability, competitor, logistics, and CTA content.
- Do not use Vietnam marketplace examples, VND pricing, or Vietnam-specific regulation unless the ticket explicitly targets Vietnam.
- Audience-facing language follows `Ticket.md`. For Singapore social content, use English or approved Singlish when requested; use Vietnamese only when the brief explicitly calls for it.

### Rule 4: Product-Claim Safety

- Only state nutritional values, ingredient facts, certifications, comparisons, or efficacy claims that are supported by the current approved source.
- Do not claim that a supplement cures, treats, prevents, diagnoses, or guarantees an outcome for a condition. Do not claim "no side effects", "safe for everyone", "HSA approved", "clinically proven", or a guaranteed body/skin result without approved evidence and review.
- Do not turn customer anecdotes into universal outcomes. Testimonials must be genuine, approved, and clearly attributable.
- Keep comparative copy factual and fair. Never state that a competitor "fails", is unsafe, or causes an outcome without substantiated, approved evidence.
- If a creative angle is persuasive but its claim status is unclear, mark it **REVIEW REQUIRED** and propose a claim-safe alternative.

### Rule 5: Evidence Before Copy

- `DOCS/product/` is a working knowledge base, not a blanket publication license. Verify any claim against the current label/listing and campaign approval before publishing.
- For Mutant Hardcore ISO, use the approved product sheet for supported angles such as protein composition, digestion positioning, value, flavour, mixing, and intended-use guidance. Do not add health, acne, lactose-intolerance, absorption-speed, or certification claims beyond the approved wording.
- Preserve exact units, serving sizes, currencies, flavour names, offer dates, and price conditions from the source ticket or approved listing.

### Rule 6: Role Boundaries & Handoffs

- Use the production roles only for their assigned scope:
  - `content-executive`: caption, creative brief, script, and copy-gap resolution.
  - `designer`: visual direction, image/carousel production, thumbnail work, reference resolution, and visual QA.
  - `video-editor`: approved-script/sequence production, scene rendering, final edit, and video QA.
  - `researcher`: reference-library and competitor/template research, not final campaign copy.
  - `notion-publisher`: approved final assets and `manifest.json` only.
- Keep handoff artifacts in the active production unit's `node/`. Never delete an earlier feedback round; append a clearly named new round instead.
- Do not publish, submit to approval, or update a live listing unless the ticket explicitly authorizes the action.

### Rule 7: Simple, Surgical Changes

- Touch only the files needed for the active task. Do not refactor unrelated assets, rewrite adjacent agent instructions, or reorganize a library without approval.
- Prefer existing skills in `PRODUCTION/.agents/skills/` over new scripts or dependencies. Use root `.agents/skills/` only when the active production goal or role explicitly requires it.
- Prefer standard libraries and native platform tools before adding dependencies.
- When a deliberate temporary simplification has a known ceiling, add one `ponytail:` comment naming the ceiling and upgrade condition.

### Rule 8: Reproducible Work

- Use descriptive, stable filenames. Keep editable source, generated output, and review notes separate.
- Do not overwrite an approved asset. Create a new version or obtain explicit approval first.
- Leave one proportional verification step: validate file existence/format for asset work; run the narrowest relevant check for code or automation work.
- Report the asset path, what was verified, and any unresolved review/compliance item at handoff.

---

## Ticket Workflow

### Intake Checklist

Before producing, confirm that `Ticket.md` identifies:

- Product/SKU, flavour/variant, and approved factual source.
- Channel and format (TikTok, Shopee, Instagram, livestream, carousel, short video, etc.).
- Target persona, desired response, CTA, language, and deadline.
- Offer/price/date details, if any.
- Available brand assets and whether a human/compliance review is required.

If a required item is missing, ask one focused question or record an explicit assumption that is safe to reverse.

### Image-Led Pipeline

1. `content-executive` creates `caption.md` and `node/creative-brief.md`.
2. `designer` resolves gaps through `node/gap-request.md`, then produces visual deliverables and QA.
3. `notion-publisher` publishes only approved final assets and writes `manifest.json`.

### Video-Led Pipeline

1. `content-executive` creates `script.md`; for AI commercial video, create `node/shooting-script.md` when the role profile requires it.
2. `designer` creates the thumbnail and/or approved sequence direction when needed.
3. `video-editor` renders, edits, and verifies the final video from the approved script or locked sequence.
4. `notion-publisher` handles the approved final handoff.

### Research Pipeline

1. `researcher` defines the research question, source scope, output location, and tags before crawling.
2. Keep source URLs, collection date, and observed facts with the research output.
3. Treat external ads, reviews, and competitor copy as inspiration or evidence to review—not as permission to reuse claims or creative.

---

## Creative & Brand Guidelines

- Lead with a real customer tension, then connect it to one supported product angle and one clear CTA.
- Match the channel: social hooks may be conversational; product facts and offer conditions must remain precise.
- Do not manufacture reviews, ratings, customer photos, influencer endorsements, scarcity, or price discounts.
- Avoid exaggerated male-body, shame, fear, or medicalized acne/digestion messaging. Reframe to an approved, respectful performance or product-experience angle.
- Ensure every rendered asset has legible text, correct product/variant, approved logo treatment, and no misleading before/after implication.
- Before delivery, check spelling, numerical accuracy, safe-area/crop fit, CTA, brand voice, and claim safety.

---

## Tool & Skill Use

- Read the relevant `PRODUCTION/.agents/skills/<skill-name>/SKILL.md` before using a production skill.
- Reuse existing skills such as `creative-direction`, `photography-direction`, `html-carousel-gen`, `write-shooting-script`, `write-ai-ugc-video-sequence-script`, `tea-ugc-ai-realism`, `gemini-omni-video-gen`, `gemini-veo-3.1-video-gen`, `notion-upload`, and `wiki-query` when applicable.
- Use `researcher` plus the crawler skills for new template/reference library work; do not make ad-library data a direct product claim source.
- For final video, preserve the approved scene order and retain source metadata needed for traceability.

---

## Definition of Done

An output is complete only when it:

- Matches the ticket's channel, audience, product variant, language, and CTA.
- Uses approved and traceable claims only.
- Is saved in the canonical `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/` unit without overwriting approved work.
- Has passed the proportional visual, technical, and factual checks for its format.
- Includes a concise handoff note naming deliverables, verification performed, and remaining review requirements.

---

## Operational Documentation Links

- [`DOCS/README.md`](DOCS/README.md): main index for durable workspace documentation.
- [`DOCS/ARCHITECTURE.md`](DOCS/ARCHITECTURE.md): durable decisions on scope, approval gates, role topology, and claim governance.
- [`DOCS/FOLDER-STRUCTURE.md`](DOCS/FOLDER-STRUCTURE.md): detailed layout, ownership, precedence, agent adapters, and skill inventory.
- [`DOCS/QUICK-REFERENCE.md`](DOCS/QUICK-REFERENCE.md): pre-flight intake checklist, claim-safety shortcut, and handoff rules.
- [`DOCS/PROGRESS.md`](DOCS/PROGRESS.md): current rolling implementation status and next steps.
- [`DOCS/BLOCKERS.md`](DOCS/BLOCKERS.md): active blockers and owner actions.
- [`DOCS/product/README.md`](DOCS/product/README.md): product knowledge scope, publication rules, and claim guardrails.

---

## Quick Commands

```bash
# Check workspace, BASE, and production instructions
ls -la AGENTS.md BASE/BASE-STRUCTURE.md BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md PRODUCTION/AGENT.md PRODUCTION/CLAUDE.md

# Check production skills and video modules
find PRODUCTION/.agents/skills -mindepth 1 -maxdepth 1 -type d | sort
find PRODUCTION/video_modules -mindepth 1 -maxdepth 1 -type d | sort

# Check local documentation structure
find DOCS -maxdepth 2 -not -name '.DS_Store' | sort
```
