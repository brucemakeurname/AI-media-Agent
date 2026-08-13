---
id: "[social]_[ai-clone-short-video]"
studio: social-media
visual_type: ai-clone-short-video
format_allow: [ask-a-question, before-after, behind-the-scenes, brand-story, case-studies, challenge, clipping, endorsement, free-trials, fun-facts, industry-news, interviews, introduce-team, lifestyle-content, podcast, process-post, product-demos, quote, seasonal, sneak-peeks, special-offers, testimonials, tip-of-the-day, tutorials]
amount: [single, batch]        # studio agent picks engine per ticket volume; body below covers single (per-sequence render) — batch spawns one parallel sub-agent per ticket, same schema
engine:
  single: { text: in-session-gemini-3-pro, crawl: "crawl_describe_Tiktok_vid_kalodata (direct Kalodata MP4); crawl_describe_Tiktok_vid_apify (fallback)", script: "write-shooting-script", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen reference_to_video, per-sequence sequential)", upscale: "flowkit (POST /api/flow/upscale-video 1080p mandatory)", voice: "applio-brand-voice (pre-script TTS timing lock + post-concat audio remux)" }
  batch:  { text: gemini-api-skill,        crawl: "crawl_describe_Tiktok_vid_kalodata (direct Kalodata MP4); crawl_describe_Tiktok_vid_apify (fallback)", script: "write-shooting-script", sequence: "write-ai-ugc-video-sequence-script", image: "flowkit (fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen)", video: "flowkit (fk-omni-video-gen parallel per-ticket sub-agents)", upscale: "flowkit (POST /api/flow/upscale-video 1080p mandatory)", voice: "applio-brand-voice (pre-script TTS timing lock + post-concat audio remux)" }
primary_skills: [wiki-query, crawl_describe_Tiktok_vid_kalodata, crawl_describe_Tiktok_vid_apify, write-shooting-script, write-ai-ugc-video-sequence-script, tea-ugc-ai-realism, creative-direction, acad-image-gen, fk-create-project, fk-gen-refs, flowkit-nano-banana-image-gen, fk-omni-video-gen, applio-brand-voice, "[html-video]-subtitle-burn-talking-head", "[html-video]-audio-mix", element-resolver, notion-upload]
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
---

# ai-clone-short-video

Omni-rendered TikTok clone short video via Flowkit — rebuilds a target TikTok reference video frame-by-frame (pacing, layout, tone) using company-owned assets, characters, settings, products, and voice, while preserving original camera composition and sequence structure.

Pipeline overview:
1. `researcher` routes the input reference URL from Notion's `Visual Concept` and `Voice` body sections: use `crawl_describe_Tiktok_vid_kalodata` for a direct `live.kalocdn.com/video/*.mp4` URL; use `crawl_describe_Tiktok_vid_apify` only as fallback for a non-Kalodata public TikTok post URL. Its final reference Markdown is the `preset_sequence_script`; it supplies the raw sequence structure, reference keyframes (sampled at 3s intervals with deduplication), and source voice structure.
2. `content-executive` drafts caption (`caption.md`), then runs `write-shooting-script` using the preset sequence script and source voice script as input:
   - Voice script is adapted keeping 80% of original cadence, flow, and tone, replacing only the human, product, brand context, and target language if required.
   - Dialogue lines are timing-locked via TTS (`node/timing/timing-lock.json`) before sequence division.
   - Script is divided into minimal 4/6/8/10s sequence packing.
   - Runs `write-ai-ugc-video-sequence-script` to write `node/ugc-sequence-script.md`, incorporating both company ref assets and the extracted target keyframes (`iconic-frames/`) as visual references so rendered frames do not drift from the reference video.
   - Applies `tea-ugc-ai-realism` review before handoff.
3. `designer` resolves character/product/setting references plus extracted ref keyframes, registers all refs in Flowkit (`fk-create-project`, `fk-gen-refs`), formulates the thumbnail concept (`creative-direction` or `photography-direction`), and renders `thumbnail.jpg` via `acad-image-gen`.
4. `video-editor` renders sequence clips with Flowkit Omni (`fk-omni-video-gen`), executes mandatory **Flowkit 1080p upscale** (`POST /api/flow/upscale-video`), remuxes Applio TTS audio (`applio-brand-voice`), burns subtitles (`[html-video]-subtitle-burn-talking-head`), mixes audio/SFX/BGM (`[html-video]-audio-mix`), prepends `thumbnail.jpg` as frame 0, and saves final MP4.
5. `notion-publisher` uploads assets, writes back to Notion, and creates `manifest.json`.

## Amount paths

- **single** — one ticket, sequential per-sequence render (`sequences` planned by minimal 4/6/8/10s packing from TTS timing lock).
- **batch** — multiple tickets in one run — spawn one parallel sub-agent per ticket.

## Prompt

> Fill every `{{placeholder}}` from Notion — field-mapping table below — then run the roles in sequence. No parallel fan-out within a single ticket.

```text
This is a {{format}} ai-clone-short-video for {{channel}}, brand {{brand}}, pillar {{pillar}}, campaign {{campaign_link}}. Topic: {{topic}}. Voice/persona: {{voice_brief}}. Reference TikTok URL: {{visual_concept_script}} (same URL used for visual concept and voice). Video requirement (hard constraints — duration cap, aspect ratio, dialogue/subtitle requirements): {{video_requirement}}.

Execution steps:

researcher (runs first):
Step 1: Parse the target reference URL from Notion fields (Visual Concept / Voice body).
Step 2: If the URL matches `https://live.kalocdn.com/video/*.mp4`, run `crawl_describe_Tiktok_vid_kalodata` to download it directly. Otherwise, run `crawl_describe_Tiktok_vid_apify` only for a public TikTok post URL. Save the final reference Markdown as `preset_sequence_script_path`. Use its sibling `-keyframes/` directory as `clone_keyframe_dir`; it contains 3-second deduplicated iconic frames. The preset supplies source sequence structure and voice structure.

content-executive (runs after researcher):
Step 1 (Caption & Voice Adaptation): Write post caption into {{campaign_folder}}/caption.md. Adapt the extracted voice script keeping 80% of original tone, cadence, and structure—replacing only character, product, brand context, and target language if requested.
Step 2 (Shooting Script & TTS Timing Lock): Run `write-shooting-script` using `preset_sequence_script_path`, `clone_keyframe_dir`, and the adapted voice script. Generate Applio TTS audio (`node/timing/timing-lock.json`), measure exact durations, and set sequence boundaries using minimal 4/6/8/10s packing to yield `node/shooting-script.md`.
Step 3 (UGC Sequence Script with Keyframe Refs): Run `write-ai-ugc-video-sequence-script` to write `node/ugc-sequence-script.md`. Each sequence prompt must include ref-keyframe references extracted in Step 1 (beside company product/character/setting assets) to anchor composition and prevent visual drift from the target clone video. A sequence may register and send up to 10 total references when needed; choose only the refs that materially anchor its matched source beats.
Step 4 (Realism Check): Run `tea-ugc-ai-realism` on `node/ugc-sequence-script.md` to polish prompt realism without altering locked timeline/schema/dialogue.

designer (runs after content-executive):
Step A (Ref Package Resolution): Resolve human/character refs (`element-resolver` -> `photography-direction` mode: reference if missing), product and setting refs (`flowkit-nano-banana-image-gen`), plus target ref-keyframes from step 1. Create Flowkit project (`fk-create-project`) and register all resolved refs (`fk-gen-refs`).
Step B (Thumbnail Concept & Direction): Run `creative-direction` (or `photography-direction` `mode: standalone` for human-lifestyle imagery) to formulate the thumbnail prompt.
Step C (Thumbnail Rendering): Render 2K+ thumbnail into {{campaign_folder}}/thumbnail.jpg via `acad-image-gen`.

video-editor (runs after designer): read locked `node/ugc-sequence-script.md`.
Step 1 (Omni Video Generation via Flowkit): for each `### Sequence N` fenced ```json block in Part B, parse and validate the block, then serialize the complete JSON object as the Flowkit Omni `prompt` value. Omni receives the full sequence JSON including `scene_description`, `timeline`, `style`, `camera_direction`, `lighting`, `voice`, `SFX`, `environment`, `element`, `motion`, `ending`, `text`, and `keyword`. Call Flowkit Omni (`fk-omni-video-gen`, endpoint `POST /api/flow/generate-video-refs-omni`) using that full-JSON `prompt`, `reference_media_ids` (max 10), `aspect_ratio: VIDEO_ASPECT_RATIO_PORTRAIT`, and the block's `duration_s: 4|6|8|10`. Obtain primaryMediaId/raw clip media ID.
Step 2 (Mandatory 1080p Video Upscale via Flowkit): before downloading raw clip for downstream use, send mandatory upscale request:
  `POST /api/flow/upscale-video` with `{"media_id": "<raw_media_id>", "scene_id": "scene-N", "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT", "resolution": "VIDEO_RESOLUTION_1080P"}`
  Poll operation until COMPLETED. Obtain upscaled video base64 (`encodedVideo`) via `GET /api/flow/media/<upscaled_primary_media_id>` and save to `node/scenes/scene_{N}_1080p_raw.mp4`.
Step 3 (Applio Brand Voice Alignment per Upscaled Sequence): align upscaled sequence clips (`node/scenes/scene_{N}_1080p_raw.mp4`) with the pre-generated Applio TTS audio (`node/timing/timing-lock.json`), remuxing the authoritative converted WAVs onto the sequence video stream.
Step 4 (Post-Production & Final Assembly):
  1. Concatenate scene MP4s in order (`node/scenes/scene_*.mp4`) into `node/video_concat.mp4`.
  2. Burn subtitles via `[html-video]-subtitle-burn-talking-head` if requested in {{video_requirement}}.
  3. Mix SFX and background music via `[html-video]-audio-mix` based on Part C spec.
  4. Prepend `thumbnail.jpg` as the **first keyframe** (1 frame at 24fps) using ffmpeg filter_complex so thumbnail is frame 0 of the final output.
  5. Save final MP4 to {{campaign_folder}}/ root (flat).

notion-publisher (runs last): write back caption, hook, thumbnail, R2-embedded video link to Notion Post page, and create {{campaign_folder}}/manifest.json after verification holds.
```

## Notion Field Mapping & Completion Contract

Same Notion Post DB integration as UGC short video workflow.
Special input rule: `visual_concept_script` and `voice_brief` in Notion Ticket carry the exact same reference URL. Prefer a direct Kalodata MP4 URL; a public TikTok post URL uses the Apify fallback path.
Completion condition requires final 1080p MP4 at root, thumbnail at root, R2 video embed, updated Post fields, `manifest.json`, and `Status = 'Submit to Review'`.

## Notes & Technical Alignment

- **Reference Crawl & Frame Extraction:** `crawl_describe_Tiktok_vid_kalodata` directly downloads a Kalodata MP4 and extracts sequence structure, voice text, and 3-second deduplicated iconic keyframes. `crawl_describe_Tiktok_vid_apify` is fallback-only for a public TikTok post URL.
- **80% Voice Adaptation:** Keep 80% original sentence structure, delivery rhythm, and tone, replacing only brand, product, character context, and target language.
- **Ref-Keyframe Visual Alignment:** Sequence prompts must incorporate extracted target keyframes (`iconic-frames/`) alongside internal product/character refs to enforce strict layout alignment.
- **Mandatory Flowkit 1080p Upscale:** Every Omni clip must be upscaled via `POST /api/flow/upscale-video` (`VIDEO_RESOLUTION_1080P`) before passing to Applio voice sync.
- **Post-Production Pipeline:** Audio mixing (`[html-video]-audio-mix`) and subtitles (`[html-video]-subtitle-burn-talking-head`) run strictly in post-production after scene concat and voice sync.

## Graph
[[../../AGENTS|Workspace AGENTS]] · [[../AGENT|Production AGENT]] · [[../../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE|Campaigns Structure]] · [[../.agents/skills/crawl_describe_Tiktok_vid_kalodata/SKILL|crawl_describe_Tiktok_vid_kalodata]] · [[../.agents/skills/crawl_describe_Tiktok_vid_apify/SKILL|crawl_describe_Tiktok_vid_apify fallback]] · [[../.agents/skills/write-shooting-script/SKILL|write-shooting-script]] · [[../.agents/skills/write-ai-ugc-video-sequence-script/SKILL|write-ai-ugc-video-sequence-script]] · [[../.agents/skills/tea-ugc-ai-realism/SKILL|tea-ugc-ai-realism]] · [[../.agents/skills/creative-direction/SKILL|creative-direction]] · [[../.agents/skills/acad-image-gen/SKILL|acad-image-gen]] · [[../video_modules/flowkit/skills/fk-omni-video-gen|fk-omni-video-gen]] · [[../.agents/skills/applio-brand-voice/SKILL|applio-brand-voice]] · [[../.agents/skills/[html-video]-subtitle-burn-talking-head/SKILL|subtitle-burn-talking-head]] · [[../.agents/skills/[html-video]-audio-mix/SKILL|audio-mix]]
