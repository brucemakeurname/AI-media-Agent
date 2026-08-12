# Scene-type → blueprint picking guidance

Guidance, not a rigid table — mirrors `hyperframes-animation/blueprints-index.md`'s own Role →
blueprint "Picking guidance" (Reproduce / Adapt / Compose), applied to `script.json`'s scene
`type` + each beat's `visualBrief` instead of the ad-genre role taxonomy.

## How to pick

**Owned by the video-editor role**, per its instructions in the production workflow doc
(`goal/[social]_[industry-news-html-summery].md`) — run once content-executive and designer
have finished authoring `script.json`'s beats (voiceText, visualBrief, imageIntent), before
`[html-video]-script-lock`'s `01-init.ts` validates and locks the script.

1. For each beat, read its parent scene's `type` (`hook` / `body` / `end`) and the beat's
   `visualBrief` (the real fact/stat/image subject it needs to show — never invent content not
   present there).
2. Browse `blueprints-index.md`'s general-purpose section by **tag**, matching the content shape
   below to candidate tags. Prefer blueprints whose `## Intent` line is closest to the beat's real
   content, not just a tag string match.
3. Choose a posture:
   - **Reproduce** — the blueprint's `[slots]` map cleanly onto `voiceText`/`visualBrief` content.
   - **Adapt** — the structure fits but content/surface differs (e.g. 2 facts instead of 3); keep
     the blueprint's signature move.
   - **Compose** — nothing in the index fits this beat's real content; build from
     `hyperframes-animation`'s motion vocabulary instead of forcing a wrong blueprint.
4. Record the chosen id into the beat's `blueprintId` field.
5. **If the scene has 2 beats** (the `hook` scene's hook+pull-up, or a CTA-less `end` scene's
   verdict+loop-back): after picking both beats' blueprints, pick a `transitionId` from
   `hyperframes-animation/transitions/TRANSITION-REGISTRY.md` to join them — match the transition's
   energy to the beat pair (e.g. a hard contradiction beat right after the hook line reads well
   with a sharp cut-style transition like `css-blur` or a glitch-cut; a softer verdict→loop-back
   pairing reads better with a slower cross-dissolve style). Record it as the scene's
   `transitionId`.

## Content shape → candidate tags

| Beat content shape                                       | Candidate tags to search                             |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| Hook line — headline reveal, "breaking" energy              | `broadcast, ticker, headline, news, hook`            |
| Pull-up line — antithesis/contradiction, retention tension  | `glitch, reveal, contrast, news, hook`               |
| Body: 2-3 related facts converging on one conclusion         | `evidence, investigation, editorial, news, reveal`   |
| Body: a single stat / number                                 | `data-viz, chart, stats, bars`                       |
| Body: before/after or two-option comparison                  | `comparison, split-screen, versus, before-after`     |
| Body: a sequence of events over time                          | `timeline, history, editorial, documentary`          |
| Body: a location or route fact                                | `map, route, location, geography`                    |
| Body: a real photo with a caption (article's own image)       | `photography, ken-burns, documentary, caption`       |
| Body: a direct quote / named source                            | `quote, attribution, editorial, portrait`            |
| Body: a document/screenshot detail worth zooming into           | `magnify, investigation, detail, document`           |
| Body: a chat/message exchange as evidence                       | `conversation, chat, message, evidence`              |
| End: verdict/wrap-up beat                                         | `outro, broadcast, news, editorial`                  |
| End: loop-back beat (echoes the hook) or CTA beat                  | `outro, broadcast, news, hook` (same family as hook) |

## Two already-converted blueprints worth knowing by name

- `evidence-board-assemble` (`text, image, reveal, investigation, editorial, evidence, news`,
  3.5s) — photos pin to corkboard, red string connects them. Strong fit for a body beat
  converging 2-3 related facts.
- `broadcast-ticker-open` (`text, broadcast, ticker, headline, news, hook, outro`, 7s) — red
  banner slams up, scrolling ticker, headline slides in, LIVE badge pulses. Strong fit for the
  hook beat, or (trimmed) the end scene's verdict/CTA beat.

## Constraints carried over from the general blueprint-picking guidance

- Never force a wrong blueprint because its tags loosely matched — a Compose-from-vocabulary beat
  that actually fits the content beats a Reproduce that doesn't.
- Pace reveals to the beat's own `voiceText` duration (from the TTS'd mp3, not a guess) — a
  blueprint's stated duration is a starting point, not a fixed constraint; see
  `hyperframes-animation`'s own note on recomputing a segment's actual available window before
  trusting a source template's stated tween duration (a real defect class found repeatedly during
  the 121-template blueprint conversion project).
- Bind `frame.md`/brand tokens on top of the chosen blueprint — never leave its own
  verification-render palette in a real ticket's output.

## See also

`../SKILL.md` ([html-video]-script-lock) ·
`../../../../video_modules/hyperframes/skills/hyperframes-animation/blueprints-index.md` (the
full tag-indexed library) ·
`../../../../video_modules/hyperframes/skills/hyperframes-animation/transitions/TRANSITION-REGISTRY.md`
(transition picking for 2-beat scenes) ·
`../../../../video_modules/hyperframes/skills/hyperframes-creative/SKILL.md` (token binding).
