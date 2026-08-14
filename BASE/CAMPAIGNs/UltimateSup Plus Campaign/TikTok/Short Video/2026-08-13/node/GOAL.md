<!--
Provenance Metadata:
- Notion Post ID: 3bb0831f-990c-80e1-91a8-cea409ccf6aa
- Notion Post URL: https://app.notion.com/p/Clone-Smoothy-making-with-banana-and-chestnut-Mutant-Big-Greens-3bb0831f990c80e191a8cea409ccf6aa
- Linked Campaign URL: https://app.notion.com/p/Mutant-Built-for-the-Daily-Grind-August-2026-3ba0831f990c80b89dead1674ebbc978
- Goal Template: PRODUCTION/goal/[social]_[ai-clone-short-video].md
- Generated Timestamp: 2026-08-13T13:59:39.481995
-->

PRODUCT DEMOS ai-clone-short-video | TikTok | Brand: Mutant / Ultimate Sup | Pillar: PERSUADE
Campaign: https://app.notion.com/p/Mutant-Built-for-the-Daily-Grind-August-2026-3ba0831f990c80b89dead1674ebbc978
Topic: Mutant Big Greens — Smoothie making with banana and chestnut | Voice: voice_1_male
Reference URL: https://live.kalocdn.com/video/7613987593012710669.mp4?key=6d38fc2c12e7c817eedfe8c4bcc7ee31&time=1786525134429
Hard Constraints: None specified

Execution steps:

researcher:
1. Parse reference URL.
2. If `https://live.kalocdn.com/video/*.mp4`, run `crawl_describe_Tiktok_vid_kalodata`; otherwise run `crawl_describe_Tiktok_vid_apify`. Save reference Markdown as `preset_sequence_script_path` and keyframes folder as `clone_keyframe_dir`.

content-executive:
1. Write caption to `caption.md`. Adapt voice script (keep 80% tone/cadence/structure; update character/product/brand/language).
2. Run `write-shooting-script` with preset script, keyframe dir, adapted voice script. Generate Applio TTS (`node/timing/timing-lock.json`), measure durations, pack 4/6/8/10s scenes into `node/shooting-script.md`.
3. Run `write-ai-ugc-video-sequence-script` -> `node/ugc-sequence-script.md`. Include ref-keyframes + product/character/setting assets (max 10 refs/sequence).
4. Run `tea-ugc-ai-realism` on `node/ugc-sequence-script.md` for prompt realism.

designer:
1. Resolve refs (`element-resolver` -> `photography-direction` for humans; `flowkit-nano-banana-image-gen` for product/setting; keyframes). Create Flowkit project (`fk-create-project`), register refs (`fk-gen-refs`).
2. Formulate thumbnail prompt via `creative-direction` (or `photography-direction` mode standalone).
3. Render 2K+ thumbnail to `thumbnail.jpg` via `acad-image-gen`.

video-editor: (Read locked `node/ugc-sequence-script.md`)
1. For each `### Sequence N` JSON block in Part B: serialize complete JSON as Flowkit Omni `prompt`. Call `fk-omni-video-gen` (`POST /api/flow/generate-video-refs-omni`) with max 10 `reference_media_ids`, `aspect_ratio: VIDEO_ASPECT_RATIO_PORTRAIT`, `duration_s: 4|6|8|10` -> get raw media ID.
2. Mandatory 1080p Upscale: `POST /api/flow/upscale-video` (`resolution: VIDEO_RESOLUTION_1080P`). Poll until COMPLETED. Save base64 from `GET /api/flow/media/<id>` to `node/scenes/scene_{N}_1080p_raw.mp4`.
3. Align `node/scenes/scene_{N}_1080p_raw.mp4` with Applio TTS WAVs (`node/timing/timing-lock.json`) via remux.
4. Post-Production:
   - Concatenate scenes -> `node/video_concat.mp4`.
   - Burn subtitles via `[html-video]-subtitle-burn-talking-head` if requested.
   - Mix SFX/BGM via `[html-video]-audio-mix`.
   - Prepend `thumbnail.jpg` as first frame (1 frame at 24fps) via ffmpeg filter_complex.
   - Save final MP4 to unit root.

notion-publisher:
Write caption, hook, thumbnail, R2 video link to Notion Post page. Create `manifest.json` after QA verification.
