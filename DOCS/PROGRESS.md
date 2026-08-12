# Ultimate Sup AI Media Social — Progress

Last updated: 2026-08-11

## Current Status

| Item | Status | Evidence / Next Step |
| --- | --- | --- |
| Root instructions | Complete | `AGENTS.md` now documents the canonical multi-IP campaign hierarchy and `PRODUCTION/video_modules/`. |
| Documentation map and layout | Complete | Core files in `DOCS/` now match BASE and PRODUCTION authorities. |
| BASE storage contracts | Complete | `BASE/BASE-STRUCTURE.md` and sector structure docs define the current paths. |
| Production runtime | Complete | `PRODUCTION/AGENT.md`, goals, role adapters, skills, and video modules are documented. |
| Product knowledge source | Needs review before publication | Validate `DOCS/product/` facts against approved Singapore listings before live use. |
| Creative template library | Complete | 11 paired JPG/JSON templates exist under the Ultimate Sup template library. |

## 2026-08-11 Reorganization

- Aligned `AGENTS.md` and `DOCS/` with `BASE/BASE-STRUCTURE.md` and `CAMPAIGNs-STRUCTURE.md`.
- Documented `PRODUCTION/video_modules/`: `flowkit`, `Applio`, `hyperframes`, and `talking-head-editing`.
- Documented the self-contained production runtime: `.agents/skills/`, `.claude/agents/`, `.codex/agents/`, `goal/`, and `env.local`.
- Updated operational checklists, verification commands, and documentation graph links.

## Next Actions

1. Add explicit voice, typography, and logo-usage guidance to `BASE/BRAND KITs/UltimateSup/guidelines/`.
2. Store approved current Singapore product label/listing extracts for active SKUs.
3. Complete human review for active 8.8 campaign offers before publication.

## Graph

[`README.md`](README.md) · [`BLOCKERS.md`](BLOCKERS.md) · [`FOLDER-STRUCTURE.md`](FOLDER-STRUCTURE.md) · [`../AGENTS.md`](../AGENTS.md) · [`../PRODUCTION/AGENT.md`](../PRODUCTION/AGENT.md)

## 2026-08-12 Goal & Pipeline Alignment

- Updated `/Users/test/Documents/AI Media/Hoài Nam/INFRA/PRODUCTION/goal/[social]_[ai-ugc-short-video].md`:
  - `content-executive` owns `write-shooting-script` -> `node/shooting-script.md` AND `write-ai-ugc-video-sequence-script` -> `node/ugc-sequence-script.md`.
  - `designer` focuses strictly on visuals: reference images, Flowkit project/refs setup (`fk-create-project`, `fk-gen-refs`, `flowkit-nano-banana-image-gen`), `creative-direction` visual prompt generation, and thumbnail rendering via `acad-image-gen`.
  - `video-editor` post-production pipeline explicitly updated:
    1. Render Omni clips via Flowkit (`fk-omni-video-gen`).
    2. Mandatory Flowkit 1080p video upscale (`POST /api/flow/upscale-video`).
    3. Per-scene voice sync via Applio (`applio-brand-voice`).
    4. Concat clips, burn subtitles (`[html-video]-subtitle-burn-talking-head`), mix audio/SFX/BGM (`[html-video]-audio-mix`).
    5. Prepend rendered thumbnail as **first keyframe** (1/24s frame 0) of the final MP4.
- Synced `PRODUCTION/.claude/agents/content-executive.md`, `designer.md`, `write-ai-ugc-video-sequence-script/SKILL.md`, `AGENTS.md`, and `DOCS/`.

## 2026-08-12 Reference Prompt Chain

- Clarified the `ai-ugc-short-video` designer workflow: reference-image prompts must be formulated through `photography-direction` (or its `element-resolver` → `reference` route for face/person assets) before generating/registering assets with Flowkit.
- `creative-direction` is used for the thumbnail concept/prompt; `acad-image-gen` renders the thumbnail. It is not the source of character-reference prompts.

## 2026-08-12 UGC Realism Skill

- Pulled `tea-ugc-ai-realism` into `PRODUCTION/.agents/skills/` with its evaluation fixture.
- Added a mandatory `content-executive` pass after `write-ai-ugc-video-sequence-script`: apply relevant `tea-ugc-ai-realism` recommendations directly inside existing Part B JSON field values while preserving the Omni schema/keys, fenced blocks, scene order, timing, dialogue, claims, references, and Part A/Part C structure.
