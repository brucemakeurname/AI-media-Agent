---
name: ai-timelapse-video
description: Produce a timelapse-style video (construction, growth, renovation, assembly, transformation — any subject with a logical start→end progression) by chaining N reference-locked keyframe images, animating each adjacent pair via Veo 3.1's first+last-frame morph, then concatenating the segments and mixing BGM. Any skill/role that needs a "compress a long process into a short accelerated video" deliverable should build on this instead of re-deriving the keyframe-chain or concat mechanics inline.
---

# ai-timelapse-video

A timelapse is not one Veo call — it's **N keyframes chained by reference, then N-1 Veo 3.1
first+last-frame morphs, hard-cut concatenated, with BGM only (no native audio)**. This skill
covers the full pipeline: how many keyframes, how each one is generated and ref'd, how to prompt
the animation between them so it reads as an accelerated process (not a static A/B fade), and how
to assemble the final deliverable.

Verified end-to-end via a live dry-run (`_workflow-tests/construction-timelapse-test/`,
2026-07-22): 4 keyframes (empty plot → foundation → rough shell → finished house), 3 Veo 3.1
segments (8s/720p/16:9 each), hard-cut concat to a clean 24s video. Every segment's rendered
first/last frame was extracted and confirmed pixel-matching its source keyframe pair — the morph
is real, not first-frame-only animation with the last frame silently ignored.

**This skill is domain-agnostic — it covers the keyframe/Veo/concat/BGM mechanics only.** It does
not know what a technically-correct construction sequence, plant-growth cycle, or product-assembly
order actually looks like. For any domain where getting the *content* of each stage right matters
(most subjects), consult a domain knowledge skill first — e.g. `construction-sequence-brainstorm`
for construction/renovation timelapses — and feed its stage list into §1-§2 below, rather than
inventing stage content here.

## 1. Determine keyframe count from logical completeness — never a fixed number

Veo 3.1's hard duration ceiling is **8s per call** (see `gemini-veo-3.1-video-gen` §5). A
timelapse's total length follows from this relationship:

```
N keyframes  →  N-1 segments  →  each segment ≤ 8s  →  total video ≤ 8 × (N-1) seconds
```

**There is no default N.** Do not reach for "4 keyframes" or "5 keyframes" as a template — the
right count is whatever number of *visually distinguishable* completion states the subject's real
process actually has, capped only by the ticket's duration budget if one exists. A quick two-state
before/after reveal might genuinely need only 3 keyframes; a multi-stage build-out with several
materially different visual states might need 6, 7, or more. Both are correct outcomes of the same
test, not a deviation from a norm.

Use `write-ai-timelapse-video-sequence-script` to run this determination properly: list every
candidate stage boundary a domain knowledge skill identifies (e.g. `construction-sequence-
brainstorm`'s technique/finishing order), keep only the boundaries that are actually visually
distinguishable from their neighbor in a single static photo, then apply the ticket's duration cap
backward (if one exists) by collapsing the least-distinct interior boundaries first — never the
true start or end state. That skill's Part A output records the resulting count with a one-line
rationale per boundary kept or collapsed, so the final number is auditable rather than assumed.

**The one hard rule regardless of count:** never let two adjacent keyframes cover a jump so large
that the bridging segment has to invent implausible intermediate content (e.g. "bare land" directly
to "finished building" in one 8s segment reads as a magic trick, not a timelapse) — insert whatever
structural midpoint(s) the process actually has until every adjacent pair is a believable single
accelerated step.

## 2. Keyframe generation — sequential chain, never a shared single ref

**Pick the keyframe aspect ratio from Veo 3.1's supported set (`16:9` / `9:16` / `1:1` — see
`gemini-veo-3.1-video-gen` §5) before generating keyframe 1, not after.** `nano-banana-image-gen`
itself supports many more ratios (e.g. `3:2`, `4:5`); if a keyframe set is generated at a ratio Veo
doesn't accept, every segment call has to force a different `aspect_ratio` than the source images
were composed at, which crops/distorts the framing right when the animation starts. Match the
target platform (9:16 vertical for Reels/Stories, 16:9 landscape/hero) and lock it identically
across every keyframe and every segment.

Generate keyframes via `nano-banana-image-gen`, **one at a time, in order**, using this reference
rule:

- **Keyframe 1** (absolute start state): no reference, or a real source photo if the ticket
  provides one (real client site, real product, real room — via `element-resolver`). This is the
  ground truth every later stage must stay geometrically consistent with.
- **Keyframe 2 through N**: reference **only the immediately preceding keyframe** (N uses N-1, not
  keyframe 1). Never let every keyframe point back at keyframe 1.

**Why chain forward instead of always referencing keyframe 1:** referencing only the first image
gives the model an anchor for camera/environment but zero information about what already changed
— it has no way to know keyframe 3 should look like a plausible next step *from keyframe 2*, so it
either regresses toward keyframe 1's exact state or invents an unrelated intermediate. Chaining
N→N+1 keeps both invariants: the camera/environment lock (still carried forward transitively from
1) and the state-continuity (each stage is a believable increment from the stage right before it).

### Prompt structure per keyframe

Use the same JSON brief schema as `nano-banana-image-gen` Step 2, with two additions:

1. **Identical camera/style block across every keyframe.** Copy the same
   `main_subject.style`, `lighting_and_atmosphere`, and `technical_specs` text verbatim into
   every keyframe's prompt (e.g. "documentary architectural photography, wide static tripod
   shot" / "Canon EOS R5 with 24mm f/2.8" / "midday overcast, soft even daylight, 5600K"). This is
   what keeps the illusion of one locked-off camera across the whole sequence — vary only
   `main_subject.detail` and `composition_elements.items`, never the style/lighting/lens block.
2. **An explicit anti-drift lock clause, appended to every keyframe from #2 onward:**
   > "Keep the exact same camera angle, framing, horizon line, and surrounding environment
   > (\<list the fixed background elements for this subject — trees/road/neighboring buildings/sky,
   > or a room's walls/window/furniture, or a plant's pot/backdrop, whatever applies\>) as the
   > reference image — only \<the specific thing progressing\> should change."

Within `main_subject.detail`, **spell out the state delta explicitly** — what is newly present at
this stage, and what temporary elements from the previous stage are now gone (scaffolding removed,
packaging discarded, wet paint dried, a plant's old leaves vs new growth). Don't write vague
"more progress" language; the model has no way to infer specifics you don't state.

**Keyframes (the static photos) stay at one consistent lighting condition by default** (same
time-of-day, same overcast/sunny condition, verbatim across every keyframe's `lighting_and_
atmosphere` block) — this is what keeps the images directly comparable and the camera-lock/anti-
drift check meaningful. Only vary the keyframes' own lighting if the creative concept explicitly
wants a seasonal-light progression across the *photos themselves* — label each keyframe's
condition clearly if so.

**This is separate from what the animation shows happening between keyframes.** If the real
process a segment bridges spans a long duration (days, weeks, or months — most construction,
renovation, and multi-stage builds), the accelerated motion should depict **multiple day→night→day
cycles occurring during that segment**, even though both its `first_frame` and `last_frame` are
lit identically — a timelapse compressing weeks into 8 seconds that never shows a single night
passing reads as unrealistically fast/frictionless, not as "many real days sped up." See §4 item 3
for how to write this into the animation prompt itself (this is the primary time-compression cue
for long-real-duration subjects, not just an optional flourish alongside streaking clouds). Only
skip day/night cycling if the ticket's real elapsed time per segment is genuinely short (a single
day or less — e.g. a fast product assembly, a same-day event setup).

### QA gate before moving to the next keyframe

After generating each keyframe, read it back and compare against its immediate predecessor:
same camera angle, same horizon/framing, same background elements, only the intended subject
state changed. **If a keyframe drifts (camera angle shifted, an unrelated background element
changed, framing zoomed), regenerate it immediately against the same predecessor with a stronger
lock clause — do not chain the next keyframe off a drifted one.** Drift compounds forward silently
otherwise, and by keyframe 4 the video will visibly jump-cut in framing at a segment boundary.

## 3. Keyframe 1 and Keyframe N carry the whole video's start/end promise

Keyframe 1 must be the concept's true starting state, and Keyframe N must be its true final state
— these two images are the first frame of segment 1 and the last frame of the final segment
respectively, so they define what the finished video opens and closes on. Every intermediate
keyframe serves double duty: it is the `last_frame` of the segment before it **and** the
`first_frame` of the segment after it. This is what makes segment boundaries invisible once
concatenated — the pixels are identical on both sides of the cut because it's literally the same
source image.

## 4. Animate each adjacent pair via Veo 3.1 first+last-frame morph

For everything about *how* to call Veo 3.1 — model IDs, request shape, parameters, RAI-filter
behavior — see `gemini-veo-3.1-video-gen`. This section covers what's specific to timelapse
content:

- **Model:** `veo-3.1-generate-001` (full) only — `lastFrame` is not available on `fast`/`3.0`.
- **`first_frame` / `last_frame`:** the two adjacent keyframes for that segment, in order.
- **`aspect_ratio` / `resolution`:** must match the keyframes' own aspect ratio, and must be
  **identical across every segment** — mixed resolutions/aspect ratios break the concat step (§5).
- **`duration_seconds`:** 8 by default (gives the accelerated-motion illusion room to read clearly;
  4-6 only if the ticket's total-length budget requires shorter segments).
- **`generate_audio`: `False` on every segment.** A real timelapse carries no synced per-shot
  audio (workers/machinery sound would clash oddly across accelerated cuts) — BGM is added once,
  over the whole assembled video (§6), never per-segment native audio.
- **`negative_prompt`:** always include camera-stability terms — `"camera shake, camera movement,
  panning, zooming, warped geometry, flickering"` — the entire illusion depends on the camera
  reading as physically locked off even while the scene content changes rapidly.

### Writing the animation prompt (the text alongside first_frame/last_frame)

The two pinned frames tell Veo *where the shot starts and ends* — they do not tell it *what
happens in between*. The prompt text is the only place that narrates the accelerated process, so
it must:

1. Open by naming the shot type and stating time is accelerating: *"Construction timelapse.
   Static tripod wide shot of \<subject\>. Time accelerates: ..."* (swap "construction" for
   whatever domain — growth, renovation, assembly).
2. List the specific real-world actions that plausibly bridge the first frame's state to the last
   frame's state — matched to what actually differs between that segment's two keyframes (if the
   keyframes show bare earth → poured foundation, name excavation/formwork/pour; if brick shell →
   finished paint, name plastering/painting/window-installation). Do not write a generic
   "work happens" line — the model fills in visual specifics from what you name.
3. Include a time-compression cue reinforcing the "sped up" read:
   - **For a subject whose real process spans days/weeks/months (most construction/renovation/
     multi-stage builds):** narrate the sky **cycling through multiple day→night→day
     transitions** — daylight fading to dusk, artificial lighting appearing (site floodlights/
     security lights on an active site, or simply neighboring buildings' windows lighting up if
     the site itself goes dark and quiet overnight — real sites are usually inactive at night, not
     lit up like a movie set, so prefer "the site sits quiet and dim while the surrounding
     neighborhood's lights come on" over inventing night-shift work that wouldn't really happen),
     then day breaking again — repeated several times across the segment's duration, ending back
     at the same bright/overcast daylight condition the segment's `last_frame` keyframe shows.
     Name roughly how many cycles fit the segment's implied real duration (a few for a week-scale
     phase, more for a month-scale one) — don't leave it as a single vague "day turns to night."
   - **For a short-real-duration subject** (a single day or less): clouds streaking, light
     flickering faster than normal, blurred motion of people/equipment passing through frame is
     sufficient — don't force a day/night cycle onto a process that doesn't span one.
4. **Close every segment's prompt with an explicit camera-lock reminder** — *"Camera does not
   move."* — belt-and-suspenders alongside the negative_prompt.
5. **Chain the narrative language segment-to-segment** so the three (or more) clips read as one
   continuous take once joined, not three disconnected renders: segment 2+'s prompt should open
   with *"...continuing from the same static wide shot..."* rather than re-introducing the shot
   from scratch.
6. **If the two keyframes show the entire subject transitioning as a whole (not a naturally
   segmented process), explicitly say so** — e.g. *"progress advances evenly across the entire
   \<subject/footprint/area\>, not partially — the whole \<subject\> transforms together."* Without
   this, the model has no reason not to invent an uneven mid-video state (part of the subject
   already at the end state while another part still looks like the start state), which reads as a
   continuity error once the segment is watched in full rather than judged by its pinned end
   frames alone. This matters most for subjects with a real "must-complete-as-one-operation" rule
   (a building's foundation must finish across its whole footprint before framing starts anywhere
   — see `construction-sequence-brainstorm` §Step 3 item 2) — but the instinct applies generally:
   don't let the animation imply a partial/patchy version of a state change that the real process
   wouldn't actually produce.

## 5. Render order and concatenation

**Image generation must be sequential** (each keyframe depends on reading back and referencing
the previous one — §2). **Video segment rendering may run in parallel** once all keyframes exist,
since each Veo call only needs its own two static images, not a neighboring segment's rendered
output — default to sequential anyway for a single-ticket dry run (simpler cost/error tracking);
parallelize across segments only if ticket volume/deadline genuinely requires it.

Before concatenating, verify every segment shares identical codec/resolution/framerate via
`ffprobe` (`codec_name`, `width`, `height`, `avg_frame_rate`) — if they match, concatenate with the
ffmpeg **concat demuxer** and `-c copy` (no re-encode):

```bash
printf "file 'seg1.mp4'\nfile 'seg2.mp4'\nfile 'seg3.mp4'\n" > concat_list.txt
ffmpeg -f concat -safe 0 -i concat_list.txt -c copy final_timelapse.mp4
```

**Hard cuts only — no cross-fade at segment boundaries.** Each boundary is already a pixel-perfect
join (the same keyframe image on both sides, per §3) — a cross-fade would blur two already-
identical frames into each other for no visual benefit, and contradicts this team's established
convention of never adding edit-layer transitions on top of pre-baked segment content (same rule
as `talking-head-editing` and `ai-commercial-short-video`). If codecs/resolutions don't match
(e.g. a segment was re-rendered at a different resolution later), re-encode the mismatched
segment(s) to the common target before concat — do not force `-c copy` across mismatched streams.

## 6. BGM — the only audio in the final video

Since every segment rendered with `generate_audio=False` (§4), the concatenated video has no
audio track at all until this step. Reuse `sfx-artist`'s **Phase 5 BGM step only** (same reuse
pattern as `ai-commercial-short-video`'s `video-editor` role — that pipeline's Phase 2/3 B-roll/
A-roll SFX steps don't apply here either, there's no HyperFrames B-roll layer):

- Mood: typically upbeat/motivational-build (progress/reveal content) — pick per the ticket's
  actual tone if it differs (a somber before/after, a playful growth clip, etc.).
- **Source from the local BGM library, not a live web-fetch** — the web-fetch path
  (Pixabay/Bensound direct links) is a known-broken pattern (logged in
  `ai-commercial-short-video-KNOWN-ISSUES.md`); use
  `.claude/skills/[html-video]-audio-mix/scripts/assets/bgm/brand/` or the brand's own BGM catalog
  instead.
- Mix under the **whole assembled video**, volume 0.10-0.15, with `afade in`/`afade out` applied
  only at the true start and true end of the final file — never at internal segment joins (those
  are hard cuts by design, §5; fading there would fight the pixel-perfect join).

## 7. Do / Don't

- DO chain each keyframe off its immediate predecessor, never off keyframe 1 for every stage.
- DO keep camera/style/lighting prompt blocks byte-identical across all keyframes unless the
  concept explicitly wants a lighting progression.
- DO spell out explicit state deltas (what's added/removed) in every keyframe's `main_subject.detail`.
- DO regenerate a drifted keyframe immediately against its correct predecessor — never propagate it.
- DO keep every segment's `aspect_ratio`/`resolution` identical.
- DO narrate the accelerated process explicitly in each segment's animation prompt — the pinned
  frames alone don't tell Veo what happens between them.
- DO explicitly state "progress advances evenly/uniformly across the whole subject" when the real
  process requires the entire subject to transition together (e.g. a foundation completing across
  100% of a footprint before framing starts) — otherwise the model may render an uneven, patchy
  mid-segment state that contradicts how the real process actually works.
- DO disable native audio (`generate_audio=False`) on every segment and add BGM once, over the
  whole final video.
- DO narrate multiple day→night→day cycles in any segment whose real bridged duration is
  days/weeks/months — ending back at the same lighting the segment's `last_frame` keyframe shows —
  rather than implying the whole process happened in one continuous daylight stretch.
- DON'T invent active night-shift work on the site (lit-up scaffolding, crews working after dark)
  unless the ticket specifically says the project ran night shifts — a real site is usually quiet
  and dim/floodlit-only overnight; let neighboring buildings' windows carry the "it's night" cue
  instead.
- DON'T cross-fade at segment boundaries — they're already pixel-identical joins.
- DON'T mix codecs/resolutions across segments going into concat — verify with `ffprobe` first.
- DON'T let a segment's animation prompt re-introduce the shot from scratch — chain the narrative
  language forward so the concatenated result reads as one continuous take.
- DON'T skip the QA read-back between keyframes to save time — a drifted keyframe is far cheaper
  to catch and re-roll immediately than after 2-3 Veo segments have already rendered off it.

## Graph

**Keyframe renderer:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/nano-banana-image-gen/SKILL|nano-banana-image-gen]]
**Video renderer (how to call Veo 3.1):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/gemini-veo-3.1-video-gen/SKILL|gemini-veo-3.1-video-gen]]
**Former sibling keyframe-then-animate pipeline (archived 2026-08-03 — UGC moved to Omni):** [[INHOUSE TEAMS/2. Production/Social Media/archive/.claude/skills/UGC-video-Veo3.1-gen/SKILL|UGC-video-Veo3.1-gen (archived)]]
**Domain knowledge example (construction):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/construction-sequence-brainstorm/SKILL|construction-sequence-brainstorm]]
**Sequence-script authoring (locks keyframe count + prompts before rendering):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-ai-timelapse-video-sequence-script/SKILL|write-ai-timelapse-video-sequence-script]]
**Used by:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-construction-timelapse-short-video]|ai-construction-timelapse-short-video workflow]]
**BGM reuse source:** `sfx-artist` (`VIDEO_MODULES/talking-head-editing/.claude/agents/`) Phase 5 only
**Known-issues precedent (BGM web-fetch is broken):** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/docs/ai-commercial-short-video-KNOWN-ISSUES|ai-commercial-short-video Known Issues]]
**Verified dry-run:** `_workflow-tests/construction-timelapse-test/` (2026-07-22)
