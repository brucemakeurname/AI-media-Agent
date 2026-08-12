---
id: "[social]_[ai-commercial-short-video]"
studio: social-media
visual_type: ai-commercial-short-video
format_allow: [before-after, behind-the-scenes, brand-story, case-studies, endorsement, free-trials, fun-facts, industry-news, interviews, introduce-team, lifestyle-content, process-post, product-demos, seasonal, sneak-peeks, special-offers, testimonials, tip-of-the-day, tutorials]
amount: [single, batch]        # studio agent picks engine per ticket volume; body below covers single (per-scene sequential render) — batch spawns one parallel sub-agent per scene, same schema
engine:
  single: { text: in-session-gemini-3-pro, video: "gemini-omni-video-gen (Vertex direct, reference_to_video)" }
  batch:  { text: gemini-api-skill,        video: "gemini-omni-video-gen (parallel per-scene sub-agents)" }
primary_skills: [wiki-query, write-shooting-script, write-ai-commercial-video-sequence-script, element-resolver, photography-direction, gemini-omni-video-gen, gpt-img-2-gen, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "AI COMMERCIAL SHORT VIDEO"
  done_status: "Submit to Review"
  # NEW FIELDS REQUIRED ON Posts DB — do not exist yet as of 2026-07-21, verified against the
  # live schema (collection://d830831f-990c-83a6-adf7-07c65da0e90a). Create as `text` type before
  # this workflow can dispatch a real ticket: "Visual Concept Script", "Voice", "Video Requirement".
  # A url-type "Video Link" property is also recommended for the write-back (see Notes) but the
  # video block embed alone is sufficient if that property isn't added.
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion, same convention as single-static
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "final .mp4 in {{campaign_folder}}/ (root, not node/ or video/) + thumbnail in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message set + video R2-uploaded and embedded (Post body video block, ≥5MB never attached as a file property) + manifest.json + Post Status = 'Submit to Review'"
status: active
---

# ai-commercial-short-video

Veo-polished, Omni-generated vertical commercial short (TVC-style — distinct from
`ai-ugc-short-video`'s raw/authentic register). Covers every content-format in `format_allow`
above. Differs from `[social]_[single-static].md` in three structural ways: content-executive's
role expands to write a real TVC **shooting script** (`write-shooting-script`, timing +
industry-craft creative translation) alongside `caption.md`; the designer's role expands from
"render images" to "resolve reference context and author the locked Omni scene prompts"
(`write-ai-commercial-video-sequence-script`, built strictly from that shooting script, never
from `Ticket.md` directly); and a `video-editor` pass is inserted after both content roles
finish.

## Amount paths

- **single** — one ticket, sequential per-scene render (5-8 scenes, one `gemini-omni-video-gen`
  call at a time, in order — Omni has no batch/parallel endpoint of its own).
- **batch** — multiple tickets in one run — spawn one parallel sub-agent per **ticket** (not per
  scene; each ticket's own scene sequence still renders sequentially inside its sub-agent).

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the 4 roles in
> sequence. No parallel fan-out within a single ticket.

```text
This is a {{format}} ai-commercial-short-video for {{channel}}, brand {{brand}}, pillar
{{pillar}}, campaign {{campaign_link}}. Topic: {{topic}}. Voice/persona: {{voice_brief}}.
Video requirement (hard constraints — packaging accuracy, forbidden claims, setting, subtitle
need, aspect ratio): {{video_requirement}}. Visual concept: {{visual_concept_script}}.

content-executive (runs first, two outputs in the same pass): (1) use /wiki-query for the
brand's writing style, draft the caption highlighting {{post_message}}, slogan {{slogan}}, big
idea {{big_idea}}, hook {{headline_hook}} — same Vietnamese-quality-pass rule as single-static
(nested `agy` session, single ticket). Save to {{campaign_folder}}/caption.md. (2) run
`write-shooting-script` against {{visual_concept_script}}/{{voice_brief}}/{{video_requirement}} —
extract the narrative arc, translate each beat into TVC-standard visual/sound/activity/VFX/SFX/
motion craft (Claude's own built-in industry knowledge — no curated TVC library exists yet, see
that skill's Method 2), and break it into sequences/scenes with explicit timestamps+durations
(≤10s per scene — split a beat into multiple sequential scenes rather than cramming dialogue/
action into one). Flag every scene's reference needs by type only
(character/environment/product/source_footage) — do not resolve paths. Save to
node/shooting-script.md.

designer (runs after content-executive): run `write-ai-commercial-video-sequence-script` against
the locked node/shooting-script.md (never Ticket.md's video-concept fields directly). Step A:
resolve/generate the reference package the shooting script flagged — character sheet
(`photography-direction` mode `reference` if a new on-screen presenter is needed), problem-state
and solution-state environment plates (`element-resolver` type `background`, or generate if the
Brand Kit has none), product packaging (`element-resolver` type `product` — pull from
{{brand}}'s real Brand Kit, never invent packaging/logo/label), matching the shooting script's
continuity/wardrobe decision. Step B: translate each scene into the locked Omni JSON prompt
schema grounded against the matching TVC-style sample from the Creative/Photoshoot prompt
libraries, assign ≤3 refs per scene, inject the mandatory `"TVC"`/`"commercial"` keywords into
every scene (guards against drifting into the sibling `ai-ugc-short-video` register), and write
node/sequence-script.md (Part A refs + Part B scene prompts + ref-assignment table). Render the
`thumbnail` spec as an ordinary static image (`creative-direction`/`photography-direction` +
`gpt-img-2-gen`/`nano-banana-image-gen`, 2K minimum) directly to {{campaign_folder}}/ root — same
resolution floor as single-static.

video-editor (runs after designer): read the locked node/sequence-script.md. For each `### Scene
N` fenced JSON block in Part B, in order, call `gemini-omni-video-gen` (`reference_to_video`,
that scene's ≤3 ref images, 9:16) and save the returned clip to node/scenes/scene_{N}.mp4 —
sequential, never parallel within one ticket, since Omni's own endpoint is synchronous per call.
Once all scenes are rendered:
concatenate them in order (ffmpeg concat demuxer, hard cuts — each scene's own `ending` field
already bakes its transition into the rendered content, so do not add ffmpeg cross-fades on top).
If {{video_requirement}} calls for on-screen subtitles: run WhisperX on the concatenated audio to
get word-level timestamps, then reuse the `subtitle-designer` skill (from
`video_modules/talking-head-editing/.claude/skills/`) to render a branded subtitle overlay and
composite it — never let Omni itself burn in subtitle text, its font/timing is inconsistent
(this is the whole reason to reuse a dedicated subtitle renderer instead of a prompt
instruction). Then reuse `sfx-artist`'s Phase 5 BGM step only (search/download/mix a royalty-free
instrumental per the mood table, afade in/out, volume 0.10-0.15) — skip its Phase 2/3 B-roll/
A-roll SFX steps entirely, there is no HyperFrames B-roll layer in this pipeline. Save the final
mp4 directly to {{campaign_folder}}/ root (flat, no `video/` subfolder — same contract as
`video-editor.md`).

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese;
final video plays back at the expected scene count/order with no scene missing or duplicated;
product packaging/logo is pixel-accurate to the Brand Kit reference in every scene that shows it;
every scene's `keyword` list carries `"TVC"`/`"commercial"`; subtitles present only if
{{video_requirement}} asked for them, and rendered via the reused subtitle skill (never
Omni-native burned-in text); thumbnail is ≥2K and matches the video's actual content; no
prohibited/copyrighted marks; no absolute-cure/guarantee language if {{video_requirement}}
forbids it.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags ->
"Hashtag", thumbnail image -> "THUMBNAIL". Video delivery (>5MB, never a Notion file property):
`upload_video_to_r2.js` the final mp4 to R2, then `upload.py --video-url` to embed it as a video
block on the Post page (+ a "Video Link" url property if that field exists). Write
{{campaign_folder}}/manifest.json last, only once every benchmark above holds.

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

Same fallback-pull convention as `[social]_[single-static].md`: fetch the Post page by
`{{notion_page_id}}`, read fields directly; only hop the `Social Media Campaigns` relation for
`{{slogan}}`/`{{big_idea}}`.

| Prompt placeholder | Actual DB field | Type | Note |
|---|---|---|---|
| `{{format}}` | Posts · `Format` | select | must be in `format_allow` |
| `{{channel}}` | Posts · `Channel` | multi_select | live schema uses `multi_select`, not `select` — read as a list |
| `{{brand}}` | parent brand page title | page title | walk Post's ancestors |
| `{{pillar}}` | Posts · `Pillar` | select | direct read |
| `{{campaign_link}}` | Posts · `Social Media Campaigns` | relation | resolved link, not the raw field |
| `{{topic}}` | Posts · `Topic` | title | |
| `{{post_message}}` | Posts · `Post Message` | text | dual-use: brief in, caption out |
| `{{slogan}}` | Campaign · `Slogan` | text | via relation |
| `{{big_idea}}` | Campaign · `Big Idea` | text | via relation |
| `{{headline_hook}}` | Posts · `Headline/Hook` | text | dual-use: brief in, hook out |
| `{{visual_concept_script}}` | Posts · `Visual Concept Script` | text | **NEW field — not yet in live schema, see frontmatter note** |
| `{{voice_brief}}` | Posts · `Voice` | text | **NEW field** — language/accent/persona for spoken dialogue |
| `{{video_requirement}}` | Posts · `Video Requirement` | text | **NEW field** — hard constraints (packaging accuracy, forbidden claims, setting, subtitle need, aspect ratio); shape modeled on `test CT45/BENH-TIEU-CHAY-O-LON.md`'s "📌 Video Requirement" section |
| `{{campaign_folder}}` | — (local) | — | resolved per `BASE/BASE-STRUCTURE.md` + `STORAGE-HIERARCHY.md` |
| `{{notion_page_id}}` | Posts page id | id | dispatch param |
| `{{done_when}}` | frontmatter | text | static |

**Write back (notion-upload → the Post page):**

| Artifact | Posts · field | Type |
|---|---|---|
| caption body | `Post Message` | text |
| headline/hook | `Headline/Hook` | text |
| hashtags | `Hashtag` | text |
| thumbnail image | `THUMBNAIL` | file |
| final video | Post body **video block** (external, R2 URL) + `Video Link` (url, if the property exists) — never the `THUMBNAIL`/file-property path, which caps around 5MB |
| completion | `Status` = `Submit to Review` | select |

## Notes

- **Three new Posts DB fields must be created before this workflow goes live.** Verified against
  the current live schema (2026-07-21): `Visual Concept Script`, `Voice`, `Video Requirement` do
  not exist yet. Add all three as `text` type (a `Video Link` url-type property is optional but
  recommended for the write-back table above). This workflow's steps are otherwise complete —
  flip to fully operational once those fields land.
- **Two-skill split (2026-07-21 refactor): `write-shooting-script` → `write-ai-commercial-video-sequence-script`.**
  content-executive no longer feeds the designer a draft JSON scene list directly from
  `Ticket.md` — it first writes a real TVC shooting script (`node/shooting-script.md`: timed
  sequences/scenes, industry-craft creative translation, reference-need flags only). The designer
  then builds `node/sequence-script.md` strictly from that file, never from `Ticket.md`'s
  video-concept fields directly — Step A resolves/generates the reference package, Step B writes
  the locked Omni JSON prompt per scene. This replaced the original single-skill `draft`/`finalize`
  mode split (`commercial-video-sequence-script`, retired) because camera/lighting/reference-asset
  resolution is visual craft that belongs entirely to the designer once a real shooting script
  exists — content-executive's job is the narrative/timing/creative-translation pass, not visual
  execution.
- **Mandatory `"TVC"`/`"commercial"` keywords.** The single biggest lever against a
  commercial-register render drifting into the sibling `ai-ugc-short-video`'s raw/authentic
  register — injected into every scene by `write-ai-commercial-video-sequence-script` Step B,
  never left to content-executive's shooting-script pass.
- **≤3 refs / scene, ≤10s / scene.** Both are `gemini-omni-video-gen` model ceilings (see that
  skill's Step 3), not stylistic choices — write pacing into prose, don't try to force an exact
  duration or a 4th reference image.
- **Transitions are pre-baked per scene, not applied at the edit layer.** Each scene's own
  `ending` field (light-leak whip, match-dissolve, glitch-cut, etc.) is rendered by Omni as part
  of that scene's content. `video-editor` only hard-cuts scenes together (ffmpeg concat demuxer)
  — this matches `talking-head-editing`'s own convention (that pipeline explicitly does no
  cross-fade transitions either, see its `WORKFLOW-template.md` "What This Pipeline Does NOT Do").
- **Subtitles are conditional and never Omni-native.** Only build them if
  `{{video_requirement}}` asks for on-screen text/subtitles. When needed: run WhisperX on the
  assembled clip's own audio to get word-level timestamps (there is no live-recording transcript
  here, unlike `talking-head-editing`'s normal Phase 0 input), then reuse `subtitle-designer`'s
  HyperFrames word-pop renderer for a consistent branded font — never instruct Omni to burn in
  subtitle text itself (unreliable font/timing, confirmed pattern across this team's video work).
- **BGM reuses `sfx-artist` Phase 5 only.** Its Phase 2/3 SFX steps assume a B-roll/A-roll
  HyperFrames layer that doesn't exist in this AI-generated-scene pipeline — only the
  mood-detection → royalty-free-search → `bgm_manifest.json` → afade-mix steps apply.
- **Video delivery bypasses the Notion file property entirely.** Every final exceeds Notion's
  ~5MB file-attachment cap. Upload to R2 (`upload_video_to_r2.js`, same bucket/credentials
  pattern as `INHOUSE TEAMS/1. Account Team/r2-upload.js`) and embed the resulting URL as a
  Notion video block (`upload.py --video-url`) — reviewers can play it inline without ever
  hitting the attachment limit.
- **Save-a-script check inverted from single-static.** This format DOES have scripts — two of
  them, `node/shooting-script.md` (content-executive) and `node/sequence-script.md` (designer,
  the locked Omni JSON prompts) — not a prose `script.md` (that field is for the talking-head/
  human-video pipeline; this is AI-generated-scene, so both live in `node/` per the Storage
  Hierarchy's "guidance/intermediate" rule, and only the rendered video is a root deliverable).
- **Language** defaults to Vietnamese for caption/on-screen text; `{{voice_brief}}` may specify a
  different spoken-dialogue language (see `test CT45` reference — Filipino/Tagalog voice was used
  there) — the two are independent.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. No status message
  before done.
- **Dry-run tested 2026-07-21** (`_workflow-tests/coca-cola-tvc-2026-07-21/`, 60s/6-scene test
  TVC, Khánh Huyền as presenter) — end-to-end render/edit mechanics confirmed working (scene
  render, hard-cut concat, subtitle burn, BGM mix). Six real issues were hit and fixed live during
  that test — before running a real ticket through this workflow, read
  `docs/ai-commercial-short-video-KNOWN-ISSUES.md` (BGM web-fetch is broken and needs the
  local library fallback; WhisperX/subtitle timing needs the silencedetect-based workaround, not
  the naive approach; a couple of environment/doc gaps). **Note:** that test ran against the
  original single-skill `commercial-video-sequence-script` (JSON output, `draft`/`finalize`
  modes), retired the same day by the `write-shooting-script` /
  `write-ai-commercial-video-sequence-script` split above — the render/edit findings still hold
  (they're downstream of `video-editor`, unaffected by this change), but the new two-skill
  scene-authoring path itself has not yet been re-verified end-to-end.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/agents/video-editor|video-editor role]] · [[../.claude/skills/write-shooting-script/SKILL|write-shooting-script]] · [[../.claude/skills/write-ai-commercial-video-sequence-script/SKILL|write-ai-commercial-video-sequence-script]] · [[../.claude/skills/gemini-omni-video-gen/SKILL|gemini-omni-video-gen]] · [[./[social]_[single-static]|single-static (schema model)]] · [[./[social]_[ai-ugc-short-video]|ai-ugc-short-video (sibling, raw register)]] · [[./docs/ai-commercial-short-video-KNOWN-ISSUES|Known Issues from dry-run test]]
