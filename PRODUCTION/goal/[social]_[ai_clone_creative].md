---
id: "[social]_[ai_clone_creative]"
studio: social-media
visual_type: ai-clone-creative
structural_fidelity_target: 9/10
format_allow: [ask-me-anything, before-after, behind-the-scenes, brand-story, case-studies, challenge, competitions, endorsement, free-trials, fun-facts, gifs-memes, industry-news, infographics, interviews, introduce-team, lifestyle-content, newsletter, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, social-cause, special-offers, testimonials, tip-of-the-day, tutorials]
tool_routing:
  text: { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese rewrite pass" }
  image: { platform: social, mechanism: "designer reverse-prompts supplied reference creative, adapts its structure to the approved brand/product brief, then renders via acad-image-gen" }
primary_skills: [wiki-query, creative-direction, photography-direction, element-resolver, acad-image-gen, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "AI CLONE CREATIVE"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline, reference_images]
output_dir: BASE/CAMPAIGNs/{ip_campaign}/{platform}/{format}/{date}/  # = {{campaign_folder}}
  # {ip_campaign} = existing IP folder under BASE/CAMPAIGNs/; default "UltimateSup Plus Campaign"
  #                 unless the ticket specifies another IP.
  # {platform}    = exact platform folder: Facebook, Instagram, or TikTok.
  # {format}      = exact platform format folder from CAMPAIGNs-STRUCTURE.md.
  # {date}        = YYYY-MM-DD from Posts·Date; suffix -2/-3 for independent same-day units.
  # Full convention: BASE/BASE-STRUCTURE.md + BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md.
brand_template_root: BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/{brand}/
reverse_prompt_template: BASE/BRAND KITs/1. Creative_Prompt_Template/json prompt template.txt
done_when: "adapted image in {{campaign_folder}}/ + reusable reference image and template JSON in {{brand_template_dir}}/ + Post THUMBNAIL set + Post Message/Headline set + manifest.json in {{campaign_folder}}/ + Post Status = 'Submit to Review'"
status: active
---

# ai-clone-creative

Creates a new social image by studying a supplied reference creative, preserving its useful
visual mechanism while replacing its brand, product, copy, claims, colours, and other brand-owned
elements with approved ticket data. This is adaptation, not pixel-copying, logo reuse, or an
unapproved competitor claim transfer.

## Prompt

> Fill every `{{placeholder}}` from Notion and the dispatch input. `{{reference_images}}` may be
> local files, public URLs, or downloaded Notion attachments. Resolve every input to a local file
> before reverse-prompting.

```text
This is a {{format}} post for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign
{{campaign_link}}. Topic: {{topic}}. The supplied reference creative(s) are to be adapted into
one original, brand-safe social creative for our approved product and Singapore audience.

For every supplied reference, target **9/10 structural fidelity**. Preserve the reference's
canvas/aspect ratio, crop, major region proportions, element count, relative positions, visual
hierarchy, depth order, lighting direction, blur level, and graphic rhythm. Do not settle for a
generic recreation of its mood. Before rendering, write a measurable structure map with normalized
coordinates (0.0–1.0) for each major element and use it as a hard layout constraint:

- Canvas: match the reference pixel ratio and safe-area logic.
- Upper zone: preserve the logo/identity zone, headline zone, headline scale, line count, and
  center alignment or offset.
- Middle zone: preserve the offer/secondary-copy zone, badge/ribbon treatment, and whitespace
  relationships.
- Lower zone: preserve the hero visual's horizontal span, overlap order, crop, foreground scale,
  and bottom branding/footer zone.
- Background: preserve the setting category, green palette family, depth-blurred background,
  light falloff, and edge framing devices. Retain the same number and approximate placement of
  non-brand decorative elements (for example corner objects or ribbons), replacing only their
  identity when required.
- Typography: preserve the reference's dimensional treatment, weight contrast, shadow/outline,
  line breaks, relative size, and text block footprint; replace wording with approved ticket text.

The final image must score at least 9/10 on composition/layout, hierarchy, background/colour,
typography treatment, lighting/depth, and subject arrangement when compared side by side with the
reference. Brand adaptation is scored separately: no third-party logo, product, person identity,
price, offer, date, claim, or copy may remain. If structural fidelity is below 9/10, create a new
revision rather than declaring the unit complete.

content-executive (runs first): use /wiki-query for the brand's writing style, then draft a
caption highlighting the core message {{post_message}}, slogan {{slogan}}, big idea {{big_idea}},
and headline/hook {{headline_hook}}. Take the mandatory Vietnamese quality pass through a nested
`agy --dangerously-skip-permissions` session before treating any draft as final. Save the finished
caption to {{campaign_folder}}/caption.md and write {{campaign_folder}}/node/creative-brief.md with
the approved message, desired response, on-image copy, product facts, CTA, and open design questions.

reference-ingestion (runs before design):
1. Resolve all {{reference_images}} inputs and download each reference image to
   {{brand_template_dir}}/ using a descriptive stable filename. Do not save credentials, cookies,
   signed URLs, or private tokens.
2. Inspect the image for composition, hierarchy, typography, lighting, subject arrangement,
   background, props, crop, aspect ratio, and visible text. Treat external logos, products,
   people, prices, claims, and copy as reference-only material, never as approved facts.
3. Reverse-prompt each image using
   {{reverse_prompt_template}}. Write a complete JSON object matching the schema and extensibility
   pattern of the Badass reference template: top-level name/tag/biz_niche/content_format/group/
   prompt; prompt includes project_info, main_subject, composition_elements with type/text/items,
   lighting_and_atmosphere, technical_specs, reference_elements with assets and prompt_instructions,
   generated_prompt_string, and negative_prompt. Keep descriptive arrays and reference asset
   metadata extensible; do not collapse the composition into a single prose field.
4. Save the JSON beside its source image in {{brand_template_dir}}/ with the same stable basename.
   Validate that it is parseable JSON and that the image/JSON pair is discoverable by filename.

designer (runs after reference-ingestion): read {{campaign_folder}}/node/creative-brief.md and
the reverse-prompt JSON pair. Run `creative-direction` (mode: initial), using the reverse-prompt
as a structural reference, then run `photography-direction` when the selected direction is
human/vibe-led. Resolve required product/logo/brand elements via `element-resolver` and read the
active brand guidance from BASE/BRAND KITs/UltimateSup/ plus any approved brand kit for {{brand}}.

Adapt the reference JSON before rendering:
- Preserve only the reusable visual mechanism: composition logic, framing, hierarchy, lighting
  pattern, and useful prop/device relationships.
- Replace brand identity, logo, product, packshot, people, exact copy, prices, vouchers, dates,
  claims, colours, typography, and CTA with approved ticket and brand-guideline values.
- Never reproduce a third-party logo, wordmark, product pack, person identity, watermark, or
  unverifiable claim. If the reference depends on one, replace it with an approved equivalent and
  record the change in {{campaign_folder}}/node/clone-adaptation.md.
- Keep the final prompt JSON complete and reusable; record fixed_structure, replaced elements,
  approved substitutions, and unresolved gaps in {{campaign_folder}}/node/clone-adaptation.md.

Render the adapted creative with `acad-image-gen` using the approved aspect ratio and exact
on-image copy. Pass the reference image as the **primary** image reference and the approved
product/logo as secondary references. In the generation prompt, repeat the structure map and say
that layout fidelity outranks stylistic improvisation. Save the final image directly under
{{campaign_folder}}/ (root, not node/) and save
the submitted prompt, local references, source JSON path, and generation result in
{{campaign_folder}}/node/images-prompts.md. Do not use a direct Google image API.

Benchmarks — all must hold before this ticket is done: caption passed the quality check; the
reference image and reverse-prompt JSON are saved as a reusable pair in {{brand_template_dir}}/;
the final image achieves the 9/10 structural-fidelity target using the side-by-side scorecard and
clearly uses the reference's approved structural inspiration but is adapted to
{{brand}}, the approved product, Singapore audience, brand guideline, and ticket copy; exact copy
is legible in the safe zone; product/variant, offer, price, date, CTA, and claims are accurate;
no prohibited, misleading, copyrighted, or third-party brand marks remain.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags -> "Hashtag",
final image -> "THUMBNAIL". Write {{campaign_folder}}/manifest.json last, only after the image,
reference pair, QA notes, and all factual checks pass.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping

Use the same Post and Campaign mapping as `[social]_[single-static].md`:

- Read `{{format}}`, `{{channel}}`, `{{brand}}`, `{{pillar}}`, `{{topic}}`, `{{post_message}}`,
  `{{headline_hook}}`, `{{language}}`, `{{deadline}}`, and `Date` from the Post.
- Resolve `{{slogan}}`, `{{big_idea}}`, and `{{campaign_link}}` through the
  `Social Media Campaigns` relation when required.
- `{{notion_page_id}}`, `{{campaign_folder}}`, and `{{reference_images}}` are dispatch/local inputs,
  not Notion columns. `{{brand_template_dir}}` resolves to
  `BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/{brand}/`.

**Write back (notion-upload → the Post page):**

| Artifact | Posts · field | Type |
|---|---|---|
| caption body | `Post Message` | text |
| headline/hook | `Headline/Hook` | text |
| hashtags | `Hashtag` | text |
| final image | `THUMBNAIL` | file |
| completion | `Status` = **`Submit to Review`** | select |

## Notes

- Create `{{brand_template_dir}}` only when that brand folder does not already exist. Never overwrite
  an existing reference/JSON pair; add a revision suffix or a new stable basename.
- The brand-template library is a reusable source library. Keep the downloaded reference image and
  reverse-prompt JSON together; do not place campaign outputs there.
- If the reference is a private attachment, use the approved local download path and do not expose
  its URL or metadata outside the workspace.
- A reference creative does not authorize its visible offer, product fact, claim, price, date,
  testimonial, or endorsement. Verify every publishable value against the active Ticket.md and the
  approved brand/product source.
- If a required product, logo, brand guideline, or approved claim is missing, stop and record
  `REVIEW REQUIRED` in `{{campaign_folder}}/node/clone-adaptation.md` instead of inventing it.
- Completion requires both the campaign deliverable and the reusable reference/template pair.

## Graph

[[../CLAUDE|Social Media CLAUDE]] · [[../../AGENT|Production Runtime]] · [[../../BASE/BASE-STRUCTURE|BASE Structure]] · [[../../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE|Campaigns Structure]] · [[../../BASE/BRAND KITs/BRAND-KIT-STRUCTURE|Brand Kit Structure]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.agents/skills/creative-direction/SKILL|creative-direction]] · [[../.agents/skills/photography-direction/SKILL|photography-direction]] · [[../.agents/skills/element-resolver/SKILL|element-resolver]] · [[../.agents/skills/acad-image-gen/SKILL|acad-image-gen]] · [[./[social]_[single-static]|single-static base workflow]]
