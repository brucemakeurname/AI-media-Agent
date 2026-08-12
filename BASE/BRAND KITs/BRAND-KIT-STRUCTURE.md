# Brand Kit Structure

**Authoritative reference for `BASE/BRAND KITs/`.**

Last updated: 2026-08-11

---

## Overview

This directory contains shared, read-only prompt/template libraries and the active Ultimate Sup
retailer brand kit. Campaign deliverables never live here; save them in
`BASE/CAMPAIGNs/<campaign-slug>/`.

```text
BASE/BRAND KITs/
├── BRAND-KIT-STRUCTURE.md              # This file
├── 1. Creative_Prompt_Template/        # Read-only image prompt/reference library
│   ├── Branding/  Brand_Template/  Commercial Photo/  Infographic/  Poster/  Product/
│   └── json prompt template.txt        # Canonical JSON prompt schema
├── 2. HTML_Creative_Prompt_Template/  # Read-only HTML/HyperFrames frame library
│   ├── {preset}/FRAME.md + sample-3x4.png
│   └── HTML-CREATIVE-TEMPLATE-STRUCTURE.md
├── 3. HTML_Video_Preset/              # Read-only HTML motion-preset library
├── 4. Photoshoot_Prompt_Template/      # Shared photoshoot prompt library
├── 5. Video_Prompt_Template/          # Shared video prompt library
├── 6. Script_Template/                # Shared TVC/UGC script-reference library
└── UltimateSup/                        # Active Ultimate Sup retailer brand kit
    ├── Product/                        # Existing product packshots; do not rename or overwrite
    ├── voice/                          # Existing local voice source material
    ├── assets/                         # Logo, avatar, thumbnail, and reusable graphic assets
    ├── guidelines/                     # Retailer brand and visual guidance
    └── text/                           # Voice-style and hashtag guidance
```

---

## Shared Template Libraries

| Path | Purpose | Write Rule |
| --- | --- | --- |
| `1. Creative_Prompt_Template/` | Image layout/prompt mechanisms and paired image/JSON references. | Read-only for campaign work. Preserve each image and JSON sibling pair. |
| `2. HTML_Creative_Prompt_Template/` | Frame presets for HTML carousel creation. | Read-only for campaign work. Follow each preset's `FRAME.md`. |
| `3. HTML_Video_Preset/` | HTML motion/video preset references. | Read-only for campaign work. |
| `4. Photoshoot_Prompt_Template/` | Photoshoot references by visual genre. | Read-only for campaign work. |
| `5. Video_Prompt_Template/` | Video prompt references by production format. | Read-only for campaign work. |
| `6. Script_Template/` | Tagged TVC/UGC script references. | Add research only through the approved crawl workflow. |

Template libraries provide visual mechanisms and structure. They never provide current product
facts, prices, vouchers, free gifts, dates, claims, or publication approval.

---

## Ultimate Sup Retailer Brand Kit

Ultimate Sup is a Singapore sports-nutrition **retailer**. It is not an influencer and it is not
the manufacturer of the product brands it sells.

```text
UltimateSup/
├── README.md                       # Inventory, roles, source, and approval rules
├── Product/                        # Existing multi-brand product packshots
├── voice/                          # Existing voice references and transcript
├── assets/
│   ├── asset-manifest.json         # Source URL, capture date, status, and verification
│   ├── logo/                       # Official/candidate store marks and favicon assets
│   ├── avatar/                     # Official social-profile images
│   ├── thumbnail/                  # Historical social-thumbnail references only
│   └── elements/                   # Versioned reusable graphic elements
├── guidelines/
│   ├── Brand Guidelines.md         # Retailer identity, logo, claim, and product-brand rules
│   └── Visual Guidelines.md        # Ecommerce, social, layout, and anti-pattern rules
└── text/
    ├── voice-style.md              # Channel tone and prohibited copy patterns
    └── hashtags.md                 # Reusable channel hashtag sets
```

### Existing Ultimate Sup Template Library

`1. Creative_Prompt_Template/Brand_Template/UltimateSup/Homepage sup 8.8.26/` contains 11 paired
JPG/JSON homepage templates. Keep pairs together. They are layout references only; every visible
offer, price, gift, date, claim, SKU, and CTA inside those images is historical until separately
approved in an active ticket.

### Asset Statuses

| Status | Meaning | Publication Rule |
| --- | --- | --- |
| `APPROVED` | Brand owner has confirmed the asset for its stated use. | Use only within the approved scope. |
| `REVIEW REQUIRED` | Public-source candidate or locally created draft. | Do not publish until the brand owner approves it. |
| `HISTORICAL REFERENCE ONLY` | Existing social/template reference containing past creative. | Use for composition only; never reuse visible commercial facts. |

### Asset Rules

1. Keep `Product/` and `voice/` in place. Add versioned files; do not replace or rename existing
   source material.
2. Record every new logo, avatar, thumbnail, or reusable graphic in `assets/asset-manifest.json`
   with its source, capture date, status, and proportional verification.
3. Do not treat a public website or social capture as automatically approved. Mark it `REVIEW
   REQUIRED` until a human owner confirms it.
4. Keep the Ultimate Sup retailer mark separate from product-brand logos and product claims.
5. Product facts, prices, vouchers, gifts, dates, and availability must come from the active ticket
   and approved Singapore source—not from a template, thumbnail, or prior post.
6. Keep campaign prompts, generated assets, QA, and handoff notes under
   `BASE/CAMPAIGNs/<campaign-slug>/`, never under `UltimateSup/`.

### Reader Map

| Reader | Required Sources |
| --- | --- |
| `content-executive` | `text/`, active ticket, and approved product source. |
| `designer` | `guidelines/`, `assets/asset-manifest.json`, `Product/`, and the selected shared template. |
| `video-editor` | `voice/`, `guidelines/`, and an approved script or locked sequence. |
| `researcher` | This structure, target-library rules, and source metadata requirements. |

---

## Verification Before Handoff

- Confirm the referenced brand asset exists and matches its manifest entry.
- Confirm each public-source asset has an explicit review status.
- Confirm the product variant, product-brand identity, price, offer, and claim come from the active
  ticket and approved source.
- Confirm campaign work remains in `BASE/CAMPAIGNs/<campaign-slug>/`.

## Graph

`BASE/BRAND KITs/UltimateSup/README.md` · `BASE/CAMPAIGNs/<campaign-slug>/Ticket.md` ·
`DOCS/product/README.md`
