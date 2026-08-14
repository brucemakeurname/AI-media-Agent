# Shooting Script — Mutant Big Greens Smoothie (Banana & Chestnut) — REDO (corrected source)

## Structural Fidelity Contract (hard constraints, carried from `preset_sequence_script_path`)
- `subject_visibility: hands-only` — a hand/forearm only enters frame to handle product/ingredients. **No face, no head, no on-camera talking creator anywhere in this script.**
- `audio_mode: voiceover narration` — all dialogue is VO over hands-only B-roll. **No lip-synced on-camera dialogue.**
- `background_continuity: single location` — one kitchen counter set for the entire video. **No location or set change.**
- Fidelity note carried verbatim from source reference: "hands-only demo, voiceover narration, single kitchen location throughout — no face and no location change anywhere in this source. Any clone script built from this reference must preserve that pattern (hands-only B-roll + VO) and only swap brand/product/voice identity — it must NOT introduce an on-camera talking creator or a second location."
- Duplication ratio target: ≥8/10 structural fidelity against source shot mechanism (4-beat message-stack arc, hands-only framing, single location, VO-only, cut rhythm). Only brand identity, product, exact wording, and voice/persona may change.

## Correction Context
This is a full redo of the 2026-08-13 content-executive pass. The prior pass fabricated the source
description (claimed "green smoothie, on-camera talking creator") when the actual Kalodata source
(`Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md`, corrected 2026-08-14) is
Bloom Clear Protein, Strawberry Watermelon — shot hands-only, VO-only, single kitchen location, full
24.47s. That fabrication compounded into a wrong on-camera-creator clone video. This redo is grounded
in the corrected reference and its keyframes only.

## Production Notes
- Biz niche / industry: Fitness / Supplement Retail
- Voice timing lock: `node/timing/timing-lock.json` (real Applio TTS+VC measurement, redone this pass)
- Measured dialogue duration: 27.90s (line_01 7.68s + line_02 7.54s + line_03 5.68s + line_04 7.00s)
- Sequence duration plan: 8s, 8s, 6s, 8s (minimal-count-per-beat packing, 30s total) — **4 sequences
  chosen to match the source's own 4-beat message-stack structure** (source = Sequence 1..4, one Omni
  call per beat), rather than the pure duration-minimal 3-sequence packing (10+10+8=28s), because
  the source's 4-shot cut rhythm is itself a structural-fidelity target under the Structural Fidelity
  Contract ("shot count... cut rhythm" is an explicit scoring criterion) and because splitting any of
  the 4 measured dialogue lines mid-sentence across a hard sequence boundary (unavoidable with 3
  sequences, since two lines together always exceed the 10s single-sequence cap) would fragment a
  single VO sentence across two separately-rendered Omni calls — a real synthesis-continuity risk,
  not just a stylistic preference. Each of the 4 sequences below holds exactly one full dialogue line
  with a small trailing pad/hold, mirroring the source's own one-VO-line-per-beat pacing.
- Target/render duration: 30s (running total: 30s >= 27.90s measured dialogue)
- Voice/persona: voice_1_male (Applio trained Singapore male brand voice, VO delivery — no lip-sync needed, hands-only)
- Video requirement (hard constraints): None specified in Ticket.md beyond the Structural Fidelity Contract above
- Continuity decision: single set throughout — one dark stone kitchen counter, cream cabinets, copper/tin-tile backsplash, wood cutting board, matching the source's single-location pattern; only the hand/sleeve, product, and ingredients are brand-swapped
- Creative-translation method: format-aware built-in craft knowledge (no curated library yet — see SKILL.md Method 2)
- Clone reference preset / keyframe directory: `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669.md` | `BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-product-demo-kalodata-mutant-big-greens-7613987593012710669-keyframes/` (candidate_01.jpg .. candidate_08.jpg)
- Clone voice adaptation: preserve ~80% source rhetorical structure/cadence/claim-stack arc (protein/calorie-style opening claim → daily-use framing → product/flavor name → taste reassurance → bonus benefit → CTA); substitutions made: Bloom Clear Protein → Mutant Big Greens, pink protein drink → green smoothie, Strawberry Watermelon flavor → banana & chestnut, hair/skin/nails bonus benefit → everyday-nutrition-for-training-days bonus benefit, stock-scarcity CTA → direct Ultimate Sup Singapore CTA (scarcity language dropped per Ultimate Sup brand voice guideline: "do not manufacture urgency, scarcity, reviews, or transformations"), Singapore/Ultimate Sup brand framing throughout.

## Sequence 1 — Hook / Claim Stat (0s–8s, 8s)
- Omni duration: 8s
- Dialogue window(s): 0.00s – 7.68s (Line 1, full)

### Sub-scene 1.1 — 0s–7.68s (Hook)
- Visual: Hand (forearm only, no face) holds a filled green-smoothie tumbler with condensation on the glass, dark stone kitchen counter behind, copper-tile backsplash visible.
- Action/Activity: Hand rotates the tumbler slightly toward camera, straw visible, product presence front-and-center — mirrors source Scene 1.1's hand-holds-finished-drink framing.
- Dialogue/VO: "This is Mutant Big Greens, real greens goodness with no added sugar, blended into a smoothie you will actually want to drink."
- SFX: Soft ambient kitchen room tone, faint ice/glass clink.
- Music/mood cue: Light, clean, no heavy beat — VO-forward mix.
- Motion/VFX: Static-to-subtle-handheld phone framing, close-up on tumbler, no camera movement toward a face (there is no face in frame).
- On-screen text: "Mutant Big Greens Smoothie"
- Ending/transition: Hard cut to ingredient prep countertop.
- Reference needs: character (no — hands-only, use hand/product ref only) · environment (yes) · product (yes) · source footage (yes) · clone keyframe (candidate_01.jpg / candidate_02.jpg)

### Sub-scene 1.2 — 7.68s–8s (pad/hold)
- Visual: Same tumbler held steady, brief hold before jumpcut.
- Action/Activity: Static hold, no new action.
- Transition from previous sub-scene: Continues directly into Sequence 2's prep cut.

## Sequence 2 — Product Reveal / Prep (8s–16s, 8s)
- Omni duration: 8s
- Dialogue window(s): 0.00s – 7.54s local (Line 2, full; global 7.68s–15.22s)

### Sub-scene 2.1 — 0s–7.54s local (Product Reveal / Daily-Use Framing)
- Visual: Hand scoops green powder from an open Mutant Big Greens tub beside an empty blender jar; sliced banana and chestnut pieces visible on the wood cutting board — mirrors source Scene 2.1's powder-pouch-beside-empty-tumbler framing.
- Action/Activity: Hand tips a scoop of green powder into the jar, then reaches to place a banana slice beside it.
- Dialogue/VO: "It has become my everyday scoop, greens, banana, and chestnut, all in one glass before I am even out the door."
- SFX: Powder-scoop rustle, soft counter taps.
- On-screen text: "Banana & Chestnut Recipe"
- Ending/transition: Jumpcut on scoop-drop motion into Sequence 3's pour.
- Reference needs: character (no — hands-only) · environment (yes) · product (yes) · source footage (yes) · clone keyframe (candidate_03.jpg / candidate_04.jpg)

### Sub-scene 2.2 — 7.54s–8s (pad/hold)
- Visual: Hand rests briefly on the jar lid before the pour cut.
- Transition from previous sub-scene: Hard cut into Sequence 3.

## Sequence 3 — Pour / Taste Proof (16s–22s, 6s)
- Omni duration: 6s
- Dialogue window(s): 0.00s – 5.68s local (Line 3, full; global 15.22s–20.90s)

### Sub-scene 3.1 — 0s–5.68s local (Taste Reassurance)
- Visual: Hand pours the blended green smoothie from the jar into a clear glass, banana slices floating, same kitchen counter — mirrors source Scene 3.1's pour-into-clear-glass-with-fruit framing.
- Action/Activity: Steady pour stream, smoothie settling in glass.
- Dialogue/VO: "And it is smooth, not grassy, tastes more like a banana treat than a greens supplement."
- SFX: Pouring liquid sound.
- On-screen text: "Smooth, Not Grassy"
- Ending/transition: Cut to hand lifting the finished glass.
- Reference needs: character (no — hands-only) · environment (yes) · product (yes) · source footage (yes) · clone keyframe (candidate_05.jpg / candidate_06.jpg)

### Sub-scene 3.2 — 5.68s–6s (pad/hold)
- Visual: Pour completes, glass sits full on the counter.
- Transition from previous sub-scene: Hard cut into Sequence 4.

## Sequence 4 — Bonus Benefit + CTA (22s–30s, 8s)
- Omni duration: 8s
- Dialogue window(s): 0.00s – 7.00s local (Line 4, full; global 20.90s–27.90s)

### Sub-scene 4.1 — 0s–7.00s local (Bonus Benefit + CTA)
- Visual: Hand holds the finished glass up at counter height, Mutant Big Greens tub visible in frame on the counter — mirrors source Scene 4.1's hold-glass-with-pouch-visible framing.
- Action/Activity: Hand lifts glass slightly toward camera, then rests it back beside the tub.
- Dialogue/VO: "Bonus, it supports my everyday nutrition on busy training days, grab your tub now at Ultimate Sup Singapore."
- SFX: Soft ambient kitchen room tone.
- On-screen text: "Get Yours @ Ultimate Sup SG"
- Ending/transition: Hold on final frame.
- Reference needs: character (no — hands-only) · environment (yes) · product (yes) · source footage (yes) · clone keyframe (candidate_07.jpg / candidate_08.jpg)

### Sub-scene 4.2 — 7.00s–8s (pad/hold)
- Visual: Static hold on glass + tub, no new action.
- Transition from previous sub-scene: End of video.

## Continuity & Wardrobe
No character/wardrobe — hands-only demo throughout. Single continuity element: one forearm/hand
(neutral skin tone, no visible sleeve branding conflict) handling product across all 4 sequences, in
one unchanging kitchen set (dark stone counter, cream cabinets, copper/tin-tile backsplash, wood
cutting board) matching the source's single-location pattern. No face, no second location, no
lip-synced dialogue anywhere in this script.

## TTS Timing Lock
| Voice line | Audio file | Exact duration | Cumulative in–out | Assigned sequence / sub-scene |
|---|---|---:|---|---|
| line_01 | `node/timing/line_01_rvc.wav` | 7.68s | 0.00–7.68s | Sequence 1 / Sub-scene 1.1 |
| line_02 | `node/timing/line_02_rvc.wav` | 7.54s | 7.68–15.22s | Sequence 2 / Sub-scene 2.1 |
| line_03 | `node/timing/line_03_rvc.wav` | 5.68s | 15.22–20.90s | Sequence 3 / Sub-scene 3.1 |
| line_04 | `node/timing/line_04_rvc.wav` | 7.00s | 20.90–27.90s | Sequence 4 / Sub-scene 4.1 |

## Reference Requirements Summary
| Sequence | character | environment | product | source_footage | clone keyframe(s) |
|---|---|---|---|---|---|
| Sequence 1 | no (hands-only) | yes | yes | yes | candidate_01.jpg, candidate_02.jpg |
| Sequence 2 | no (hands-only) | yes | yes | yes | candidate_03.jpg, candidate_04.jpg |
| Sequence 3 | no (hands-only) | yes | yes | yes | candidate_05.jpg, candidate_06.jpg |
| Sequence 4 | no (hands-only) | yes | yes | yes | candidate_07.jpg, candidate_08.jpg |

## Revision Log
- round 1 (2026-08-13, superseded): fabricated on-camera-creator draft — INVALID, do not reuse; root cause documented in the corrected source reference.
- round 2 (2026-08-14): full redo by content-executive against corrected grounded source reference; hands-only/VO/single-location Structural Fidelity Contract applied; TTS timing lock regenerated via real Applio TTS+VC measurement (27.90s measured, 30s sequence plan, 4 sequences matching source beat count).

## Gaps Open
None.
