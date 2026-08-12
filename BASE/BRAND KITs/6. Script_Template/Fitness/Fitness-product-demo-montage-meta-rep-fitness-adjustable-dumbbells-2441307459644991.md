---
source_platform: meta
source_ad_id: 2441307459644991
source_url: https://www.facebook.com/ads/library/?id=2441307459644991  # stable Meta Ad Library permalink
country: US
biz_niche: Fitness
content_format: product-demo-montage
duration_sec: 39.4
performance_metrics:
  is_active: true  # still running as of scrape date (2026-07-24)
  start_date: 2026-03-30
  end_date: still active
  run_duration_days: 116  # and counting
  platforms: [FACEBOOK, INSTAGRAM, AUDIENCE_NETWORK, THREADS]
  engagement_metrics_available: false  # Meta Ad Library API exposes no like/impression/spend data for non-political ads
performance_signal: Meta Ad Library – currently active, running 116+ days across 4 placements; no engagement data exposed by the API. Real DTC brand (REP Fitness), specific named product line ("Adjustable Dumbbells Built to Last" — matches title/CTA), not a lifestyle/reseller ad — stronger product-identity signal than a runtime-only proxy alone.
---

## Arc Breakdown
Hook (macro product tease) → feature/mechanism close-up → full-product reveal → multi-person
demo montage → closing macro. No spoken VO — background music (with lyrics, unrelated to the
product) plays throughout, same pattern as this library's other silent product-demo entries. Unlike
the entry this one replaced, the **product itself carries clear on-screen brand identification**
(embossed logo, wordmark on wristbands/apparel, and a dial/pin adjustment mechanism unique to this
product category) — this is the corrected selection criterion going forward (see
`crawl_SocialAds_Template_apify/SKILL.md`).

## Sequence 1 — Hook / macro tease (0.0–4.0s)
### Scene 1.1
- Visual: extreme macro close-up, dark/moody lighting, the dumbbell head's stacked-plate mechanism
  shot at a dramatic angle, a small embossed logo mark (mountain-peak icon) visible on the housing,
  "REP" wordmark legible on the base stand beneath it
- Action/Activity: static product on a stand, no hands yet, slow rack-focus style reveal
- Dialogue/VO pattern: none — no spoken VO anywhere in this ad
- SFX / Music mood: moody/tense instrumental opening (background track with lyrics, not
  product-specific — same pattern as the sibling Speediance-style entries in this library)
- Motion/VFX: none, static macro hold
- On-screen text pattern: none in this opening beat — the product's own branding (etched logo +
  base wordmark) functions as the "text," not an overlay graphic
- Timing: 0.0–4.0s

## Sequence 2 — Mechanism/feature close-up (4.0–8.0s, and again ~28-32s)
### Scene 2.1
- Visual: extreme macro close-up of a hand adjusting the weight-selection dial/pin mechanism on the
  dumbbell head — the product's core functional differentiator (tool-free quick weight change)
- Action/Activity: fingers turning/setting the selector
- Dialogue/VO pattern: none
- SFX / Music mood: continues
- Motion/VFX: none, handheld micro-movement only
- On-screen text pattern: none
- Timing: ~4.0–8.0s (mechanism close-up recurs later in the montage, e.g. ~28-32s, reinforcing the
  same feature claim from the ad's own copy: "steel construction, rigorously tested")
- Timing: 4.0–8.0s

## Sequence 3 — Full product reveal (12.0–16.0s)
### Scene 3.1
- Visual: pulls back to a full environment shot — a matched pair of the adjustable dumbbells resting
  on their own wheeled stand/rack, set inside a real home-gym space (visible barbell rack, weight
  plates, resistance bands hanging on a wall-mounted pegboard behind)
- Action/Activity: static product-in-context shot, no person in frame
- Dialogue/VO pattern: none
- SFX / Music mood: continues
- Motion/VFX: none
- On-screen text pattern: none
- Timing: 12.0–16.0s

## Sequence 4 — Multi-person demo montage (16.0–36.0s)
### Scene 4.1
- Visual: cuts between at least 2 different people (different genders, different builds) using the
  product across 3+ distinct exercises — a seated bicep curl, a standing bent-over row, and a
  walking lunge with the dumbbells held at the sides — all shot in the same branded home-gym
  environment as Sequence 3
- Action/Activity: real exercise reps performed with visible effort/form, not staged posing
- Dialogue/VO pattern: none
- SFX / Music mood: continues, likely builds in energy across the montage (standard product-montage
  pacing convention, not directly confirmed segment-by-segment from this sampling density)
- Motion/VFX: fast cuts between users/exercises, no transition effects (hard cuts only)
- On-screen text pattern: none over the exercise shots themselves
- Timing: 16.0–36.0s
- Note: a branded wristband with a legible "REP" wordmark appears in close-up during this
  sequence (one user's wrist, gripping the dumbbell handle) — a second, deliberate brand-identity
  touchpoint beyond the product housing itself

## Sequence 5 — Closing macro (36.0–39.4s)
### Scene 5.1
- Visual: returns to a macro product shot (not fully sampled at this frame density — likely mirrors
  Sequence 1's opening framing as a bookend)
- Action/Activity: static, no person
- Dialogue/VO pattern: none
- SFX / Music mood: resolves
- Motion/VFX: none
- On-screen text pattern: none in-video — the ad's actual CTA lives entirely in the surrounding
  Meta unit (title: "Adjustable Dumbbells Built to Last", CTA button: "Shop now", linking directly
  to the product collection page), not as an on-screen graphic
- Timing: 36.0–39.4s

## Why this was selected
**Replaces a prior Fitness-niche entry (Speediance Gym Monster 2) that was flagged for not clearly
identifying a specific product on-screen** — that ad's video carried only generic lifestyle text
("POV: your home gym...") with the product name living solely in the surrounding ad caption, not
the video itself. This entry was sourced specifically to correct that gap: REP Fitness's product
(embossed logo, base wordmark, and a second wristband-branding touchpoint) is unambiguously
identifiable from the video pixels alone, and the ad copy's own title ("Adjustable Dumbbells Built
to Last") names the exact product category. Also a stronger candidate than the alternatives found in
the same search batch — Fitbod, BetterMe, and Military Training System are apps/training programs
(not physical gym accessories), and Superfitness's ad was a full-gym-build case study, not a single
product. `is_active: true` (still running as of the scrape date) is a mildly stronger signal than a
closed-and-forgotten long-runner, though still weaker than TikTok's real ctr_rank/like_count metrics
per this library's standing caveat on Meta-sourced entries.

## Graph
**Parent:** [[BASE/BRAND KITs/6. Script_Template/README|Script Template Library]] (if created)
**Built by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_SocialAds_Template_apify/SKILL|crawl_SocialAds_Template_apify]]
**Sibling:** [[BASE/BRAND KITs/6. Script_Template/Fitness/Fitness-ugc-testimonial-meta-maxpro-air-cable-machine-1616794992743761|Fitness — MAXPRO Air cable machine (ugc-testimonial)]]
