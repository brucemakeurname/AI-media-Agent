# broll-selection-rules — Phase 2 B-roll Logic

> Rules governing which sentences get B-roll visualization, which template each B-roll uses, and how each B-roll is rendered.

---

## Goal

Cover 35–50% of total runtime with B-roll. Target **8–10 B-roll slots** for a 60–90s video. Quality over quantity — never force a slot on content that has no visualizable anchor.

---

## 5-Pass Selection Algorithm

### Pass 1 — Group Sentences

Group `cut_plan.json` segments into sentences. Boundary = `.`/`!`/`?` in `text` OR gap ≥ 0.45s between segments. Label `S0, S1, S2, …`.

### Pass 2 — Visualizability Gate (Hard Gate)

Evaluated FIRST. A sentence passes if it has at least ONE of:
- Concrete noun or brand that can be rendered (GPU, Midjourney logo, screensaver)
- A stat or specific number (99%, 3.2M, $2,840)
- A clear contrast with two renderable sides
- A strong emotion or metaphor pairing with abstract motion

A sentence FAILS if it is:
- Pure section framing ("Number one,")
- A conditional setup with no visual anchor ("So, if you're going to do it,")
- An orphaned clause whose meaning depends on adjacent speech

**Sentences failing visualizability are excluded regardless of score.**

### Pass 2b — Algorithmic Score (only for visualizability-passing sentences)

| Feature | Score |
|---|---|
| Duration ≥ 3.5s | +3 |
| Duration 2.5–3.5s | +1 |
| Stat / specific number | +2 |
| Named entity (Midjourney, NVIDIA, etc.) | +2 |
| Descriptive noun (avatar, GPU, screensaver, media) | +2 |
| Comparison / contrast ("like a", "not a", "but you") | +1 |
| Metaphor (brush/artist, cheat code, weapon) | +1 |
| Section header | −3 |
| Short punchy emotional fragment (< 1.5s) | −2 |

**Threshold: score ≥ 4 to be eligible.**

### Pass 3 — Select Slots

After 4–5s of A-roll without a B-roll, the next eligible sentence (passes BOTH visualizability and score) opens a slot.

**Duration adaptation:**
- Winning sentence > 6s: truncate template to scene-01 only, set `hyperframes.json` duration to slot.
- Winning sentence < 3s: merge with next sentence if combined ≤ 6s AND coherent.
- **Never end mid-sentence.** Sentence integrity overrides duration.

### Pass 4 — Template Matching

Read the Motion Template MOC, assign one template per slot, **maximize variety** (no template used twice if possible). Use the content-signal → template-category mapping:

| Content Signal | Template Category | Render Method |
|---|---|---|
| Stat / percentage | Hero Stat Reveal | CSS/GSAP |
| Market flooding / avatars / cities | Isometric City Build | **Three.js** |
| Human vs AI / X vs Y contrast | Split Screen Comparison | CSS/GSAP |
| Soul / philosophical / abstract | Abstract Color Field | CSS/GSAP |
| Named AI tools + logos | Dynamic Product Visualization | CSS/GSAP |
| Personal taste / eye / aesthetics | Abstract Geometric Transformation | **Three.js** |
| GPU costs / subscriptions / technical | Technical Blueprint Reveal | CSS/GSAP |
| Media startup / dashboard | Soft UI Dashboard | CSS/GSAP |
| Cinematic CTA / "STOP." | Cinematic Title Card | CSS/GSAP |
| Abstract orbit / momentum | Orbiting Torus Rings | **Three.js** |

### Pass 5 — Visual Asset Protocol

For every slot with a brand/product entity:
1. WebSearch the entity name + " logo svg"
2. WebFetch the first viable SVG (or raster fallback)
3. Save to `broll_renders/br_{N}_comp/assets/logos/{brand-slug}.svg`
4. Adjust fill/stroke for the composition background color

---

## Three.js Integration Pattern

Use Three.js for: Isometric City, Abstract Geometric Transformation, Orbiting Rings, or any 3D-native category.

**Hard rules:**
- No `requestAnimationFrame` / `setInterval` — GSAP timeline IS the render loop
- `renderer.setPixelRatio(1)` — ensures frame-exact pixel output in headless renderer
- Deterministic positions only — no `Math.random()`. Use `Math.sin(i * constant)` seeding or explicit arrays
- For Three.js objects: set `scale.y = 0` (or similar) BEFORE timeline, GSAP animates to 1
- Long rotations: use large target angles (`Math.PI * 4`) instead of `repeat: -1` for deterministic seeks
- Camera orbit: animate `{ angle: val }` object, recompute `camera.position.x/z` in `onUpdate` before render
- Render initial frame BEFORE `tl.play()` — first frame must not be black

**Canvas + GSAP setup:**
```js
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1080, 1920);
renderer.setPixelRatio(1);
renderer.setClearColor(0x1C1C1E);
document.getElementById('canvas-wrap').appendChild(renderer.domElement);

var tl = gsap.timeline({
  paused: true,
  onUpdate: function () { renderer.render(scene, camera); }
});
window.__timelines = window.__timelines || {};
window.__timelines['{composition-id}'] = tl;
renderer.render(scene, camera);  // initial frame
```

**Group-pivot rise pattern (for buildings, columns, etc.):**
```js
var group = new THREE.Group();
group.position.set(x, 0, z);            // pivot at ground level
var geo = new THREE.BoxGeometry(w, h, d);
geo.translate(0, h / 2, 0);             // mesh top half, base at y=0
group.add(new THREE.Mesh(geo, mat));
group.scale.y = 0;                      // start flat
scene.add(group);
tl.to(group.scale, { y: 1, duration: 0.46, ease: 'back.out(1.3)' }, delay);
```

**Camera presets:**
| Use case | Camera | Position | LookAt |
|---|---|---|---|
| Isometric city | Orthographic fH=560 fW=315 | (560, 560, 560) | (0, 80, 0) |
| 3D geometry | Perspective fov=58 | (0, 0, 520) | (0, 0, 0) |
| Orbiting rings | Perspective fov=55 | (0, 0, 620) | (0, 0, 0) |

---

## Render Procedure (per slot)

1. Create `broll_renders/br_{N}_comp/` — full HyperFrames project (copy `package.json`, `hyperframes.json` from a template).
2. Write `index.html` following chosen template spec, with `data-composition-id="broll-{N}"` and `data-duration="{slot_duration}"`.
3. Run `npm run check` — 0 errors required.
4. Render: `cd broll_renders/br_{N}_comp && npm run render`
5. Output: `broll_renders/br_{N}.mp4` (1080×1920, 30fps, H.264, AAC).
6. Verify with `ffprobe`: duration within ±0.5s of `slot_duration`. If outside → mark `render_verified: false`.

---

## broll_timestamp.json Schema

```json
{
  "project": "{project_id}",
  "total_brolls": 0,
  "brolls": [
    {
      "id": "br_00",
      "start": 0.0,
      "end": 0.0,
      "slot_duration": 0.0,
      "render_duration": 0.0,
      "segments_covered": [0, 1, 2],
      "sentence_text": "...",
      "template_channel": "...",
      "template_name": "...",
      "template_category": "stat-reveal",
      "adaptation": "extended — template 4s → slot 5.2s",
      "logos_used": null,
      "screen_capture_url": null,
      "composition_dir": "broll_renders/br_00_comp",
      "render": "broll_renders/br_00.mp4",
      "render_verified": true
    }
  ]
}
```

**Field meanings:**
- `slot_duration` = source coverage (`end − start` in cut_plan time)
- `render_duration` = ffprobe-verified MP4 length
- `render_verified` = true ONLY after ffprobe confirms H.264 + duration within ±0.5s of `slot_duration`

---

## SFX Assignment (Phase 2 Step 2)

After all B-rolls are rendered, `sfx-artist` reads `broll_timestamp.json` + each `index.html` to map motion energy → SFX.

**Per B-roll:**
- Entry SFX at `start` offset (always)
- Optional accent SFX at peak motion moment

**SFX volume rules:**
- B-roll entry: `transition/swoosh.mp3` at 0.35–0.40
- Particle/build entry: `emphasis/tick.mp3` at 0.30
- Logo card / list entry: `transition/pop.mp3` at 0.30

**Output:** `broll_renders/broll_sfx_timestamp.json` with per-broll SFX array `{file, offset_sec, volume, reason}`.

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Media Team/5. Video Hub/talking-head-editing/WORKFLOW-template|WORKFLOW-template]]
**Sibling rules:** [[aroll-overlay-rules|aroll-overlay-rules]] · [[assembly-rules|assembly-rules]]
**Reference:** Motion Template MOC at `motion-researcher/output/Motion Video Template/MOC.md`
