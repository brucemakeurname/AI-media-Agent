# Shooting-Script Template + Worked Example — `6. Script_Template/`

Reference structure every ad breakdown in this library follows. Both builder skills READ this file
before writing so their output matches the schema exactly:

- `crawl_describe_TiktokAds_Template` — manual hand-picked TikTok Ads Library URLs; fills **every**
  field, including the fine per-`Keyframes` layer (this is the deep, machine-semantic path).
- `crawl_SocialAds_Template_apify` — Apify auto-discovery (TikTok + Meta); may leave `Keyframes`
  sparse when frame sampling is coarse, everything above it still required.

The leading `_` keeps this file sorting above the niche folders and marks it non-data — it is a
template, never crawled into. **This schema is a strict superset of the existing F&B/Fitness
entries**: the original field names are unchanged (so old entries stay valid), the new fields
(`Product presence`, `Element motion`, `Emphasis / Pacing`, `Transition out`, `Keyframes`,
`script_mode`, `## CTA Analysis`, `## Conversion Mechanics`) are additive enrichment for
describing motion/product/text on a per-instant basis a machine can parse.

---

## Filename convention

```
{biz_niche}/{biz_niche}-{content_format}-{platform}-{content-slug}-{ad_id}.md
{biz_niche}/{biz_niche}-{content_format}-{platform}-{content-slug}-{ad_id}.mp4   (source video kept alongside)
```

- `{biz_niche}` — folder name AND filename prefix (same tag vocab as `creative-direction`: `F&B`,
  `Fitness`, `Beauty`, `Health`, …). File stays identifiable even if moved out of its folder.
- `{content_format}` — the pillar (2-5 word kebab: `discount-livestream-teaser`, `product-reveal`,
  `ugc-testimonial`, `feature-montage`, …).
- `{platform}` — `tiktok` | `meta`.
- `{content-slug}` — hand-written brand+product/hook label (`mammy-cheese-suitcase-gift`).
- `{ad_id}` — source platform's own id, last, for uniqueness + traceability.

## IP / legal (non-negotiable)

Every prose field describes **structure/pattern**, never the source ad's literal wording.
Paraphrase on-screen copy and VO — capture the rhetorical move, not the exact sentence. The kept
`.mp4` is for human QA only.

---

## SCHEMA

````markdown
---
source_platform: tiktok | meta
source_ad_id: {{id}}
source_page_url: {{Creative Center / Ad Library detail page — for metrics + traceability.
  TikTok: https://ads.tiktok.com/business/creativecenter/topads/{{ad_id}}/pc/en }}
source_url: {{the CDN URL actually downloaded — flag TikTok CDN links as signed/expiring}}
captured_date: {{YYYY-MM-DD}}
country: {{one of US, CA, VN, AU, GB — locked allow-list}}
biz_niche: {{niche}}
content_format: {{pillar}}
script_mode: {{narrative | message-stack | tutorial-usecase | hybrid — see note at end}}
duration_sec: {{length}}
subject_visibility: {{on-camera talking | hands-only | product-only | mixed — grounded strictly in
  what the accepted keyframes actually show; "hands-only" if no keyframe contains a visible face,
  full stop, regardless of whether the audio has a voiceover}}
audio_mode: {{on-camera dialogue | voiceover narration | ambient/SFX only | on-screen text only —
  grounded in the actual whisperx transcript, never assumed; "voiceover narration" (speech over
  B-roll, no speaking mouth on screen) is the common pairing with hands-only, and must NOT be
  confused with on-camera dialogue downstream}}
background_continuity: {{single location | multi-location (state which beats change) — compare
  backdrop details across every accepted keyframe, not a visual impression}}
performance_metrics:
  # TikTok — real fields off the ad page. ctr_rank/cost_rank are INTERNAL rank/percentile scores
  # (lower = better; 0.08 is NOT "8% CTR"). Never invent a number the page didn't show.
  source_ranking_metric: {{impression | ctr | like | cost}}
  like_count: {{if present}}
  comment_count: {{if present}}
  share_count: {{if present}}
  ctr_rank: {{internal rank/percentile}}
  cost_rank: {{internal rank/percentile}}
  ctr_vs_industry: {{verbatim conversion label the page shows, e.g. "Top 10% of industry average"}}
  budget_level: {{Low | Medium | High, if shown}}
  period_days: {{ranking window}}
  country: {{country}}
  # Meta — no engagement/spend for non-political ads; record availability instead:
  is_active: {{true/false}}
  start_date: {{YYYY-MM-DD}}
  end_date: {{YYYY-MM-DD | "still active"}}
  run_duration_days: {{end - start}}
  platforms: {{[FACEBOOK, INSTAGRAM, ...]}}
  engagement_metrics_available: false
performance_signal: {{one-line human summary from the metrics above}}
---

## Arc Breakdown
{{script_mode + which beats present: hook / problem / turn / mechanism / proof / payoff / CTA — and
  why that mode fits}}

**Fidelity note (mandatory, one line):** restate `subject_visibility` / `audio_mode` /
`background_continuity` here in prose, e.g. "hands-only demo, voiceover narration, single kitchen
location throughout — no face and no location change anywhere in this source; any clone script
built from this reference must preserve that pattern and only swap brand/product/voice." This is
the line `write-shooting-script`/`write-ai-ugc-video-sequence-script` must not silently violate.

## Sequence N — {{beat name}} ({{start}}–{{end}}s)
### Scene N.M
- Visual: {{shot size, angle, composition, setting — paraphrased}}
- Action/Activity: {{what the subject physically does}}
- Product presence: {{how the product enters/exits frame — held up / worn / floating hero / on shelf;
  angle, prominence, first-appears / leaves timing}}
- Element motion: {{every moving element as `element: from → to (speed/easing)`; camera moves
  (push-in / track / whip); subject blocking}}
- Motion/VFX: {{effect + on which element + what it visualizes; speed ramps; match cuts}}
- On-screen text pattern: {{paraphrased copy + position + animate IN/OUT + persistent-badge vs
  scene-synced caption}}
- Dialogue/VO pattern: {{rhetorical STRUCTURE, not verbatim; language/accent; "none" is valid}}
- SFX / Music mood: {{music energy; hero SFX moments}}
- Emphasis / Pacing: {{cuts/sec here; what is foregrounded; claim-repetition — note when the core
  claim is restated via a NEW visual}}
- Transition out: {{hard cut | match cut | morph | whip | dissolve | speed ramp}}
- Timing: {{start–end}}
- Keyframes:
    - t={{time}}s: {{exact composition at this instant — subject/product/text positions, what just
      moved in/out. One line per visually distinct instant; finer than a scene.}}
    - t={{time}}s: {{...}}

(repeat Scene N.M per shot; repeat Sequence N per beat)

## CTA Analysis
{{where/how the CTA appears (persistent badge / end-card / spoken), phrasing pattern (paraphrased),
  urgency devices (dates, stock, price), seconds on screen}}

## Conversion Mechanics
{{why it plausibly converts — offer structure, proof type, the single core claim + how many times /
  via how many different visuals it is hammered, and how the metrics corroborate it}}

## Why this was selected
{{justification vs selection criteria + what pattern it adds the library didn't already have}}

## Graph
**Parent:** [[BASE/BRAND KITs/6. Script_Template/_shooting-script-template|Shooting-Script Template]]
**Built by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/{{skill}}/SKILL|{{skill}}]]
**Sibling in this batch:** [[BASE/BRAND KITs/6. Script_Template/{{niche}}/{{other}}|{{label}}]]
````

---

## WORKED EXAMPLE (real entry — study this for the expected granularity)

Below is how the schema looks filled for a real library entry, the Mămmy cheese "buy-3-get-a-free-
kids-suitcase" livestream teaser (`F&B/F&B-discount-livestream-teaser-tiktok-mammy-cheese-suitcase-
gift-7661308372935376903.md`). Copy is paraphrased (IP rule). Notice the `Element motion` from→to
notation and the per-instant `Keyframes` — that is the level a machine needs to reconstruct the shot.

````markdown
---
source_platform: tiktok
source_ad_id: 7661308372935376903
source_page_url: https://ads.tiktok.com/business/creativecenter/topads/7661308372935376903/pc/en
source_url: https://v16m-default.tiktokcdn.com/...  # signed CDN link, captured 2026-07-24, expires
captured_date: 2026-07-24
country: VN
biz_niche: F&B
content_format: discount-livestream-teaser
script_mode: message-stack   # ranked gift-then-feature blocks around a purchase-threshold offer, not a narrative arc
duration_sec: 24.8
performance_metrics:
  source_ranking_metric: ctr
  ctr_rank: 0.08          # best-in-niche among VN F&B candidates; internal rank, NOT 8% CTR
  like_count: 160         # small/narrow-reach (livestream announcement to existing base)
  cost_rank: 2
  period_days: 120
  country: VN
performance_signal: TikTok Top Ads – ctr_rank 0.08 (best-in-niche, VN F&B, 120d), like_count 160 (narrow reach)
---

## Arc Breakdown
`message-stack`. Gift reveal (hook) → suitcase feature blocks (proof) → product co-placement (payoff).
No problem/turn beat — it is a gift-with-purchase livestream teaser, not a testimonial arc. Vietnamese
VO covers only the first ~9s; the rest is visual + on-screen-text only.

## Sequence 1 — Hook / gift reveal (0.0–9.0s)
### Scene 1.1
- Visual: wide-to-medium in a warehouse/stock-room (product cartons stacked behind), presenter in a
  branded white polo + white trousers walks toward camera holding a green kids' travel suitcase
- Action/Activity: walks in, lifts the suitcase to camera, gestures while addressing the viewer
- Product presence: the GIFT (green suitcase) is the hero from frame 1, held chest-height, front face
  to camera; the actual cheese product does NOT appear yet (held back for the payoff)
- Element motion: presenter: background → foreground (steady walk-in, ~0–3s); suitcase: raised
  waist → chest (slow lift, ease-out)
- Motion/VFX: animated mascot sticker (top-right) + a yellow arrow pointing down at the persistent
  corner callout — both animate/loop the whole ad
- On-screen text pattern: PERSISTENT top-left green callout (livestream brand + "join live" urgency)
  present every frame — a permanent CTA badge, not a caption; at ~2.5s a bottom offer line
  paraphrasable as "buy 3 cheese → free travel suitcase" pops in (scale-up), stays through the beat
- Dialogue/VO pattern: opens by naming the exact bonus tied to a purchase threshold, then a personal-
  ownership aside ("I use this one too"), then 2–3 quick durability points, closing on a dated
  live-stream call to action
- SFX / Music mood: upbeat music bed, energetic
- Emphasis / Pacing: ~1 cut/1.5s here; the offer line is the foregrounded beat; the corner CTA badge
  restates the "watch live" action continuously
- Transition out: hard cut to the open-suitcase demo
- Timing: 0.0–9.0s
- Keyframes:
    - t=0.5s: presenter mid-stride in background center, suitcase at waist, only the corner CTA badge on screen
    - t=2.6s: presenter at medium distance, suitcase raised to chest, bottom offer line "3 cheese → free suitcase" popped in
    - t=6.0s: tighter, presenter gestures at the suitcase face, offer line + corner badge both held

## Sequence 2 — Feature demo (9.0–17.0s)
### Scene 2.1
- Visual: medium/close, presenter unzips and opens the suitcase to reveal the black interior lining,
  then rotates it to show the patterned exterior shell
- Action/Activity: opens the case fully, points into the compartment, then turns it to show the outside
- Product presence: gift suitcase fills most of the frame, rotated through interior → exterior faces
- Element motion: suitcase lid: closed → hinged fully open (~9–11s); suitcase body: front-face →
  ~45° rotate to show side shell (~13–15s); presenter's hand: enters to point at compartment
- Motion/VFX: none beyond the persistent stickers
- On-screen text pattern: short feature-label overlays appear synced to the beat being shown —
  paraphrasable as "flexible plastic" during the interior, "scratch-resistant shell" during the
  exterior — separate from the persistent corner badge; each pops in near the feature it labels
- Dialogue/VO pattern: none detected past ~9s — this beat is carried by the on-screen feature labels,
  not spoken VO
- SFX / Music mood: continues from Sequence 1
- Emphasis / Pacing: slower, ~1 cut/2.5s, letting each feature label read
- Transition out: hard cut to the product co-placement
- Timing: ~9.0–17.0s
- Keyframes:
    - t=9.5s: suitcase held open, black interior facing camera, hand entering frame left
    - t=12.0s: "flexible plastic" label popped in over the interior compartment
    - t=14.5s: suitcase rotated to exterior, "scratch-resistant shell" label over the patterned face

## Sequence 3 — Product co-placement / payoff (17.0–24.8s)
### Scene 3.1
- Visual: pulls back to a fuller shot — the green suitcase now stands ON TOP of a built display stack
  of the actual Mămmy cheese retail packaging, blue starry backdrop behind
- Action/Activity: presenter poses beside/holding the suitcase next to the product display, direct
  eye contact
- Product presence: FIRST appearance of the real cheese product — its retail packaging forms the
  display base under the gift, tying gift ↔ purchase visually without a spoken line
- Element motion: camera: medium → pull-back to reveal the full display; presenter: steps in beside
  the stack; animated cat sticker: heart-hands loop over the product
- Motion/VFX: heart-hands mascot sticker over the product stack
- On-screen text pattern: only the persistent corner CTA badge remains — this beat lets the visual
  gift+product co-placement make the point
- Dialogue/VO pattern: none (silent)
- SFX / Music mood: continues, resolves
- Emphasis / Pacing: holds longer, letting the gift-sits-on-product image land
- Transition out: end
- Timing: ~17.0–24.8s
- Keyframes:
    - t=18.0s: pull-back reveals suitcase standing on the cheese-carton display, blue backdrop
    - t=22.0s: presenter posed beside the stack holding the suitcase, corner CTA badge held to end

## CTA Analysis
Two-layer CTA: a PERSISTENT top-left "join the live" badge on every single frame (never absent), plus
a spoken dated live-stream call in the first 9s. Urgency = the live event + the buy-3 threshold. The
badge is on-screen 100% of runtime — the ad never lets the viewer forget the conversion action.

## Conversion Mechanics
Gift-with-purchase built on a threshold (buy 3 → free suitcase): the free item is shown as more
desirable/premium (a real kids' suitcase with demoed features) than the small cheese purchase it
requires, inverting the perceived value. Core action ("watch the live") is hammered continuously by
the persistent badge; the offer is restated as VO + bottom line + implied by the final gift-on-product
co-placement. ctr_rank 0.08 (best-in-niche) corroborates a strong hook, low like_count reflects
deliberately narrow reach (existing-customer livestream announcement), not weak creative.

## Why this was selected
Best-CTR-rank F&B candidate in the VN pool. Adds a discount/livestream gift-with-purchase pattern
distinct from the narrative-testimonial and pure product-demo patterns already in the library.
````

---

## `script_mode` (required field — the most useful retrieval tag)

Selects which script-generation machine an ad demonstrates, so a consumer pulls the right pattern for
the product×painpoint it faces:

| `script_mode` | When an ad is this | Tells the consumer |
|---|---|---|
| `narrative` | product relieves a lived, emotional, high-stakes painpoint; character arc / before→after | spokesperson/testimonial structure, continuity, pre-posed refs |
| `message-stack` | product sells an attribute/upgrade in a commodity category; VFX/text-forward, no real arc | rank features → visualize each → repeat the core claim across shots |
| `tutorial-usecase` | product shown solving one concrete real situation step-by-step | anchor to a specific use occasion; how-to beat order |
| `hybrid` | genuinely two of the above | name both; note where it switches |

## Graph
**Parent:** [[BASE/BRAND KITs/BRAND-KIT-STRUCTURE|Brand Kit Structure]]
**Real example entry:** [[BASE/BRAND KITs/6. Script_Template/F&B/F&B-discount-livestream-teaser-tiktok-mammy-cheese-suitcase-gift-7661308372935376903|Mămmy cheese suitcase-gift]]
**Read by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_describe_TiktokAds_Template/SKILL|crawl_describe_TiktokAds_Template]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_SocialAds_Template_apify/SKILL|crawl_SocialAds_Template_apify]]
**Owner role:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/researcher|researcher]]
