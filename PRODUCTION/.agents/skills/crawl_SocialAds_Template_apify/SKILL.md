---
name: crawl_SocialAds_Template_apify
description: Crawl real high-performing TikTok AND Meta (Facebook/Instagram) video ads via Apify actors (auto-discovery by platform/biz_niche/count), break each one down into a paraphrased, tagged sequence-script reference, and save it into BASE/BRAND KITs/2b. Script_Template/. Builds the reference library only — does not consume it. Manual, on-demand batch runs, not automatic. For manually-curated single TikTok Ads Library URLs (no Apify), use the sibling skill crawl_describe_TiktokAds_Template instead. See design doc DOCS/superpowers/specs/2026-07-24-script-source-builder-design.md for the full rationale.
---

# crawl_SocialAds_Template_apify

*(formerly `script-source-builder` — renamed 2026-07-29 to distinguish it from the manual-curation
sibling `crawl_describe_TiktokAds_Template`. This skill is the **Apify auto-discovery** path,
covering both TikTok and Meta; the sibling is TikTok-Ads-Library-only, driven by a hand-picked
URL list.)*

Builds the missing TVC/UGC script reference library. `write-shooting-script`'s Method 2 currently
writes narrative/dialogue from Claude's own general knowledge because no curated library exists on
disk (its own SKILL.md says so explicitly). This skill is how that library gets populated — one
batch at a time, from real winning ads, paraphrased into reusable structural patterns.

**This skill does not change how `write-shooting-script` or `write-ai-ugc-video-sequence-script`
retrieve** — wiring the library into those consumers is separate follow-up work, once
`2b. Script_Template/` has enough entries to be useful.

## Trigger

Manual invocation only — never automatic/scheduled. Params:

| Param | Values |
|---|---|
| `platform` | `tiktok` \| `meta` \| `both` |
| `biz_niche` | target industry/niche — same tag vocabulary as `creative-direction` |
| `count` | number of ads to crawl + breakdown this batch |
| `content_format` (optional) | specific pillar to target; omit to pull Top Ads across any pillar in the niche |

### Country lock (hard constraint, not a per-call param)

Only crawl from markets with strong social media penetration — never let a run drift into an
unrequested country. Locked allow-list: **US, CA, VN, AU, GB**.

- **TikTok**: pass `countries` restricted to whichever of the 5 apply (TikTok Creative Center's
  `countries` param has no fixed enum in the actor's schema — VN is expected to work given it's a
  major TikTok market, but this hasn't been verified live; spot-check the first VN run's results).
- **Meta**: the actor's `country` param is a **fixed enum** —
  `US, GB, CA, AU, DE, FR, IT, ES, BR, IN, ALL` — **VN is not in it**. Don't use `ALL` and
  post-filter for VN-looking pages; that's unreliable (Ad Library results aren't reliably tagged to
  a display country). **VN is TikTok-only within this locked list** — Meta runs are limited to
  US/CA/AU/GB.

## Phase 1 — Crawl to staging

### 1. Access

Try the **Apify MCP server** (`apify`, enabled for this project) first. If its tools aren't present
in-session, fall back to the Apify REST API directly:

```
curl -H "Authorization: Bearer $APIFY_API_TOKEN" https://api.apify.com/v2/acts/{actor}/runs ...
```

`APIFY_API_TOKEN` lives in `D:\1. SOLOFLOWS\.env.ops` — never paste the token value into any output,
commit, or Notion page.

### 2. Actor selection

| `platform` | Actor |
|---|---|
| `tiktok` | TikTok Creative Center Ad Intelligence |
| `meta` | Facebook Ads Transcript Scraper |

### 3. Selection criteria

**Verified 2026-07-24 live test (1 TikTok + 1 Meta pilot, F&B niche):**
- TikTok actor's `keyword` param is unreliable — a plain niche keyword (`"restaurant"`) returned
  `adsFound: 0` even though the field is documented as actor-supported. Don't rely on it as the
  primary filter. Instead pull unfiltered Top Ads (`sortBy: "like"`, no keyword, `periodDays` up to
  `"120"` if a short window returns too few niche matches) and filter the niche manually from
  `adTitle`/`hookText` text — this is what actually worked.

**Confirmed 2026-07-24, second test (Fitness niche, VN+US):** `keyword` is not merely unreliable —
**10 separate terms tried** (gym, fitness, workout, dumbbell, protein powder, leggings, yoga mat, ab
roller, resistance band, gym bag), every single one returned `adsFound: 0`. Treat this field as
**non-functional**, not just occasionally unhelpful — never spend a call on it, go straight to the
unfiltered-Top-Ads + manual-filter approach above. Also confirmed: a niche can genuinely be absent
from TikTok's current Top Ads pool — checked top-20 across all 3 `sortBy` values (`ctr`/`like`/
`impression`) × 3 `periodDays` windows (7/30/120) for both VN and US and found zero fitness-equipment
ads (that slice was dominated by beauty/mom-and-baby/fashion). When this happens, fall back to the
Meta actor's `searchQueries` (which does work — verified both times) rather than forcing a
non-matching TikTok result into the niche; Meta's country restriction still applies (§ Country lock)
so this fallback only covers countries in Meta's supported enum.
- Meta actor's `requireTranscript: true` **throws a hard run failure** (`"No ads with exposed
  transcript/caption data were found. Try a video-heavy query or disable requireTranscript."`) if
  no result happens to have Meta's own exposed transcript field — most public ads don't. **Default
  to `requireTranscript: false`** and let Phase 1 §5's WhisperX step produce the transcript instead
  of depending on the actor for it.

Apply hard filters first (via actor query params where supported, else filter the returned metadata
before downloading anything):

- `country` is within the locked allow-list (US, CA, VN, AU, GB) — see Country lock above. Never
  crawl an unrequested country.
- `biz_niche` matches or is closely adjacent to the requested niche.
- Format matches the platform's strength — TikTok → UGC/short-form, Meta → TVC/brand ad.
- Video length is in the pipeline's usable range (roughly 15-90s). Omni's per-scene ceiling is 10s
  and target total duration is 15-60s, so a much longer video has little direct reference value.
- **The specific product must be identifiable from the video's own pixels** — a visible logo,
  wordmark, distinctive housing/packaging, or an on-screen text overlay that names it. A caption/ad-copy
  field naming the product doesn't count if the video itself only shows generic lifestyle content
  with no branding — that ad teaches nothing about how to *show* a product on screen, which is the
  point of this library. **Confirmed 2026-07-24**: a first Fitness-niche pick (Speediance Gym
  Monster 2) was rejected and replaced for exactly this reason — its on-screen text was a generic
  lifestyle claim, product identity lived only in the surrounding Meta ad copy. The replacement (REP
  Fitness adjustable dumbbells) has an embossed logo + base wordmark + a second branded-wristband
  touchpoint, all visible in-frame.

Then rank/select among what passes:

- Prefer platform-verified performance signals (TikTok Top Ads' own like-rate/CTR curation) over
  raw runtime — a long-running ad is not proof of quality, a brand can simply forget to pull a stale
  one. **TikTok exposes real numbers for this** (`likeCount`, `ctrRank`, `costRank` — pull whichever
  the actor's `sortBy` was set to and record it). **Meta's public Ad Library API does not** — it has
  no engagement/spend data for ordinary commercial ads (only political/issue ads get that), so for
  Meta the closest available signal is run duration (`startDate`/`endDate`) and placement breadth
  (`platforms` count) — weaker proxies, not real performance proof. Say so plainly in
  `performance_signal` rather than implying Meta ads were engagement-vetted the same way TikTok's
  were.
- Prefer ads with an identifiable structural arc (hook → problem → proof → CTA), checkable from a
  preview before full download.
- Diversify picks across `content_format`/pillar within the niche rather than pulling
  near-duplicate ads — the goal is breadth of pattern, not depth on one formula.

### 4. Download

Pull only videos that passed selection into `node/staging/{platform}-{ad_id}/`.

### 5. Extraction

- **Transcript**: use platform-provided captions/on-screen text if the actor already returns them.
  Otherwise transcribe locally with WhisperX (`.claude/skills/[html-video]-subtitle-burn-industry-news/scripts/whisperx_transcribe.py`
  is this codebase's reference invocation). Set `PYTHONIOENCODING=utf-8` / `PYTHONUTF8=1` before
  invoking — Windows consoles crash on diacritic output otherwise (known issue, see
  `ai-commercial-short-video-KNOWN-ISSUES.md` item 2c). Real ad audio is normal human speech (not
  TTS-synthesized), so the VAD/timestamp unreliability documented for Omni's synthesized voice
  (items 2a/2b in that same doc) likely doesn't apply here — trust WhisperX's own segment
  boundaries unless spot-checking shows otherwise. **Empty segments (`"segments": []`) is a valid
  outcome, not a failure** — verified 2026-07-24: a pure macro-cut product-demo ad had no VAD-detected
  speech at all (music/on-screen-text only). Record `Dialogue/VO pattern: none` in that case rather
  than treating it as an extraction error or retrying.
- **Frames**: ffmpeg keyframe extraction with explicit cost-control limits (adopted from reviewing
  the external `watch-video-skill` reference implementation): cap **100 frames per video**, resize
  to **512px width**, sampling density adaptive to video length — denser for short videos, sparser
  for long ones.
- **Time-sync**: pair each frame to its nearest transcript segment by timestamp before Phase 2 —
  hand Claude matched visual+dialogue pairs, not two unsynced streams.

### 6. Keep the source video (changed 2026-07-24 — was delete-after-breakdown)

Move the downloaded video from staging to sit alongside its written breakdown, using the naming
convention from Phase 2 below (`{filename}.mp4` next to `{filename}.md`). This lets a human QA the
breakdown against the actual footage. The
original design deleted staged assets after Phase 2 (copyright safeguard) — overridden on request;
be aware this means the library now stores real copyrighted ad video files, which grows repo size
and reintroduces the retention question the earlier design avoided. Keyframes/raw audio.wav used
only for extraction are still transient and can be discarded once the transcript/frames are read.

## Phase 2 — Breakdown, tag, and store

Read the time-synced frames + transcript for each staged ad and write a breakdown that mirrors
`write-shooting-script`'s own output shape, so a future retrieval pass can field-substitute from it
directly.

**Output location and filename (changed 2026-07-24 — was `{platform}-{ad_id}.md`)**:

```
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-{platform}-{content-slug}-{ad_id}.md
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-{platform}-{content-slug}-{ad_id}.mp4
```

- `{content-slug}` is a short (2-5 word) kebab-case descriptor of the actual ad content (brand +
  product/hook), e.g. `starbucks-smores-frappuccino` or `zhenmi-portable-blender-juice` — written
  by whoever runs Phase 2, not derived mechanically, so it should read as a human-recognizable
  label at a glance without opening the file.
- `{ad_id}` stays at the end for uniqueness/traceability back to the source platform's own record.
- New folder, sibling to `2a. Video_Prompt_Template/`, mirroring `1. Creative_Prompt_Template/`'s
  tagged-library convention (folder-per-niche) — the niche is still both the folder name and the
  filename prefix, so a file is identifiable even if moved out of its folder.

**File schema**:

```markdown
---
source_platform: tiktok | meta
source_ad_id: {{id}}
source_url: {{public ad listing / permalink if one exists, else the CDN video URL actually used —
  flag CDN URLs as signed/expiring, they are not stable long-term}}
country: {{one of US, CA, VN, AU, GB — the locked allow-list, never anything outside it}}
biz_niche: {{niche}}
content_format: {{pillar}}
duration_sec: {{source video length}}
performance_metrics:
  # TikTok — real fields the actor returns, use them as-is, never invent a number it didn't give.
  # ctr_rank / cost_rank are TikTok Creative Center's own internal RANK/PERCENTILE scores within
  # the ranked pool (lower = better, e.g. 0.08 = near the top of the pool sorted by that metric) —
  # they are NOT a literal CTR% or cost figure. Never read "ctr_rank: 0.08" as "8% CTR". The actor
  # also does not return view_count or comment_count at all — don't estimate them without saying
  # so; if a like/view ratio is needed for context, state it as an external-benchmark-based
  # estimate, not a measured number (verified 2026-07-24 while sourcing this batch).
  source_ranking_metric: {{impression | ctr | like | cost — which sort the ad was found under}}
  like_count: {{likeCount, if present}}
  ctr_rank: {{ctrRank, if present — internal rank/percentile, not a raw CTR%, see note above}}
  cost_rank: {{costRank, if present — internal rank/percentile, not a raw cost figure}}
  period_days: {{periodDays the ranking was computed over}}
  country: {{country}}
  # Meta — the public Ad Library API exposes no engagement/spend numbers for ordinary commercial
  # (non-political) ads. Do not approximate a like/reach count for Meta entries — record what's
  # actually available instead:
  is_active: {{true/false}}
  start_date: {{YYYY-MM-DD}}
  end_date: {{YYYY-MM-DD, or "still active" if is_active}}
  run_duration_days: {{end_date - start_date}}
  platforms: {{list, e.g. [FACEBOOK, INSTAGRAM, AUDIENCE_NETWORK, MESSENGER]}}
  engagement_metrics_available: false  # explicit — Meta Ad Library API doesn't expose these for non-political ads
performance_signal: {{one-line human summary derived from the metrics above, e.g. "TikTok Top Ads – like_count 53,803, ranked by like over 120d/US" or "Meta Ad Library – ran 28 days across 4 placements, no engagement data exposed by API"}}
---

## Arc Breakdown
{{which beats are present: hook / problem / turn / proof / payoff / CTA}}

## Sequence 1 — {{beat name}}
### Scene 1.1
- Visual: {{shot/camera/composition structure, paraphrased — not a verbatim quote}}
- Action/Activity:
- Dialogue/VO pattern: {{the STRUCTURE of the line, not the literal wording — e.g. "opens on a
  rhetorical question targeting the pain point, pivots to a benefit statement at second 3"}}
- SFX / Music mood:
- Motion/VFX:
- On-screen text pattern:
- Timing: {{start–end}}

(repeat per scene / sequence)

## Why this was selected
{{short justification against the selection criteria above}}
```

## IP / legal handling

Every text field (`Visual`, `Dialogue/VO pattern`, `On-screen text pattern`) must describe
**structure/pattern**, never reproduce the source ad's literal wording — this part is still
non-negotiable regardless of whether the source video is kept.

**Video retention (changed 2026-07-24):** the source video file is now kept in the library
alongside its breakdown (Phase 1 §6), for human QA against the actual footage. The original design
deleted it after Phase 2 specifically to avoid storing copyrighted assets — that safeguard no
longer applies. Real ad videos (real brands, real footage) now live in this repo. If this library
is ever shared/exported outside the team, or a brand issues a takedown request, the retained video
files are the actual legal exposure point — the paraphrased text breakdowns alone were the
low-risk part.

`source_url` is a reference link, not a retained copy — storing where a public ad lives is fine;
storing the asset itself is not. Meta's Ad Library permalinks (`adLibraryUrl`) are stable long-term;
TikTok Creative Center's own `videoUrl` is a signed CDN link with an embedded expiry and **will go
dead** — store it anyway for traceability at write-time, but don't treat it as a working link later.

## Do / Don't

- DO filter candidates from metadata before downloading — never bulk-download then filter after.
- DO diversify picks across pillars within a niche rather than saturating one formula.
- DO move the source video next to its breakdown file in `2b. Script_Template/` (§6) — keyframes
  and the extracted `audio.wav` are still transient staging and can be discarded.
- DON'T quote a source ad's dialogue/on-screen text verbatim anywhere in the output file.
- DON'T run this automatically/on a schedule — every batch is an explicit manual call.
- DON'T touch `write-shooting-script` or `write-ai-ugc-video-sequence-script` — this skill only
  populates the library, it doesn't wire consumers to it.

## Graph

**Owner role:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/researcher|researcher]]
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Design doc:** [[DOCS/superpowers/specs/2026-07-24-script-source-builder-design|script-source-builder design]]
**Manual-curation sibling (TikTok Ads Library only, no Apify):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_describe_TiktokAds_Template/SKILL|crawl_describe_TiktokAds_Template]]
**Shared library + template:** [[BASE/BRAND KITs/2b. Script_Template/_shooting-script-template|shooting-script template]]
**Feeds (future work, not yet wired):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-shooting-script/SKILL|write-shooting-script]]
**Sibling pattern:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/creative-direction/SKILL|creative-direction]]
