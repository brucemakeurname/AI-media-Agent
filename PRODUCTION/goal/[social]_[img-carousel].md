---
id: "[social]_[img-carousel]"
studio: social-media
visual_type: img-carousel
format_allow: [before-after, brand-story, case-studies, infographics, process-post, product-demos, testimonials, tutorials]
tool_routing:                    # see ../TOOL-ROUTING-CLI-VS-API.md — multi-slide image set,
                                  # rendered slides (not HTML — that's the html-carousel workflow)
  text:  { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese rewrite pass; also writes per-slide copy" }
  image: { platform: social, mechanism: "designer renders cover + content slides via gpt-img-2-gen, 2K, cover as --reference for template consistency -- never nested CLI" }
primary_skills: [wiki-query, creative-direction, element-resolver, gpt-img-2-gen, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "IMG CAROUSEL"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "slide_01.png … slide_0N.png in {{campaign_folder}}/ (root) + Post THUMBNAIL set (slide_01, the cover) + Post Message/Headline set + manifest.json (slides in order) + Post Status = 'Submit to Review'"
status: active
---

# img-carousel

**Same workflow as `single-static` — the difference is a multi-slide image set with a specific
creative split.** A carousel is not N independent images: the **first slide is a thumbnail-grade
stop-scroll cover** (its own full creative concept), and **every content slide after it shares ONE
template** (identical layout/color/typography/framing — only the per-slide copy and content change).
This keeps the swipe cohesive while the cover does the scroll-stopping. Everything else — the caption
pass, the Notion field mapping, the completion contract — is identical to
`[social]_[single-static].md`. Rendered-image carousel only; for a text-heavy/layout-critical
HTML-composed carousel use `[social]_[html-carousel].md` instead.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping is identical to `single-static`, see that
> file's table — then paste into the CLI session.

```text
This is a {{format}} image carousel for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign
{{campaign_link}}. Topic: {{topic}}. Two roles run in sequence — one caption + per-slide copy, one
slide set.

content-executive (runs first): use /wiki-query for the brand's writing style, then draft the caption
highlighting the core message {{post_message}}, slogan {{slogan}}, big idea {{big_idea}}, hook
{{headline_hook}}. Single-ticket run, so take the mandatory Vietnamese quality pass through a nested
`agy --dangerously-skip-permissions` session before treating any draft as final. Then plan the
carousel: decide the slide count from the topic's natural structure (a cover + typically 3-9 content
slides — e.g. a "5 mẹo" post = 1 cover + 5 content = 6 slides; never pad or starve the count) and
write the per-slide copy — slide 1 = the cover hook line, slides 2..N = one content beat each, plus a
final CTA beat if the format calls for it. Save the caption to {{campaign_folder}}/caption.md and the
per-slide copy + slide count to node/slides-copy.md for the designer.

designer (runs after content-executive): read node/creative-brief.md + node/slides-copy.md, then work
in TWO passes:
  (1) COVER (slide 1) — run `creative-direction` (mode: initial) to design a thumbnail-grade,
      stop-scroll cover: bold, high-contrast, carries the campaign key-visual element (name it,
      download it from the Campaign page) and real brand references (never generic stock). Resolve
      references via `element-resolver`. Render via `gpt-img-2-gen` (1:1, 2K min; 4K if
      {{channel}} = Instagram). Save as {{campaign_folder}}/slide_01.png.
  (2) CONTENT TEMPLATE (slides 2..N) — do NOT run a fresh creative concept per slide. Lock ONE shared
      template derived from the cover's design tokens (same background system, color palette,
      typography, margins, copy placement, footer/branding), then render each content slide via
      `gpt-img-2-gen` passing {{campaign_folder}}/slide_01.png as `--reference` so all slides stay
      visually consistent — substituting only that slide's own copy (from node/slides-copy.md) and
      any per-slide product/visual element. Save slide_02.png … slide_0N.png. Record the locked
      template (tokens + which slide-1 features are fixed vs. per-slide) in node/images-prompts.md.

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese (quality
pass done); slide count matches node/slides-copy.md; slide_01 reads as a strong stop-scroll cover;
slides 2..N are visibly one consistent template (same layout/palette/type — only content differs),
not N different designs; every slide's copy is legible in the safe zone; the key-visual element and
real brand references are present; every slide is ≥2K; no prohibited/copyrighted marks.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags -> "Hashtag",
{{campaign_folder}}/slide_01.png -> "THUMBNAIL". Write {{campaign_folder}}/manifest.json last (list
slide_01..slide_0N in order), only once every benchmark above holds.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

**Identical to `[social]_[single-static].md`** — fetch the Post page by `{{notion_page_id}}`, read
fields directly; only hop the `Social Media Campaigns` relation for `{{slogan}}`/`{{big_idea}}`. See
that file's field-mapping table (Read + Write-back). The only write-back difference: `THUMBNAIL`
receives `slide_01.png` (the cover); all slides are saved to `{{campaign_folder}}/` root and listed
in `manifest.json` in swipe order.

## Notes

- **Only the image step differs from `single-static`** (multi-slide, cover + shared template). If
  `single-static` changes on caption/field-mapping/completion, mirror it here.
- **The creative split is the whole point.** `creative-direction` runs **once**, for the cover only.
  Content slides reuse the cover as a `--reference` template (gpt-img-2-gen Step 4's carousel order:
  cover first with no reference, then slides 2+ each pass the cover) — they are template
  substitutions, not fresh concepts. Running `creative-direction` per slide would defeat the
  cohesion and waste effort.
- **Rendered images, not HTML.** This is the image-carousel lane; the HTML-composed, layout-critical
  carousel is `[social]_[html-carousel].md` (uses `html-carousel-gen`). Route data-heavy/precise-text
  carousels there instead.
- **Slide count is content-driven, never a fixed default** — content-executive sets it from the
  topic's real structure in node/slides-copy.md; the designer renders exactly that many.
- **Consistency mechanism.** Passing slide_01 as `--reference` on every content slide is what holds
  the template; if a content slide drifts (different palette/layout), regenerate it with a tighter
  "match the reference layout exactly, change only the copy" instruction before accepting it.
- **Language** defaults to Vietnamese unless the ticket says otherwise.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. Post no status message
  before done — only the final signal goes to CMO.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/skills/creative-direction/SKILL|creative-direction]] · [[../.claude/skills/gpt-img-2-gen/SKILL|gpt-img-2-gen]] · [[./[social]_[single-static]|single-static (base workflow)]] · [[./[social]_[html-carousel]|html-carousel (HTML-composed sibling)]]
