---
name: html-carousel-design-system
description: Design token reference and component catalog for the SoloFlows 1:1 HTML carousel system. Read this before coding any carousel slide.
type: reference
---

# SoloFlows HTML Carousel — Design System

## Canvas

| Property | Value |
|---|---|
| Width × Height | 1080 × 1080 px |
| Aspect ratio | 1:1 |
| Output format | JPEG, quality 95 |
| Viewport (Playwright) | `{ width: 1080, height: 1080 }` |

```css
html, body {
  width: 1080px; height: 1080px;
  overflow: hidden; background: #FFFFFF;
}
.slide {
  width: 1080px; height: 1080px;
  position: relative; overflow: hidden;
  background-color: #FFFFFF;
  background-image:
    linear-gradient(rgba(0,0,59,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,59,0.035) 1px, transparent 1px);
  background-size: 36px 36px;
  padding: 60px 72px 0 72px;
  font-family: 'Inter', sans-serif; color: #00003B;
}
```

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--blue` | `#2472F8` | Primary accent, links, active indicators |
| `--neon` | `#FFBB00` | Italic em on dark backgrounds only |
| `--dark` | `#00003B` | Dark banners, dark cards |
| `--bg` | `#FFFFFF` | Slide background |
| `--ink` | `#111` | Body text, headlines |
| `--muted` | `#555` | Secondary body text |
| `--faint` | `#888` | Labels, captions, metadata |
| `--border` | `rgba(0,0,0,0.1)` | Dividers |
| `--card-bg` | `rgba(0,0,0,0.045)` | Light card backgrounds |

---

## Typography

Google Fonts CDN link (required in every slide `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Headline XL (cover) | Inter | 72–76px | 900 | letter-spacing -.025em, lh 1.05 |
| Headline L (content) | Inter | 84–88px | 900 | letter-spacing -.03em, lh 1.04 |
| Headline emphasis | Inter italic | same as parent | 400 | color #2472F8 |
| Watermark | Inter | 340px | 900 | color rgba(36,114,248,0.055), lh .85 |
| Blockquote lead | Inter | 21px | 700 | line-height 1.45 |
| Blockquote body | Inter | 19px | 400 | color #555, line-height 1.65 |
| Bullet list | Inter | 20px | 400 | color #333, line-height 1.5 |
| Quote card body | Inter | 18px | 400 | color #444, line-height 1.6 |
| Quote card title | Inter | 19px | 800 | color #111 |
| Series label | Inter | 16px | 700 | uppercase, letter-spacing .16em |
| Tag badge | Inter | 15px | 800 | uppercase, letter-spacing .1em |
| Stat number | Inter | 72px | 900 | color #2472F8 |
| Stat label | Inter | 17px | 400 | color #777 |
| Meta number | Inter | 60px | 900 | color #00003B |
| Meta label | Inter | 16px | 400 | color #888 |
| Handle | Inter | 18px | 600 | color #555 |
| Slide count | Inter | 20px | 500 | color #aaa |
| Dark banner body | Inter | 21px | 400 | color #eee, lh 1.6 |
| Dark banner em | Inter italic | same as parent | 400 | color #FFBB00 |
| CTA handle | Inter | 64px | 900 | color #2472F8 |
| CTA sub | Inter | 22px | 400 | color #555, lh 1.65 |

---

## Decoration

### Blob (ambient glow)
```html
<div class="blob"></div>
```
```css
.blob {
  position: absolute; top: -120px; right: -120px;
  width: 560px; height: 560px;
  background: radial-gradient(circle, rgba(36,114,248,0.08) 0%, transparent 65%);
  pointer-events: none;
}
```
Place as first child inside `.slide`. Always present.

### Grid background
Built into `.slide` via `background-image`. Cell size: 36px. No additional HTML needed.

---

## Layout Shell (every slide)

```html
<div class="slide">
  <div class="blob"></div>
  <div class="top-bar"> ... </div>
  <div class="series-label">SERIES NAME</div>
  <!-- main content -->
  <div class="bottom-bar"> ... </div>
</div>
```

### Top bar
```css
.top-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:36px; position:relative; z-index:1 }
.top-logo { height:48px; object-fit:contain }
.slide-count { font-size:20px; font-weight:500; color:#aaa; letter-spacing:.06em }
```
```html
<div class="top-bar">
  <img src="./assets/logo-primary.png" class="top-logo" alt="Solo Flows">
  <span class="slide-count">N / TOTAL</span>
</div>
```

### Series label
```css
.series-label { font-size:16px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#888; margin-bottom:20px; display:flex; align-items:center; gap:12px; position:relative; z-index:1 }
.series-label::before { content:'*'; color:#2472F8; font-size:22px }
```

### Bottom bar
```css
.bottom-bar { position:absolute; bottom:40px; left:72px; right:72px; display:flex; align-items:center; justify-content:space-between; z-index:2 }
.dashes { display:flex; align-items:center; gap:8px }
.d { height:4px; border-radius:2px; background:#CCCCD8 }
.d.a { background:#2472F8 }  /* active dash = current slide */
.handle { font-size:18px; font-weight:600; color:#333362 }
.swipe { font-size:17px; color:#aaa }
```
```html
<div class="bottom-bar">
  <div class="dashes">
    <div class="d a" style="width:44px"></div>
    <div class="d" style="width:28px"></div>
    <div class="d" style="width:36px"></div>
    <div class="d" style="width:48px"></div>
    <div class="d" style="width:22px"></div>
  </div>
  <span class="handle">soloflows.com</span>
  <span class="swipe">Vuốt để xem thêm →</span>  <!-- omit on last slide -->
</div>
```
Active dash: move `.d.a` class to the dash position matching current slide number.

---

## Component Catalog

### Headline
```css
.headline { font-size:84px; font-weight:900; line-height:1.04; color:#00003B; letter-spacing:-.03em; margin-bottom:28px; position:relative; z-index:1 }
.headline em { font-family:'Inter',sans-serif; font-style:italic; font-weight:400; color:#2472F8 }
```
Use `<br>` for manual line breaks. Wrap key phrase in `<em>` for italic blue emphasis. Use 72–76px for 3-line headlines (cover slide), 84–88px for 2-line headlines (content slides).

### Watermark (cover slides only)
```css
.watermark { font-size:340px; font-weight:900; color:rgba(36,114,248,0.055); line-height:.85; letter-spacing:-.05em; margin-bottom:-40px; margin-left:-8px; user-select:none; position:relative; z-index:1 }
```
Negative `margin-bottom` overlaps with the element below, creating a layered background effect.

### Breaking label (cover slides)
```css
.breaking-label { font-size:15px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:#2472F8; margin-bottom:18px; display:flex; align-items:center; gap:12px; position:relative; z-index:1 }
.breaking-label::before { content:''; width:28px; height:2px; background:#2472F8; display:inline-block }
```

### Tag (category badge)
```css
.tag { display:inline-block; background:#2472F8; color:white; font-size:15px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:12px 24px; margin-bottom:24px; border-radius:4px; position:relative; z-index:1 }
```

### Blockquote
```css
.blockquote { border-left:6px solid #2472F8; padding:20px 28px; margin-bottom:26px; position:relative; z-index:1 }
.blockquote .lead { font-size:21px; font-weight:700; color:#00003B; margin-bottom:12px; line-height:1.45 }
.blockquote .body { font-size:19px; color:#333362; line-height:1.65 }
```
```html
<div class="blockquote">
  <div class="lead">Lead sentence — the key fact.</div>
  <div class="body">Supporting detail. <strong>Bold key phrase.</strong></div>
</div>
```

### Quote card
```css
.quote-card { background:rgba(0,0,0,0.045); border-radius:14px; padding:22px 24px; margin-bottom:18px; position:relative; z-index:1 }
.qc-title { font-size:19px; font-weight:800; color:#00003B; margin-bottom:10px }
.dots { display:flex; gap:9px; margin-bottom:12px }
.dot { width:11px; height:11px; border-radius:50% }
.quote-card p { font-size:18px; color:#444; line-height:1.6 }
```
```html
<div class="quote-card">
  <div class="dots">
    <div class="dot" style="background:#2472F8"></div>
    <div class="dot" style="background:#CCCCD8"></div>
    <div class="dot" style="background:#CCCCD8"></div>
  </div>
  <p>Quote or supporting callout text here.</p>
</div>
```
Use `.qc-title` when the card has a named heading. Use only `.dots` + `<p>` for anonymous callouts.

### Bullet list
```css
.bullet-list { list-style:none; margin-bottom:24px; position:relative; z-index:1 }
.bullet-list li { display:flex; align-items:flex-start; gap:18px; font-size:20px; color:#333; line-height:1.5; margin-bottom:16px }
.bullet-list li::before { content:'▶'; color:#2472F8; font-size:12px; margin-top:5px; flex-shrink:0 }
```

### Stats grid (3-up numbers)
```css
.stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:24px; position:relative; z-index:1 }
.stat-box { background:rgba(0,0,0,0.045); border-radius:14px; padding:24px 16px; text-align:center }
.stat-num { font-size:72px; font-weight:900; color:#2472F8; line-height:1; letter-spacing:-.025em }
.stat-label { font-size:17px; color:#777; margin-top:8px; line-height:1.35 }
```

### Meta row (cover numbers, inline)
```css
.meta-row { display:flex; gap:64px; position:relative; z-index:1 }
.meta-num { font-size:60px; font-weight:900; color:#00003B; letter-spacing:-.025em; line-height:1 }
.meta-label { font-size:16px; color:#888; margin-top:6px }
```

### Data row (3-column timeline cards)
```css
.data-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:22px; position:relative; z-index:1 }
.data-card { background:rgba(0,0,0,0.05); border-radius:14px; padding:20px 20px }
.dc-title { font-size:26px; font-weight:900; color:#2472F8; letter-spacing:-.01em }
.dc-date { font-size:15px; color:#888; margin-top:4px }
.dc-desc { font-size:15px; color:#666; margin-top:3px }
```

### Dark banner
```css
.dark-banner { background:#00003B; border-radius:14px; padding:24px 28px; display:flex; align-items:flex-start; gap:18px; position:relative; z-index:1 }
.dark-banner .icon { color:#2472F8; font-size:22px; margin-top:3px; flex-shrink:0 }
.dark-banner p { font-size:21px; color:#eee; line-height:1.6 }
.dark-banner p em { font-family:'Inter',sans-serif; font-style:italic; color:#FFBB00 }
```
```html
<div class="dark-banner">
  <span class="icon">▶</span>
  <p>Key insight statement. <em>Italic emphasis in neon.</em></p>
</div>
```

### Date badge
```css
.date-badge { display:inline-flex; align-items:center; gap:14px; background:rgba(36,114,248,0.1); border-radius:8px; padding:12px 22px; margin-bottom:22px; font-size:20px; font-weight:700; color:#2472F8; letter-spacing:.05em; position:relative; z-index:1 }
```
```html
<div class="date-badge"><span>DD/M</span><span>→</span><span>DD/M</span></div>
```

### CTA block (last slide)
```css
.cta-block { margin-bottom:44px; position:relative; z-index:1 }
.cta-label { font-size:16px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#aaa; margin-bottom:16px }
.cta-handle { font-size:64px; font-weight:900; color:#2472F8; letter-spacing:-.025em; line-height:1; margin-bottom:20px }
.cta-sub { font-size:22px; color:#333362; line-height:1.65 }
```

### Divider
```css
.divider { width:100%; height:1px; background:rgba(0,0,0,0.1); margin:36px 0; position:relative; z-index:1 }
```

### Tag row (hashtags/topics)
```css
.tag-row { display:flex; gap:16px; flex-wrap:wrap; position:relative; z-index:1 }
.tag { display:inline-block; background:rgba(36,114,248,0.1); color:#2472F8; font-size:16px; font-weight:700; letter-spacing:.06em; padding:10px 20px; border-radius:100px }
```

---

## Spacing Budget

Available vertical space (content area):
- Canvas: 1080px
- Top padding: 60px
- Top bar (logo 48px + margin-bottom 36px): ~84px
- Series label (~22px text + margin ~20px): ~42px
- Bottom bar (absolute, 40px from bottom): ~60px reserved
- **Available for content: ~834px**

Target content height per slide: 700–820px. Leave breathing room — do not pack to the edge.

Approximate component heights at current scale:
| Component | Height (incl. margin) |
|---|---|
| Headline L 2 lines (84px) | ~200px |
| Headline XL 3 lines (76px) | ~260px |
| Blockquote (lead + body) | ~140px |
| Bullet list 3 items | ~110px |
| Quote card (dots + title + body) | ~130px |
| Stats grid | ~165px |
| Data row | ~115px |
| Dark banner | ~100px |
| Tag badge | ~60px |
| Date badge | ~65px |

If total exceeds 820px: drop one bullet item, remove a quote card, or reduce one `margin-bottom` by 6–8px.

---

## Slide Architecture Patterns

| Slide type | Components used |
|---|---|
| Cover (hook) | watermark, breaking-label, headline, sub, divider, meta-row |
| Overview | headline, blockquote, stats-grid, dark-banner |
| Detail / error | tag, headline, blockquote, bullet-list, quote-card |
| Timeline | tag, headline, date-badge, blockquote, bullet-list, quote-card |
| Analysis | headline, blockquote, data-row, bullet-list, dark-banner |
| Reveal | headline, blockquote, quote-card, bullet-list |
| CTA | headline, cta-block, divider, tag-row |

---

## Asset Paths

Logo primary (wordmark): `./assets/logo-primary.png`
Logo submark (icon only): `./assets/submark.svg`

Source logos: `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\`

---

## Render Command

```python
from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = r"path\to\output"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1080, "height": 1080})
    for i in range(1, N + 1):
        slide = f"slide-{i:02d}.html"
        html_path = os.path.join(OUTPUT_DIR, slide)
        file_url = "file:///" + html_path.replace(chr(92), "/").replace(" ", "%20")
        page.goto(file_url, wait_until="networkidle")
        page.wait_for_timeout(2000)
        jpeg_path = os.path.join(OUTPUT_DIR, slide.replace(".html", ".jpg"))
        page.screenshot(path=jpeg_path, type="jpeg", quality=95)
    browser.close()
```

---

## Graph

[[INHOUSE TEAMS/2. Media Team/4. Design Hub/CLAUDE|Design Hub]] · [[INHOUSE TEAMS/2. Media Team/4. Design Hub/.claude/agents/skills/html-carousel-gen|HTML Carousel Gen Skill]] · [[INHOUSE TEAMS/2. Media Team/4. Design Hub/graphic-design/CLAUDE|Graphic Design]]
