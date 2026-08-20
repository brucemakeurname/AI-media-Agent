---
name: "[html-video]-post-production-qa-broll-overlay"
description: "Validate downloaded/generated scenes, resolve product B-roll with deterministic audio mapping, assemble the timeline, and add HyperFrames product/price/text overlays over A-roll before final delivery."
---

# Post-production QA, Product B-roll & HyperFrames Overlay

Use this skill after Flowkit scene generation and before final delivery for AI UGC, AI clone,
commercial, and talking-head tickets. It turns every handoff into a verifiable media artifact;
missing or unverified ingredients block assembly.

## Inputs

- `Ticket.md` and `node/GOAL.md` — approved product, price, offer, claims, CTA, language, and format.
- `node/*sequence-script*.md` — locked scene order, duration, dialogue, B-roll beat type, and refs.
- Downloaded/upscaled scene files and their Flowkit request metadata.
- Approved product/brand refs from `BASE/BRAND KITs/`.
- Approved voice source or scene audio strategy.

## Required outputs

Keep these in the campaign unit's `node/` directory:

- `scene-qa.json` — one record per downloaded, upscaled, and watermark-removed scene.
- `broll-manifest.json` — visual source, audio source, timeline, product ref, and insertion mode.
- `concat-qa.json` — duration, stream, boundary, and dead-air checks after assembly.
- `hyperframes-overlay-manifest.json` — overlay HTML/render paths, zones, timings, and QA.
- `handoff.md` — fallback, correction, and review notes.

## Phase 1 — Download and post-download QA

Run QA twice: immediately after the final scene download, then again after watermark removal
and any post-processing. Do not wait until concat to discover a bad scene.

### Download QA

For every scene, verify and record:

1. File exists, is non-empty, and is the expected scene output rather than another campaign's file.
2. Container opens with `ffprobe`; video stream, audio stream, duration, FPS, and dimensions exist.
3. Duration is within `0.25s` of the locked scene duration. A short render is a blocker.
4. Vertical output is `1080x1920` after upscale, or the documented original dimensions before fallback.
5. First/middle/last frame are decodable and not black, frozen, or visibly corrupted.
6. The original download is retained when Flowkit upscale fails; record `upscale_fallback: "ffmpeg"`.

### Post-processing QA

After Flowkit/FFmpeg upscale and per-scene watermark removal, verify again:

- `watermark_removed_path` exists and is the file passed downstream.
- Duration drift stays within `0.25s` of the downloaded scene.
- Video remains `1080x1920`, `yuv420p` or the documented delivery pixel format, and playable.
- Audio presence and channel layout match the selected voice/audio strategy.
- The watermark-removal tool ran on this scene, not on the concatenated master.
- `render_verified: true` only after every check above passes.

If a check fails, stop, write the failure to `node/handoff.md`, and repair that scene before
concat. Never silently substitute a render or source from another campaign.

Suggested record shape:

```json
{
  "scene": "03",
  "downloaded_path": "node/scenes/scene_03_downloaded.mp4",
  "upscaled_path": "node/scenes/scene_03_1080p.mp4",
  "watermark_removed_path": "node/scenes/scene_03_clean.mp4",
  "expected_duration_sec": 6,
  "actual_duration_sec": 5.98,
  "width": 1080,
  "height": 1920,
  "audio_present": true,
  "upscale_fallback": null,
  "render_verified": true
}
```

## Phase 2 — Product B-roll design and insertion

Product B-roll is a deliberate visual cutaway, not an untracked extra clip.

### Resolve the product visual

- Use the exact approved packshot, label, logo, and product variant from the Brand Kit.
- Do not ask a video model to redraw packaging, price, discount, dosage, or claim text.
- If the Brand Kit lacks a clean angle, record a gap and request the missing asset.
- Choose one product beauty treatment per ticket: macro liquid, ingredient reveal, light-trail
  sweep, controlled particle burst, or glow pulse. Vary the treatment between tickets, not within
  one product identity system.
- Keep dense packaging text in a readable wider shot; do not push in on hallucination-prone text.

### B-roll contract

Each B-roll beat must declare:

```json
{
  "id": "broll_02",
  "beat_type": "b-roll-product",
  "start_sec": 7.2,
  "end_sec": 10.8,
  "visual_path": "node/scenes/product_broll_02_clean.mp4",
  "audio_path": "node/timing/line_03.wav",
  "audio_mode": "approved_voice_remux",
  "product_ref": "BASE/BRAND KITs/.../approved-packshot.png",
  "insertion_mode": "full_frame_cutaway",
  "render_verified": true
}
```

Use `full_frame_cutaway` when the product visual replaces the A-roll picture. Keep the A-roll or
approved voice audio underneath; B-roll must not invent a second speaker. If an Omni B-roll clip
has no visible speaker, its own `voice`/`dialogue` fields stay empty. Use the approved audio source,
or generate a same-duration paired A-roll audio source when the selected voice strategy requires it.

At assembly, map **video from B-roll + audio from the approved A-roll/voice source** for the exact
same `[start_sec, end_sec]` window. Pure A-roll windows map both streams from the A-roll source.
Do not use a B-roll clip's accidental generated speech just because it exists.

After insertion, verify:

- B-roll starts and ends on the declared timeline boundaries.
- The product remains the approved variant and is not mirrored, cropped beyond recognition, or
  covered by an unsafe claim.
- Dialogue stays continuous across the cut.
- The source A-roll is visible again after the B-roll window; no bleed into the next beat.

### Assembly timing invariants

- Probe every rendered B-roll and trim it to `min(render_duration, slot_duration)` before
  compositing. Re-encode the trim with `-an`; B-roll never contributes its own dialogue.
- For full-frame B-roll, delay the input with `-itsoffset {start_sec}` and use
  `overlay=...:eof_action=pass`. Do not rely on `enable=between(...)` alone.
- Compute concat timestamps from actual `ffprobe` durations. If the concat master has measured
  inflation, calculate and record a per-project scale factor before placing later B-roll windows.
- Keep the measured timestamp map in `node/broll-manifest.json`; do not recompute offsets in a
  later command from nominal script durations.

## Phase 3 — Concat and audio/text QA

After scene assembly and before subtitles:

1. Probe the concat master and compare duration with the sum of the locked timeline windows.
2. Run `silencedetect` and inspect every internal silence of approximately one second or longer.
   Natural sentence pauses are allowed; undocumented dead-air gaps are not.
3. Verify each scene boundary against `broll-manifest.json` and `scene-qa.json`.
4. Run WhisperX on the final voice-bearing concat audio.
5. Compare the WhisperX words with `node/timing/approved-voice.txt` and every locked scene voice.
6. Correct subtitle **text only** when ASR spelling/diacritics differ; preserve WhisperX timestamps.
7. Re-burn subtitles and spot-check the first, middle, B-roll transition, and final CTA frames.

For Vietnamese, keep the existing contract: tokenizer-aware grouping, maximum five visible words
per burst, and subtitle baseline around `SUB_Y_RATIO=0.75`. Treat a voice/text mismatch as a
review blocker, not a cosmetic warning.

## Phase 4 — HyperFrames overlays on A-roll

Use the local HyperFrames `talking-head-recut` or `motion-graphics` workflow to create transparent
graphic overlays over the assembled A-roll/B-roll video. HyperFrames is for designed graphics, not
for replacing the underlying footage and not for plain subtitle rendering.

For Ultimate Sup tickets, load and use the reusable library at
`BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/`. Read `scene-map.json`,
`modules/module-map.json`, `style.css`, and `animation.js`; instantiate the matching module and
named animator instead of authoring a new overlay animation. If no module matches, stop with
`REVIEW REQUIRED` and record the missing module. Do not improvise motion.

### Overlay content

- Product element: approved packshot, ingredient icon, or benefit-safe visual cue.
- Price/offer: copy exactly from `Ticket.md`; never invent a price, discount, date, or scarcity.
- Text overlay: one short claim-safe message per card, with the source field recorded in the manifest.
- Motion: short entrance, readable hold, and exit; use the talking point's actual timing rather than
  arbitrary animation loops.

### Safe zones for 9:16

- Reserve `y=0.72–0.90` for subtitles; do not place product cards or price text there.
- Place headline/brand tags in `y=0.08–0.22` with safe side margins.
- Place product callouts in `x=0.60–0.92`, `y=0.28–0.62`, away from the speaker's face and hands.
- Place price/CTA cards in `y=0.58–0.68` only when they do not collide with the subject, product,
  or subtitle safe area.
- Keep important graphics inside a 5% horizontal and 7% vertical action-safe margin.

### Render and composite contract

1. Build one HTML composition per overlay cluster, with a static `1080x1920` stage and explicit
   duration/FPS metadata.
2. Keep the root transparent wherever the A-roll must remain visible.
3. Use `data-start`/`data-duration` or the equivalent HyperFrames timeline attributes for every card.
4. Lint and browser-check the composition before render.
5. Render a transparent overlay as ProRes 4444 (`yuva444p12le`) when the local setup supports it;
   do not replace alpha with a chroma-key background.
6. Probe the overlay for dimensions, duration, alpha/pixel format, and frame decodability.
7. Composite the overlay onto the assembled video using the manifest timestamps. For A-roll
   overlays, shift the overlay stream with `[1:v]setpts=PTS+{start_sec}/TB`; never combine that
   with `-itsoffset` or `PTS-STARTPTS`, which resets the overlay to time zero.
8. Spot-check overlay entry/exit, product legibility, price accuracy, subtitle clearance, and the
   final CTA before SFX/BGM mix and thumbnail prepend.

The overlay manifest must record:

```json
{
  "id": "price_callout_01",
  "source": "node/hyperframes/price_callout/index.html",
  "render": "node/hyperframes/renders/price_callout.mov",
  "start_sec": 12.4,
  "end_sec": 15.8,
  "zone": "price_cta",
  "alpha_verified": true,
  "copy_source": "Ticket.md:offer",
  "render_verified": true
}
```

## Phase 5 — Final QA and delivery

After HyperFrames composite, subtitle burn, SFX/BGM mix, and thumbnail prepend:

- Probe final duration, `1080x1920`, H.264 video, AAC audio, and playable output.
- Verify thumbnail is the first frame and has no unintended audio.
- Verify all B-roll, overlays, prices, claims, CTA, captions, and product variant against the ticket.
- Confirm no overlay clips over a face, subtitle, or required packshot label.
- Confirm B-roll and overlay clips are pre-trimmed to their declared slots and use
  `eof_action=pass` at every overlay boundary.
- Save the final QA result and unresolved review items in `node/handoff.md`.
- Only then write `manifest.json` and hand the root MP4/thumbnail to `notion-publisher`.

## Failure rule

Missing media, failed probe, duration mismatch, dead-air gap, incorrect product/price, invalid alpha,
or subtitle mismatch blocks downstream work. Keep the failed artifact and record the owner/fix; do
not silently switch to another renderer or another campaign's source.
