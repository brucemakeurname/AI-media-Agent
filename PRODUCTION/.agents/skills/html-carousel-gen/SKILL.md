---
name: html-carousel-gen
description: Generate a multi-slide HTML carousel from a content brief. Produces per-slide HTML files at 1080x1080px and renders them to JPEG via Playwright. Invoke with /html-carousel-gen.
type: skill
---

# HTML Carousel Generator

## When to invoke
Use this skill when the designer chooses an HTML template approach for a carousel — structured data-driven slides with consistent typography and brand layout, not AI-generated images. The designer selects it per `Ticket.md`'s format and the `node/creative-brief.md`, then drives it as one of the direction mechanisms (alongside `creative-direction` / `photography-direction`).

---

## Step 1 — Read inputs & plan direction

Read in this order:
1. `Ticket.md` in the campaign folder — the ticket's format, language, brand, and `output_dir`.
2. `node/creative-brief.md` (from content-executive) — core message, desired response,
   audience, per-slide key points, and on-image copy candidates. This is the same brief every
   other direction mechanism reads; there is no separate blueprint file.

Extract from the brief:
- **Topic** — what the carousel is about
- **Slide count** — how many slides (default 8: 1 cover + N content + 1 CTA)
- **Language** — Vietnamese default unless `Ticket.md` specifies otherwise
- **Key data points** — numbers, dates, facts to feature
- **Series label** — brand/topic name displayed as the category tag (e.g., "CLAUDE CODE")
- **CTA destination** — URL or handle for the last slide

Then write `node/html-direction.md`: slide count, per-slide role + content mapping, and which
component classes from the design system (`design-system.md`, this skill's companion CSS token
and component reference — consult it while planning Step 2) apply per slide. Single pass — no
scoring, no refine loop, no round numbering.

If the brief is missing something this step needs, do not guess: the designer writes
`node/gap-request.md` headed `# Gap Request — Round N` (the same self-numbering rule as every
other direction) and waits for content-executive's `## Round N answers` before continuing. HTML
direction never loops on itself, but it participates in that shared gap-request contract.

---

## Step 2 — Plan the slide architecture

Map content to slide types before writing any code. Document your plan:

```
Slide 1: Cover        → hook headline, key stat watermark, 3× meta numbers
Slide 2: Overview     → summary blockquote, stats grid, dark banner reveal
Slide 3–N: Content    → one focused point per slide (tag + headline + blockquote + details)
Slide N+1: CTA        → follow prompt, tag row
```

Rules:
- Cover slide always has a large watermark (a bold number or year)
- Content slides: one main idea each — do not stack 2 unrelated points
- CTA slide: no swipe label in bottom bar
- Slide count in bottom bar: `N / TOTAL` where N matches the file number
- Active dash: move `.d.a` to the dash position matching the current slide number (5 dashes = 5 slides; if more, add/remove dashes proportionally)

---

## Step 3 — Write HTML files

**Output path:** the `output_dir` from `Ticket.md` (the campaign root). Default campaign output path format:
```
D:\1. SOLOFLOWS\BASE\CAMPAIGNs\[bucket]\[...subpath]\[YYYY-MM-DD]\[ticket_id]\
```

Create one `.html` file per slide: `slide-01.html`, `slide-02.html`, etc.

**Required in every file:**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Slide N/TOTAL</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
/* paste design system base CSS + only this slide's unique components */
</style>
</head>
```

**CSS approach:** Include only the base shell CSS plus the component classes actually used in that slide. Do not paste the entire design system into every file.

**Base CSS (required in every slide):**
```css
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1080px;overflow:hidden;background:#FFFFFF}
.slide{
  width:1080px;height:1080px;position:relative;overflow:hidden;
  background-color:#FFFFFF;
  background-image:linear-gradient(rgba(0,0,59,0.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,0,59,0.035) 1px,transparent 1px);
  background-size:36px 36px;
  padding:60px 72px 0 72px;
  font-family:'Inter',sans-serif;color:#00003B;
}
.blob{position:absolute;top:-120px;right:-120px;width:560px;height:560px;
  background:radial-gradient(circle,rgba(36,114,248,0.08) 0%,transparent 65%);
  pointer-events:none}
.top-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px;position:relative;z-index:1}
.top-logo{height:48px;object-fit:contain}
.slide-count{font-size:20px;font-weight:500;color:#aaa;letter-spacing:.06em}
.series-label{font-size:16px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888;
  margin-bottom:20px;display:flex;align-items:center;gap:12px;position:relative;z-index:1}
.series-label::before{content:'*';color:#2472F8;font-size:22px}
.bottom-bar{position:absolute;bottom:40px;left:72px;right:72px;display:flex;
  align-items:center;justify-content:space-between;z-index:2}
.dashes{display:flex;align-items:center;gap:8px}
.d{height:4px;border-radius:2px;background:#CCCCD8}
.d.a{background:#2472F8}
.handle{font-size:18px;font-weight:600;color:#333362}
.swipe{font-size:17px;color:#aaa}
```

**Logo asset path:** `./assets/logo-primary.png`

If the `assets/` folder doesn't exist in the output folder, copy these two files there:
- `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\PNG\1.PRIMARY_TRANS_BG_lightmode_21x9_.png` → rename to `logo-primary.png`
- `D:\1. SOLOFLOWS\BASE\BRAND KITs\Solo Flows_Brand_Kit\1. logo\SVG\3.SUBMARK_TRANS_BG_1x1.svg` → rename to `submark.svg`

---

## Step 4 — Spacing check

Before rendering, mentally verify each slide's content height stays within budget:

Available content height: ~834px
- Headline L 2 lines (~200px), Headline XL 3 lines (~260px), blockquote (~140px), bullet-list 3 items (~110px), quote-card (~130px), stats-grid (~165px), data-row (~115px), dark-banner (~100px), tag (~60px), date-badge (~65px)
- If estimated total > 820px: drop one bullet item, remove a quote card, or reduce one `margin-bottom` by 6–8px

---

## Step 5 — Render to JPEG

Run Playwright after all HTML files are written. Python required.

```python
from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = r"ABSOLUTE_PATH_TO_SLIDE_FOLDER"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1080, "height": 1080})
    for i in range(1, SLIDE_COUNT + 1):
        slide = f"slide-{i:02d}.html"
        html_path = os.path.join(OUTPUT_DIR, slide)
        file_url = "file:///" + html_path.replace(chr(92), "/").replace(" ", "%20")
        page.goto(file_url, wait_until="networkidle")
        page.wait_for_timeout(2000)
        jpeg_path = os.path.join(OUTPUT_DIR, slide.replace(".html", ".jpg"))
        page.screenshot(path=jpeg_path, type="jpeg", quality=95)
        print(f"{slide} rendered")
    browser.close()
```

Wait for `networkidle` + 2s to ensure Google Fonts load before capturing.

---

## Step 6 — Quality check

After rendering, review each JPEG for:
- [ ] Content fills the canvas — no large empty areas at top or bottom
- [ ] Logo visible and correctly sized at top-left
- [ ] No text overflow (content cut off at edges)
- [ ] Active dash matches slide number
- [ ] Last slide has no swipe label
- [ ] Font loaded correctly (Inter + Inter italic visible)

If any slide fails: fix the HTML and re-render that slide only.

---

## Step 7 — Write output contract

Append an `## Output` section to `node/html-direction.md` (the direction file from Step 1) for
traceability — do NOT create a separate `design-output.md`; final status lives in the campaign
root `manifest.json` written later by `notion-publisher`:

```markdown
## Output

- Slides: N files at 1080×1080px
- Format: JPEG, quality 95
- Path: [absolute path to campaign root]
- Files: slide-01.jpg … slide-0N.jpg
- Series: [SERIES LABEL]
- Language: [Vietnamese / English]
- Status: DONE
```

---

## Common mistakes to avoid

| Mistake | Fix |
|---|---|
| `display:flex` or `padding` on `body` | Never. Body must be bare `width/height/overflow` only. |
| Relative paths with spaces unencoded | Use `.replace(" ", "%20")` in file URL |
| Font not loading before screenshot | Always `wait_until="networkidle"` + `wait_for_timeout(2000)` |
| Content overflowing bottom | Reduce bullet count, tighten margins, or shrink font by 4px |
| Headline `em` emphasis wrong | `.headline em` = Inter weight 800, color `#2472F8` (blue). No serif, no Playfair. |
| Logo too small / not visible | `height:48px; object-fit:contain` on `.top-logo` — never use pixel width |

---

## Graph

**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Driven by:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/designer|designer role]]
**Siblings:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]] · [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/photography-direction/SKILL|photography-direction]]
