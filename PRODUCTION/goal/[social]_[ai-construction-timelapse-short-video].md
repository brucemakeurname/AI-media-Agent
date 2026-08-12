---
id: "[social]_[ai-construction-timelapse-short-video]"
studio: social-media
visual_type: ai-construction-timelapse-short-video
format_allow: [process-post, before-after, case-studies, brand-story, behind-the-scenes, sneak-peeks]
amount: [single, batch]        # studio agent picks engine per ticket volume; body below covers single (per-segment sequential render) — batch spawns one parallel sub-agent per ticket, same schema
engine:
  single: { text: in-session-gemini-3-pro, image: "nano-banana-image-gen (keyframe chain, sequential)", video: "gemini-veo-3.1-video-gen (Veo 3.1 full, first+last frame morph)" }
  batch:  { text: gemini-api-skill,        image: "nano-banana-image-gen (keyframe chain, parallel per-ticket, still sequential within a ticket)", video: "gemini-veo-3.1-video-gen (sequential per-ticket, parallel across tickets)" }
primary_skills: [wiki-query, construction-sequence-brainstorm, write-ai-timelapse-video-sequence-script, ai-timelapse-video, nano-banana-image-gen, gemini-veo-3.1-video-gen, element-resolver, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "AI CONSTRUCTION TIMELAPSE SHORT VIDEO"
  done_status: "Submit to Review"
  # visual_type_value is NOT yet an option on the live Visual Type select (verified 2026-07-22 —
  # only the 9 values from WORKFLOWS-BLUEPRINT.md §4 exist). Add it as a 10th select option before
  # this workflow can dispatch a real ticket. This workflow otherwise reuses the same 3 NEW Posts
  # DB text fields already flagged (not yet created) by [social]_[ai-commercial-short-video].md:
  # "Visual Concept Script", "Voice" (unused here — no spoken dialogue), "Video Requirement".
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion, same convention as single-static
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "final .mp4 in {{campaign_folder}}/ (root, not node/) + thumbnail in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message set + video R2-uploaded and embedded (Post body video block, ≥5MB never attached as a file property) + manifest.json + Post Status = 'Submit to Review'"
status: active
---

# ai-construction-timelapse-short-video

Veo-generated accelerated-progress short — a construction, renovation, or build-out compressed
into a 16-40s vertical clip via a chained sequence of reference-locked keyframes animated pairwise
with Veo 3.1's first+last-frame morph. Distinct from `ai-commercial-short-video`/`ai-ugc-short-
video` in mechanism (no scene-by-scene `reference_to_video` prompts, no spoken dialogue/VO at all
— the only audio is BGM) and in content shape (one continuous physical location progressing
through real stages, not a multi-scene narrative). Built entirely on the `ai-timelapse-video`
skill — this workflow only supplies the Notion field mapping, role split, and Post/Notion
write-back around that skill's mechanics.

## Amount paths

- **single** — one ticket, sequential keyframe chain + sequential segment render. Keyframe/segment
  count is **not fixed** — `write-ai-timelapse-video-sequence-script` derives it per ticket from
  how many visually-distinguishable stage boundaries `construction-sequence-brainstorm` identifies
  for this specific building/foundation type, capped by {{video_requirement}}'s duration budget if
  one is stated (see that skill's Step A).
- **batch** — multiple tickets in one run — spawn one parallel sub-agent per **ticket** (not per
  keyframe/segment; each ticket's own keyframe chain and segment sequence still runs sequentially
  inside its sub-agent, since keyframes are reference-chained and cannot be parallelized — see
  `ai-timelapse-video` §2/§5).

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the 3 roles in
> sequence. No parallel fan-out within a single ticket.

```text
This is a {{format}} ai-construction-timelapse-short-video for {{channel}}, brand {{brand}},
pillar {{pillar}}, campaign {{campaign_link}}. Topic: {{topic}}. Progression stages: {{visual_
concept_script}}. Video requirement (hard constraints — real site vs generated, keyframe count/
duration budget, aspect ratio, brand marks that must appear, forbidden claims): {{video_
requirement}}.

content-executive (runs first, two outputs): (1) use /wiki-query for the brand's writing style,
draft the caption highlighting {{post_message}}, slogan {{slogan}}, big idea {{big_idea}}, hook
{{headline_hook}} — same Vietnamese-quality-pass rule as single-static (nested `agy` session,
single ticket). Save to {{campaign_folder}}/caption.md. (2) Run `construction-sequence-brainstorm`
against {{visual_concept_script}}/{{video_requirement}}: classify the building type/scale (Step 1
— defaults to nhà dân dụng thấp tầng unless the ticket says otherwise; flag CMO instead of
proceeding if the ticket is actually hạ tầng/cầu-đường, out of that skill's scope), pick the
foundation type (Step 2), and list out the full candidate stage-boundary menu (Steps 3-4/6 — kỹ
thuật thi công phase order ground-to-roof, then trình tự hoàn thiện order; never reorder either)
with each candidate's explicit state delta (what's newly present, what temporary elements are now
gone) and Step 5's site-organization details (hàng rào/biển báo, vật tư tập kết, giàn giáo). Do
**not** pick a final keyframe count here — that determination belongs to the next role. Vague
"more progress" language is not acceptable input either way. Flag whether the process should
anchor to a **real site/product photo** (ticket provides one — resolve via `element-resolver`) or
be fully generated from scratch. Save to node/timelapse-stages.md.

designer (runs after content-executive): run `write-ai-timelapse-video-sequence-script` against
node/timelapse-stages.md + {{video_requirement}}. Step A locks the actual keyframe count for this
ticket — keep only the candidate boundaries that are visually distinguishable from their neighbor,
apply {{video_requirement}}'s duration budget backward if one is stated (never collapsing away the
true start/end state), and record a one-line rationale per boundary kept or collapsed. Step B
writes every keyframe's full generation-ready JSON prompt. Then execute that locked plan: resolve
keyframe 1 via `element-resolver` if a real anchor was flagged, else generate it via
`nano-banana-image-gen`; generate every subsequent keyframe **sequentially**, each referencing only
its immediate predecessor, per `ai-timelapse-video` §2 — identical camera/style/lighting prompt
block across all keyframes, explicit anti-drift lock clause from keyframe 2 onward. QA-read each
keyframe against its predecessor before generating the next; regenerate immediately (never chain
forward) if camera/framing/environment drifted. Save keyframes to node/keyframes/frame_{n}.jpg and
the locked plan to node/timelapse-sequence-script.md. Render the video's `thumbnail` (final-state
keyframe, or a light composite of it) as a static image directly to {{campaign_folder}}/ root, 2K
minimum — same resolution floor as single-static.

video-editor (runs after designer): read node/timelapse-sequence-script.md's Part B — every
segment's `first_frame`/`last_frame`/duration/aspect-ratio/resolution/negative_prompt and animation
prompt text are already locked there (per `ai-timelapse-video` §4's rules — named bridging actions,
time-acceleration narration, forward-chained narrative language, camera-lock close), do not
re-derive or rewrite them here. For each segment in order, call `gemini-veo-3.1-video-gen`
(`veo-3.1-generate-001`, `generate_audio: false`) exactly per that locked spec. Sequential within
one ticket. Save each to node/segments/seg_{n}.mp4. Verify identical codec/resolution/framerate via
`ffprobe` across all segments, then concatenate (ffmpeg concat demuxer, `-c copy`, hard cuts — no
cross-fades, segment boundaries are already pixel-identical joins per `ai-timelapse-video` §3/§5).
Mix BGM per `ai-timelapse-video` §6 (reuse `sfx-artist` Phase 5 only — mood-detect from
{{video_requirement}}/{{post_message}} tone, default upbeat/motivational-build; source from the
local BGM library, never the broken web-fetch path; afade in/out only at the true start/end of the
full assembled video, volume 0.10-0.15). Save the final mp4 directly to {{campaign_folder}}/ root
(flat, no `video/` subfolder — same contract as `video-editor.md`).

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese; every
keyframe holds the same camera angle/horizon/background as its neighbors (no framing jump-cut
anywhere in the sequence); keyframe 1 and keyframe N visually match {{visual_concept_script}}'s
stated start/end states; every rendered segment's own first/last frame visually matches its source
keyframe pair (spot-check by extracting and reading them back — confirms a real morph, not
first-frame-only drift); final concatenated video has no visible seam or cross-fade at any segment
join; BGM is present and mixed under with no native Veo audio leaking through; thumbnail is ≥2K
and matches the video's actual final-state visual; no prohibited/copyrighted marks unless
{{video_requirement}} explicitly names a real, cleared brand.

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
| `{{visual_concept_script}}` | Posts · `Visual Concept Script` | text | **shared NEW field, see frontmatter note** — here it holds the ordered progression states, not a scene-by-scene script |
| `{{video_requirement}}` | Posts · `Video Requirement` | text | **shared NEW field** — keyframe count/duration budget, real-vs-generated anchor, aspect ratio, brand marks, forbidden claims |
| `{{campaign_folder}}` | — (local) | — | resolved per `BASE/BASE-STRUCTURE.md` + `STORAGE-HIERARCHY.md` |
| `{{notion_page_id}}` | Posts page id | id | dispatch param |
| `{{done_when}}` | frontmatter | text | static |

`{{voice_brief}}` (Posts · `Voice`) is not used by this workflow — there is no spoken dialogue,
only BGM. It exists on the Posts DB solely because `ai-commercial-short-video` needs it; leave it
blank on tickets routed here.

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

- **New `Visual Type` select option required before this workflow can dispatch a real ticket.**
  Verified against the live schema 2026-07-22: only the 9 values in `WORKFLOWS-BLUEPRINT.md` §4
  exist. Add `"AI CONSTRUCTION TIMELAPSE SHORT VIDEO"` as a 10th option — this workflow's steps are
  otherwise complete, matching the pattern `ai-commercial-short-video` used for its own missing
  fields (documented gap, not a blocker to writing the workflow itself).
- **No new Posts DB fields requested.** This workflow reuses `Visual Concept Script` and `Video
  Requirement`, already flagged as missing by `[social]_[ai-commercial-short-video].md` — once
  those two land (per that workflow's own note), both workflows can dispatch. `Voice` exists on
  the schema for that sibling workflow's use, not this one.
- **All keyframe-chain/Veo mechanics, all real construction knowledge, and the count-locking logic
  each live in their own skill — none of the three is duplicated here.** This workflow only
  supplies the Notion field mapping and role split. `ai-timelapse-video` covers the sequential-
  chain reference rule, anti-drift lock-clause wording, per-segment animation-prompt structure,
  concat/BGM steps — domain-agnostic (works for any subject with a progression, not just
  construction). `construction-sequence-brainstorm` covers the domain-specific candidate stage
  menu: building-type classification, foundation-type selection, the real kỹ thuật thi công phase
  order and trình tự hoàn thiện order (ground to roof, then finishing), and realistic tổ chức thi
  công site details (hàng rào/biển báo/vật tư/giàn giáo) — grounded in Giáo trình Kỹ thuật thi công
  and Giáo trình Tổ chức thi công (Bộ Xây Dựng) rather than surface-level "watch it get built"
  guesses. `write-ai-timelapse-video-sequence-script` is what turns that candidate menu into a
  locked, ticket-specific plan — **it decides the actual keyframe/segment count**, per ticket, from
  the visual-distinguishability test plus {{video_requirement}}'s duration budget; no fixed count
  lives anywhere in this pipeline anymore. Changing which building types/techniques this workflow
  supports means editing the brainstorm skill; changing how the count is decided means editing the
  sequence-script skill — never hardcode a number back into this file.
- **No spoken dialogue or per-segment native audio.** Every Veo call renders with
  `generate_audio: false`; the only audio in the final deliverable is the BGM mixed in by
  `video-editor`'s last step. Do not let a segment's prompt imply dialogue or synced sfx — it will
  either be ignored (audio disabled) or, worse, bias the visual motion toward something that
  expects sound design that never arrives.
- **BGM reuses `sfx-artist` Phase 5 only** — identical reuse pattern to `ai-commercial-short-
  video`'s `video-editor` role. Source from the local BGM library
  (`.claude/skills/[html-video]-audio-mix/scripts/assets/bgm/brand/`), never the web-fetch path (broken —
  see `docs/ai-commercial-short-video-KNOWN-ISSUES.md`).
- **Real-site vs generated-site is a per-ticket branch, not a fixed rule.** A client's actual
  before/after project reveal should anchor keyframe 1 (and possibly the final keyframe, if a
  real "after" photo exists) via `element-resolver`; a purely illustrative/generic timelapse (no
  real client site) generates all N keyframes from scratch. `content-executive`'s
  node/timelapse-stages.md must flag which applies before `designer` starts the chain.
- **Segment count is a hard multiplier on render time and cost** — each Veo 3.1 call in this
  session's dry run took ~80-85s and produces a real billed clip (see `gemini-veo-3.1-video-gen`
  §8 for quota/cost). Don't pad the count "for safety" when the ticket's process reads clearly in
  fewer stages — `write-ai-timelapse-video-sequence-script`'s test picks the minimum count that
  avoids an implausible jump between adjacent states, nothing more.
- **Dry-run tested 2026-07-22** (`_workflow-tests/construction-timelapse-test/`, generic
  illustrative construction site, not a real client) — confirmed working end-to-end: 4-keyframe
  chain held camera lock and correct state progression across all stages, 3 Veo 3.1 segments each
  produced a real first+last-frame morph (verified by extracting and visually comparing each
  segment's own rendered first/last frame against its source keyframes), hard-cut concat produced
  a clean 24s video with no visible seams. **Not yet verified in this workflow's real context:**
  the BGM mix step, the `element-resolver` real-site-anchor branch, the thumbnail step, and the
  full Notion round-trip (page pull, write-back, R2 upload) — the dry run covered only the
  keyframe-chain + Veo + concat mechanics that now live in `ai-timelapse-video`.

## Graph

[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/agents/video-editor|video-editor role]] · [[../.claude/skills/construction-sequence-brainstorm/SKILL|construction-sequence-brainstorm (technique/organization knowledge)]] · [[../.claude/skills/write-ai-timelapse-video-sequence-script/SKILL|write-ai-timelapse-video-sequence-script (locks keyframe/segment count + prompts)]] · [[../.claude/skills/ai-timelapse-video/SKILL|ai-timelapse-video (core mechanics)]] · [[../.claude/skills/gemini-veo-3.1-video-gen/SKILL|gemini-veo-3.1-video-gen]] · [[../.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]] · [[./[social]_[ai-commercial-short-video]|ai-commercial-short-video (sibling, multi-scene narrative)]] · [[./docs/ai-commercial-short-video-KNOWN-ISSUES|Known Issues (shared BGM/field gaps)]]
