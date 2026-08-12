# PROGRESS â€” Video Preset Library

**Single source of truth for the Codex loop. Read this first every iteration (see `GOAL.md`).**
Work top-to-bottom. Do ONE unchecked item per iteration, tick it, note + date, commit.

Legend: `[ ]` not started Â· `[~]` in progress Â· `[x]` done Â· `âš  BLOCKED:` needs attention

Last updated: 2026-08-04 (created)

---

## Phase 0 â€” Engine refactor (must finish before Phase 1)

Follow `â€¦/news-summery-editing/docs/plans/2026-08-04-video-preset-library.md`.

- [x] Task 1 â€” handlebars dep + `videoPresetDir` config
- [x] Task 2 â€” preset bundle loader + scene-map validation
- [x] Task 3 â€” view-model builders (all 25 scene-types) + contract doc
- [x] Task 4 â€” Handlebars scene renderer in `html-composer.ts`
- [x] Task 5 â€” base animation runtime + `SFV_ANIMATORS` dispatch
- [x] Task 6 â€” engine-owned capture templates
- [x] Task 7 â€” author the `bold-poster` bundle (reference)
- [x] Task 8 â€” wire pipeline + rerender to the bundle
- [x] Task 9 â€” remove in-module bold-poster + 18-scene regression render matches baseline
- [x] Task 10 â€” `--v-text-scale` token, bold-poster text +30%
- [x] Task 11 â€” optional illustrative image slot on image-capable scenes (engine + bold-poster templates)

**Phase 0 gate:** all boxes above ticked AND `output/bold-poster-18scene-2026-08-04` re-renders to
match the approved baseline (15 layouts, Solo Flows shell+logo, text +30%, image slots optional).

---

## Phase 1 â€” Preset bundles (one per iteration)

`bold-poster` is produced by Phase 0 (Task 7) and is the reference â€” already counted done below.
For each other preset: build bundle â†’ render sample â†’ eyeball â†’ update `PRESET-SCENE-MAP.md` â†’ tick.

- [x] **bold-poster** â€” reference bundle (done in Phase 0 Task 7)
- [x] **biennale-yellow**
- [x] **blockframe**
- [x] **blue-professional**
- [x] **broadside**
- [x] **capsule**
- [x] **cartesian**
- [x] **claude**
- [x] **cobalt-grid**
- [x] **coral**
- [x] **creative-mode**
- [x] **daisy-days**
- [x] **editorial-forest**

### Per-preset sub-checklist (copy under a preset when you start it)

```
- [~] <preset>  (started YYYY-MM-DD)
  - [x] read 1a/<preset>/FRAME.md
  - [x] style.css (palette+type from FRAME.md; all font-size via calc(*var(--v-text-scale)))
  - [x] templates/*.hbs (bind contract fields only; image slot on image-capable types)
  - [x] animation.js (SFV_ANIMATORS, preset classes)
  - [x] scene-map.json (supported scene-types)
  - [x] GUIDELINE.md
  - [x] render sample + contact sheet, eyeball OK (no off-palette/clip/broken anim)
  - [x] sample.png saved
  - [x] PRESET-SCENE-MAP.md updated
  - [x] committed (incl. PROGRESS.md)
```

---

## Notes / blockers log

- 2026-08-04 â€” Task 1 complete: added Handlebars and configurable shared preset-library path; config test + typecheck pass.
- 2026-08-04 â€” Task 2 complete: added Fail-Loud bundle loader, map/template validation, and capture-scene allowance; tests + typecheck pass.
- 2026-08-04 â€” Task 3 complete: added pure view-model builders and frozen 25-scene contract; all builder tests + typecheck pass.
- 2026-08-04 â€” Task 4 complete: design layouts render through bundle Handlebars templates + view-models; composer test + typecheck pass.
- 2026-08-04 â€” Task 5 complete: added engine base timeline with per-preset animator dispatch; full tests + typecheck pass.
- 2026-08-04 â€” Task 6 complete: moved canonical capture markup outside preset bundles; full tests + typecheck pass.
- 2026-08-04 â€” Task 7 complete: authored the 15-template bold-poster reference bundle; loader + Handlebars compilation + typecheck pass.
- 2026-08-04 â€” Task 8 complete: pipeline and rerender resolve bundles and emit bundle CSS; full tests + typecheck pass.
- 2026-08-04 â€” Library scaffolded; spec + engine plan + GOAL written. Phase 0 not started yet.
- 2026-08-04 — Task 9 complete: removed legacy bold-poster render/CSS ownership; verified the generic bundle path with an 18-scene rerender and contact sheet.
- 2026-08-04 — Task 10 complete: stage root now supplies --v-text-scale: 1.3; bold-poster text verified at the scaled size with the 18-scene rerender.
- 2026-08-04 — Task 11 complete: image-capable view models expose normalized imageUrl; real article image pools feed optional bold-poster image slots.
- 2026-08-04 — biennale-yellow complete: 15-frame parchment/indigo/yellow catalogue bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — blockframe complete: 15-layout neobrutalist pastel bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — blue-professional complete: 15-layout cobalt/cream executive bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — broadside complete: 15-layout ink/fire-orange protest-poster bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — capsule complete: 15-layout cream/candy pill editorial bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — cartesian complete: 15-layout warm-stone catalogue bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — claude complete: 15-layout warm-editorial cream/coral bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — cobalt-grid complete: 15-layout cream/cobalt risograph grid bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — coral complete: 15-layout coral/ink/cream magazine-poster bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — creative-mode complete: 15-layout neo-brutalist cream/accent bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — daisy-days complete: 15-layout pastel sticker bundle rendered and visually approved from the shared 18-scene sample.
- 2026-08-04 — editorial-forest complete: 15-layout green/pink/cream literary editorial bundle rendered and visually approved from the shared 18-scene sample.
