# Image Sourcing Guide — real photos inside HTML-composed slides

Every preset in this library is typography/decoration-first — no preset's component set assumes a
photo by default. This guide covers the one case that needs one: **when a slide's content is a real
product, event, or news item** and a stock/AI-generated visual would be less credible (or actively
wrong) than the real thing.

**Verified end-to-end 2026-08-03** — crawled a real Dân Trí article, downloaded its hero photo, and
composed it into a `blockframe` slide with source attribution. Mechanism below is that exact,
working pipeline, not a theoretical plan.

## When to insert a real photo

**Insert one when:**
- The ticket's format is `industry-news` (or equivalent) — reporting on a real, dated event.
- A Frame Treatment has an explicit photo/image slot (`card-elevated` holding a product shot,
  `image-placeholder`, a "Feature Cards" icon region sized for a real photo instead of an icon).
- The content makes a factual claim about something real (a real product launch, a real company
  figure) where a generated image would misrepresent it.

**Do NOT insert one when:**
- The slide is declarative/typography-only per its own preset's density guidance (Cover, Manifesto/
  Quote, Colophon/Closing, Chapter Opener) — these are explicitly meant to run **sparse**, and a
  photo dropped in just to fill space defeats the point (and the vertical-fill rule is solved with
  the preset's own decoration/chrome components instead — see `HTML-CREATIVE-TEMPLATE-STRUCTURE.md`).
- The content is generic/evergreen (a stat, a process explainer, a brand statement) with no real
  external subject to depict — use the preset's own typographic/data components instead.
- No real, attributable source is available — never substitute a stock photo passed off as "real."

## How to crawl (verified pattern)

1. **Find the real article.** Fetch the outlet's homepage or category page via `curl` with a
   browser User-Agent (bare `curl` without one gets blocked by most VN news CDNs):
   ```bash
   curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
     "https://{outlet}/" -o home.html
   ```
2. **Extract the real article URL + headline**, not just a thumbnail — grep/parse for the article's
   own `<h1>`/headline and its canonical `.htm`/`.html` URL. Verified pattern (Dân Trí): thumbnail
   `<img>` tags on the homepage point at small cropped `zoom/WxH/...` CDN paths — do not use those as
   the final asset; follow the article link instead.
3. **Fetch the article page itself** and extract the **full-size hero image URL** (not the homepage
   thumbnail crop) — article pages typically expose an OG-image-scale or gallery-scale version
   (e.g. `zoom/1200_630/...` or an un-cropped `/2026/...` path) distinct from the homepage's small
   thumbnail crop.
4. **Download with a referer header** — verified required (Dân Trí's CDN 403s without it):
   ```bash
   curl -s -A "Mozilla/5.0 ..." -e "https://{outlet}/" "{full-size-image-url}" -o assets/hero.jpg
   ```
5. Save into the ticket's project folder (`node/images/` or a project-local `assets/`), never
   outside the campaign folder.

## How to place it in a slide

- Wrap it in the preset's own **card component** (BlockFrame: `card-elevated`, 4px border + 8px hard
  shadow; Blue Professional: a tinted card, no shadow; Cobalt Grid: flat, no card at all — match
  whichever preset is in use, don't invent a new photo-frame style).
- `object-fit: cover` on a fixed-height container — **never** stretch/distort to fill an arbitrary box.
- A slight tilt (if the preset's own decoration language uses tilt, e.g. BlockFrame) is fine; don't
  add effects the preset doesn't otherwise use.
- **Always caption the source directly under or beside the image**, small mono/chrome text in the
  preset's own label style: `Ảnh & nguồn: {Outlet} — {domain}`. Never crop out or omit this.
- If the slide states a fact from the article (a price, a date, a figure), quote it **verbatim from
  the source** — never round, embellish, or infer a number the article doesn't state (same rule as
  the `img-carousel`/`industry-news` "ground the facts" convention).

## IP / attribution rule (same spirit as the ad-library crawler skills)

- **Editorial/citation use only** — reporting on or referencing real published news with visible
  attribution. Never strip the credit line, never imply the photo is original work, never reuse it
  for an unrelated commercial claim the source article doesn't support.
- **One photo per slide, sourced from one real article** — don't composite multiple outlets' photos
  into a single fabricated "story."
- If a ticket needs the photo for anything beyond a single social slide (e.g. a paid ad, a
  redistributed asset), escalate — this guide covers editorial citation only, not a general license.

## Do / Don't

- DO follow the article link to the full-size hero image — never ship the homepage's small cropped
  thumbnail as a slide's hero visual.
- DO send both a browser User-Agent and a `referer` header — most VN news CDNs 403 without one or
  both (verified on Dân Trí).
- DO caption the source visibly, every time, no exceptions.
- DON'T insert a photo into a declarative/sparse Frame Treatment just to solve vertical-fill — use
  the preset's own decoration components instead (see `HTML-CREATIVE-TEMPLATE-STRUCTURE.md`).
- DON'T fabricate or round a fact pulled from the source article.
- DON'T crawl in parallel/batch for this use case — one photo, one slide, one verified source, same
  "one at a time" discipline as `crawl_describe_TiktokAds_Template`/`crawl_describe_MetaAds_Template`.

## Graph

**Parent:** [[HTML-CREATIVE-TEMPLATE-STRUCTURE|Structure]]
**Related pattern:** `INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_describe_TiktokAds_Template/SKILL.md` · `.../crawl_describe_MetaAds_Template/SKILL.md`
**Consumer:** `html-creative-direction` skill
