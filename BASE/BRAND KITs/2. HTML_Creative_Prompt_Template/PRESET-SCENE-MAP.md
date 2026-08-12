# Preset â†’ News-Video Scene-Type Map

Used by `VIDEO_MODULES/news-summery-editing` (render engine for `[social]_[industry-news-html-summery]`).
Each preset declares which of the module's scene-types it can render with a **real** Frame Treatment
from its own `FRAME.md` â€” never an invented layout. A scene-type not listed here for a preset is
**not renderable** with that preset; `html-composer.ts` throws a Fail-Loud error naming the gap rather
than silently falling back.

Status: `bold-poster`, `biennale-yellow`, `blockframe`, `blue-professional`, `broadside`, `capsule`, `cartesian`, `claude`, `cobalt-grid`, `coral`, `creative-mode`, `daisy-days`, and `editorial-forest` are wired through the generic bundle renderer. Each supports **15**
scene-types â€” 6 native Frame Treatments (purpose-built `bp-*` markup) plus 9 borrowed layouts kept
through `BASE/BRAND KITs/3. HTML_Video_Preset/bold-poster/` (`scene-map.json`, Handlebars templates, scoped CSS, and animator dispatch). All 13 presets are wired through the same bundle contract.

## bold-poster Â· 6 native Frame Treatments

| Scene-type (`templateData.template`) | Frame Treatment | Why |
|---|---|---|
| `hook` | Hero Stack | 3-line tilted Shrikhand opener â€” matches hook's job (headline + subhead + emphasis word) |
| `vignelli-stat` | Hero Stat | Full-red panel, single poster numeral â€” matches vignelli-stat's `stat`/`label`/`sub` fields |
| `data-flow` | Financial Grid | Double-border cell grid â€” matches data-flow's `points[]` (label+value pairs) |
| `callout` | Pull Quote | Red panel, 2-line Shrikhand quote â€” matches callout's `statement`/`tag` |
| `timeline` | Editorial Cards | Red-leftbar cards â€” matches timeline's `events[]` (year+label), one card per event |
| `outro` | Closing Statement | Tilted close-big sign-off â€” matches outro's `ctaTop`/`channelName`/`source` |

## bold-poster Â· 9 re-skinned animated layouts

These are the module's original upstream layouts (dark-theme) recolored to bold-poster. They keep
their real GSAP motion â€” the reason to use them is animation variety a static Frame Treatment can't give.
Only text/data layouts qualify; layouts that imply fabricated photography (`collage`, `photo-kenburns`,
`evidence-board`) are **excluded** per bold-poster's `FRAME.md` no-invented-imagery rule.

| Scene-type | Motion it adds |
|---|---|
| `nyt-chart` | Red bars grow from baseline + optional line overlay draws in (serif headline clip-reveal) |
| `before-after` | Red vs. white split panels slide in, divider line draws, metric pill pops |
| `elastic-reveal` | Shrikhand headline + red stat chips spring in with elastic ease |
| `swiss-reveal` | Red rule wipes out, Shrikhand title rises line-by-line |
| `decision-tree` | Connectors draw, red root â†’ dark branches â†’ white leaf nodes scale in |
| `conversation` | Chat bubbles pop in sequence with a typing indicator (red = key line) |
| `highlighter` | White card drops in, red highlighter sweep animates across key lines |
| `stagger-demo` | Dark/red alternating bars grow in staggered sequence |
| `magnifier` | Red lens glides across the ground revealing a zoomed detail |

Still **not mapped** for bold-poster (fabricated-imagery or non-fit): `collage`, `evidence-board`,
`photo-kenburns`, `route-map`, `countdown`, `path-follow`, `product-canvas`.
A script using bold-poster must only use the 15 scene-types above (plus the 3 capture templates,
which are preset-agnostic â€” see below).

## biennale-yellow · 15 catalogue-frame treatments

`biennale-yellow` implements the 15 text/data layouts as a restrained art-biennale catalogue:
parchment ground, indigo type/hairlines, one solar-yellow bloom or panel, and a pagenum. Its optional
image bands are only rendered when the normalized `imageUrl` is present.

| Scene-types | Frame treatment family |
|---|---|
| `hook`, `swiss-reveal`, `magnifier` | Cover / editorial title with bloom and measured display serif |
| `vignelli-stat`, `elastic-reveal` | Chapter-divider numeral and manifesto statistic |
| `data-flow`, `timeline`, `nyt-chart`, `stagger-demo` | Ledger / strand-row information treatment with 1px rules |
| `callout`, `highlighter`, `conversation` | Manifesto, highlighted note, and literary dialogue |
| `before-after`, `decision-tree`, `outro` | Yellow panel split, quiet decision grid, and catalogue colophon |

A script using biennale-yellow may use these 15 design scene-types plus the three preset-agnostic
capture templates. Image-heavy fabricated layouts (`collage`, `evidence-board`, `photo-kenburns`) and
non-catalogue motion layouts remain unmapped.

## blockframe · 15 neobrutalist frame treatments

`blockframe` supports the same 15 design scene-types through black-bordered, hard-shadowed pastel
frames. It cycles cream, blue, pink, green, and yellow grounds; the closer uses the required black
plate with yellow offset shadow. Its image slots remain optional on the supported image-capable types.

## Preset-agnostic scene-types (all presets)

## broadside · 15 protest-poster treatments

## capsule · 15 candy-pill editorial treatments

## cartesian · 15 warm-stone catalogue treatments

## claude · 15 warm-editorial treatments

## cobalt-grid · 15 risograph report treatments

## coral · 15 magazine-poster treatments

## creative-mode · 15 neo-brutalist editorial treatments

## daisy-days · 15 pastel sticker treatments

## editorial-forest · 15 literary annual-report treatments

`editorial-forest` supports the shared 15 design scene-types with flat forest-green, dusty-rose,
and oat-paper surfaces; Source Serif/mono hierarchy; and restrained 2px editorial rules.

`daisy-days` supports the shared 15 design scene-types with cream/pastel grounds, rounded outlined
sticker cards, Fredoka/Quicksand hierarchy, and hard charcoal offsets.

`creative-mode` supports the shared 15 design scene-types with cream paper, square heavy ink borders,
Archivo Black display, and restrained green/pink/orange/yellow flat-block collisions.

`coral` supports the shared 15 design scene-types with flat coral, ink, and warm-cream regions,
diagonal hatch texture, and uppercase Bebas display hierarchy. Conditional article-image slots remain intact.

`cobalt-grid` supports the shared 15 design scene-types with a permanent cream/cobalt graph-paper
ground, electric-cobalt type and hairlines, and no secondary colour. Conditional article-image slots remain intact.

`claude` supports the shared 15 design scene-types with cream/tile editorial surfaces, EB Garamond
display, mono spike kickers, soft hairline elevation, and one terracotta voltage accent per frame.

`cartesian` supports the shared 15 design scene-types with warm stone paper, Playfair Display and
Inter hierarchy, taupe hairlines, and restrained compass-ring atmosphere. Conditional article-image
slots remain intact.

`capsule` supports the shared 15 design scene-types through a cream, candy-accented pill system.
Outlined 9999px and 2rem content pills, restrained hard-offset shadows, and Bodoni/Space Grotesk
hierarchy replace the poster frame while retaining conditional article-image slots.

`broadside` supports the shared 15 design scene-types with a strict two-register system: ink-black
documentation frames and fire-orange declaration frames. Barlow lowercase display type is the single
dominant graphic element, with IBM Plex Mono chrome and flat 1px structural rules. Image-capable
templates retain conditional article-image slots only.

## blue-professional · 15 executive information treatments

`blue-professional` supports the shared 15 design scene-types in a warm-cream, cobalt, and near-black
consulting system. Rounded cobalt-tint cards carry comparative data and decisions; cover, divider, and
closing scenes reserve the cobalt panel and quiet ring geometry. Optional image-capable templates retain
their conditional article-image slots.

`website-demo`, `website-walkthrough`, `video-clip` are screen/video **capture** features, not
design layouts â€” no preset owns them. They keep their existing fixed CSS treatment regardless of
`metadata.preset`.

## Graph

[[BASE/BRAND KITs/2. HTML_Creative_Prompt_Template/HTML-CREATIVE-TEMPLATE-STRUCTURE|Template Library Structure]] Â· [[INHOUSE TEAMS/2. Production/Social Media/VIDEO_MODULES/news-summery-editing/AGENTS|news-summery-editing AGENTS]]
