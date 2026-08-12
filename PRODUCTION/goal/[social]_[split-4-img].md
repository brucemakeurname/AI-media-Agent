---
id: "[social]_[split-4-img]"
studio: social-media
visual_type: split-4-img
format_allow: [ask-me-anything, before-after, behind-the-scenes, brand-story, case-studies, challenge, competitions, endorsement, free-trials, fun-facts, industry-news, infographics, interviews, introduce-team, lifestyle-content, newsletter, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, social-cause, special-offers, testimonials, tip-of-the-day, tutorials]
tool_routing:                    # see ../TOOL-ROUTING-CLI-VS-API.md — one composed image per ticket,
                                  # so routing never varies per run
  text:  { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese rewrite pass" }
  image: { platform: social, mechanism: "designer composes ONE large canvas via gpt-img-2-gen (2880x2880 native, no upscale) then slices into 4 via split-4-image -- never nested CLI" }
primary_skills: [wiki-query, creative-direction, element-resolver, gpt-img-2-gen, split-4-image, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "SPLIT 4 IMG"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "_base.png + slide_1..slide_4.jpg in {{campaign_folder}}/ (root) + Post THUMBNAIL set (the composite _base) + Post Message/Headline set + manifest.json (lists the 4 tiles in upload order) + Post Status = 'Submit to Review'"
status: active
---

# split-4-img

**Same workflow as `single-static` — the only difference is the image step.** Instead of rendering
one final image, the designer composes **one large canvas** and slices it into **4 tiles** that
reassemble into a seamless 2×2 grid when uploaded to **Facebook** (Facebook renders a 4-photo post
as a 2×2 collage; other platforms just show a 4-slide swipe). Everything else — the caption pass,
the Notion field mapping, the completion contract — is identical to `[social]_[single-static].md`.

Covers every content-format in `format_allow` (one workflow file per visual type). `{{format}}`/
`{{pillar}}` are read per-ticket off the Post row, not fixed by this file.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping is identical to `single-static`, see
> that file's table — then paste into the CLI session.

```text
This is a {{format}} split-4-image post for {{channel}}, brand {{brand}}, pillar {{pillar}},
campaign {{campaign_link}}. Topic: {{topic}}. Two roles run in sequence — one composed image (sliced
into 4), one caption.

content-executive (runs first): use /wiki-query for the brand's writing style, then draft a caption
highlighting the core message {{post_message}}, the slogan {{slogan}}, big idea {{big_idea}}, and
headline/hook {{headline_hook}}. Single-ticket run, so take the mandatory Vietnamese quality pass
through a nested `agy --dangerously-skip-permissions` session (content-executive.md step 3) before
treating any draft as final. Save the finished caption to {{campaign_folder}}/caption.md and write
node/creative-brief.md (core message, desired response, on-image copy candidate, open design
questions) for the designer.

designer (runs after content-executive): work in TWO passes, in order — a design pass, then a purely
mechanical render+slice pass. Never blend them: nothing about the 2×2 split influences the
composition itself.
  (1) DESIGN (creative-direction owns this, produces ONE locked composition — never a 4-region plan):
      read node/creative-brief.md, run `creative-direction` (mode: initial) exactly per its own
      Method 1→2→3 (visual brief → niche/pillar-gated retrieval of 3-5 templates from
      `BASE/BRAND KITs/1. Creative_Prompt_Template/` → score/select). This locks ONE single,
      normally-composed image the same way any other single-static post would be designed — there is
      no quadrant authoring, no per-region captions, no "top-left shows X" planning. Save the locked
      direction to node/creative-direction.json (see the skill's own output schema). The image MUST
      carry the campaign key-visual element (name it, download it from the Campaign page) and use
      real brand reference images, never a generic stock look; resolve required references via
      `element-resolver`.
  (2) RENDER + SLICE (`split-4-image` — mechanical only, no design decisions here): render the locked
      composition via `gpt-img-2-gen` at `2880x2880` (largest native square — gpt-image-2 outputs
      2K-4K directly, NEVER upscale a smaller base), save it as {{campaign_folder}}/_base.png, then
      slice it into {{campaign_folder}}/slide_1.jpg … slide_4.jpg in reading order (slide_1=top-left,
      slide_2=top-right, slide_3=bottom-left, slide_4=bottom-right). Pass the prompt through a UTF-8
      file (e.g. node/prompt.txt) rather than typing it inline into a shell command — hand-typed
      inline prompts have silently dropped Vietnamese diacritics before. If the locked composition
      has continuous background/subject (most do, since Method 3 favors a single coherent scene),
      the slice naturally reads as one reassembled picture — that continuity is a side effect of a
      well-composed single image, not something to plan for during design. Save
      node/images-prompts.md for traceability.

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese (quality
pass done, no facts changed); `_base.png` is 2880×2880 and the four tiles are 1440×1440 square (a
clean Facebook 2×2 needs square tiles); the four tiles visually reassemble into `_base.png` with no
region misordered; any headline/copy sits inside one tile and is legible; the key-visual element and
real brand references are present; no prohibited/copyrighted marks.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags -> "Hashtag",
the composite {{campaign_folder}}/_base.png -> "THUMBNAIL" (so the reviewer sees the whole picture).
Write {{campaign_folder}}/manifest.json last (list slide_1..slide_4 in Facebook upload order), only
once every benchmark above holds.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

**Identical to `[social]_[single-static].md`** — fetch the Post page by `{{notion_page_id}}`, read
fields directly; only hop the `Social Media Campaigns` relation for `{{slogan}}`/`{{big_idea}}`. See
that file's field-mapping table (Read + Write-back). The only write-back difference here: `THUMBNAIL`
receives the composite `_base.png`, and the four `slide_N.jpg` tiles are the actual assets a human
(or the Communication Team) uploads to Facebook in filename order.

## Notes

- **Only the image step differs from `single-static`.** If `single-static` changes (caption pass,
  field mapping, completion contract), mirror it here — do not let the two drift apart on anything
  except the compose-then-slice image mechanism.
- **`creative-direction` designs ONE image, full stop — the 2×2 split is not a design input.** A
  past run skipped `creative-direction` entirely and hand-invented a 4-quadrant layout with separate
  per-region captions instead; that is not this workflow. Run the skill's real Method 1→2→3 (niche/
  pillar-gated retrieval + scoring from `1. Creative_Prompt_Template/`, same as every other visual
  type) and let it lock a normal single composition. `split-4-image` is purely mechanical — render
  what `creative-direction` locked, then cut it into 4 named tiles. If the locked composition doesn't
  read as one continuous scene once sliced, that's a signal the composition itself needs a stronger
  score-3+ template match, not that the design step should start planning quadrants.
- **Facebook-specific.** The 2×2 seamless reassembly only happens on Facebook's 4-photo collage.
  Upload the four tiles in `slide_1 → slide_4` order; Facebook fills the grid top-left, top-right,
  bottom-left, bottom-right in upload order. On Instagram/others the same four tiles are just a
  4-slide carousel swipe (that's what `split-4-img`'s sibling `strip-4` layout is for — use it if the
  ticket targets a swipe instead of a Facebook grid). Verify the final layout on the real platform.
- **Native 2K-4K, never upscale.** gpt-image-2 supports up to 3840px edge / 8.3MP natively (max
  square = 2880×2880). Generate the base at target size; never upscale a small base — seams and
  in-image text degrade. See `split-4-image/SKILL.md` for the full size table and constraints.
- **Exactly 4 photos, all square.** A 3- or 5-photo Facebook post uses a different layout, and
  non-square tiles trigger Facebook's "1 big + 3 small" arrangement instead of a clean 2×2.
- **Language** defaults to Vietnamese unless the ticket says otherwise.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. Post no status message
  before done — only the final signal goes to CMO.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/skills/split-4-image/SKILL|split-4-image]] · [[../.claude/skills/gpt-img-2-gen/SKILL|gpt-img-2-gen]] · [[../.claude/skills/creative-direction/SKILL|creative-direction]] · [[./[social]_[single-static]|single-static (base workflow)]]
