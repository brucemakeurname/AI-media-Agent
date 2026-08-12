---
id: "[social]_[single-static]"
studio: social-media
visual_type: single-static
format_allow: [ask-me-anything, before-after, behind-the-scenes, brand-story, case-studies, challenge, competitions, endorsement, free-trials, fun-facts, gifs-memes, industry-news, infographics, interviews, introduce-team, lifestyle-content, newsletter, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, social-cause, special-offers, testimonials, tip-of-the-day, tutorials]
tool_routing:                    # see ../TOOL-ROUTING-CLI-VS-API.md — this format is always
                                  # single-ticket/single-image, so routing never varies per run
  text:  { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese rewrite pass" }
  image: { platform: social, mechanism: "designer renders via gpt-img-2-gen API, 2K min (4K if channel=Instagram or 1:1-crop-4 needed) -- never nested CLI, which caps at 1K" }
primary_skills: [wiki-query, creative-direction, element-resolver, gpt-img-2-gen, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da           # ticket lives here (1 post = 1 ticket)
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9        # campaign-level fields (via relation)
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"              # Post -> Campaign hop (slogan + tagline ONLY — purpose/messages read straight off Posts)
  visual_type_value: "SINGLE STATIC"                    # new Visual Type select field (2026-07-11) — fixed per this workflow
  # format_value / pillar_value removed 2026-07-20: this workflow now covers every content-format
  # in format_allow above (not just industry-news), so {{format}}/{{pillar}} are read per-ticket
  # off the Post row (see step 2 of the Notion field mapping below) instead of being fixed here.
  done_status: "Submit to Review"                       # real option (NOT "Chờ duyệt")
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else is pulled from Notion
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}
  # {bucket}     = one of the 3 top buckets in BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
  #                ("1. Client Bookings" if a paying client, "2. SoloFlows Campaigns" if the
  #                brand's own channel) — CMO picks per ticket source, not this workflow.
  # {format}     = the content-type folder from STORAGE-HIERARCHY.md's Format Definitions
  #                table (e.g. "Single Image" for a static IG/FB post, "Post" for Threads/X) —
  #                NOT this file's visual_type slug ("single-static").
  # {date}       = YYYY-MM-DD from Posts·Date; suffix -2/-3 if another piece already exists
  #                for the same brand/channel/format/date (no separate {ticket_id} level).
  # Full convention: BASE/BASE-STRUCTURE.md §2 (top-level map) +
  # BASE/CAMPAIGNs/STORAGE-HIERARCHY.md (bucket → brand → channel → format → date).
done_when: "image in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message/Headline set + manifest.json in {{campaign_folder}}/ + Post Status = 'Submit to Review'"
status: active
---

# single-static

Covers every content-format in `format_allow` above (one workflow file per visual type — see
CLAUDE.md item 24 / `../../WORKFLOWS-BLUEPRINT.md` §4). `{{format}}`/`{{pillar}}` below are
read per-ticket off the Post row, not fixed by this file.

## Prompt

> Fill every `{{placeholder}}` from Notion — each token is named after its real field, see
> the field-mapping table below — then paste into the CLI session.

```text
This is a {{format}} post for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign
{{campaign_link}}. Topic: {{topic}}. Two roles run in sequence — one image, one caption, no
parallel sub-agent fan-out needed for this format.

content-executive (runs first): use /wiki-query for the brand's writing style, then draft a
caption highlighting the core message {{post_message}}, the slogan {{slogan}}, big idea
{{big_idea}}, and headline/hook {{headline_hook}}. This is a single-ticket run, so take the
mandatory Vietnamese quality pass through a nested `agy --dangerously-skip-permissions`
session (content-executive.md step 3) before treating any draft as final — never publish your
own raw draft. Save the finished caption to {{campaign_folder}}/caption.md and write
node/creative-brief.md (core message, desired response, on-image copy candidate, open design
questions) for the designer.

designer (runs after content-executive): read node/creative-brief.md, run `creative-direction`
(mode: initial) to pick the visual concept — the image MUST carry the campaign key-visual
element (name it, point to the file, download it from the Campaign page in Notion) and use
real brand reference images (testimonial, client, pricing, facilities shoots), never a generic
stock look. Resolve any required reference element via `element-resolver`. Render the final
image with `gpt-img-2-gen` — this format renders a headline into the image, and GPT Image 2 is
the skill that keeps that text legible; if it still garbles, retry with a tighter
text-in-image instruction before escalating. Render at 2K minimum, 4K if {{channel}} is
Instagram or the image will later be cropped into a 1:1→4-way split (full rule:
`../TOOL-ROUTING-CLI-VS-API.md`) — never the nested-CLI image path, which caps at 1K. Save
the final image directly under {{campaign_folder}}/ (root, not node/), and save
node/images-prompts.md for traceability.

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese
(passed the quality-pass check, no facts dropped or changed); final image is ≥2K (4K where
required above); the approved headline/copy is legible inside the image safe zone; the
key-visual element and real brand reference images are present; no prohibited/copyrighted
marks.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags ->
"Hashtag", final image -> "THUMBNAIL". Write {{campaign_folder}}/manifest.json last, only once
every benchmark above holds.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

Fallback pull: fetch the **Post** page by `{{notion_page_id}}`, read its fields directly first
(`{{pillar}}` and `{{post_message}}` are answered entirely from the Post itself — no hop
needed). Only follow the `Social Media Campaigns` relation for the two fields Posts doesn't
have: `{{slogan}}` and `{{big_idea}}`.

**Read (fill the prompt)** — one row per `{{placeholder}}` that literally appears in the
Prompt block above, in the order it first appears. Placeholder tokens are now named after
their real field, so there is no separate alias to remember:

| Prompt placeholder | Actual DB field | Type | Note |
|---|---|---|---|
| `{{format}}` | Posts · `Format` | select | must be one of `format_allow` (frontmatter) for this workflow — 36 standardized options total, see Notes |
| `{{channel}}` | Posts · `Channel` | select | INSTAGRAM / FACEBOOK / LINKEDIN / X / TIKTOK |
| `{{brand}}` | parent **brand page** title | page title | the page that owns the Posts DB, under `SOLO FLOWS WORKSPACE` (e.g. "Nhà Đẹp Plus"). Resolve by walking the Post's ancestors up to the brand/project page — not a column in either DB |
| `{{pillar}}` | Posts · `Pillar` | select | direct read, **no** relation hop (`EDUCATE`/`ENGAGE`/`PERSUADE`/`INSPIRE`/`SUPPORT`/`ENTERTAIN`) |
| `{{campaign_link}}` | Posts · `Social Media Campaigns` | relation | not itself a column value — it's the **resolved link** (URL/title of the linked Campaign page) read off the Posts-side relation field. The reverse (dual) relation on the Campaign side is called `Social Media Posts` |
| `{{topic}}` | Posts · `Topic` | title | post subject |
| `{{post_message}}` | Posts · `Post Message` | text | direct read, **no** relation hop. Dual-use field: read as the ticket-creator's pre-filled brief, then **overwritten** with the final caption at completion (see Write-back table) |
| `{{slogan}}` | Campaign · `Slogan` | text | via relation — Posts has no `Slogan` field, hop is required here |
| `{{big_idea}}` | Campaign · `Big Idea` | text | via relation — Posts has no equivalent field, hop is required here |
| `{{headline_hook}}` | Posts · `Headline/Hook` | text | dual-use: read as the pre-filled hook brief, then **overwritten** with the final hook at completion (see Write-back table) |
| `{{campaign_folder}}` | — (local) | — | the absolute per-ticket campaign folder = this file's `output_dir`. Resolve it per `BASE/BASE-STRUCTURE.md` (§2 top-level map) + `BASE/CAMPAIGNs/STORAGE-HIERARCHY.md` (bucket → brand → channel → format → date). Not a Notion column. Final deliverables (`caption.md`, images, `manifest.json`) go in `{{campaign_folder}}/` root; guidance/intermediate files (`images-prompts.md`, design-spec) go in `{{campaign_folder}}/node/` |
| `{{notion_page_id}}` | Posts page id | id | the ticket dispatch param, not read from a column |
| `{{done_when}}` | frontmatter `done_when` | text | static per workflow, not pulled from Notion |

Only `{{slogan}}` and `{{big_idea}}` require the Campaign relation hop — every other
placeholder reads straight off the Post. `Date` and `Visual Type` are real Posts fields used
for **routing/output-path metadata** (frontmatter `visual_type_value`, and `{date}` in
`output_dir`) — they are not referenced as `{{...}}` inside the Prompt text, so they don't
belong in this table.

**Write back (notion-upload → the Post page):**

| Artifact | Posts · field | Type |
|---|---|---|
| caption body | `Post Message` | text |
| headline/hook | `Headline/Hook` | text |
| hashtags | `Hashtag` | text |
| final image | `THUMBNAIL` | file |
| completion | `Status` = **`Submit to Review`** | select |

## Notes

- **Status enum is English, not Vietnamese.** Real options: `Pending` · `In-progress` ·
  `Submit to Review` · `Approved` · `Published` · `Reject`. This workflow ends at
  **`Submit to Review`** (was assumed "Chờ duyệt"). Reviewer sets `Approved`; Comm Team
  publishes → `Published`. ⚠ The system-wide status enum in the blueprint/Comm Team still
  says Vietnamese — reconcile separately.
- **Save-a-script check.** A static post has **no** script — skip the "save script" step.
- **`{{campaign_folder}}` (renamed from `base_days`, 2026-07-11).** It's the resolved absolute
  path to this ticket's own campaign folder in `BASE/CAMPAIGNs/`, not a generic "save
  somewhere" token. Per `BASE/CAMPAIGNs/STORAGE-HIERARCHY.md`'s Production Folder Convention
  (refined 2026-07-12): this workflow writes `caption.md`, final image files, and
  `manifest.json` into `{{campaign_folder}}/` root, and `images-prompts.md` (plus any other
  intermediate artifact) into `{{campaign_folder}}/node/` — the one allowed subfolder.
- **Tool routing.** This format is always single-ticket/single-image, so the routing decision
  never varies per run: text takes the nested `agy` CLI Vietnamese-rewrite path (volume =
  single); the image always takes the `gpt-img-2-gen` API path regardless of volume, because
  Social Media's platform floor (2K, 4K for Instagram/crop-4) is above what a nested CLI image
  session can produce (capped at 1K). Full rule: `../TOOL-ROUTING-CLI-VS-API.md`.
- **Text legibility.** single-static usually renders a headline into the image; `gpt-img-2-gen` is
  already the render skill for this reason (strongest at legible in-image text) — if it still
  garbles, retry with a tighter text-in-image instruction rather than switching skills.
- **Campaign key-visual.** No structured field — pull it from the Campaign page body /
  attachments (notion image download) and pass as a reference.
- **`Format` DB options standardized 2026-07-11.** Fixed typos/labels: `INFORGRAPHIC`→
  `INFOGRAPHICS`, `UGC`→`USER CONTENT`, `MEMES`→`GIFS/MEMES`, `SNEAKE PEEKS`→`SNEAK PEEKS`.
  Removed `TYPO CAROUSEL` (it was a visual type, not a content format — no tickets used it).
  All 36 `hop`-wheel formats now present, colored by pillar (green=educate, yellow=engage,
  red=persuade, purple=inspire, blue=support, orange=entertain).
- **New `Visual Type` select field added to the Posts DB (2026-07-11)** — carries the
  engine/pipeline dimension that used to have no column: `SINGLE STATIC` · `IMG CAROUSEL` ·
  `HTML CAROUSEL` · `SPLIT 4 IMG` · `AI COMMERCIAL SHORT VIDEO` · `AI UGC SHORT VIDEO` ·
  `HUMAN SHORT VIDEO` · `LONG VIDEO` · `MOTION GRAPHIC` — maps 1:1 to the `goal/` folder
  slugs. Other workflow files should set their own `visual_type_value` the same way.
- **Ground the facts (when `{{format}}` = industry-news).** Verify and cite the source in the
  caption; never fabricate a stat (Rule 9). Flag CMO if unverifiable. Not applicable to other
  formats in `format_allow`.
- **Language** defaults to Vietnamese unless the ticket says otherwise.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. Post no status
  message before done — only the final signal goes to CMO.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]]
