# Marketing Team — Brand Storage Structure

**Last updated:** 2026-05-05
**Owner:** CMO (Machine B)
**Purpose:** Reference document for brand folder hierarchy and file organization

---

## Quick Reference

**Hierarchy:** `Brand → Method → Quarter → Month → Week → Day`

**Four Methods:**
1. `01. Brand Marketing` — brand positioning, partnerships, PR, brand health
2. `02. Social Media Marketing` — content strategy, calendars, social performance
3. `03. SEO` — keyword strategy, content production, technical SEO
4. `04. Email Marketing` — sequences, newsletters, automation

**Time Flow:**
```
Long-term strategy (Quarter)
    ↓
1-Month Plan (Pillars + Angles)
    ↓
Weekly Breakdown
    ↓
Daily Tickets (CMO assigns to Hubs)
```

---

## Full Storage Tree

```
02. brands/
├── Bruce/
│   ├── 01. Brand Marketing/
│   │   ├── strategy.md                     ← Brand bible (positioning, pillars, voice)
│   │   └── campaigns/
│   │       └── CAM-014-ai-influencer-trends-q3/
│   │           └── campaign-plan.md         ← Campaign Plan sections 1-8 (mirrors Notion Campaign page body)
│   ├── 02. Social Media Marketing/
│   ├── 03. SEO/
│   │   └── Q2_2026/
│   │       ├── strategy.md                  ← Quarterly SEO strategy
│   │       ├── research/
│   │       │   ├── seo-audit-2026-04.md
│   │       │   ├── seo-target-2026-04.md
│   │       │   └── competitor-analysis-2026-04.md
│   │       └── May_2026/
│   │           ├── strategy.md              ← Monthly SEO plan (keywords, content queue)
│   │           ├── report.md                ← Monthly SEO performance (added end of month)
│   │           └── Week 1/
│   │               ├── README.md            ← Week summary
│   │               └── [no daily tickets for SEO method]
│   │           ├── Week 2/
│   │           ├── Week 3/
│   │           └── Week 4/
│   └── 04. Email Marketing/
│
├── Khanh Huyen/
│   ├── 01. Brand Marketing/
│   │   └── strategy.md
│   ├── 02. Social Media Marketing/
│   │   └── Q2_2026/
│   │       ├── strategy.md                  ← Quarterly social strategy
│   │       ├── research/
│   │       │   ├── social-audit-2026-04.md
│   │       │   ├── social-target-2026-04.md
│   │       │   └── iconic-visual-research-beauty.md
│   │       └── May_2026/
│   │           ├── strategy.md              ← Monthly pillars + angles
│   │           ├── report.md                ← Monthly social performance
│   │           └── Week 1/
│   │               ├── README.md
│   │               ├── 01.MondayTicket_04_05_2026.md
│   │               ├── 02.TuesdayTicket_05_05_2026.md
│   │               ├── 03.WednesdayTicket_06_05_2026.md
│   │               ├── 04.ThursdayTicket_07_05_2026.md
│   │               └── 05.FridayTicket_08_05_2026.md
│   │           ├── Week 2/
│   │           ├── Week 3/
│   │           └── Week 4/
│   ├── 03. SEO/
│   └── 04. Email Marketing/
│
├── Solo Flows Platform/
│   ├── 01. Brand Marketing/
│   │   ├── strategy.md
│   │   └── 2026-05-02-discovery-audit.md   ← Research file (legacy location)
│   ├── 02. Social Media Marketing/
│   ├── 03. SEO/
│   └── 04. Email Marketing/
│
├── Mylara Vey/                              ← Same structure as Bruce/Khanh Huyen
├── Chu Sau/                                 ← Same structure
└── Personal Brand/                          ← Same structure
```

---

## Method Folders — What Goes Where

| # | Method Folder | Purpose | Example Files |
|---|---------------|---------|---------------|
| 01 | `Brand Marketing` | Brand bible, positioning, partnerships, PR, brand health | `strategy.md`, audit files, partner lists, NPS data, `campaigns/[Campaign ID]-[slug]/campaign-plan.md` |
| 02 | `Social Media Marketing` | Content pillars, angles, posting calendars, social performance | Monthly strategies, daily tickets, visual research |
| 03 | `SEO` | Keyword strategy, content queue, technical SEO, ranking reports | Keyword clusters, content briefs, audit reports |
| 04 | `Email Marketing` | Sequences, newsletters, send calendars, automation | Sequence maps, monthly send plans, A/B test results |

---

## Time Hierarchy — When Folders Are Created

### Quarterly Level (`Q[X]_[YYYY]/`)

**Created:** At start of each quarter
**Contents:**
- `strategy.md` — Quarterly targets, themes, campaigns, high-level KPIs
- `research/` — Quarterly audits, benchmarks, competitor analysis

**Example:** `Q2_2026/` folder created on April 1, 2026

---

### Monthly Level (`[Mon]_[YYYY]/`)

**Created:** During 1-Month Strategy planning (1 week before month starts)
**Contents:**
- `strategy.md` — Monthly strategy (pillars, angles, content queue, send calendar)
- `report.md` — Monthly performance report (added at end of month)
- `Week [1-4]/` — Weekly folders (created during weekly breakdown)

**Example:** `May_2026/` folder created ~April 24, 2026 (1 week before May starts)

---

### Weekly Level (`Week [N]/`)

**Created:** During weekly breakdown (typically on Monday for that week)
**Contents:**
- `README.md` — Week summary (pillars active, total pieces, status)
- Daily ticket files — One per day with content (see naming below)

**Example:** `Week 1/` folder created ~April 27, 2026 (Monday of last week of April, planning for Week 1 of May)

---

### Daily Level (`[Order].[Day]Ticket_[DD]_[MM]_[YYYY].md`)

**Created:** During weekly breakdown, one file per day that has content scheduled
**Contents:** Task list with Hub assignments, QC checklist, completion log

**Example:**
```
01.MondayTicket_04_05_2026.md    ← May 4, 2026 (Monday)
02.TuesdayTicket_05_05_2026.md   ← May 5, 2026 (Tuesday)
```

**No ticket file** for days without content (rest days).

---

## File Naming Conventions

| Level | File Type | Naming Pattern | Example |
|-------|-----------|----------------|---------|
| Brand root | Brand bible | `strategy.md` | `strategy.md` |
| Brand root | Research (legacy) | `[topic]-[YYYY-MM-DD].md` | `2026-05-02-discovery-audit.md` |
| Quarter | Quarterly strategy | `strategy.md` | `strategy.md` |
| Quarter | Research | `[topic]-[YYYY-MM].md` | `seo-audit-2026-04.md` |
| Month | Monthly strategy | `strategy.md` | `strategy.md` |
| Month | Monthly report | `report.md` | `report.md` |
| Week | Week summary | `README.md` | `README.md` |
| Day | Daily ticket | `[Order].[Day]Ticket_[DD]_[MM]_[YYYY].md` | `01.MondayTicket_04_05_2026.md` |

**Order format:** 01, 02, 03... (leading zero for single digits)
**Day format:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
**Date format:** DD_MM_YYYY (day_month_year with underscores)

---

## What Files Go Where — Decision Tree

```
Is this brand-specific?
│
├─ No → Put in shared/
│
└─ Yes → Which method?
    │
    ├─ Brand positioning / partnerships / PR / NPS
    │   └─ 01. Brand Marketing/
    │
    ├─ Social content / calendars / social metrics / visual research
    │   └─ 02. Social Media Marketing/
    │
    ├─ Keywords / SEO content / ranking reports / technical SEO
    │   └─ 03. SEO/
    │
    └─ Email sequences / newsletters / automation / A/B tests
        └─ 04. Email Marketing/
```

**Within each method:**
- Is this a strategy document? → `strategy.md` at appropriate time level
- Is this research/audit data? → `research/` at quarterly level
- Is this performance data? → `report.md` at monthly level
- Is this a daily task? → Daily ticket in `Week [N]/` folder

---

## Workflow → Storage Mapping

| Workflow | Output File | Storage Path |
|----------|-------------|--------------|
| Long-term strategy (Social) | Quarterly social strategy | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/strategy.md` |
| Long-term strategy (Social) | Social audit | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/research/social-audit-[YYYY-MM].md` |
| Long-term strategy (Social) | Social targets | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/research/social-target-[YYYY-MM].md` |
| Content Pillar Builder | Monthly social strategy | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/[Mon]_[YYYY]/strategy.md` |
| Weekly Breakdown | Week README | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/[Mon]_[YYYY]/Week [N]/README.md` |
| Daily Task Ticket | Daily ticket | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/[Mon]_[YYYY]/Week [N]/[Order].[Day]Ticket_[DD]_[MM]_[YYYY].md` |
| Monthly Performance | Monthly social report | `02. brands/[Name]/02. Social Media Marketing/Q[X]_[YYYY]/[Mon]_[YYYY]/report.md` |
| Campaign Plan | Campaign plan (sections 1-8, mirrors Notion Campaign page) | `02. brands/[Name]/01. Brand Marketing/campaigns/[Campaign ID]-[slug]/campaign-plan.md` |

*Similar mapping applies for SEO, Email, and Brand Marketing workflows.*

Section 9 (Visual Strategy) of a Campaign Plan is not stored here — it lives in the Brand Kit, see `BASE/BRAND KITs/BRAND-KIT-STRUCTURE.md` and `CMO/context/campaign-plan-template.md`.

---

## CMO Daily Workflow

```
Morning (e.g., 9:00 AM):
1. Open 02. brands/
2. Check which brands have tickets for today (e.g., 2026-05-05)
3. For each brand with today's ticket:
   a. Read the ticket file
   b. Review task list
   c. Assign each task to appropriate Hub:
      - Content tasks → Content Hub
      - Visual tasks → Design Hub
      - Video tasks → Video Hub
      - Publishing tasks → Communication Team
   d. Update ticket status to "In Progress"

During Day:
1. Hubs execute tasks
2. Hubs update ticket with progress
3. Communication Team publishes completed assets

Evening (e.g., 6:00 PM):
1. Review all completed tickets for the day
2. Mark tickets as "Done" if all tasks complete
3. Note any blockers or issues
4. Prepare for next day
```

---

## Example File Path Reference

| What I'm Looking For | Path Example |
|----------------------|--------------|
| Khanh Huyen's brand bible | `02. brands/Khanh Huyen/01. Brand Marketing/strategy.md` |
| May 2026 social plan for Bruce | `02. brands/Bruce/02. Social Media Marketing/Q2_2026/May_2026/strategy.md` |
| Social audit for Q2 2026 (Bruce) | `02. brands/Bruce/02. Social Media Marketing/Q2_2026/research/social-audit-2026-04.md` |
| SEO keywords for May 2026 (Platform) | `02. brands/Solo Flows Platform/03. SEO/Q2_2026/May_2026/strategy.md` |
| Monday ticket May 4 (Khanh Huyen) | `02. brands/Khanh Huyen/02. Social Media Marketing/Q2_2026/May_2026/Week 1/01.MondayTicket_04_05_2026.md` |
| April 2026 social report (Chu Sau) | `02. brands/Chu Sau/02. Social Media Marketing/Q2_2026/Apr_2026/report.md` |
| Email send calendar May 2026 (Platform) | `02. brands/Solo Flows Platform/04. Email Marketing/Q2_2026/May_2026/strategy.md` |
| Brand partnership pipeline Q2 2026 (Personal Brand) | `02. brands/Personal Brand/01. Brand Marketing/Q2_2026/strategy.md` |

---

## When to Create New Folders

| Trigger | Action |
|---------|--------|
| Start of new quarter | Create `Q[X]_[YYYY]/` in each active method folder |
| 1 week before new month | Run 1-Month Strategy workflows → create `[Mon]_[YYYY]/` folder |
| Monday (weekly planning) | Run Weekly Breakdown → create `Week [N]/` folder + daily tickets |
| End of month | Write `report.md` in month folder |
| New brand added | Create brand folder + 4 method folders + `strategy.md` |

---

## Graph

**Team Structure:** [[MKT-FOLDER-STRUCTURE|Marketing Team Folder Structure]]
**Workflows:** [[01. Marketing Mix/4. Promote/workflows/Long-term strategy/|Long-term]] · [[01. Marketing Mix/4. Promote/workflows/1-Month Strategy/|1-Month]] · [[01. Marketing Mix/4. Promote/workflows/1-Week Plan/|1-Week]]
**Brands:** [[Bruce/01. Brand Marketing/strategy|Bruce]] · [[Khanh Huyen/02. Social Media Marketing/iconic-visual-research-beauty|Khanh Huyen Research]] · [[Solo Flows Platform/01. Brand Marketing/strategy|Platform]]
**Campaign Plan:** [[CMO/context/campaign-plan-template|Campaign Plan Template]] · [[BASE/BRAND KITs/BRAND-KIT-STRUCTURE|Brand Kit Structure]] (Visual Strategy)
