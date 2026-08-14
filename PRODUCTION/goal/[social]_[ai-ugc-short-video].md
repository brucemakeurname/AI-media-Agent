---
id: "[social]_[ai-ugc-short-video]"
studio: social-media
visual_type: ai-ugc-short-video
format_allow: [ask-a-question, before-after, behind-the-scenes, brand-story, case-studies, challenge, clipping, endorsement, free-trials, fun-facts, industry-news, interviews, introduce-team, lifestyle-content, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, special-offers, testimonials, tip-of-the-day, tutorials]
amount: [single, batch]        # studio agent picks engine per ticket volume; body below covers single (per-sequence render) — batch spawns one parallel sub-agent per ticket, same schema
engine:
  single: { text: in-session-gemini-3-pro, script: "write-shooting-script", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen reference_to_video, per-sequence sequential)", upscale: "flowkit (POST /api/flow/upscale-video 1080p mandatory)", voice: "applio-brand-voice (pre-script TTS timing lock + post-concat audio remux)" }
  batch:  { text: gemini-api-skill,        script: "write-shooting-script", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen parallel per-ticket sub-agents)", upscale: "flowkit (POST /api/flow/upscale-video 1080p mandatory)", voice: "applio-brand-voice (pre-script TTS timing lock + post-concat audio remux)" }
primary_skills: [wiki-query, write-shooting-script, write-ai-ugc-video-sequence-script, tea-ugc-ai-realism, creative-direction, acad-image-gen, fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen, fk-omni-video-gen, gwt-remove-watermark-video, applio-brand-voice, "[html-video]-subtitle-burn-talking-head", "[html-video]-audio-mix", element-resolver, notion-upload]
notion:
  posts_db: 38d0831f990c802db2b1e2a7b03a05da
  posts_source: collection://d830831f-990c-83a6-adf7-07c65da0e90a
  campaigns_db: 3990831f990c80119e4bf38f9c68bea9
  campaigns_source: collection://3990831f-990c-80a5-9b1d-000b0102b5a0
  relation_field: "Social Media Campaigns"
  visual_type_value: "AI UGC SHORT VIDEO"
  done_status: "Submit to Review"
inputs: [notion_page_id, campaign_folder, language, deadline]  # campaign_folder format: BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/YYYY-MM-DD/
output_dir: BASE/CAMPAIGNs/{ip_campaign}/{platform}/{format}/{date}/  # = {{campaign_folder}}, see BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md
done_when: "final .mp4 in {{campaign_folder}}/ (root, not node/ or video/) + thumbnail in {{campaign_folder}}/ + Post THUMBNAIL set + Post Message set + video R2-uploaded and embedded (Post body video block, ≥5MB never attached as a file property) + manifest.json + Post Status = 'Submit to Review'"
status: active
---

# ai-ugc-short-video

Omni-rendered raw/authentic UGC-style vertical short via Flowkit — distinct from `ai-commercial-short-video`'s TVC-polished register.

Pipeline overview:
1. `content-executive` drafts caption (`caption.md`), runs `write-shooting-script` to write `node/shooting-script.md`, runs `write-ai-ugc-video-sequence-script` to generate `node/ugc-sequence-script.md`, then uses `tea-ugc-ai-realism` to review and apply its actionable realism improvements before handoff.
2. `designer` resolves the reference package: for a missing human/character ref, `element-resolver` routes to `photography-direction` (`mode: reference`) to formulate and generate the person prompt; for product/setting refs, retrieve approved assets first, then generate missing items via `flowkit-nano-banana-image-gen`. Register all refs in Flowkit (`fk-create-project`, `fk-gen-refs`), then use `creative-direction` (or `photography-direction` standalone for human lifestyle) to formulate the thumbnail prompt and render it via `acad-image-gen`.
3. `video-editor` renders Omni sequence clips via Flowkit (`fk-omni-video-gen`), runs mandatory **Flowkit 1080p upscale** (`POST /api/flow/upscale-video`), removes the Gemini/Veo visible watermark per scene (`gwt-remove-watermark-video`, before concat), runs Applio **Voice Sync** on each scene's own render audio (`applio-brand-voice` Mode 2 — not a pre-baked-TTS splice), burns subtitles (`[html-video]-subtitle-burn-talking-head`), mixes audio/SFX/BGM (`[html-video]-audio-mix`), prepends the thumbnail as the **first keyframe**, and saves the final MP4.
4. `notion-publisher` uploads assets, writes back to Notion, and creates `manifest.json`.

## Amount paths

- **single** — one ticket, sequential per-sequence render (`sequences` planned by minimal 4/6/8/10s packing from TTS timing lock).
- **batch** — multiple tickets in one run — spawn one parallel sub-agent per ticket.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the 3 roles in sequence. No parallel fan-out within a single ticket.

```text
This is a {{format}} ai-ugc-short-video for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign {{campaign_link}}. Topic: {{topic}}. Voice/persona: {{voice_brief}}. Video requirement (hard constraints — duration cap, aspect ratio, dialogue/subtitle need, forbidden claims): {{video_requirement}}. Visual concept: {{visual_concept_script}}.

content-executive (runs first):
Step A: Use /wiki-query for the brand's writing style, draft the caption highlighting {{post_message}}, slogan {{slogan}}, big idea {{big_idea}}, hook {{headline_hook}} — save to {{campaign_folder}}/caption.md.
Step B: Run `write-shooting-script` to write `{{campaign_folder}}/node/shooting-script.md`. The skill must synthesize per-line dialogue with `applio-brand-voice`, save `{{campaign_folder}}/node/timing/timing-lock.json` + WAVs, then use the measured TTS timing for minimal 4/6/8/10s sequence packing and timed sub-scenes/jumpcuts. If `{{visual_concept_script}}` resolves to a crawled reference (`crawl_describe_Tiktok_vid_kalodata`/`_apify` output), treat its `subject_visibility`/`audio_mode`/`background_continuity` frontmatter as hard constraints — see the Structural Fidelity Contract note below — and re-state them explicitly inside `node/shooting-script.md`.
Step C: Run `write-ai-ugc-video-sequence-script` using locked `node/shooting-script.md` and `node/timing/timing-lock.json` to produce `{{campaign_folder}}/node/ugc-sequence-script.md` (Part A reference context, Part B fenced JSON Omni sequence prompt blocks with internal `timeline` sub-scenes/jumpcuts, Part C audio/BGM spec).
Step D: Run `tea-ugc-ai-realism` over `node/ugc-sequence-script.md` as a visual-only review. Apply relevant realism improvements only to existing visual fields: `scene_description`, `style`, `camera_direction`, `lighting`, `environment`, `element`, `motion`, `ending`, and `keyword`. Do not edit `voice`, `SFX`, or `text`; in particular, preserve every `voice` value as the exact approved dialogue from the locked shooting script. Preserve the exact JSON keys/schema, fenced-block structure, scene order, `duration_s`, reference assignments, claims, and Part A/Part C structure. Do not add, remove, rename, or reorder fields/scenes.

designer (runs after content-executive):
Step A (Reference Prompt & Asset Generation): Resolve each locked reference requirement. For a missing `face`/`person`, call `element-resolver`; it routes through `photography-direction` (`mode: reference`) to formulate and generate the person reference prompt/image. For product/setting/wardrobe refs, retrieve approved Brand Kit assets first; generate missing items with `flowkit-nano-banana-image-gen`. Create/select the Flowkit project (`fk-create-project`) and register the resolved refs (`fk-gen-refs`).
Step B (Thumbnail Concept & Direction): Run `creative-direction` (or `photography-direction` `mode: standalone` for human-lifestyle imagery) to formulate the thumbnail prompt.
Step C (Thumbnail Rendering): Render 2K+ thumbnail into {{campaign_folder}}/thumbnail.jpg via `acad-image-gen`.

video-editor (runs after designer): read locked `node/ugc-sequence-script.md`.
Step 1 (Omni Video Generation via Flowkit): for each `### Sequence N` fenced ```json block in Part B, parse and validate the block, then serialize the complete JSON object as the Flowkit Omni `prompt` value. Omni receives the full sequence JSON including `scene_description`, `timeline`, `style`, `camera_direction`, `lighting`, `voice`, `SFX`, `environment`, `element`, `motion`, `ending`, `text`, and `keyword`. Call Flowkit Omni (`fk-omni-video-gen`, endpoint `POST /api/flow/generate-video-refs-omni`) using that full-JSON `prompt`, `reference_media_ids` (max 3), `aspect_ratio: VIDEO_ASPECT_RATIO_PORTRAIT`, and the block's `duration_s: 4|6|8|10`. Obtain primaryMediaId/raw clip media ID.
Step 2 (Mandatory 1080p Video Upscale via Flowkit): before downloading raw clip for downstream use, send mandatory upscale request:
  `POST /api/flow/upscale-video` with `{"media_id": "<raw_media_id>", "scene_id": "scene-N", "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT", "resolution": "VIDEO_RESOLUTION_1080P"}`
  Poll operation until COMPLETED. Obtain upscaled video base64 (`encodedVideo`) via `GET /api/flow/media/<upscaled_primary_media_id>` and save to `node/scenes/scene_{N}_1080p_raw.mp4`.
Step 3 (Watermark Removal — before any voice/concat work touches the clip): run
  `gwt-remove-watermark-video` (`video_modules/VeoWatermarkRemover/skills/gwt-remove-watermark-video.md`)
  on each individual scene: `GeminiWatermarkTool-Video --veo -i node/scenes/scene_{N}_1080p_raw.mp4
  -o node/scenes/scene_{N}_1080p_nowm.mp4 -q`. This demo binary is capped at roughly 10s of input
  per call — since every sequence is itself packed to 4/6/8/10s, running it per scene (never on an
  already-concatenated video) always stays in bounds. Spot-check a bottom-right-corner frame crop
  per scene before trusting the output.
Step 4 (Applio Voice Sync on the Watermark-Clean Render — NOT a pre-baked-audio splice): the
  locked `node/timing/timing-lock.json` WAVs are a pre-production timing reference only — they
  locked dialogue duration and sequence packing before Omni ever rendered, not the source for
  final audio. The real source is the Omni render's own generated dialogue audio, baked into
  `scene_{N}_1080p_nowm.mp4`. Run `applio-brand-voice` **Mode 2 (Voice Sync)** per scene: extract
  that scene's own audio to a mono 40kHz working WAV, measure its pitch, run `core.py infer` (RVC
  conversion to the trained brand voice model), then remux the converted WAV back onto that
  scene's watermark-clean video stream (`-map 0:v -map 1:a -c:v copy -c:a aac`) — never
  `core.py tts` (Mode 1) and never a straight splice of the pre-baked `node/timing/line_*_rvc.wav`
  files onto the new render.
Step 5 (Post-Production & Final Assembly):
  1. Concatenate the voice-synced, watermark-clean scene MP4s in order (`node/scenes/scene_*.mp4`, the Step 4 output) into `node/video_concat.mp4`.
  2. Burn subtitles via `[html-video]-subtitle-burn-talking-head` if requested in {{video_requirement}}.
  3. Mix SFX and background music via `[html-video]-audio-mix` based on Part C spec.
  4. Prepend `thumbnail.jpg` as the **first keyframe** (1 frame at 24fps) using ffmpeg filter_complex so thumbnail is frame 0 of the final output.
  5. Save final MP4 to {{campaign_folder}}/ root (flat).

notion-publisher (runs last): write back caption, hook, thumbnail, R2-embedded video link to Notion Post page, and create {{campaign_folder}}/manifest.json after verification holds.
```

## Notion Field Mapping & Completion Contract

Same Notion Post DB integration as commercial video workflow. Completion condition requires final 1080p MP4 at root, thumbnail at root, R2 video embed, updated Post fields, `manifest.json`, and `Status = 'Submit to Review'`.

## Notes & Technical Alignment

- **Structural Fidelity Contract (when a crawled reference is the visual source):** a source
  video's `subject_visibility`, `audio_mode`, and `background_continuity` (fields on any
  `crawl_describe_Tiktok_vid_kalodata`/`_apify` reference, schema in
  `BASE/BRAND KITs/6. Script_Template/_shooting-script-template.md`) are hard constraints, not
  creative suggestions — a `hands-only` + `voiceover narration` + `single location` source must
  never drift into an on-camera talking creator in a new location by the time Omni renders it.
  This was a real, documented 2026-08-14 failure on the sibling `ai-clone-short-video` pipeline
  (root cause: the crawler's own written description drifted from the actual footage, and every
  downstream step compounded it silently — see the correction notice in
  `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md`).
  Target ≥8/10 structural fidelity (shot count, framing, subject pattern, location count, cut
  rhythm) against the source; only brand/product/copy/voice may change.
- **Role Ownership / Ref Prompt Source:** `content-executive` owns both `write-shooting-script` and `write-ai-ugc-video-sequence-script`. `photography-direction` (`mode: reference` via `element-resolver`) is mandatory for missing human/character reference prompts; product/setting prompts come from approved Brand Kit assets or the locked shooting/sequence script. `designer` owns visual ref resolution, Flowkit project/refs, thumbnail direction, and thumbnail rendering via `acad-image-gen`.
- **Realism Review & Revision:** `content-executive` must run `tea-ugc-ai-realism` after `write-ai-ugc-video-sequence-script`, apply its relevant recommendations directly inside the existing Part B field values, and lock the revised sequence script before designer receives it. Schema/key/scene/timing/reference/dialogue/claim changes are prohibited in this pass.
- **Mandatory Flowkit 1080p Upscale:** Every Omni clip must be upscaled via `POST /api/flow/upscale-video` (`VIDEO_RESOLUTION_1080P`) before passing to watermark removal or Applio voice sync.
- **Mandatory Per-Scene Watermark Removal:** Every upscaled clip must go through `gwt-remove-watermark-video` before voice sync or concat — Flow/Omni output always carries a visible Gemini/Veo watermark. Demo binary capped at ~10s per call, so it must run per-scene (each already ≤10s by the packing rule) and strictly before concat.
- **Voice Sync, Not TTS Splice:** Applio's job here is Mode 2 (Voice Sync) run on each scene's own watermark-clean render audio — converting the Omni-generated dialogue to the trained brand voice via RVC — not remuxing the pre-locked `node/timing/timing-lock.json` WAVs verbatim onto the new render. Those WAVs remain the pre-production timing reference that drove sequence packing.
- **Post-Production Pipeline:** Audio mixing (`[html-video]-audio-mix`) and subtitles (`[html-video]-subtitle-burn-talking-head`) run strictly in post-production after scene concat and voice sync.

## Graph
[[../../AGENTS|Workspace AGENTS]] · [[../AGENT|Production AGENT]] · [[../../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE|Campaigns Structure]] · [[../.agents/skills/write-shooting-script/SKILL|write-shooting-script]] · [[../.agents/skills/write-ai-ugc-video-sequence-script/SKILL|write-ai-ugc-video-sequence-script]] · [[../.agents/skills/tea-ugc-ai-realism/SKILL|tea-ugc-ai-realism]] · [[../.agents/skills/creative-direction/SKILL|creative-direction]] · [[../.agents/skills/acad-image-gen/SKILL|acad-image-gen]] · [[../video_modules/flowkit/skills/fk-omni-video-gen|fk-omni-video-gen]] · [[../.agents/skills/applio-brand-voice/SKILL|applio-brand-voice]] · [[../.agents/skills/[html-video]-subtitle-burn-talking-head/SKILL|subtitle-burn-talking-head]] · [[../.agents/skills/[html-video]-audio-mix/SKILL|audio-mix]] · [[../video_modules/VeoWatermarkRemover/skills/gwt-remove-watermark-video|gwt-remove-watermark-video]]
