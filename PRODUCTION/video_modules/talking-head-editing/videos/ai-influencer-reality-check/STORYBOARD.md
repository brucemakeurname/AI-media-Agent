---
format: 1080x1920
duration: 56s
message: "AI influencers aren't a cheat code — they're a media business, and that's why 99% of people who launch one quit in the first month."
arc: listicle — Hook → Reality check → 4 reasons (claim + payoff each) → Takeaway → CTA
audience: aspiring AI-influencer creators / solo operators evaluating whether to launch one
mode: autonomous
music: confident, slightly aggressive protest-poster underscore — sparse percussion, no melody sweetness
---

## Video direction

- **Palette system (from `frame.md` — Broadside):** two registers only, one per frame. Dark register = ink-black ground (`colors.ink-black`), cream text (`colors.cream`), fire-orange (`colors.fire-orange`) as the sole accent. Orange register = fire-orange ground, ink-black text/headlines, no second hue. Never invent a color outside this pair.
- **Type:** every hero line is Barlow display/h1, lowercase, weight 700–900, negative-tracked (`frame.md` typography ramp) — one display moment per frame, nothing else competes. Chrome (kickers, catalogue numerals, reason numbers) is IBM Plex Mono, uppercase, 0.14em.
- **Motion grammar + reveal model:** long-tail `power3` settles everywhere — no bounce, no overshoot. Every frame reveals only what the VO is saying at t=0; each further piece (a clause, a numeral, a tool name) lands on its own spoken cue, weighted into the back ~50% of the frame's duration. Once content resolves, hold it — at most a subtle jitter (`sine-wave-loop`, low amplitude) keeps a held frame alive.
- **Rhythm / held-frame allocation:** the four "payoff" frames (4, 6, 8, 10 — Pull Quote) are the video's deliberate held beats: the quote lands early in the frame and then holds still, giving the punchy claim frames before them room to be busy. Frame 12 (the close) is the other sanctioned hold — land the line and let it sit, no exit motion (final frame only).
- **Framing rotation (Broadside frame-treatment vocabulary, never same twice in a row):** Statement (dark) → Fadelist (dark) → Cover (orange) → Pull Quote (dark) → Cover (orange) → Pull Quote (dark) → Cover (orange) → Pull Quote (dark) → Cover (orange) → Pull Quote (dark) → Statement (dark) → Cover (orange).
- **Negative list:** no bouncy/overshoot easing; no lazy breathing or back-half camera pan/push; no floating bokeh or purple-blue "AI" gradient cliché; no second accent color; no cream text on the orange register; no browser chrome / interface mocks (nothing here is about a UI); nothing dumped in the first ~25% of any frame.

## Frame 1 — The hype

- scene: Massive lowercase type slams in, word by word, filling the frame
- voiceover: "Everyone's telling you to launch an AI influencer and get rich. Nobody's telling you why 99% quit in month one."
- duration: 8.363s
- transition_in: cut
- status: outline
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Contrast (common-belief vs reality)
- beat: tension + skepticism

narrativeRole: Opens the cognitive gap — everyone hypes launching, nobody explains the failure rate.
keyMessage: The hype ignores a 99% first-month quit rate.
blueprint: compose
focal: the hero clause "get rich" (orange, on ink-black)
roles: hero clause = foreground subject (Statement register, dark) · supporting hype phrase = supporting (cream, smaller, above) · mono kicker "EVERYONE'S SHOUTING" = supporting chrome
sfx: none (cold open on VO)

Scene 1 (0.0–2.2s): ink-black ground; mono kicker "EVERYONE'S SHOUTING" fades in top-left as the VO opens — **per-word staggered reveal** (`dynamic-content-sequencing`), power3 settle. Centered-left, low density.
Scene 2 (2.2–4.2s): as the VO says "launch the AI influencer and get rich," the Statement display line builds beneath the kicker — **kinetic beat-slam** (`kinetic-beat-slam`) on "get rich," that clause alone inked fire-orange, rest cream. Left-anchored, ~50% of frame.
Scene 3 (4.2–6.0s): as the VO pivots to "nobody's telling you why 99% quit," the orange clause holds and a second cream line drops in beneath via **per-word staggered reveal**; frame settles and holds — subtle jitter only, no further motion.

## Frame 2 — The reality check

- scene: The hyped words dissolve; one stark line replaces them, dead-center
- voiceover: "So here's the reality check."
- duration: 1.941s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-reality-check.html
- type: product_intro
- persuasion: Signposting
- beat: orientation + anticipation

narrativeRole: Names the frame the rest of the video runs inside — this is a reality check, not a tutorial.
keyMessage: What follows is the honest accounting, not more hype.
blueprint: compose (Fadelist treatment, Adapt)
focal: fadelist-title "the reality check" (fire-orange, oversized)
roles: fadelist-title = foreground subject · three fading hype words ("rich.", "now.", "viral.") = supporting (opacity 1.0/0.5/0.22 stack, cream)
sfx: soft-thud (on the title's landing)

Scene 1 (0.0–1.0s): carries over from Frame 1's held state — the three hype words ("rich.", "now.", "viral.") stack top-left at 1.0/0.5/0.22 opacity, static (Adapt: keep the fadelist opacity-stack signature; the three words are pulled straight from Frame 1's hype rather than generic list items).
Scene 2 (1.0–2.5s): as the VO says "so here's," the hype-word stack dims further (0.5/0.3/0.15) via **scale-swap** handoff (`scale-swap-transition`) toward the frame's right side, making room.
Scene 3 (2.5s–end): on "the reality check," the oversized fadelist-title slams in fire-orange via **hard-cut / flash word-swap** (`discrete-text-sequence`), settles power3, holds still — subtle jitter only.

## Frame 3 — Reason one: claim

- scene: A big numeral "1" anchors the frame; the claim types in beneath it
- voiceover: "Reason one — most AI influencers fail. The market's flooded with low-effort, dead-eyed avatars. A tool isn't a brand."
- duration: 8.448s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/03-reason-one.html
- type: feature_showcase
- persuasion: Contrast (tool vs. brand)
- beat: recognition

narrativeRole: First reason — confusing owning a tool with having a brand is why most avatars fail.
keyMessage: A tool is not a brand; most AI influencers never cross that gap.
blueprint: compose (Cover treatment, Reproduce)
focal: broadside-num "01" + display clause "most fail"
roles: broadside-num "01" = supporting chrome (top-left, mono, low opacity) · display clause = foreground subject (ink on fire-orange) · lead line (dead-eyed avatars / tool≠brand) = supporting, 75% ink
sfx: none

Scene 1 (0.0–1.5s): fire-orange ground; broadside-num "01" and mono kicker "REASON" fade in top-left — **per-word staggered reveal**, power3. Left-anchored, ~45% silence.
Scene 2 (1.5–4.5s): as the VO says "most AI influencers fail," the display clause "most fail" builds via **kinetic beat-slam**, ink-black, filling ~50% of frame.
Scene 3 (4.5–7.0s): as the VO names "low-effort, dead-eyed avatars" then "a tool isn't a brand," the lead line reveals beneath in 75% ink via **per-word staggered reveal**, settles and holds — subtle jitter only.

## Frame 4 — Reason one: payoff

- scene: The claim distills to one blunt line, oversized, alone
- voiceover: "Just because she moves doesn't mean she matters."
- duration: 2.603s
- transition_in: crossfade
- status: outline
- src: compositions/frames/04-reason-one-payoff.html
- type: social_proof
- persuasion: Distillation
- beat: "aha" + conviction

narrativeRole: Crystallizes reason one into a quotable, shareable line.
keyMessage: Motion isn't meaning — an avatar moving is not the same as an avatar mattering.
blueprint: compose (Pull Quote treatment, Reproduce)
focal: quote-text "just because she moves doesn't mean she matters"
roles: quote-mark (oversized fire-orange ") = supporting chrome, top · quote-text = foreground subject, cream on ink-black
sfx: none

Scene 1 (0.0–0.6s): ink-black ground, chrome suppressed; oversized fire-orange quote-mark drops in via **spring-pop entrance** (`spring-pop-entrance`, smooth long-tail, no overshoot).
Scene 2 (0.6–2.4s): as the VO speaks the line, quote-text assembles via **per-word staggered reveal** beneath the mark, cream, ≤78cqw.
Scene 3 (2.4–3.0s): held read — quote-text settled, subtle jitter only, no further motion; this is one of the video's deliberate held beats.

## Frame 5 — Reason two: claim

- scene: A big numeral "2" anchors the frame; claim builds beneath it
- voiceover: "Reason two — content comes fast, AI comes later. Photorealistic skin, zero personality — that's a screensaver, not a creator."
- duration: 9.195s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/05-reason-two.html
- type: feature_showcase
- persuasion: Contrast (screensaver vs. creator)
- beat: recognition

narrativeRole: Second reason — polish without personality is decoration, not creation.
keyMessage: Photorealistic skin with zero personality is a screensaver, not a creator.
blueprint: compose (Cover treatment, Reproduce)
focal: broadside-num "02" + display clause "AI comes later"
roles: broadside-num "02" = supporting chrome · display clause = foreground subject (ink on fire-orange) · lead line (screensaver, not creator) = supporting, 75% ink
sfx: none

Scene 1 (0.0–1.5s): fire-orange ground; broadside-num "02" + kicker "REASON" fade in — **per-word staggered reveal**, power3.
Scene 2 (1.5–4.5s): as the VO says "content comes fast, AI comes later," display clause slams in via **kinetic beat-slam**, ~50% of frame.
Scene 3 (4.5–7.0s): as the VO names "photorealistic skin," "zero personality," "screensaver, not creator," the lead line reveals phrase-by-phrase via **per-word staggered reveal**, settles and holds.

## Frame 6 — Reason two: payoff

- scene: One blunt line, oversized, alone
- voiceover: "You cannot automate a soul."
- duration: 2.027s
- transition_in: crossfade
- status: outline
- src: compositions/frames/06-reason-two-payoff.html
- type: social_proof
- persuasion: Distillation
- beat: "aha" + conviction

narrativeRole: Crystallizes reason two into the video's sharpest line.
keyMessage: Personality can't be automated — it has to be built.
blueprint: compose (Pull Quote treatment, Reproduce)
focal: quote-text "you cannot automate a soul"
roles: quote-mark = supporting chrome · quote-text = foreground subject
sfx: none

Scene 1 (0.0–0.6s): ink-black ground; fire-orange quote-mark drops in via **spring-pop entrance**, power3.
Scene 2 (0.6–2.4s): quote-text assembles via **per-word staggered reveal**, timed to the VO, slowest reveal in the video (matches the script's "slowest line" delivery note).
Scene 3 (2.4–3.0s): held read, subtle jitter only — the video's second deliberate held beat.

## Frame 7 — Reason three: claim

- scene: A big numeral "3" anchors the frame; claim builds beneath it, the four tool names appear as a small parallel row
- voiceover: "Reason three — your taste is the only edge. Everyone has Midjourney, Kling, Luma, Nano Banana. Same tools, different eye."
- duration: 8.32s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/07-reason-three.html
- type: feature_showcase
- persuasion: Comparison of two options (same tools, different outcome)
- beat: recognition

narrativeRole: Third reason — with identical tools available to everyone, taste becomes the only differentiator.
keyMessage: Everyone has the same tools; taste is what separates the results.
blueprint: compose (Cover treatment, Adapt)
focal: broadside-num "03" + display clause "taste is the edge"
roles: broadside-num "03" = supporting chrome · display clause = foreground subject · four tool names (Midjourney/Kling/Luma/Nano Banana) = supporting mono row, small
sfx: none

Adapt: Cover's lead-line slot becomes a small parallel mono row of four tool names instead of a single sentence — same silence/register, a four-item enumeration in place of one lead line.

Scene 1 (0.0–1.5s): fire-orange ground; broadside-num "03" + kicker "REASON" fade in.
Scene 2 (1.5–4.5s): as the VO says "your taste is the only edge," display clause slams in via **kinetic beat-slam**, ~50% of frame.
Scene 3 (4.5–7.0s): as the VO names each tool ("Midjourney… Kling… Luma… Nano Banana"), the four names reveal left-to-right one at a time via **in-place token cycle** (`discrete-text-sequence`) in the small mono row; settles and holds.

## Frame 8 — Reason three: payoff

- scene: One blunt line, oversized, alone
- voiceover: "The AI is the brush. You are still the artist."
- duration: 3.221s
- transition_in: crossfade
- status: outline
- src: compositions/frames/08-reason-three-payoff.html
- type: social_proof
- persuasion: Analogy / metaphor
- beat: conviction + fascination

narrativeRole: Crystallizes reason three with a brush/artist analogy.
keyMessage: The tool executes; the human eye still directs.
blueprint: compose (Pull Quote treatment, Reproduce)
focal: quote-text "the AI is the brush. you are still the artist."
roles: quote-mark = supporting chrome · quote-text = foreground subject
sfx: none

Scene 1 (0.0–0.6s): ink-black ground; fire-orange quote-mark drops in via **spring-pop entrance**.
Scene 2 (0.6–2.8s): quote-text assembles via **per-word staggered reveal**, "the brush" and "the artist" each landing on their own beat.
Scene 3 (2.8–3.5s): held read, subtle jitter only — third deliberate held beat.

## Frame 9 — Reason four: claim

- scene: A big numeral "4" anchors the frame; claim builds beneath it
- voiceover: "Reason four — it ain't cheap. GPU costs, subscriptions, hours fixing glitches. That's capital investment."
- duration: 7.659s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/09-reason-four.html
- type: feature_showcase
- persuasion: Statistical proof (cost enumeration)
- beat: recognition + unease

narrativeRole: Fourth reason — the real, ongoing cost most people underestimate.
keyMessage: GPU costs, subscriptions, and glitch-fixing time make this capital investment, not a side hustle.
blueprint: compose (Cover treatment, Reproduce)
focal: broadside-num "04" + display clause "it ain't cheap"
roles: broadside-num "04" = supporting chrome · display clause = foreground subject · lead line (GPU costs / subscriptions / glitch time) = supporting, 75% ink
sfx: none

Scene 1 (0.0–1.5s): fire-orange ground; broadside-num "04" + kicker "REASON" fade in.
Scene 2 (1.5–4.5s): as the VO says "it ain't cheap," display clause slams in via **kinetic beat-slam**.
Scene 3 (4.5–7.0s): as the VO enumerates "GPU costs… subscriptions… hours fixing glitches," the lead line reveals phrase-by-phrase via **per-word staggered reveal**, settles and holds.

## Frame 10 — Reason four: payoff

- scene: One blunt line, oversized, alone
- voiceover: "You're building a media startup, not playing a video game."
- duration: 3.584s
- transition_in: crossfade
- status: outline
- src: compositions/frames/10-reason-four-payoff.html
- type: social_proof
- persuasion: Distillation
- beat: conviction

narrativeRole: Crystallizes reason four's stakes.
keyMessage: Treat the cost and effort like a startup would, not like a game.
blueprint: compose (Pull Quote treatment, Reproduce)
focal: quote-text "you're building a media startup, not playing a video game"
roles: quote-mark = supporting chrome · quote-text = foreground subject
sfx: none

Scene 1 (0.0–0.6s): ink-black ground; fire-orange quote-mark drops in via **spring-pop entrance**.
Scene 2 (0.6–3.0s): quote-text assembles via **per-word staggered reveal**, "media startup" and "video game" as the two landing beats.
Scene 3 (3.0–3.5s): held read, subtle jitter only — fourth deliberate held beat.

## Frame 11 — The takeaway

- scene: All four numerals flash past in sequence, then vanish, leaving one line
- voiceover: "So stop treating this like a cheat code."
- duration: 2.368s
- transition_in: crossfade
- status: outline
- src: compositions/frames/11-takeaway.html
- type: branding
- persuasion: Callback (returns to Frame 1's "get rich quick" framing)
- beat: resolve

narrativeRole: Generalizes the four reasons into one governing principle.
keyMessage: The cheat-code mindset is the root cause of all four failure modes.
blueprint: compose (Statement treatment, Reproduce)
focal: display clause "stop the cheat code" (one clause fire-orange)
roles: display clause = foreground subject (dark register, cream + one orange clause) · four small numerals "01 02 03 04" = supporting chrome, flashing past then vanishing
sfx: none

Scene 1 (0.0–1.2s): ink-black ground; the four reason numerals ("01 02 03 04") flash past top-to-bottom via **hard-cut / flash word-swap** (`discrete-text-sequence`), each on-screen barely long enough to register — a callback to Frames 3/5/7/9.
Scene 2 (1.2–3.0s): as the VO says "stop treating this like a cheat code," the numerals vanish and the Statement display line builds via **kinetic beat-slam**, "cheat code" inked fire-orange, rest cream; settles and holds.

## Frame 12 — The close

- scene: The final line lands dead-center, full weight, and holds
- voiceover: "Start treating it like a business."
- duration: 1.877s
- transition_in: cut
- status: outline
- src: compositions/frames/12-cta.html
- type: cta
- persuasion: Distillation
- beat: inevitability + "now I get it"

narrativeRole: Closing call to action — reframe the entire endeavor.
keyMessage: Business mindset, not lottery-ticket mindset, is the actual takeaway.
blueprint: compose (Cover treatment, Reproduce)
focal: display word "business" (ink on fire-orange, near full-bleed)
roles: display word = foreground subject, sole element · mono kicker "START" = supporting chrome, above
sfx: soft-thud (on final landing)

Scene 1 (0.0–1.0s): fire-orange ground; mono kicker "START" fades in top-left via **per-word staggered reveal**.
Scene 2 (1.0–3.0s): as the VO lands "treating it like a business," the display word "business" slams in via **kinetic beat-slam**, ink-black, near full-bleed, centered per portrait canvas (y ≈ 0.42×height). This is the video's real exit — holds to black, no further motion, no back-half push.
