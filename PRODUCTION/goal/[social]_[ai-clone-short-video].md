---
id: "[social]_[ai-clone-short-video]"
studio: social-media
visual_type: ai-clone-short-video
format_allow: [ask-a-question, before-after, behind-the-scenes, brand-story, case-studies, challenge, clipping, endorsement, free-trials, fun-facts, industry-news, interviews, introduce-team, lifestyle-content, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, special-offers, testimonials, tip-of-the-day, tutorials]
amount: [single, batch]        # studio agent picks engine per ticket volume; body below covers single (per-sequence render) — batch spawns one parallel sub-agent per ticket, same schema
engine:
  single: { text: in-session-gemini-3-pro, crawl: "crawl_describe_Tiktok_vid_kalodata (direct Kalodata MP4); crawl_describe_Tiktok_vid_apify (fallback)", script: "write-shooting-script", timing: "gemini-tts-timing", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen reference_to_video, per-sequence sequential)", upscale: "flowkit 1080p → ffmpeg fallback", voice: "approved per-scene voice strategy" }
  batch:  { text: gemini-api-skill,        crawl: "crawl_describe_Tiktok_vid_kalodata (direct Kalodata MP4); crawl_describe_Tiktok_vid_apify (fallback)", script: "write-shooting-script", timing: "gemini-tts-timing", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen parallel per-ticket sub-agents)", upscale: "flowkit 1080p → ffmpeg fallback", voice: "approved per-scene voice strategy" }
primary_skills: [wiki-query, crawl_describe_Tiktok_vid_kalodata, crawl_describe_Tiktok_vid_apify, write-shooting-script, gemini-tts-timing, write-ai-ugc-video-sequence-script, tea-ugc-ai-realism, video-thumbnail, acad-image-gen, fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen, fk-omni-video-gen, gwt-remove-watermark-video, ffmpeg-upscale-video, "[html-video]-post-production-qa-broll-overlay", "[html-video]-subtitle-burn-talking-head", "[html-video]-audio-mix", element-resolver, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "AI CLONE SHORT VIDEO"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline]  # campaign_folder format: BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/YYYY-MM-DD/
output_dir: BASE/CAMPAIGNs/{ip_campaign}/{platform}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md
done_when: "final .mp4 in {{campaign_folder}}/ (root, not node/ or video/) + thumbnail in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message set + video R2-uploaded and embedded (Post body video block, ≥5MB never attached as a file property) + manifest.json + Post Status = 'Submit to Review'"
status: active
runtime:
  modules_manifest: PRODUCTION/video_modules/VIDEO-MODULES.md
  runtime_env: PRODUCTION/video_modules/runtime.sh
  preflight: PRODUCTION/video_modules/preflight.sh
---

# ai-clone-short-video

Omni-rendered TikTok clone short video via Flowkit — rebuilds a target TikTok reference video frame-by-frame (pacing, layout, tone) using company-owned assets, characters, settings, products, and voice, while preserving original camera composition and sequence structure.

Pipeline overview:
0. From the workspace root, source `PRODUCTION/video_modules/runtime.sh` and run `PRODUCTION/video_modules/preflight.sh`. If it fails, stop; do not substitute a different campaign's footage or an unapproved TTS provider.
1. `researcher` routes the input reference URL from Notion's `Visual Concept` and `Voice` body sections: use `crawl_describe_Tiktok_vid_kalodata` for a direct `live.kalocdn.com/video/*.mp4` URL; use `crawl_describe_Tiktok_vid_apify` only as fallback for a non-Kalodata public TikTok post URL. Its final reference Markdown is the `preset_sequence_script`; it supplies the raw sequence structure, reference keyframes (sampled at 3s intervals with deduplication), and source voice structure.
2. `content-executive` drafts caption (`caption.md`), then runs `write-shooting-script` using the preset sequence script and source voice script as input:
   - Voice script is adapted keeping 80% of original cadence, flow, and tone, replacing only the human, product, brand context, and target language if required.
   - Dialogue lines are timing-locked via `gemini-tts-timing` (`node/timing/timing-lock.json`) before sequence division.
   - Script is divided into minimal 4/6/8/10s sequence packing.
   - Runs `write-ai-ugc-video-sequence-script` to write `node/ugc-sequence-script.md`, incorporating both company ref assets and the extracted target keyframes (`iconic-frames/`) as visual references so rendered frames do not drift from the reference video.
   - Applies `tea-ugc-ai-realism` review before handoff.
3. `designer` resolves character/product/setting references plus extracted ref keyframes, registers all refs in Flowkit (`fk-create-project`, `fk-gen-refs`), writes `node/thumbnail-brief.md` from the locked first beat, and renders `thumbnail.jpg` via `video-thumbnail` + `acad-image-gen`.
4. `video-editor` renders sequence clips with Flowkit Omni (`fk-omni-video-gen`), executes mandatory **Flowkit 1080p upscale** (`POST /api/flow/upscale-video`) or the recorded `ffmpeg-upscale-video` fallback, downloads each scene, runs download QA, removes the Gemini/Veo visible watermark per scene (`gwt-remove-watermark-video`), runs post-processing QA, inserts product B-roll using approved product refs plus the matching A-roll/voice audio source, concatenates, runs dead-air/boundary and WhisperX approved-text QA, renders transparent HyperFrames product/price/text overlays over A-roll, burns subtitles (`[html-video]-subtitle-burn-talking-head` with `SEGMENT_MODE=smart MAX_TOKENS=5 SUB_Y_RATIO=0.75`), mixes audio/SFX/BGM (`[html-video]-audio-mix`), runs final QA, prepends `thumbnail.jpg` as frame 0, and saves final MP4.
5. `notion-publisher` uploads assets, writes back to Notion, and creates `manifest.json`.

## Amount paths

- **single** — one ticket, sequential per-sequence render (`sequences` planned by minimal 4/6/8/10s packing from TTS timing lock).
- **batch** — multiple tickets in one run — spawn one parallel sub-agent per ticket.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the roles in sequence. No parallel fan-out within a single ticket.

```text
This is a {{format}} ai-clone-short-video for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign {{campaign_link}}. Topic: {{topic}}. Voice/persona: {{voice_brief}}. Reference TikTok URL: {{visual_concept_script}} (same URL used for visual concept and voice). Video requirement (hard constraints — duration cap, aspect ratio, dialogue/subtitle requirements): {{video_requirement}}. B-roll mode: {{broll_mode}} (Brief: {{broll_description}}). Overlay mode: {{overlay_mode}} (Brief: {{overlay_description}}).

Execution steps:

researcher (runs first):
Step 1: Parse the target reference URL from Notion fields (Visual Concept / Voice body).
Step 2: If the URL matches `https://live.kalocdn.com/video/*.mp4`, run `crawl_describe_Tiktok_vid_kalodata` to download it directly. Otherwise, run `crawl_describe_Tiktok_vid_apify` only for a public TikTok post URL. Both skills store every downloaded source video and extracted keyframe **inside `BASE/BRAND KITs/6. Script_Template/{biz_niche}/` by brand/niche** (create the niche folder if it does not already exist; reuse it if it does) — never in `node/staging/` under `PRODUCTION/` or this campaign unit; that path is scratch-only and is deleted by the crawler before it hands off. Save the final reference Markdown as `preset_sequence_script_path`. Use its sibling `-keyframes/` directory as `clone_keyframe_dir`; it contains 3-second deduplicated iconic frames. The preset supplies source sequence structure and voice structure.

content-executive (runs after researcher):
Step 0 (Structural Fidelity Contract — read before writing anything): read
`preset_sequence_script_path`'s `subject_visibility`, `audio_mode`, and `background_continuity`
frontmatter fields (and its "Fidelity note" line). These are **hard constraints**, not creative
suggestions — carry them into every downstream artifact this ticket produces:
- If `subject_visibility: hands-only` or `product-only`, the clone script must stay hands-only/
  product-only — never invent an on-camera talking creator. Only when the source is genuinely
  `on-camera talking` may the clone script show a face.
- If `audio_mode: voiceover narration`, keep the adapted dialogue as VO over B-roll — do not
  rewrite it into on-camera lip-synced dialogue.
- If `background_continuity: single location`, keep the whole clone in one consistent set — do
  not introduce a location/set change the source never had.
- **Duplication ratio:** target ≥8/10 structural fidelity to the source's actual shot mechanism
  (shot count, camera framing per beat, subject-visibility pattern, location count, cut rhythm) —
  the *only* things approved to change are brand identity, product, exact wording, and (per Step
  1's 80% rule) voice/persona. If a gap between the locked reference and what's about to be
  written is unavoidable (e.g. the source is `on-camera talking` but this brand has no approved
  creator face), stop and record it as `REVIEW REQUIRED` in `node/creative-brief.md` instead of
  silently substituting a different visual mechanism.
Step 1 (Caption & Voice Adaptation): Write post caption into {{campaign_folder}}/caption.md. Adapt the extracted voice script keeping 80% of original tone, cadence, and structure—replacing only character, product, brand context, and target language if requested.
Step 2 (Shooting Script & Gemini TTS Timing Lock): Run `gemini-tts-timing` on the adapted approved voice lines, save the exact final voice text as `node/timing/approved-voice.txt`, then run `write-shooting-script` using `preset_sequence_script_path`, `clone_keyframe_dir`, and the adapted voice script. Save `node/timing/timing-lock.json` + per-line WAVs, measure exact durations, and set sequence boundaries using minimal 4/6/8/10s packing to yield `node/shooting-script.md`. Re-state Step 0's `subject_visibility`/`audio_mode`/`background_continuity` constraints explicitly inside `node/shooting-script.md` so `write-ai-ugc-video-sequence-script` inherits them without re-reading the source reference.
Step 3 (UGC Sequence Script with Keyframe Refs): Run `write-ai-ugc-video-sequence-script` to write `node/ugc-sequence-script.md`. Each sequence prompt must include ref-keyframe references extracted in Step 1 (beside company product/character/setting assets) to anchor composition and prevent visual drift from the target clone video. A sequence may register and send up to 10 total references when needed; choose only the refs that materially anchor its matched source beats.
Step 4 (Realism Check): Run `tea-ugc-ai-realism` on `node/ugc-sequence-script.md` to polish prompt realism without altering locked timeline/schema/dialogue.

designer (runs after content-executive):
Step A (Ref Package Resolution): Resolve human/character refs (`element-resolver` -> `photography-direction` mode: reference if missing), product and setting refs (`flowkit-nano-banana-image-gen`), plus target ref-keyframes from step 1. Create Flowkit project (`fk-create-project`) and register all resolved refs (`fk-gen-refs`).
Step B (Thumbnail Brief): Run `video-thumbnail` from the locked clone sequence; write `{{campaign_folder}}/node/thumbnail-brief.md` with the first-beat hook, actual subject/product, safe area, and approved refs.
Step C (Thumbnail Rendering): Render the 9:16 TikTok thumbnail into {{campaign_folder}}/thumbnail.jpg via `acad-image-gen`; do not invent a disconnected `creative-direction` query.

video-editor (runs after designer): read locked `node/ugc-sequence-script.md`.
Step 1 (Omni Video Generation via Flowkit): for each `### Sequence N` fenced ```json block in Part B, parse and validate the block, then serialize the complete JSON object as the Flowkit Omni `prompt` value. Omni receives the full sequence JSON including `scene_description`, `timeline`, `style`, `camera_direction`, `lighting`, `voice`, `SFX`, `environment`, `element`, `motion`, `ending`, `text`, and `keyword`. Call Flowkit Omni (`fk-omni-video-gen`, endpoint `POST /api/flow/generate-video-refs-omni`) using that full-JSON `prompt`, `reference_media_ids` (max 10), `aspect_ratio: VIDEO_ASPECT_RATIO_PORTRAIT`, and the block's `duration_s: 4|6|8|10`. Obtain primaryMediaId/raw clip media ID.
Step 2 (Mandatory 1080p Video Upscale via Flowkit): before downloading raw clip for downstream use, send mandatory upscale request:
  `POST /api/flow/upscale-video` with `{"media_id": "<raw_media_id>", "scene_id": "scene-N", "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT", "resolution": "VIDEO_RESOLUTION_1080P"}`
  Poll operation until COMPLETED. Obtain upscaled video base64 (`encodedVideo`) via `GET /api/flow/media/<upscaled_primary_media_id>` and save to `node/scenes/scene_{N}_1080p_raw.mp4`. If Flowkit fails, run `ffmpeg-upscale-video` on the downloaded scene, keep the original download, and record the fallback engine and error.
Step 3 (Watermark Removal — Omni/Flow renders always carry the Gemini/Veo visible watermark):
  immediately after each scene's 1080p download, run download QA before any voice/concat work touches it, then run
  `gwt-remove-watermark-video` (`video_modules/VeoWatermarkRemover/skills/gwt-remove-watermark-video.md`)
  on that single scene: `GeminiWatermarkTool-Video --veo -i node/scenes/scene_{N}_1080p_raw.mp4 -o
  node/scenes/scene_{N}_1080p_nowm.mp4 -q`. This is a demo binary capped at roughly 10s of input
  per call — since every Omni sequence is itself packed to 4/6/8/10s, running it **per scene
  before concat** (never on the already-concatenated multi-scene video) always stays in bounds.
  Spot-check one frame's bottom-right corner crop per scene to confirm the mark is actually gone
  before trusting the output. All downstream steps consume `scene_{N}_1080p_nowm.mp4`, not the
  raw watermarked file. Run post-processing QA on the clean output before voice sync.
Step 4 (Applio Voice Sync on the Watermark-Clean Render — NOT a pre-baked-audio splice): the
  locked `node/timing/timing-lock.json` WAVs are a **pre-production timing reference only** (they
  exist to lock dialogue duration and sequence packing before Omni ever renders) — they are not
  the source for the final audio track. The Omni render's own generated dialogue audio, baked
  into `scene_{N}_1080p_nowm.mp4`, is the real source. Run `applio-brand-voice` **Mode 2 (Voice
  Sync)** per scene: extract that scene's own audio to a mono 40kHz working WAV, measure its
  pitch, run `core.py infer` (RVC conversion to the trained brand voice model), then remux the
  converted WAV back onto that scene's watermark-clean video stream (`-map 0:v -map 1:a -c:v copy
  -c:a aac`) — never `core.py tts` (Mode 1) and never a straight splice of the pre-baked
  `node/timing/line_*_rvc.wav` files onto the new render; those files' only remaining job is
  confirming the Omni render's dialogue timing/duration landed within the locked packing, not
  supplying final audio.
Step 5 (Post-Production & Final Assembly):
  1. Product B-roll Handling (runs when `b-roll: true` in sequence script / ticket): Resolve approved product B-roll, keep it visual-only, pre-trim every clip to its declared slot, map B-roll video to the matching A-roll/approved voice audio, and save `node/broll-manifest.json`. Use actual `ffprobe` concat durations, `-itsoffset` and `eof_action=pass` for full-frame cutaways. (If `b-roll: false`, skip B-roll mapping and assemble A-roll scenes directly).
  2. Concatenate the voice-synced, watermark-clean scene MP4s in order
     (`node/scenes/scene_*.mp4`, the Step 4 output) into `node/video_concat.mp4`.
  3. Run dead-air and boundary QA into `node/concat-qa.json`, then run WhisperX on the concat audio, compare to `node/timing/approved-voice.txt`, correct only
     subtitle text with `correct_whisper_text.py`, then burn via `[html-video]-subtitle-burn-talking-head`
     using `SEGMENT_MODE=smart MAX_TOKENS=5 SUB_Y_RATIO=0.75` if requested in {{video_requirement}}.
  4. HyperFrames Overlay Handling (runs when `overlay: true` in sequence script / ticket): Render transparent product/price/CTA/text overlays with HyperFrames `talking-head-recut`/`motion-graphics`; use ProRes 4444 alpha and `setpts=PTS+start/TB` (never combine with `-itsoffset`), reserve `y=0.72–0.90` for subtitles, and save `node/hyperframes-overlay-manifest.json`. (If `overlay: false`, skip HyperFrames overlay generation).
  5. Mix SFX and background music via `[html-video]-audio-mix` based on Part C spec, run final QA,
     then prepend `thumbnail.jpg` as the **first keyframe** (1 frame at 24fps) using ffmpeg
     filter_complex so thumbnail is frame 0 of the final output.
  6. Save final MP4 to {{campaign_folder}}/ root (flat).

notion-publisher (runs last): write back caption, hook, thumbnail, R2-embedded video link to Notion Post page, and create {{campaign_folder}}/manifest.json after verification holds.
```

## Notion Field Mapping & Completion Contract

Same Notion Post DB integration as UGC short video workflow.
Special input rule: `visual_concept_script` and `voice_brief` in Notion Ticket carry the exact same reference URL. Prefer a direct Kalodata MP4 URL; a public TikTok post URL uses the Apify fallback path.
Completion condition requires final 1080p MP4 at root, thumbnail at root, R2 video embed, updated Post fields, `manifest.json`, and `Status = 'Submit to Review'`.

## Notes & Technical Alignment

- **Gemini TTS timing lock:** create `node/timing/lines.json`, run `gemini-tts-timing`, and pack the minimum
  4/6/8/10s plan from measured durations before writing the clone sequence script. Keep the source
  reference structure, but never estimate speech timing from characters.
- **Scene order:** `reference download → Gemini TTS timing → sequence script → Omni render → Flowkit
  upscale (or ffmpeg fallback) → download QA → per-scene watermark removal → post-processing QA →
  product B-roll/audio mapping → concat → dead-air/boundary QA → WhisperX + approved-text QA →
  HyperFrames A-roll overlays → subtitle burn → SFX/BGM mix → final QA → thumbnail prepend`.
- **Subtitle/audio QA:** compare WhisperX words from the concat audio with the approved voice text
  before burn; preserve timestamps, correct only transcript text, and enforce Vietnamese smart
  grouping with a hard maximum of 5 visible tokens at `SUB_Y_RATIO=0.75`.
- **Thumbnail:** derive the hook, subject/product, first-beat tension, safe area, and reference
  assets from the locked clone sequence via `video-thumbnail`; do not use a generic creative query.

- **Reference Crawl & Frame Extraction:** `crawl_describe_Tiktok_vid_kalodata` directly downloads a Kalodata MP4 and extracts sequence structure, voice text, and 3-second deduplicated iconic keyframes. `crawl_describe_Tiktok_vid_apify` is fallback-only for a public TikTok post URL.
- **80% Voice Adaptation:** Keep 80% original sentence structure, delivery rhythm, and tone, replacing only brand, product, character context, and target language.
- **Structural Fidelity Contract:** `subject_visibility`, `audio_mode`, and `background_continuity`
  (fields on the locked `preset_sequence_script_path`, see
  `BASE/BRAND KITs/6. Script_Template/_shooting-script-template.md`) are hard constraints, not
  creative suggestions — a `hands-only` + `voiceover narration` + `single location` source must
  never drift into an on-camera talking creator in a new location. This was a real, documented
  2026-08-14 failure on this exact pipeline (see the correction notice in
  `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md`)
  — the crawler's own written description drifted from the actual footage, and every downstream
  step compounded it silently. Target ≥8/10 structural-fidelity (shot count, framing, subject
  pattern, location count, cut rhythm) against the source; only brand/product/copy/voice may
  change.
- **Ref-Keyframe Visual Alignment:** Sequence prompts must incorporate extracted target keyframes (`iconic-frames/`) alongside internal product/character refs to enforce strict layout alignment.
- **Mandatory Flowkit 1080p Upscale:** Every Omni clip must attempt `POST /api/flow/upscale-video` (`VIDEO_RESOLUTION_1080P`) before download. If it fails, use `ffmpeg-upscale-video`, preserve the original download, and record the fallback in `node/handoff.md`/`manifest.json`.
- **Mandatory Per-Scene Watermark Removal:** Every downloaded/upscaled clip must go through `gwt-remove-watermark-video` immediately after download and before any voice remux or concat. The demo binary is capped at ~10s per call, so run it per scene.
- **Voice/timing separation:** Gemini TTS WAVs lock pre-production timing only. Do not silently splice them onto lip-sync scenes; use the approved scene voice strategy and record any B-roll audio remux explicitly.
- **Product B-roll (Optional mode `b-roll: true`):** When declared in Ticket / sequence script,
  a B-roll beat replaces only the visible picture for its declared window. Keep its dialogue/voice
  empty and map video to the matching approved A-roll/voice audio; record the mapping in
  `node/broll-manifest.json`. When `b-roll: false`, skip cutaway mapping.
- **HyperFrames overlays (Optional mode `overlay: true`):** When declared in Ticket / sequence script,
  use `talking-head-recut`/`motion-graphics` for transparent product, price, CTA, and claim-safe
  text cards after concat. Reserve the lower subtitle band (`y=0.72–0.90`), verify alpha and
  timestamps, and save `node/hyperframes-overlay-manifest.json`. When `overlay: false`, skip overlay generation.
- **Post-Production Pipeline:** Audio mixing (`[html-video]-audio-mix`) and subtitles (`[html-video]-subtitle-burn-talking-head`) run strictly in post-production after scene concat and voice sync.

## Graph
[[../../AGENTS|Workspace AGENTS]] · [[../AGENT|Production AGENT]] · [[../../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE|Campaigns Structure]] · [[../.agents/skills/crawl_describe_Tiktok_vid_kalodata/SKILL|crawl_describe_Tiktok_vid_kalodata]] · [[../.agents/skills/crawl_describe_Tiktok_vid_apify/SKILL|crawl_describe_Tiktok_vid_apify fallback]] · [[../.agents/skills/write-shooting-script/SKILL|write-shooting-script]] · [[../.agents/skills/write-ai-ugc-video-sequence-script/SKILL|write-ai-ugc-video-sequence-script]] · [[../.agents/skills/tea-ugc-ai-realism/SKILL|tea-ugc-ai-realism]] · [[../.agents/skills/creative-direction/SKILL|creative-direction]] · [[../.agents/skills/acad-image-gen/SKILL|acad-image-gen]] · [[../video_modules/flowkit/skills/fk-omni-video-gen|fk-omni-video-gen]] · [[../.agents/skills/applio-brand-voice/SKILL|applio-brand-voice]] · [[../.agents/skills/[html-video]-post-production-qa-broll-overlay/SKILL|post-production-qa-broll-overlay]] · [[../.agents/skills/[html-video]-subtitle-burn-talking-head/SKILL|subtitle-burn-talking-head]] · [[../.agents/skills/[html-video]-audio-mix/SKILL|audio-mix]] · [[../video_modules/VeoWatermarkRemover/skills/gwt-remove-watermark-video|gwt-remove-watermark-video]]
