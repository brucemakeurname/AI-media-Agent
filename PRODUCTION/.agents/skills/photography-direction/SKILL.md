---
name: photography-direction
description: Convert an approved creative brief into a scored, retrieval-informed human/vibe-led photography direction (standalone mode), or resolve a single face/person reference asset (reference mode). Round-aware in standalone mode — refine preserves prior rounds unless a re-score threshold fires. Renders via nano-banana-image-gen. Does NOT handle non-human creative concepts — that is creative-direction.
---

# photography-direction

The designer's photography engine — the human/vibe counterpart to `creative-direction`.
Two modes:

- `standalone` — turns `node/creative-brief.md` (+ `Ticket.md`) into
  `node/photography-direction.json`: a chosen photography direction
  (styling/setting/lighting/composition), then renders finals to the campaign root via
  `nano-banana-image-gen`. Used when a post's imagery sells on vibe and human authenticity
  rather than a visual concept — luxury fashion, high-end sport, lifestyle, editorial portraits.
- `reference` — single-pass, no scoring: generates ONE face/person reference image into
  `node/elements/` for another pipeline. Called by `element-resolver`, never by the designer.

Photography is separated from `creative-direction` because gpt-image-2 renders Vietnamese /
human faces stiffly (stiff, soulless, not soft). This skill routes human imagery through
`nano-banana-image-gen` (Pro model — holds face geometry) and scores on vibe/realism, not
message/metaphor.

## Library

`D:\1. SOLOFLOWS\BASE\BRAND KITs\2. Photoshoot_Prompt_Template` — stills only. The `video/`
subfolder (cinematic / fashion-style / tvc-style / ugc-style) is OUT of scope.

Collections (the folder path is the `group` field in each JSON):
```
industry/campaign-key-visual [d]/   industry/lookbook-line-sheet [d]/
industry/pr-press-kit [d]/          industry/social-content [d]/
indie/abstract [d]/                 indie/analog-vintage [d]/
indie/enegy-lifestyle [d]/          indie/environment-atmospheric [d]/
indie/low-fi-dreamy [d]/            indie/moody-portrait [d]/  (nested: intimate-closeup/, outdoor-editorial/, urban-night/)
indie/noir-dark [d]/
ugc/casual-everyday [d]/            ugc/lifestyle-moment [d]/
ugc/selfie-pov/                     ugc/viral-trending/
```

Sample schema — the `prompt` sub-object is the same reverse-prompt shape as
Creative_Prompt_Template; only the top-level metadata differs
(`image_type`/`image_vibe`/`image_purpose`/`policy_review` instead of
`biz_niche`/`content_format`, and `tag` is an array):
```json
{
  "name": "", "tag": ["adult-woman","minimalism"], "image_type": "", "image_vibe": "",
  "image_purpose": "", "group": "indie/abstract", "source_url": "",
  "policy_review": {"status": "pass|remediated", "changes": []},
  "prompt": {
    "project_info": {"theme": "", "color_palette": "", "format": ""},
    "main_subject": {"type": "", "detail": "", "style": ""},
    "composition_elements": {"text": "", "items": []},
    "lighting_and_atmosphere": {"type": "", "effect": ""},
    "technical_specs": {"render_style": "", "resolution": ""},
    "generated_prompt_string": "", "negative_prompt": "",
    "reference_elements": {"assets": [{"type": "", "name": "", "required": false, "source": "", "usage": ""}], "prompt_instructions": ""}
  }
}
```

## Inputs

| Param | Values |
|---|---|
| `mode` | `standalone` \| `reference` |
| `ticket_path` | absolute path to `Ticket.md` |
| `creative_brief_path` | `node/creative-brief.md` (standalone) |
| `photography_prompt_library_root` | `D:\1. SOLOFLOWS\BASE\BRAND KITs\2. Photoshoot_Prompt_Template` |
| `element_request` | (reference only) `{type, name}` from the triggering `reference_requirements` item |
| `existing_direction_path` | (standalone refine only) `node/photography-direction.json` |
| `revision_notes` | (standalone refine only) the answered gaps from `node/gap-request.md` |
| `output_path` | `node/photography-direction.json` (standalone) or `node/elements/<slug>.png` + an `elements.json` entry (reference) |

## Retrieval helper

Grep `tag` + `image_vibe`/`image_type` (this library has no `content_format`/`biz_niche`), and
prune the out-of-scope `video/` subtree:
```bash
find "D:/1. SOLOFLOWS/BASE/BRAND KITs/2. Photoshoot_Prompt_Template" -path "*/video/*" -prune -o -iname "*.json" -print | xargs grep -l "<tag_or_vibe>"
```
Then open the matched `.json` files and read the `prompt` object plus
`image_vibe`/`image_type`/`policy_review`. Carry each match's `policy_review.changes` forward
as a remediation precedent — if a prior sample needed a fix (e.g., clarifying that subjects are
adults), apply the same clarification proactively rather than rediscovering it.

## Scoring rubric — `standalone` only (each 0–5, total 0–40)

vibe_authenticity · styling_accuracy · human_realism · mood_coherence · brand_fit ·
platform_utility · rendering_feasibility · reference_readiness

## mode: standalone

1. Method 1 — brief → photography direction: subject, wardrobe/styling, setting, mood,
   lighting, composition, brand constraints. NOT central-message / visual-metaphor — that is
   `creative-direction`'s job.
2. Method 2 — retrieve 3–5 samples by `tag`, `image_vibe`/`image_type`, and `group` folder;
   record patterns to adapt (styling, lighting setup, composition) and patterns NOT to copy
   (a real person's identity, third-party brand marks). Apply `policy_review` precedents.
3. Method 3 — diverge 3 directions that differ in styling/setting/lighting *mechanism* (not
   just color/subject), score each on the rubric above, converge on the highest.
4. Write `node/photography-direction.json` (schema below) with
   `revision_log: [{round:1, action:"initial", scores:{…}}]`.
5. Render the selected direction via `nano-banana-image-gen` (Pro model — face-geometry
   fidelity over Flash) to the campaign root. Image 1 first, then pass it as reference for
   subsequent images so the set stays coherent.

## mode: standalone → refine  (sticky-with-threshold — identical algorithm to creative-direction)

Read `existing_direction_path`. Apply `revision_notes`, then:

1. Re-score the current `selected_concept` AND the other stored concepts against the updated brief.
2. **Switch concept** if `max(other stored concept total) − selected total ≥ 4`. (Hysteresis:
   small edits never flip the choice.)
3. **Full re-diverge** (3 fresh concepts) ONLY if selected `vibe_authenticity < 3/5` after
   re-score AND no stored concept clears step 2. Log `action: "full_regen"`.
4. Otherwise keep the concept; mutate only `styling` / `setting` / `lighting` / `composition`,
   on-image copy, and `reference_requirements`.
5. **Preserved unless step 2/3 fires:** `retrieved_patterns` and the selected concept's
   `design_tokens`.
6. Append `{round:N, action:"kept"|"switched"|"full_regen", scores:{…}, changed:[…]}` to
   `revision_log`.
7. Update `gaps_open` — an empty list means no gaps remain and the designer's loop can terminate.

## Output schema — `node/photography-direction.json`

```json
{
  "post_summary": {"content_format":"", "biz_niche":"", "audience":"", "vibe":"", "desired_response":""},
  "retrieved_patterns": [{"sample_name":"", "sample_path":"", "why_relevant":"", "patterns_to_adapt":[], "patterns_not_to_copy":[]}],
  "concepts": [{"id":"A", "name":"", "styling":"", "setting":"", "lighting":"", "composition":"", "reference_requirements": [{"type":"", "name":"", "required": true}], "score":{"vibe_authenticity":0,"styling_accuracy":0,"human_realism":0,"mood_coherence":0,"brand_fit":0,"platform_utility":0,"rendering_feasibility":0,"reference_readiness":0}, "total":0}],
  "selected_concept_id": "A",
  "selection_rationale": "",
  "design_tokens": {"palette":["#"], "styling_language":"", "lighting_language":""},
  "revision_log": [{"round":1, "action":"initial", "scores":{}, "changed":[]}],
  "gaps_open": []
}
```

## mode: reference  (single-pass, no scoring, no round loop)

Never called by the designer directly — only by `element-resolver` when an unresolved
`reference_requirements` item has `type` = `face` or `person`.

1. Read `element_request.type` / `.name` + brand voice; determine subject, styling, and pose
   only (no full brief, no `photography-direction.json`).
2. Retrieve the single best-fit sample by `tag` / `image_vibe` / `group`.
3. Generate ONE image via `nano-banana-image-gen` (Pro — face-geometry consistency) into
   `node/elements/<slug>.png`.
4. Record provenance in `node/elements/elements.json` (same shape `element-resolver` writes:
   `{"type","name","required","path","provenance":"generated","source"}`) and return the path.

## Do / Don't
- DO stop at the locked direction in `standalone` before rendering finals — render only the
  converged concept, never all three.
- DO use nano-banana Pro for faces; Flash only if the brief explicitly wants raw UGC texture.
- DO preserve `retrieved_patterns` across rounds unless a switch/regen fires.
- DON'T copy a real person's identity or a third-party brand mark from a library sample.
- DON'T score in `reference` mode — it is single-pass.
- DON'T write anywhere but `output_path` (inside `node/`, or the campaign root for standalone finals).

## Graph
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Mechanic:** [[INHOUSE TEAMS/2. Production/Social Media/archive/DESIGNER-CREATIVE-DIRECTION-HANDOFF|Designer↔Creative Handoff (archived)]]
**Sibling:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]]
**Consumer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/element-resolver/SKILL|element-resolver]]
**Library:** [[BASE/BRAND KITs/BRAND-KIT-STRUCTURE|Brand Kit Structure]]
