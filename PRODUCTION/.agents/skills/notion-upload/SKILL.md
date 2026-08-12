---
name: notion-upload
description: Push finished content (title + properties + markdown body + images) into a Notion database page. Generic replacement for per-team uploaders. Sets review status (e.g. "Chờ duyệt"). Env NOTION_TOKEN.
---

# notion-upload

Create a page in a Notion database with a title, arbitrary properties, an optional markdown
body, and set the review status. Used at the final Publish step of every content workflow.

## Prerequisites

- `NOTION_TOKEN` in env (Bearer integration token).
- The integration must be shared to the target database.
- `--database-id` from the ticket (CMO passes it, or the agent pulls it from the brief).

## Usage

```bash
python upload.py \
  --database-id "<db id>" \
  --title "<page title>" \
  --title-prop "Name" \
  --status "Chờ duyệt" --status-prop "Status" \
  --body "<output_dir>/caption.md" \
  [--props "<output_dir>/props.json"] \
  [--cover-url "https://<r2>/hero.jpg"]
```

Prints the created page URL.

## Property mapping

- `--title` → the database title property (`--title-prop`, default `Name`).
- `--status` → a `select` property (`--status-prop`, default `Status`). If the database
  uses Notion's native **status** type instead of `select`, edit `upload.py` (`"status"`
  block instead of `"select"`) — this is a common gotcha.
- `--props` → a JSON file of any extra Notion-formatted properties, merged in verbatim
  (rich_text, select, date, number, relation, url, multi_select …). Follow the field
  format in the SEO `notion-blog-database-uploader` reference for exact shapes.

## Body (markdown → blocks)

`upload.py` converts the markdown body to Notion blocks: `#/##/###` → headings,
`- / *` → bullets, `![alt](https url)` → external image block, everything else → paragraph.
Blocks are capped at 100 per create call (Notion limit) — long articles: append in batches.

## Images

- **External URL** (R2, already uploaded): use `![alt](url)` in the body or `--cover-url`.
- **Local files**: Notion's API cannot attach a local path directly. Upload to R2 first (or
  use Notion's file-upload API) and reference the resulting URL. Never inline base64.

## Video (files that exceed Notion's ~5MB file-property cap)

Every `ai-commercial-short-video`/`ai-ugc-short-video` final is well over 5MB, so it can never be
attached to a Notion `file` property directly (that path is for the small `THUMBNAIL` image only).
Instead:

1. Upload the final mp4 to R2: `node upload_video_to_r2.js "<final.mp4>" "social-media/<brand>/<date-or-ticket>/<name>.mp4"`
   → prints the public `https://pub-<account>.r2.dev/...` URL.
2. Pass that URL to `upload.py --video-url "<url>"` — appends a Notion `video` block (external
   type) to the page body, so reviewers can play it inline without a >5MB attachment.
3. If the dispatched workflow's Write-back table also wants the link stored as a property (e.g.
   a `Video Link` url-type field), add it via `--props` as a normal `url` property pointing at the
   same R2 URL — the video block and the property are independent, use either or both.

## Graph
[[../../../WORKFLOWS-BLUEPRINT|Workflows Blueprint]]
