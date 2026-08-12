# GOAL — Build the Video Preset Library (Codex engineering loop)

**You are a Codex agent running in a loop.** Your mission is to build every video preset bundle in
this folder so the `news-summery-editing` render engine can render a 9:16 news video in any of the
13 house presets. Work is **one preset per iteration — never batch.**

## Read these first (every iteration, before doing anything)

1. **`PROGRESS.md`** (this folder) — the single source of truth for what is done and what is next.
   ALWAYS read it first. If your context was compacted/reset, `PROGRESS.md` tells you exactly where
   to resume. Trust it over memory.
2. **Design spec:** `INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/news-summery-editing/docs/specs/2026-08-04-video-preset-library-design.md`
3. **Engine plan:** `…/news-summery-editing/docs/plans/2026-08-04-video-preset-library.md`
4. **View-model contract:** `…/news-summery-editing/docs/specs/view-model-contract.md` (the frozen
   fields each `.hbs` template may bind — do not invent fields).
5. **Reference bundle:** `3. HTML_Video_Preset/bold-poster/` — copy its shape for every preset.
6. Each preset's design source: `2. HTML_Creative_Prompt_Template/<preset>/FRAME.md` (colours +
   typography already exist there).

## The loop protocol (do EXACTLY this each iteration)

1. Open `PROGRESS.md`. Find the **first unchecked item** (top to bottom).
2. Do **only that one item** — one engine task, or one full preset. Do not start a second.
3. When finished and verified, **tick its checkbox in `PROGRESS.md`**, add a one-line note + date,
   then `git commit` (include `PROGRESS.md` in the commit).
4. Stop the iteration. The loop restarts and re-reads `PROGRESS.md`.

If a step fails or is blocked: leave the box unchecked, add a `⚠ BLOCKED:` note under it in
`PROGRESS.md` describing the blocker, commit that note, and stop.

## Phase 0 — Engine (do before any non-bold-poster preset)

Follow the engine plan (`…/docs/plans/2026-08-04-video-preset-library.md`) task by task (Tasks 1–11).
This makes the engine template-driven and produces the `bold-poster` reference bundle. Do NOT author
other presets until Phase 0 is fully checked and the bold-poster 18-scene regression render matches
its approved baseline.

## Phase 1 — Author one preset per iteration

For the preset named by the next unchecked row in `PROGRESS.md`:

1. Read `2. HTML_Creative_Prompt_Template/<preset>/FRAME.md`.
2. `cp -r bold-poster/ <preset>/` as the skeleton, then rewrite:
   - **`style.css`** — the preset's palette + typography from FRAME.md. **All font-size go through
     `calc(<base> * var(--v-text-scale))`** (text runs +30%; see spec §13). Scope every rule
     `#stage[data-preset="<preset>"] …`.
   - **`templates/*.hbs`** — the preset's composition for each supported scene-type. Bind ONLY
     view-model contract fields. Image-capable scene-types (`hook, callout, photo-kenburns, collage,
     evidence-board, magnifier, vignelli-stat, data-flow, timeline`) must include the optional image
     slot `{{#if imageUrl}}…{{/if}}` (spec §14).
   - **`animation.js`** — `window.SFV_ANIMATORS = { <type>: (scene,tl,start,dur)=>… }` targeting this
     preset's own classes.
   - **`scene-map.json`** — list only scene-types this preset supports. Drop image-heavy/fabricated
     layouts if the preset's FRAME.md forbids invented imagery.
   - **`GUIDELINE.md`** — FRAME.md tokens + re-skin notes.
3. Render the shared sample script for this preset:
   `cd …/news-summery-editing && npm run pipeline -- output/preset-sample-<preset>/script.json`
   (copy `output/bold-poster-18scene-2026-08-04/script.json`, set `metadata.preset` +
   `metadata.brand`). If TTS is slow/kill-prone, reuse the salvaged voice mp3s or run rerender.
4. Build a contact sheet and **eyeball it** (aesthetic QA is human/agent judgement, not a unit test):
   `ffmpeg -y -i output/preset-sample-<preset>/video.mp4 -vf "fps=1/3.95,scale=228:405,tile=5x4" -frames:v 1 <preset>/sample.png`
   Fix any off-palette / clipped / broken-animation layout before ticking done.
5. Update `2. HTML_Creative_Prompt_Template/PRESET-SCENE-MAP.md` to mark this preset wired.
6. Tick the preset in `PROGRESS.md` (+ note + date), commit, stop.

## Hard rules

- **One preset per iteration. Never batch.** (Keeps each commit reviewable and compaction-safe.)
- **Never invent view-model fields** — bind only what the contract exposes; if a layout needs a new
  computed value, that is an engine change (add it in the module + contract doc first), not a
  template hack.
- **`--v-text-scale`** must drive every font size (spec §13).
- **Image slots optional** — render only when `imageUrl` present; generation is the `designer` role's
  job, not this loop's.
- Follow the module's CLAUDE.md rules (English-only infra, Fail-Loud, surgical changes).
- Commit after every ticked item; always include `PROGRESS.md`.

## Definition of done (whole library)

All 13 presets ticked in `PROGRESS.md`, each with a committed bundle + `sample.png`, `PRESET-SCENE-MAP.md`
updated, and the engine plan fully checked.

## Graph

[[INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/news-summery-editing/docs/specs/2026-08-04-video-preset-library-design|Design Spec]] ·
[[INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/news-summery-editing/docs/plans/2026-08-04-video-preset-library|Engine Plan]] ·
[[BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/PRESET-SCENE-MAP|Preset Scene Map]]
