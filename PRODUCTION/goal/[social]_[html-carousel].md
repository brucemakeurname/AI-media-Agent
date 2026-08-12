---
id: "[social]_[html-carousel]"
studio: social-media
visual_type: html-carousel
format_allow: [case-studies, industry-news, infographics, product-demos, qa, tutorials]
tool_routing:                    # see ../TOOL-ROUTING-CLI-VS-API.md — cover is always AI-image,
                                  # content slides are always HTML render, never the reverse
  text:  { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese rewrite pass; also writes per-slide copy" }
  image: { platform: social, mechanism: "designer renders cover via gpt-img-2-gen (creative-direction), content slides 2..N via html-creative-direction + hyperframes snapshot -- cover is NEVER HTML" }
primary_skills: [wiki-query, creative-direction, gpt-img-2-gen, html-creative-direction, element-resolver, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "HTML CAROUSEL"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "slide_01.png (AI cover) … slide_0N.png (HTML content) in {{campaign_folder}}/ (root) + Post THUMBNAIL set (slide_01) + Post Message/Headline set + manifest.json (slides in order, each tagged cover/content) + Post Status = 'Submit to Review'"
status: active
---

# html-carousel

**Two-mechanism carousel, hard split by slide role (Nam, 2026-08-03): the cover is always a real
AI-generated photo, content slides are always HTML-composed.** Slide 1 = `gpt-img-2-gen` (through
`creative-direction`, same mechanism `single-static`/`img-carousel` use) because HTML/CSS cannot
fake a credible photorealistic hook. Slides 2..N = `html-creative-direction`, which retrieves a
Frame Treatment from the 13-preset library at `BASE/BRAND KITs/1a. HTML_Creative_Prompt_Template/`
and renders deterministic HTML→PNG via the vendored HyperFrames engine — genuinely better than a
generated image for data/quote/step/chart content, where exact typography and layout matter more
than photorealism. **Never swap the two** — an HTML cover or an AI-generated data chart both defeat
the reason this workflow has two mechanisms instead of one.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping is identical to `single-static`, see that
> file's table — then paste into the CLI session.

```text
This is a {{format}} HTML carousel for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign
{{campaign_link}}. Topic: {{topic}}. Two roles run in sequence — one caption + per-slide copy, one
slide set built from two different mechanisms.

content-executive (runs first): use /wiki-query for the brand's writing style, then draft the
caption highlighting {{post_message}}, slogan {{slogan}}, big idea {{big_idea}}, hook
{{headline_hook}}. Single-ticket run, so take the mandatory Vietnamese quality pass through a nested
`agy --dangerously-skip-permissions` session before treating any draft as final. Then plan the
carousel: decide slide count from the topic's natural structure (1 AI cover + typically 3-8 HTML
content slides — a slide count driven by how much real content there is, never padded) and write the
per-slide copy — slide 1 = the cover's hook line/visual concept, slides 2..N = one content beat each
(a stat, a quote, a process step, a comparison — whatever the topic's real structure supports). Save
the caption to {{campaign_folder}}/caption.md and the per-slide copy + slide count + slide-1-vs-
slide-2..N role split to node/slides-copy.md for the designer.

designer (runs after content-executive): work in TWO passes, in order — content slides genuinely
need the cover's mood before they can pick a harmonizing preset, so the cover must render first.
  (1) COVER (slide 1, AI image — never HTML): run `creative-direction` (mode: initial) to design a
      thumbnail-grade, stop-scroll cover — bold, high-contrast, carries the campaign key-visual
      element (name it, download it from the Campaign page) and real brand references (never
      generic stock). Resolve references via `element-resolver`. Constrain the cover's color grade
      to a palette one of the 13 Frame Treatments could plausibly echo — pick from {{brand}}'s Brand
      Kit palette, not an arbitrary photorealistic grade (e.g. warm sunset tones, teal-and-orange
      film look) that no flat-design preset can match later. Note the dominant 1-2 hex tones used in
      node/slides-copy.md so Step 2 below can match against them directly instead of eyeballing the
      rendered PNG cold. Render via `gpt-img-2-gen` (1:1 or the ticket's channel ratio, 2K min; 4K if
      {{channel}} = Instagram). Save as {{campaign_folder}}/slide_01.png.
  (2) CONTENT SLIDES (2..N, HTML — never AI-generated): run `html-creative-direction` against
      node/slides-copy.md's per-slide beats. Step 2 picks a `frame-preset` from
      `1a. HTML_Creative_Prompt_Template/` whose mood harmonizes with slide_01's own palette/tone
      (read the cover before choosing), copies its FRAME.md to node/frame.md, and overrides
      color/font tokens with {{brand}}'s real Brand Kit — keeping the preset's structural tokens
      (radii, shadow style, component shapes). Step 3 retrieves a Frame Treatment per slide's
      content shape (Dashboard/Stat Grid for a stat, Pull Quote for a quote, Bar Ranking for a
      comparison, Closing/CTA for the last slide). Step 3.5 is mandatory — every content slide must
      fill ≥80-85% of the canvas, never top-heavy. Step 4 checks the chosen preset's palette-cycling
      rule (fixed-accent presets keep one color across all content slides; cycling presets —
      blockframe/capsule/creative-mode/daisy-days/editorial-forest — vary color per slide/element
      per their documented order). Steps 5-6 author + `hyperframes snapshot` each content slide to
      {{campaign_folder}}/slide_02.png … slide_0N.png.

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese (quality
pass done); slide_01 is a real AI-generated photo and reads as a strong stop-scroll cover; slides
2..N are HTML-rendered (never AI-generated) and are visibly one shared preset/template — only
content differs; content slides fill ≥80-85% of their canvas (no dead bottom third); palette on
content slides matches the chosen preset's cycling rule; the preset's mood visibly harmonizes with
the cover's own palette/tone; every slide is ≥2K-equivalent (content slides render at the channel's
native pixel size); no prohibited/copyrighted marks; no fabricated stats on content slides (every
figure traces to the ticket).

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags -> "Hashtag",
{{campaign_folder}}/slide_01.png -> "THUMBNAIL". Write {{campaign_folder}}/manifest.json last (list
slide_01..slide_0N in order, tag slide_01 as `mechanism: gpt-img-2-gen` and the rest as `mechanism:
html-creative-direction` for traceability), only once every benchmark above holds.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

**Identical to `[social]_[single-static].md`** — fetch the Post page by `{{notion_page_id}}`, read
fields directly; only hop the `Social Media Campaigns` relation for `{{slogan}}`/`{{big_idea}}`. See
that file's field-mapping table (Read + Write-back). The only write-back difference: `THUMBNAIL`
receives `slide_01.png` (the AI cover); all slides saved to `{{campaign_folder}}/` root and listed
in `manifest.json` in swipe order with their render mechanism tagged.

## Notes

- **The cover-is-never-HTML / content-is-never-AI-image split is a hard rule, not a default.** If a
  ticket seems to want an all-HTML deck (no photo needed at all) or an all-photo deck (no data/quote
  content), that's a different visual type (`single-static`/`img-carousel` for all-photo,
  `[social]_[html-carousel]` still applies structurally but flag to CMO if genuinely zero content
  slides make sense — a 1-slide "carousel" isn't this workflow).
- **Order matters: cover renders before any content slide.** `html-creative-direction`'s Step 2
  (preset selection) explicitly reads the rendered cover to pick a harmonizing preset — running
  content slides first would mean picking a preset blind, then hoping the AI cover happens to match.
- **Thumbnail/content mismatch is a known failure mode — a photorealistic cover followed by a
  visually unrelated flat-design carousel.** The fix is upstream, at cover generation, not at preset
  selection: the cover step above requires constraining slide_01's color grade to {{brand}}'s Brand
  Kit palette and logging the 1-2 dominant hex tones, so Step 2's "harmonize with the cover" match is
  a real palette match, not a vibe check against a rendered PNG.
- **Preset selection is content-driven AND cover-driven.** Pick the Frame Treatment per slide's
  content shape (stat → Dashboard, quote → Pull Quote, etc. — see `html-creative-direction` Step 3),
  but pick the *preset itself* (which of the 13) to harmonize with the cover's mood/palette, not
  independently.
- **Palette-cycling rule is real and must be checked** — 5 of 13 presets (`blockframe`, `capsule`,
  `creative-mode`, `daisy-days`, `editorial-forest`) require real per-slide color variation; the
  other 8 require one identical accent on every content slide. Getting this backwards is a defect
  either direction. Full table: `1a. HTML_Creative_Prompt_Template/HTML-CREATIVE-TEMPLATE-STRUCTURE.md`.
- **Vertical-fill (Step 3.5 of `html-creative-direction`) is mandatory per content slide** — every
  preset is authored for 16:9; naive top-anchoring onto a taller canvas leaves 30-60% dead space,
  verified repeatedly while building the template library. Fill with the preset's own real
  components, never invented elements or stretched whitespace.
- **Real photos inside a content slide** (e.g. a news-format ticket needing a cited photo mid-deck)
  follow `1a. HTML_Creative_Prompt_Template/IMAGE-SOURCING-GUIDE.md` — verified crawl mechanism
  (browser UA + referer, follow the article to its full-size hero image, always caption the source).
  This is separate from the cover, which is always AI-generated, never a crawled photo.
- **Language** defaults to Vietnamese unless the ticket says otherwise.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. Post no status message
  before done — only the final signal goes to CMO.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/skills/creative-direction/SKILL|creative-direction (cover)]] · [[../.claude/skills/gpt-img-2-gen/SKILL|gpt-img-2-gen (cover render)]] · [[../.claude/skills/html-creative-direction/SKILL|html-creative-direction (content slides)]] · [[./[social]_[single-static]|single-static (schema model)]] · [[./[social]_[img-carousel]|img-carousel (sibling, all-AI-image carousel)]]
