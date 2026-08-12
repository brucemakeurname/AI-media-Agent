---
name: element-resolver
description: Resolve a reference asset (logo, product, face, icon, background, motif) needed for an image prompt — retrieve it from the Brand Kit / Creative library, or generate it if missing, saving to node/elements/ and returning path + provenance.
---

# element-resolver

Called by the designer once per `reference_requirements[]` entry marked `required: true`
(the field lives on each concept in `creative-direction.json`, shape `{type, name, required}`),
before writing image prompts. Keeps the render step supplied with real asset paths.

## resolve_element(type, name, brand)

1. **Search** (retrieve first):
   - `BASE/BRAND KITs/[brand]_Brand_Kit/assets/images/{face,outfits,locations,props}/`
   - `BASE/BRAND KITs/1. Creative_Prompt_Template/*/` reference images
   ```bash
   find "D:/1. SOLOFLOWS/BASE/BRAND KITs/[brand]_Brand_Kit/assets/images" -iname "*<name>*"
   find "D:/1. SOLOFLOWS/BASE/BRAND KITs/1. Creative_Prompt_Template" -iname "*<name>*.json"
   ```
   Inspect any match's filename/sibling `.json` tags before accepting — a keyword substring hit is not automatically a genuine match for `type`/`name`/`brand`; if the closest hit doesn't actually match, treat as Missing.
2. **Found** → copy nothing; return the absolute source path.
3. **Missing** → generate and save into `node/elements/`, branching on `type`:
   - **`type` is `face` or `person`** → call the `photography-direction` skill in `reference`
     mode (`mode: reference`, `element_request: {type, name}`). It renders one human reference
     via `nano-banana-image-gen` (Pro) into `node/elements/<slug>.png` and records its own
     provenance. This is the path that gives Vietnamese / human faces the softness gpt-image-2
     misses — do NOT fall back to a bare gpt-image-2 call for faces.
   - **any other `type`** (logo, product, icon, background, motif, wardrobe, location) →
     generate directly:
     ```bash
     python "../gpt-img-2-gen/clients/openai_gpt_image.py" --prompt "<element prompt>" --output "<output_dir>/node/elements/<slug>.png" --size 1024x1024
     ```
     Use `nano-banana-image-gen` instead when a non-face element still needs
     character-consistent rendering. These are reference images, never the campaign-root final,
     so the platform resolution floor in `TOOL-ROUTING-CLI-VS-API.md` doesn't apply — a nested
     `agy`/`codex` CLI session (1K) is an equally valid way to generate them.
4. **Record** provenance in `node/elements/elements.json` and return it — only for the
   direct-generate branch (any `type` other than `face`/`person`). The face/person branch
   already had its provenance recorded by `photography-direction` in step 3; don't write a
   second entry for it.
   ```json
   {"type":"product","name":"","required":true,"path":"","provenance":"retrieved|generated","source":""}
   ```

## Rules
- Retrieve before generate — never regenerate an asset that already exists in the Brand Kit.
- Write generated assets ONLY to `{output_dir}/node/elements/` — never the campaign root, never the Brand Kit.
- No external/third-party brand assets unless supplied by the campaign (`Ticket.md`).
- Fail loud: if generation returns no file, stop and report the full client error.
- If the retrieve step itself errors (bad path, filesystem error), fail loud the same way — report what was searched, what failed, and that generation should not proceed blindly.

## Graph
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Consumers:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]]
**Delegates to:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/photography-direction/SKILL|photography-direction]] (face/person elements)
