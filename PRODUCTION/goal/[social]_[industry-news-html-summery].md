---
id: "[social]_[industry-news-html-summery]"
studio: social-media
visual_type: industry-news-html-summery
format_allow: [industry-news]
tool_routing:                    # video render routes through Codex CLI, per CLAUDE.md
                                  # Critical Session Context item 3: "Video render = Codex"
  text:  { volume: single, mechanism: "content-executive draft -> nested agy CLI Vietnamese quality pass; also writes script.json scene beats" }
  video: { platform: social, mechanism: "content-executive drafts script.json beats -> designer adds brand frame.md + image intents -> video-editor locks blueprints/transitions and runs the 5 [html-video]-* skills in sequence (VoxCPM TTS via voxcpm-voice-engine + HyperFrames render, tag-indexed blueprint library as visuals — no fixed preset)" }
primary_skills: [wiki-query, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "INDUSTRY NEWS HTML SUMMERY"
  done_status: "Submit to Review"
  # NEW FIELD REQUIRED ON Posts DB — "Source Article URL" (url type). Not verified against the
  # live schema yet; create it before dispatching a real ticket through this workflow.
inputs: [notion_page_id, campaign_folder, language, deadline]  # everything else pulled from Notion
output_dir: BASE/CAMPAIGNs/{bucket}/{brand}/{channel}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/STORAGE-HIERARCHY.md
done_when: "final .mp4 in {{campaign_folder}}/ (root) + thumbnail in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message set + video R2-uploaded and embedded (Post body video block) + manifest.json + Post Status = 'Submit to Review'"
status: active
---

# industry-news-html-summery

Turns one long-form industry/news article URL into a 9:16 short video (minimum 45s, longer if the
ticket brief specifies) — real spoken narration (VoxCPM2, cloned to the brand's own voice) over
HTML-composed scenes built from HyperFrames' tag-indexed general-purpose blueprint library (never
a fabricated stock-photo look, never a fixed preset catalog), in a **hook → pull-up → body → end**
narrative loop (pull-up is an antithesis/contradiction beat right after the hook, creating
retention tension; end wraps the topic and loops back to the hook unless the brief asks for a CTA
instead). Render engine: 5 independent skills under `.claude/skills/`, each named
`[html-video]-<step>` (`script-lock`, `voice-synthesis`, `audio-mix`, `subtitle-burn`,
`thumbnail-signal`) — see each skill's own `SKILL.md`. This supersedes both the old
`news-summery-editing` fixed-`.hbs`-preset pipeline and the short-lived monolithic
`hyperframes/skills/industry-news` skill (2026-08-08, superseded the same day it was rebuilt — see
`docs/superpowers/specs/2026-08-08-industry-news-script-pipeline-redesign-design.md`). Distinct
from `[social]_[html-carousel]`: this workflow produces one continuous narrated video, not a
swipeable static image set, and its source is a crawled article rather than a Notion creative
brief.

**Every beat picks its visual shape by content, from the full blueprint library** — see
`.claude/skills/[html-video]-script-lock/references/scene-type-blueprint-map.md` for the picking
guidance (content shape → candidate tags, Reproduce/Adapt/Compose posture, transition picking for
2-beat scenes). There is no preset ceiling and no fixed scene count.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the 3 roles in
> sequence.

```text
This is an industry-news-html-summery for {{channel}}, brand {{brand}}, pillar {{pillar}},
campaign {{campaign_link}}. Source article: {{source_url}}.

content-executive (runs first): fetch {{source_url}}, extract title/body/domain (image crawling
is the designer role's job, via crawl-article-images.mjs — see below). Use
/wiki-query for the brand's writing style, then draft the caption highlighting {{post_message}},
slogan {{slogan}}, big idea {{big_idea}}, hook {{headline_hook}} — mandatory Vietnamese quality
pass through a nested `agy --dangerously-skip-permissions` session before treating any draft as
final. Save to {{campaign_folder}}/caption.md. Then plan the video: determine targetDurationSec
(from the brief if it specifies a length, else 45s floor) and compute a planning scene count via
ceil(targetDurationSec / 3). Write voiceText + visualBrief per beat, covering the article's real
structure, using this narrative shape: hook scene = 2 beats (hook line + pull-up — an immediate
antithesis/contradiction line that creates retention tension); body scenes = 1 beat each (headline
fact, a key stat, a supporting detail — never pad with filler); end scene = 2 beats (verdict +
loop-back to the hook, closing the narrative loop) unless the brief requires a CTA, in which case
end is a single CTA beat. Save the scene plan to node/scene-plan.md and start
{{campaign_folder}}/node/video-build/script.json with these fields (no blueprintId yet).

designer (runs after content-executive): read node/scene-plan.md. Read
BASE/BRAND KITs/{{brand}}_Brand_Kit/frame.md — if it doesn't exist yet, pick a fitting preset from
video_modules/hyperframes/skills/hyperframes-creative/frame-presets/ and save it there for all
future {{brand}} videos (never re-picked per project unless this ticket explicitly asks for a
style change). First run
`node video_modules/hyperframes/skills/media-use/scripts/crawl-article-images.mjs --url
{{source_url}} --project {{campaign_folder}}/node/video-build --json` once to fetch the article's
real og:image + inline images into `node/video-build/node/crawled-images/` — no extra deps, pure
fetch+regex. For each beat, add `imageIntent` where a visual asset is needed and, when one of the
crawled images fits that beat, resolve it via `media-use resolve --type image --intent
"<beat description>" --project {{campaign_folder}}/node/video-build --from
node/crawled-images/<file>` — only fall through to `media-use resolve` search/generate (HeyGen/
mflux) when no crawled article image suits that beat. Never fabricate imagery when a real
article image is available. Pull {{brand}}'s real identity from its Brand Kit: displayName,
TikTok handle, followers, avatarUrl, ≤3-char initials, and the brand's voice-reference .wav path
(voiceReferenceAudio) — never leave metadata.brand empty and never reuse another brand's voice.
Continue updating {{campaign_folder}}/node/video-build/script.json.

video-editor (runs after designer, per its `industry-news path` in
.claude/agents/video-editor.md): for every beat, follow
.claude/skills/[html-video]-script-lock/references/scene-type-blueprint-map.md to pick a
blueprintId from video_modules/hyperframes/skills/hyperframes-animation/blueprints-index.md's
general-purpose section — Reproduce/Adapt/Compose, never force a wrong shape onto real content.
For any 2-beat scene (hook, or a CTA-less end), also pick a transitionId joining the 2 beats.
Estimate `estimatedTimingSec` per beat. This locks the full `script.json` following
`.claude/skills/[html-video]-script-lock/scripts/lib/script-schema.ts` — the standard contract to
run the pipeline. Then run the 5 `[html-video]-*` skills in sequence against that script.json:
`script-lock`'s `01-init.ts` (validate + lock) → `voice-synthesis`'s `02-synthesize-voice.ts`
(cloned-voice TTS per beat) → source any beat with `imageIntent` via `media-use resolve` → build
`compositions/index.html` (subagent, instantiating each beat's blueprint) →
`script-lock`'s `06-mark-progress.ts scenes_built` → `hyperframes lint`/`check --strict
--snapshots` (never render past a failing gate) → `audio-mix`'s `03-mix-audio.ts` (SFX/BGM) →
`hyperframes render` → `subtitle-burn`'s `04-burn-subtitles.ts` (whisperx word-level burn) →
`thumbnail-signal`'s `05-thumbnail-signal.ts`. In parallel with the render/subtitle-burn calls,
the designer role generates {{campaign_folder}}/thumbnail.png (gpt-img-2-gen, ≥2K) so it's ready
the moment render finishes — the thumbnail-signal skill just confirms it landed. Move the
rendered video.mp4 to {{campaign_folder}}/video.mp4 (root, not node/) — every other artifact
(script.json, voice/, compositions/, renders/video-raw.mp4) stays inside node/video-build/.

Benchmarks — all must hold before this ticket is done: caption reads as natural Vietnamese; the
locked script.json's scene sequence starts with hook (2 beats) and ends with end (1-2 beats per
CTA requirement); every beat's blueprint choice passes `hyperframes check --strict --snapshots`
(never render past a failing gate); metadata.brand carries {{brand}}'s real identity, never a
different brand's voice/handle/logo; final video plays back with correct beat count/order, total
length ≥ targetDurationSec, and audible narration matching the article's real facts (no
fabricated numbers); thumbnail is ≥2K and matches the video's actual content; no
prohibited/copyrighted marks.

Upload via notion-upload: caption -> "Post Message", hook -> "Headline/Hook", hashtags ->
"Hashtag", thumbnail image -> "THUMBNAIL". Video delivery (>5MB, never a Notion file property):
`upload_video_to_r2.js` the final mp4 to R2, then `upload.py --video-url` to embed it as a video
block on the Post page. Write {{campaign_folder}}/manifest.json last, only once every benchmark
above holds — this is the ticket-completion manifest, distinct from
{{campaign_folder}}/node/video-build/progress.json (the pipeline's own per-step state, written
throughout by the 5 `[html-video]-*` skills).

Goal: {{done_when}} — finish by setting the Post "Status" to "Submit to Review".
```

## Notion field mapping (async pull)

Same fallback-pull convention as `[social]_[single-static].md`: fetch the Post page by
`{{notion_page_id}}`, read fields directly; only hop the `Social Media Campaigns` relation for
`{{slogan}}`/`{{big_idea}}`.

| Prompt placeholder | Actual DB field | Type | Note |
|---|---|---|---|
| `{{channel}}` | Posts · `Channel` | multi_select | live schema uses `multi_select` |
| `{{brand}}` | parent brand page title | page title | walk Post's ancestors |
| `{{pillar}}` | Posts · `Pillar` | select | direct read |
| `{{campaign_link}}` | Posts · `Social Media Campaigns` | relation | resolved link |
| `{{post_message}}` | Posts · `Post Message` | text | dual-use: brief in, caption out |
| `{{slogan}}` | Campaign · `Slogan` | text | via relation |
| `{{big_idea}}` | Campaign · `Big Idea` | text | via relation |
| `{{headline_hook}}` | Posts · `Headline/Hook` | text | dual-use: brief in, hook out |
| `{{source_url}}` | Posts · `Source Article URL` | url | **NEW field — not yet in live schema, see frontmatter note** |
| `{{campaign_folder}}` | — (local) | — | resolved per `STORAGE-HIERARCHY.md` |
| `{{notion_page_id}}` | Posts page id | id | dispatch param |

**Write back (notion-upload → the Post page):**

| Artifact | Posts · field | Type |
|---|---|---|
| caption body | `Post Message` | text |
| headline/hook | `Headline/Hook` | text |
| hashtags | `Hashtag` | text |
| thumbnail image | `THUMBNAIL` | file |
| final video | Post body **video block** (external, R2 URL) — never the file property (5MB cap) |
| completion | `Status` = `Submit to Review` | select |

## Notes

- **Article image sourcing is a real script, not prose.**
  `video_modules/hyperframes/skills/media-use/scripts/crawl-article-images.mjs` fetches
  `{{source_url}}`'s HTML and downloads its og:image (cover candidate) + up to 8 inline body
  images to a local `node/crawled-images/` folder (dependency-free — Node's built-in `fetch` +
  regex, no DOM parser). Sends a browser-like User-Agent + article-origin Referer (news CDNs
  hotlink-protect and some also block on UA substrings — verified against a real vnexpress.net
  article 2026-08-10). `media-use resolve --type image --from node/crawled-images/<file>` freezes
  the chosen local file into the project manifest; only fall through to `media-use resolve`
  search/generate (HeyGen/mflux) when no crawled image fits a beat.
- **One new Posts DB field required:** `Source Article URL` (url type) — verify/create before a
  real ticket dispatches.
- **Brand identity is per-ticket, never a fixed default.** `metadata.brand` is required in
  `script.json`, no built-in fallback — always pull the real per-brand voice-reference `.wav` +
  TikTok identity from the ticket's Brand Kit, never reuse Solo Flows' own or another brand's.
- **Brand visual identity (`frame.md`) is now persistent per brand**, not re-picked per video
  project — see `BASE/BRAND KITs/<Brand>_Brand_Kit/frame.md`, established 2026-08-08.
- **No preset ceiling, no fixed scene count.** Every beat picks its shape from the full
  tag-indexed blueprint library via `scene-type-blueprint-map.md`; scene count is planning-driven
  from `targetDurationSec` (2026-08-08 script-pipeline redesign).
- **Video render is 5 independent skills, not one packaged skill.** `.claude/skills/[html-video]-
  {script-lock,voice-synthesis,audio-mix,subtitle-burn-industry-news,thumbnail-signal}/` — driven by the
  `video-editor` role's `industry-news path` (`.claude/agents/video-editor.md`). content-executive
  and designer author the script's content/visual-intent fields; video-editor locks blueprint/
  transition/timing choices and runs the 5 skills in sequence. This replaced a short-lived
  monolithic `hyperframes/skills/industry-news` skill the same day it was built, after a decision
  against packaging this pipeline inside the `hyperframes` repo.
- **Storage moved to the campaign folder.** All pipeline working files live in
  `{{campaign_folder}}/node/video-build/` (script.json, progress.json, voice/, compositions/,
  renders/) — no skill owns its own `videos/<project>/` directory anymore.
- **Real end-to-end render mechanism proven 2026-08-08**, re-proven 2026-08-10 on the current
  beat/pull-up/loop-back structure + 5-skill split + `crawl-article-images.mjs` image sourcing (a
  real vnexpress.net article, `_scratch/industry-news-test-render/`, not committed): real cloned
  voice per beat, real crawled article images bound into `evidence-board-assemble`, real
  blueprint-driven visuals (7 beats across 5 scenes, 2 overlap transitions), real `check
  --snapshots` clean pass, real render, real muxed audio, real whisperx-burned word-level Vietnamese
  subtitles — confirmed by eye via extracted frames.
  **Two real gaps found and fixed during this pass, neither previously documented:**
  1. **`<audio src="voice.mp3">` must be added as a direct child of the composition root before
     `hyperframes render`** — nothing in this doc or the skill docs said so; the first render came
     out silent (`hasAudio:false` in the render trace) because the build step never embeds it
     automatically. `[html-video]-audio-mix` must run and produce `voice.mp3` *before* the
     composition's `index.html` is finalized, and the build step must add the `<audio>` element
     itself (see `hyperframes-core` → `variables-and-media.md`) — `[html-video]-subtitle-burn-
     industry-news` only burns subtitles onto whatever audio the render already has; it does not
     mux narration in.
  2. **A blueprint's own authored `duration` almost never matches a beat's real TTS'd duration** —
     don't bind a blueprint's tween offsets literally; rescale every `S + offset` timestamp by
     `realBeatDuration / blueprint.metadata.duration` so the full choreography still completes
     inside the beat's actual window (`hero-stat-reveal` authored 4s ran inside a 7.04s beat here;
     `evidence-board-assemble` authored 3.5s ran inside 7.68s).
  Also reconfirmed the Vietnamese-font gap class from `frame.md`'s Known Gaps is not
  Shrikhand/Baskerville-only: Poppins 800 silently fell back to a system serif for `Ỷ` (in "9 NGHÌN
  TỶ") — caught only by eyeballing a snapshot PNG, not by any automated check. Swapped that slot to
  Inter (already proven correct elsewhere in the same render) rather than trying to fix the subset
  request — treat any font family binding a Vietnamese numeral/stat display as unverified until
  visually checked, not just Shrikhand/Baskerville.
  `index.html` lives directly at `{{campaign_folder}}/node/video-build/` (not under a `compositions/`
  subfolder) — `hyperframes lint`/`check`/`render` all resolve `index.html` at the project root by
  default; `compositions/` is only for sub-composition files loaded via `data-composition-src`.
- **Language** defaults to Vietnamese unless the ticket says otherwise.
- **Completion.** Set `Status = Submit to Review` and write `manifest.json`. No status message
  before done.

## Graph
[[../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]] · [[../CLAUDE|Social Media CLAUDE]] · [[../../../../BASE/CAMPAIGNs/STORAGE-HIERARCHY|Storage Hierarchy]] · [[../TOOL-ROUTING-CLI-VS-API|Tool Routing: CLI vs API]] · [[../.claude/agents/content-executive|content-executive role]] · [[../.claude/agents/designer|designer role]] · [[../.claude/agents/video-editor|video-editor role]] · [[../.claude/skills/[html-video]-script-lock/SKILL|[html-video]-script-lock]] · [[../.claude/skills/[html-video]-voice-synthesis/SKILL|[html-video]-voice-synthesis]] · [[../.claude/skills/[html-video]-audio-mix/SKILL|[html-video]-audio-mix]] · [[../.claude/skills/[html-video]-subtitle-burn-industry-news/SKILL|[html-video]-subtitle-burn-industry-news]] · [[../.claude/skills/[html-video]-thumbnail-signal/SKILL|[html-video]-thumbnail-signal]] · [[../.claude/skills/[html-video]-script-lock/references/scene-type-blueprint-map|Scene-type blueprint picking guidance]] · [[../../../../docs/superpowers/specs/2026-08-08-industry-news-script-pipeline-redesign-design|Script-pipeline redesign spec]] · [[../../../../DOCS/hyperframe-bp-upgrade/PLAN|PLAN.md Task B — original render-mechanism proof]] · [[./[social]_[single-static]|single-static (schema model)]] · [[./[social]_[html-carousel]|html-carousel (sibling, static not video)]]
