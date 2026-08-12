---
name: creative-direction
description: Convert an approved creative brief into a scored, retrieval-informed carousel/single-post art direction. Round-aware — refine preserves prior rounds unless a re-score threshold fires. Owns the three methods (Caption→Direction, Retrieval Analogy, Diverge-Score-Converge). Does NOT render.
---

# creative-direction

The designer's brainstorm engine. Turns `node/creative-brief.md` (+ `Ticket.md`) into
`node/creative-direction.json`: a chosen visual direction with a per-slide plan. Stops before
rendering — rendering is done by `gpt-img-2-gen` / `nano-banana-image-gen` / `html-carousel-gen`
/ `infographic` after this skill locks the direction.

## Inputs

| Param | Values |
|---|---|
| `mode` | `initial` \| `refine` |
| `ticket_path` | absolute path to `Ticket.md` |
| `creative_brief_path` | `node/creative-brief.md` |
| `creative_prompt_library_root` | `D:\1. SOLOFLOWS\BASE\BRAND KITs\1. Creative_Prompt_Template` |
| `existing_direction_path` | (refine only) `node/creative-direction.json` |
| `revision_notes` | (refine only) the answered gaps from `node/gap-request.md` |
| `output_path` | `node/creative-direction.json` |

## Method 1 — Caption → Creative Direction

Read the COMPLETE brief before evaluating any single slide. Extract the visual brief:
central message · desired audience response · audience insight · emotional tone ·
communication tension · content format + intent · visual metaphor/device · visual hierarchy +
text strategy · brand constraints + safe zones + reference assets · carousel narrative
(hook → explanation/proof → payoff → CTA).

## Method 2 — Retrieval-Guided Template Selection

**Step 2a — Niche/Pillar Gate (hard filter, run first):** Determine the ticket's own
`biz_niche` and `content_format`/pillar from Method 1's visual brief (Ticket.md's `Format`/
`Visual Type`/pillar fields map to the 36-format taxonomy in
`../../../../WORKFLOWS-BLUEPRINT.md` §3). Search `creative_prompt_library_root` for candidates
whose own `biz_niche` and `content_format` **match or are closely adjacent** to the ticket's.
Only pull candidates from this gated set into Method 3's scoring pool.

**Widen only if the gated set has fewer than 3 candidates:** relax `biz_niche` first (keep
`content_format` fixed), and only relax `content_format` too if still short of 3. `content_format`
(the pillar — Special offers, Endorsement, Brand story, etc.) determines the expressive
mechanism a template uses; two templates sharing a pillar carry comparable structure even
across different industries, whereas two templates in the same industry but a different
pillar often don't share structure at all. So cross-industry-same-pillar is the cheaper,
safer widening step; cross-pillar is the more disruptive one and should only be taken if
same-pillar candidates don't exist anywhere in the library. Record the widening as a `changed`
entry in round 1's `revision_log` (e.g. "niche gate widened: no Food & Beverage template in the
library carries the 'Special offers' pillar's ticket/voucher mechanism — widened to Fashion &
Apparel, kept content_format fixed at Special offers") so a cross-niche pick is always
traceable, never silent.

Within the gated (or widened) set, retrieve 3–5 samples by inspecting sibling `.json`
metadata, further narrowing by communication intent, visual device, palette, text density,
subject type, reference needs.

For each retrieved template, split its `prompt` JSON into two buckets — this split is what
Method 3 scores and what the final direction is built from:

- **`fixed_structure`** (must be preserved near-verbatim if this template is selected):
  composition/layout hierarchy (`composition_elements.items`, positions, item roles),
  the visual device/mechanism itself (e.g. "ticket-shaped discount panel", "seated ambassador
  portrait", "split-frame comparison"), the lighting/camera treatment pattern, and the overall
  `render_style` approach.
- **`substitutable_fields`** (must change per this ticket): subject identity/description,
  exact on-image copy/text, brand name/logo, product identity, specific numbers (price,
  discount), and `color_palette`/hex values when the template's own palette conflicts with
  this brand's palette. Templates often mark these explicitly with bracket placeholders (e.g.
  `[INSERT BRAND NAME]`) — treat any such placeholder as substitutable by definition, and use
  the same judgment for un-bracketed but clearly brand/subject-specific values.

Never reuse a retrieved template's third-party brand identity (visible logos, wordmarks,
copyrighted assets) even when substituting — those are always in `substitutable_fields`, never
`fixed_structure`.

Retrieval helper (direct filesystem glob + grep over the JSON sidecars — this is structured-metadata lookup, not prose semantic search):
```bash
find "D:/1. SOLOFLOWS/BASE/BRAND KITs/1. Creative_Prompt_Template" -iname "*.json" ! -iname "json prompt template.txt" | xargs grep -l "<content_format>\|<biz_niche>\|<visual device>"
```
Then open the top sibling `.json` files directly to read `prompt` + `reference_elements`.

## Method 3 — Score → Select (template-first)

Score each of the 3–5 **retrieved templates** (not invented ideas) on the 8-criterion rubric,
evaluating: "if we substitute this ticket's fields into this template's exact `fixed_structure`,
how well does the result perform?" Select the highest-scoring template as the direction — its
`fixed_structure` becomes the final composition, its `substitutable_fields` get this ticket's
values.

**Diverge fallback (only when no template fits):** If every retrieved template scores below
24/40 total (no reasonable analog exists in the library for this niche/format), diverge THREE
original directions that differ in visual mechanism instead, score them the same way, and
converge on the highest. Log this explicitly (see `revision_log.action: "diverged_no_template_fit"`)
so it's clear the direction did not come from library reuse.

## Scoring rubric (each 0–5, total 0–40)

message_fidelity · stop_scroll · brand_fit · carousel_continuity · platform_utility ·
rendering_feasibility · reference_readiness · distinctiveness

## mode: initial

1. Method 1 → visual brief (includes the ticket's own `biz_niche`/`content_format`).
2. Method 2 → niche/pillar-gated retrieval of 3–5 templates, widening only if the gate yields
   fewer than 3, each split into `fixed_structure` / `substitutable_fields`.
3. Method 3 → score each retrieved (gated) template (template-first); select highest, or
   diverge-fallback if none clears 24/40.
4. Write `creative-direction.json` (schema below) with `revision_log: [{round:1, action:"initial", scores:{…}}]`.

## mode: refine  (sticky-with-threshold)

Read `existing_direction_path`. Apply `revision_notes`, then:

1. Re-score the current `selected_concept` AND the other stored concepts (retrieved templates)
   against the updated brief.
2. **Switch concept** if `max(other stored concept total) − selected total ≥ 4`. (Hysteresis: small edits never flip the choice.)
3. **Full re-diverge** (or re-select among the retrieved templates) ONLY if selected
   `message_fidelity < 3/5` after re-score AND no stored concept clears step 2. If the
   requirement change is severe enough that NONE of the already-retrieved templates fit either
   (e.g. the content format itself changed), re-run Method 2 to retrieve a fresh set of 3–5
   templates before re-scoring. Log `action: "full_regen"`.
4. Otherwise keep the concept; mutate only `field_substitutions`, `slide_plan`, on-image copy,
   `reference_requirements` — never the selected template's `fixed_structure`.
5. **Preserved unless step 2/3 fires:** `retrieved_patterns` and the selected concept's
   `fixed_structure` / `design_tokens` (`palette`, `type_system`, `grid_and_safe_zone`, `recurring_motif`).
6. Append `{round:N, action:"kept"|"switched"|"full_regen", scores:{…}, changed:[…]}` to `revision_log`.

## Output schema — `node/creative-direction.json`

```json
{
  "post_summary": {"content_format":"", "biz_niche":"", "audience":"", "core_message":"", "desired_response":"", "carousel_narrative":""},
  "retrieved_patterns": [{"sample_name":"", "sample_path":"", "sample_biz_niche":"", "sample_content_format":"", "niche_gate_match":"gated|widened", "why_relevant":"", "fixed_structure":"", "substitutable_fields":[{"template_field":"", "template_value":"", "note":""}]}],
  "concepts": [{"id":"A", "source_template_path":"", "name":"", "fixed_structure_summary":"", "field_substitutions":[{"template_field":"", "template_value":"", "substituted_value":""}], "slide_plan":[{"slide":1,"role":"hook","composition":""}], "reference_requirements": [{"type":"", "name":"", "required": true}], "score":{"message_fidelity":0,"stop_scroll":0,"brand_fit":0,"carousel_continuity":0,"platform_utility":0,"rendering_feasibility":0,"reference_readiness":0,"distinctiveness":0}, "total":0}],
  "selected_concept_id": "A",
  "selection_rationale": "",
  "design_tokens": {"palette":["#"], "type_system":"", "grid_and_safe_zone":"", "recurring_motif":""},
  "revision_log": [{"round":1, "action":"initial", "scores":{}, "changed":[]}],
  "gaps_open": []
}
```

For a concept produced via the diverge fallback (no template scored ≥24/40), `source_template_path`
and `field_substitutions` are omitted/empty and `fixed_structure_summary` describes the
originally-invented mechanism instead.

`gaps_open` is a list of unresolved gap descriptions (missing copy/elements the current
`selected_concept` still needs). Both `initial` and `refine` modes must populate/update it —
empty list means no gaps remain and the designer's loop can terminate.

## Do / Don't
- DO stop at the locked direction — never render here.
- DO preserve the selected template's `fixed_structure` (composition/layout/visual device) —
  only the fields in `substitutable_fields` change.
- DO preserve `retrieved_patterns` across rounds unless a switch/regen fires.
- DON'T copy a retrieved template's visible third-party brand identity (logos, wordmarks) even
  when reusing its structure — that's always substitutable, never fixed.
- DON'T invent a new visual mechanism when a retrieved template already scores ≥24/40 — only
  the diverge fallback is allowed to originate a new mechanism.
- DON'T score a template that hasn't passed the niche/pillar gate (Method 2, Step 2a) — a
  cross-niche template only enters scoring once the gate is explicitly widened for lack of
  same-niche candidates, and that widening must be logged.
- DON'T write anywhere but `output_path` (inside `node/`).

## Graph
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Mechanic:** [[INHOUSE TEAMS/2. Production/Social Media/archive/DESIGNER-CREATIVE-DIRECTION-HANDOFF|Designer↔Creative Handoff (archived)]]
**Library:** [[BASE/BRAND KITs/BRAND-KIT-STRUCTURE|Brand Kit Structure]]
