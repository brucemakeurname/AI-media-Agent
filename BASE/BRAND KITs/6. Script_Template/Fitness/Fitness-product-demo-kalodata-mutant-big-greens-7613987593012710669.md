---
source_platform: tiktok
source_ad_id: 7613987593012710669
source_url: https://live.kalocdn.com/video/7613987593012710669.mp4 (signed, expiring)
captured_date: 2026-08-13
biz_niche: Fitness
content_format: product-demo
script_mode: message-stack
duration_sec: 24.47
subject_visibility: hands-only — no face is visible in any accepted keyframe (candidate_01..08),
  full 24.47s. A person's forearm/hand (purple sleeve, painted nails) enters frame to handle
  product/ingredients but never the head/face.
audio_mode: voiceover narration — whisperx transcript confirms continuous spoken VO over the
  hands-only B-roll (no speaking mouth ever on screen). Full transcript (paraphrase only downstream,
  never reuse verbatim): opens with a protein/calorie/no-added-sugar claim, states it will be a
  daily go-to, names the specific product/flavor, describes taste ("light and refreshing, tastes
  more like juice than protein"), adds a hair/skin/nails benefit claim, closes on a stock-scarcity
  CTA pointing at a cart icon.
background_continuity: single location — same kitchen counter (dark stone counter, cream cabinets,
  copper/tin-tile backsplash, wood cutting board, pen/knife holders visible in background) in every
  accepted keyframe, no location change anywhere in the 24.47s.
---

## CORRECTION NOTICE (2026-08-14)

This entry originally (2026-08-13) described the source as a **green smoothie** with **banana and
chestnut prep** and "a creator [who] speaks in an authentic conversational voice" — none of that
is what the source video actually shows. Re-verified against the retained keyframes and a fresh
`whisperx` pass on the retained source MP4: the actual product is **Bloom Clear Protein,
Strawberry Watermelon flavor** (pink protein drink, not a green smoothie; no banana or chestnut
anywhere), the person is **hands-only** (no face ever shown), and the "conversational voice" is a
**voiceover narration**, not an on-camera talking creator. This fabricated first draft is the
documented root cause of a downstream clone-video that drifted into an on-camera talking creator
in a different apartment kitchen — see `crawl_describe_Tiktok_vid_kalodata/SKILL.md`'s Step 3
grounding contract, added in response. This corrected version is grounded in the actual
keyframes/transcript; do not revert to the original description.

## Arc Breakdown
`message-stack` — ranked claim/feature blocks (protein/calorie stat → daily-use framing → product
name/flavor → taste reassurance → bonus benefit → scarcity CTA), no emotional before/after arc.

**Fidelity note (mandatory):** hands-only demo, voiceover narration, single kitchen location
throughout — no face and no location change anywhere in this source. Any clone script built from
this reference must preserve that pattern (hands-only B-roll + VO) and only swap brand/product/
voice identity — it must NOT introduce an on-camera talking creator or a second location.

## Sequence 1 — Hook / claim stat (0.0–5.0s)
### Scene 1.1
- Visual: hand holds a filled pink-drink tumbler with floral wrap, kitchen counter behind
- Product presence: finished drink front-and-center, tumbler with straw
- Dialogue/VO pattern: opens with a protein-gram + calorie + no-added-sugar claim stack
- Keyframes: candidate_01.jpg / candidate_02.jpg (hand + product only, no face)

## Sequence 2 — Product reveal / prep (5.0–13.0s)
### Scene 2.1
- Visual: hand scoops powder from an open protein-powder pouch beside an empty tumbler
- Product presence: powder pouch (Bloom Clear Protein, Strawberry Watermelon) label clearly legible
- Dialogue/VO pattern: names the product/flavor, sets up the daily-use framing
- Keyframes: candidate_03.jpg / candidate_04.jpg

## Sequence 3 — Pour / mix / taste proof (13.0–19.0s)
### Scene 3.1
- Visual: hand pours liquid from the tumbler shaker into a clear glass with fresh strawberry slices
- Element motion: pour stream from tumbler → glass, strawberries floating
- Dialogue/VO pattern: taste reassurance ("light, refreshing, more like juice than protein")
- Keyframes: candidate_05.jpg / candidate_06.jpg

## Sequence 4 — Bonus benefit + CTA (19.0–24.47s)
### Scene 4.1
- Visual: hand holds the finished glass up, product pouch visible on counter in frame
- Dialogue/VO pattern: bonus hair/skin/nails benefit claim, then stock-scarcity CTA pointing at cart
- Keyframes: candidate_07.jpg / candidate_08.jpg

## CTA Analysis
Spoken scarcity CTA only in the final ~2s ("hard to keep in stock" + cart-icon callout) — no
persistent on-screen CTA badge observed in the accepted keyframes.

## Conversion Mechanics
Claim-stack message structure: leads with a hard stat (protein/calorie), reframes as a daily habit,
proves taste concern is unfounded, adds a secondary beauty-benefit claim, closes on scarcity. All
carried by VO over continuous hands-only B-roll in one unchanging location — no character arc, no
face, no set change.

## Graph
**Parent:** [[BASE/BRAND KITs/6. Script_Template/_shooting-script-template|Shooting Script Template]]
**Builder Skill:** [[PRODUCTION/.agents/skills/crawl_describe_Tiktok_vid_kalodata/SKILL|crawl_describe_Tiktok_vid_kalodata]]
**Owner Role:** [[.claude/agents/researcher|researcher]]
