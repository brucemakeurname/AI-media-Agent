---
name: notion2goal
description: Pull a scheduled post/ticket from Notion (by page ID, title, or date like "12/8"), create the standard `Ticket.md` in the target campaign folder (`BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/YYYY-MM-DD/`), select the matching goal template in `PRODUCTION/goal/` via `Visual Type`, fill all prompt placeholders, and save the populated prompt as `node/GOAL.md`.
---

# notion2goal

Pull Notion post data for a requested date, page ID, or post title, construct a standard `Ticket.md` in the target campaign folder, and instantiate the corresponding goal prompt as `node/GOAL.md`.

## Prerequisites

- `NOTION_TOKEN` set in `PRODUCTION/env.local` or environment (Bearer integration token).
- Standard databases:
  - Posts DB ID: `38d0831f990c802db2b1e2a7b03a05da`
  - Campaigns DB ID: `3990831f990c80119e4bf38f9c68bea9`
- Notion integration must have access to both databases.

Load credentials only for the requested pull; never print the token:

```bash
set -a
source PRODUCTION/env.local
set +a
test -n "${NOTION_TOKEN:-}" || { echo "BLOCKED: NOTION_TOKEN is missing"; exit 1; }
```

## Usage

```text
Use skill notion2goal for post scheduled 2026-08-12
Use skill notion2goal for page 38d0831f-990c-802d-b2b1-e2a7b03a05da
Use skill notion2goal for post "PVL ISO Gold Singlish UGC Short Video"
```

## Step-by-Step Workflow

### Step 1: Query Notion Post Page

1. **By Date (e.g. `12/8` or `2026-08-12`):**
   - Normalize the requested date to `YYYY-MM-DD`, using the current year only when the user omits it.
   - Query `Posts DB` (`38d0831f990c802db2b1e2a7b03a05da`) using the actual date-property name returned by the database schema (`Date`, `Publish Date`, or `Scheduled Date`).
   - If multiple posts match, select the requested title or list options for disambiguation.
2. **By Page ID / Title:**
   - Fetch page directly or query by title (`Topic` / `Name` field).

Use the Notion REST API version configured by the integration. Inspect database schema first, then query/fetch the selected Post page, its full page body, and every linked Campaign page. Do not update Notion in this skill.

### Step 2: Extract Notion Fields & Mapping

Extract the following values from the Post page, its body, and its linked Campaign page (via `Social Media Campaigns` relation):

| Variable / Placeholder | Source Notion Field / Logic | Missing-data handling |
|---|---|---|
| `topic` | Post `Topic` or `Name` (title) | Required |
| `format` | Post `Format` (select) | Stop: required for target folder |
| `channel` | Post `Channel` (multi_select or select) | Stop: required for target folder |
| `brand` | Parent Brand Page title or Post `Brand` | Record `REVIEW REQUIRED` in Ticket if absent |
| `ip_campaign` | Explicit IP field, user confirmation, or linked Campaign title only when it equals an existing `[IP] Campaign` folder | Stop: never infer from product brand |
| `pillar` | Post `Pillar` (select) | Record `REVIEW REQUIRED` in Ticket if absent |
| `campaign_link` | Resolved title and URL of linked `Social Media Campaigns` page | Stop if the template requires campaign fields |
| `post_message` | Post `Post Message` (text) | Record `REVIEW REQUIRED` in Ticket if absent |
| `headline_hook` | Post `Headline/Hook` (text) | Record `REVIEW REQUIRED` in Ticket if absent |
| `slogan` | Linked Campaign `Slogan` (text) | Stop if template contains `{{slogan}}` |
| `big_idea` | Linked Campaign `Big Idea` (text) | Stop if template contains `{{big_idea}}` |
| `visual_type` | Post `Visual Type` (select) | Stop: required for template routing |
| `voice_brief` | Post `Voice` (select or text) | Stop if template contains `{{voice_brief}}` |
| `video_requirement` | Post `Video Requirement` property, otherwise matching Post body section | Optional; default to `None specified` if absent |
| `visual_concept_script` | Post `Visual Concept Script` property, otherwise matching Post body section | Stop only if absent everywhere and required by template |
| `scheduled_date` | Post `Date` / `Publish Date` (`YYYY-MM-DD`) | Stop: required for date folder |

#### Body Block Extraction Rule

Fetch all paginated Post page body blocks (`GET /v1/blocks/{page_id}/children`) recursively. Normalize section labels case-insensitively, trimming a final colon. Treat a label block such as `Visual Concept:` or `Video Requirement:` as the start of a section: include its own non-label text plus every following sibling block (and all descendants) until the next label block. This covers Notion's common `paragraph label → quote/callout → nested paragraph` layout. Read a matching Post database property first; otherwise concatenate the section body text in document order:

- `Visual Concept` → `visual_concept_script`
- `Video Requirement` → `video_requirement`

`video_requirement` is optional and defaults to `None specified` if no property or body section exists. Include every non-empty body section used in `Ticket.md`'s Notion Field Snapshot using its original Notion section label.

Never fabricate missing values or leave a known required placeholder in `GOAL.md`. Report the Post page, missing field, and required owner action, then stop before creating/updating `GOAL.md`.

### Step 3: Map `Visual Type` → Goal Template File

Select the template in `PRODUCTION/goal/`:

| Notion `Visual Type` Value | Goal Template Path |
|---|---|
| `AI UGC SHORT VIDEO` / `ai-ugc-short-video` | `PRODUCTION/goal/[social]_[ai-ugc-short-video].md` |
| `AI COMMERCIAL SHORT VIDEO` / `ai-commercial-short-video` | `PRODUCTION/goal/[social]_[ai-commercial-short-video].md` |
| `SINGLE STATIC` / `single-static` | `PRODUCTION/goal/[social]_[single-static].md` |
| `HTML CAROUSEL` / `html-carousel` | `PRODUCTION/goal/[social]_[html-carousel].md` |
| `IMG CAROUSEL` / `img-carousel` | `PRODUCTION/goal/[social]_[img-carousel].md` |
| `HUMAN SHORT VIDEO` / `human-short-video` | `PRODUCTION/goal/[social]_[human-short-video].md` |
| `MOTION GRAPHIC` / `motion-graphic` | `PRODUCTION/goal/[social]_[motion-graphic].md` |
| `SPLIT 4 IMG` / `split-4-img` | `PRODUCTION/goal/[social]_[split-4-img].md` |
| `INDUSTRY NEWS HTML SUMMARY` / `industry-news-html-summery` | `PRODUCTION/goal/[social]_[industry-news-html-summery].md` |
| `AI CONSTRUCTION TIMELAPSE SHORT VIDEO` | `PRODUCTION/goal/[social]_[ai-construction-timelapse-short-video].md` |

### Step 4: Resolve Target Campaign Folder

Follow `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`:

```text
campaign_folder = BASE/CAMPAIGNs/{ip_campaign}/{platform}/{format_folder}/{YYYY-MM-DD}/
```

- `ip_campaign`: Must match an existing `[IP] Campaign` folder exactly; do not default it.
- `platform`: `TikTok`, `Instagram`, or `Facebook`.
- `format_folder`: `Short Video`, `Single Post`, `Carousel`, `Multiple Post`, or `Reel`.
- `YYYY-MM-DD`: Date folder from `scheduled_date`. Suffix `-2`, `-3` if folder already exists for another ticket.

Map platform/format only to existing canonical folders. For a multi-select `Channel`, select the one explicitly requested by the user; otherwise stop and ask which channel is the production unit.

Create `{{campaign_folder}}` and `{{campaign_folder}}/node` if they do not exist.

### Step 5: Task 1 — Create `Ticket.md`

Save `{{campaign_folder}}/Ticket.md` using standard schema:

```markdown
# Ticket: {{topic}}

- **Notion Page ID:** {{notion_page_id}}
- **Product / Brand:** {{brand}}
- **IP Campaign:** {{ip_campaign}}
- **Platform / Format:** {{channel}} / {{format}} (Visual Type: {{visual_type}})
- **Target Date:** {{scheduled_date}}
- **Target Audience / Pillar:** {{pillar}}
- **Goal / Topic:** {{topic}}
- **Voice / Persona:** {{voice_brief}}
- **Video / Visual Requirement:** {{video_requirement}}
- **Slogan / Big Idea:** {{slogan}} | {{big_idea}}

## Post Brief & Message
{{post_message}}

## Headline / Hook Brief
{{headline_hook}}

## Visual Concept Brief
{{visual_concept_script}}

## Notion Field Snapshot
List every non-empty editorial/business property pulled from the selected Post and linked Campaign using its exact Notion field label and normalized value. Include any non-empty Post body sections used by this workflow. Exclude only Notion system metadata (created/edited timestamps and users), file download URLs, and credentials. This preserves fields that are not used by the selected goal template without inventing a local schema.

## Traceability
- **Notion Post URL:** {{notion_page_url}}
- **Linked Campaign URL:** {{campaign_url}}
- **Goal Template:** {{goal_template_path}}
```

### Step 6: Task 2 — Generate `node/GOAL.md`

1. Read the goal template file identified in Step 3.
2. Copy only the fenced text under `## Prompt`; do not copy the goal template's frontmatter, field-mapping table, or reference notes.
3. Replace all `{{placeholder}}` values using the mapped field values from Step 2:
   - `{{format}}` → mapped `format`
   - `{{channel}}` → mapped `channel`
   - `{{brand}}` → mapped `brand`
   - `{{pillar}}` → mapped `pillar`
   - `{{campaign_link}}` → mapped `campaign_link`
   - `{{topic}}` → mapped `topic`
   - `{{voice_brief}}` → mapped `voice_brief`
   - `{{video_requirement}}` → mapped `video_requirement`
   - `{{visual_concept_script}}` → mapped `visual_concept_script`
   - `{{post_message}}` → mapped `post_message`
   - `{{slogan}}` → mapped `slogan`
   - `{{big_idea}}` → mapped `big_idea`
   - `{{headline_hook}}` → mapped `headline_hook`
   - `{{campaign_folder}}` → resolved `campaign_folder` path
   - `{{notion_page_id}}` → Notion page ID
   - `{{done_when}}` → static `done_when` value from template frontmatter
4. Prepend provenance metadata (Post ID/URL, Campaign URL, template path, generated timestamp), then save the populated prompt text to `{{campaign_folder}}/node/GOAL.md`.

## Verification & Definition of Done

1. `{{campaign_folder}}/Ticket.md` exists and is non-empty.
2. `{{campaign_folder}}/node/GOAL.md` exists and contains no remaining `{{...}}` placeholder inside the copied prompt.
3. The folder structure strictly matches `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`.

## Graph

[[../../../../AGENTS|Workspace AGENTS]] · [[../../../../BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE|Campaigns Structure]] · [[../../../AGENT|Production AGENT]] · [[../notion-upload/SKILL|notion-upload]]
