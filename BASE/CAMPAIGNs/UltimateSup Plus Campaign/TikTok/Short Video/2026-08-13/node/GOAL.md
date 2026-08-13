<!--
Provenance Metadata:
- Notion Post ID: 3bb0831f-990c-80e1-91a8-cea409ccf6aa
- Notion Post URL: https://app.notion.com/p/Clone-Smoothy-making-with-banana-and-chestnut-Mutant-Big-Greens-3bb0831f990c80e191a8cea409ccf6aa
- Linked Campaign URL: https://app.notion.com/p/Mutant-Built-for-the-Daily-Grind-August-2026-3ba0831f990c80b89dead1674ebbc978
- Goal Template: PRODUCTION/goal/[social]_[ai-clone-short-video].md
- Generated Timestamp: 2026-08-13T13:59:39.481995
-->

This is a PRODUCT DEMOS ai-clone-short-video for TIKTOK, brand Mutant / Ultimate Sup, pillar PERSUADE, campaign https://app.notion.com/p/Mutant-Built-for-the-Daily-Grind-August-2026-3ba0831f990c80b89dead1674ebbc978. Topic: Mutant Big Greens — Smoothy making with banana and chestnut. Voice/persona: voice_1_male. Target reference URL: https://live.kalocdn.com/video/7613987593012710669.mp4?key=6d38fc2c12e7c817eedfe8c4bcc7ee31&time=1786525134429 (same URL used for visual concept and voice). Video requirement (hard constraints — duration cap, aspect ratio, dialogue/subtitle requirements): None specified.

Execution steps:

researcher (runs first):
Step 1: Parse the target reference URL from Notion fields (Visual Concept / Voice body).
Step 2: If the URL matches `https://live.kalocdn.com/video/*.mp4`, run `crawl_describe_Tiktok_vid_kalodata` to download it directly. Otherwise, run `crawl_describe_Tiktok_vid_apify` only for a public TikTok post URL. Save the final reference Markdown as `preset_sequence_script_path`. Use its sibling `-keyframes/` directory as `clone_keyframe_dir`; it contains 3-second deduplicated iconic frames. The preset supplies source sequence structure and voice structure.

content-executive (runs after researcher):
Step 1 (Caption & Voice Adaptation): Write post caption into BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-13/caption.md. Adapt the extracted voice script keeping 80% of original tone, cadence, and structure—replacing only character, product, brand context, and target language if requested.
Step 2 (Shooting Script & TTS Timing Lock): Run `write-shooting-script` using `preset_sequence_script_path`, `clone_keyframe_dir`, and the adapted voice script. Generate Applio TTS audio (`node/timing/timing-lock.json`), measure exact durations, and set sequence boundaries using minimal 4/6/8/10s packing to yield `node/shooting-script.md`.
Step 3 (UGC Sequence Script with Keyframe Refs): Run `write-ai-ugc-video-sequence-script` to write `node/ugc-sequence-script.md`. Each sequence prompt must include ref-keyframe references extracted in Step 1 (beside company product/character/setting assets) to anchor composition and prevent visual drift from the target clone video. A sequence may register and send up to 10 total references when needed; choose only the refs that materially anchor its matched source beats.
Step 4 (Realism Check): Run `tea-ugc-ai-realism` on `node/ugc-sequence-script.md` to polish prompt realism without altering locked timeline/schema/dialogue.

designer (runs after content-executive):
Step A (Ref Package Resolution): Resolve human/character refs (`element-resolver` -> `photography-direction` mode: reference if missing), product and setting refs (`flowkit-nano-banana-image-gen`), plus target ref-keyframes from step 1. Create Flowkit project (`fk-create-project`) and register all resolved refs (`fk-gen-refs`).
Step B (Thumbnail Concept & Direction): Run `creative-direction` (or `photography-direction` `mode: standalone` for human-lifestyle imagery) to formulate the thumbnail prompt.
Step C (Thumbnail Rendering): Render 2K+ thumbnail into BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-13/thumbnail.jpg via `acad-image-gen`.

video-editor (runs after designer): read locked `node/ugc-sequence-script.md`.
Step 1 (Omni Video Generation via Flowkit): for each `### Sequence N` fenced ```json block in Part B, parse and validate the block, then serialize the complete JSON object as the Flowkit Omni `prompt` value. Omni receives the full sequence JSON including `scene_description`, `timeline`, `style`, `camera_direction`, `lighting`, `voice`, `SFX`, `environment`, `element`, `motion`, `ending`, `text`, and `keyword`. Call Flowkit Omni (`fk-omni-video-gen`, endpoint `POST /api/flow/generate-video-refs-omni`) using that full-JSON `prompt`, `reference_media_ids` (max 10), `aspect_ratio: VIDEO_ASPECT_RATIO_PORTRAIT`, and the block's `duration_s: 4|6|8|10`. Obtain primaryMediaId/raw clip media ID.
Step 2 (Mandatory 1080p Video Upscale via Flowkit): before downloading raw clip for downstream use, send mandatory upscale request:
  `POST /api/flow/upscale-video` with `{"media_id": "<raw_media_id>", "scene_id": "scene-N", "aspect_ratio": "VIDEO_ASPECT_RATIO_PORTRAIT", "resolution": "VIDEO_RESOLUTION_1080P"}`
  Poll operation until COMPLETED. Obtain upscaled video base64 (`encodedVideo`) via `GET /api/flow/media/<upscaled_primary_media_id>` and save to `node/scenes/scene_{N}_1080p_raw.mp4`.
Step 3 (Applio Brand Voice Alignment per Upscaled Sequence): align upscaled sequence clips (`node/scenes/scene_{N}_1080p_raw.mp4`) with the pre-generated Applio TTS audio (`node/timing/timing-lock.json`), remuxing the authoritative converted WAVs onto the sequence video stream.
Step 4 (Post-Production & Final Assembly):
  1. Concatenate scene MP4s in order (`node/scenes/scene_*.mp4`) into `node/video_concat.mp4`.
  2. Burn subtitles via `[html-video]-subtitle-burn-talking-head` if requested in None specified.
  3. Mix SFX and background music via `[html-video]-audio-mix` based on Part C spec.
  4. Prepend `thumbnail.jpg` as the **first keyframe** (1 frame at 24fps) using ffmpeg filter_complex so thumbnail is frame 0 of the final output.
  5. Save final MP4 to BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-13/ root (flat).

notion-publisher (runs last): write back caption, hook, thumbnail, R2-embedded video link to Notion Post page, and create BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-13/manifest.json after verification holds.
