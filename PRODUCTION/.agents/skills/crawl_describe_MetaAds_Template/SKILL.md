---
name: crawl_describe_MetaAds_Template
description: Download and deeply describe hand-picked Meta (Facebook/Instagram) Ads Library ads. The user supplies only the "Library ID" number(s) shown in the Ads Library panel (NOT the advertiser Page ID) — the skill fetches each ad through Apify's apify/facebook-ads-scraper by that Library ID, pulls the signed fbcdn video URL, downloads it, and writes a per-keyframe shooting-script reference into BASE/BRAND KITs/2b. Script_Template/. One at a time, resumable checklist deleted when the whole list is done. Meta Ads Library ONLY. For TikTok manual curation use crawl_describe_TiktokAds_Template; for Apify auto-discovery across TikTok+Meta use crawl_SocialAds_Template_apify.
---

# crawl_describe_MetaAds_Template

Turns a **hand-picked list of Meta (Facebook/Instagram) Ads Library ads** into richly-described,
per-keyframe shooting-script references in `BASE/BRAND KITs/2b. Script_Template/`. This is the
**manual-curation** path for Meta — the Facebook counterpart of `crawl_describe_TiktokAds_Template`:
the human browses the Meta Ads Library, decides which winning ads are worth studying, and hands over
each ad's **Library ID**; the skill fetches, downloads, and deeply describes them one at a time.

Owned by the **researcher** role (`.claude/agents/researcher.md`).

## Why a separate skill (and why it MUST go through Apify)

Unlike TikTok's Creative Center, a Meta Ads Library page **cannot be crawled with raw `curl`**
(verified 2026-07-29): Facebook serves a JS bot-challenge interstitial (`__rd_verify_...`) and, even
after the challenge is passed, returns a generic error page to any non-browser client. There is no
server-rendered `__NEXT_DATA__` blob to parse (that trick is TikTok-only). The ad's content + video
URL live behind a warm browser session (datr/LSD tokens).

So the fetch step here goes through **Apify** — but in **targeted single-ad-by-Library-ID mode**, not
the sibling's auto-discovery. That keeps the manual-curation spirit (the human picks the exact ads)
while using the only mechanism that actually reaches Meta. This skill also produces a **finer
breakdown** than the auto-discovery sibling — per-keyframe element/text/product motion — because a
hand-picked ad is worth the deeper pass.

**Advantage over `crawl_SocialAds_Template_apify` for Meta:** the sibling's discovery actor
(`Facebook Ads Transcript Scraper`) has a fixed `country` enum that **excludes VN**. Fetching a
specific ad by Library ID via `apify/facebook-ads-scraper` has **no such country limit** — VN ads
resolve fine (verified 2026-07-29). So VN Meta ads are reachable *only* through this by-ID path.

## Scope guardrails

- **Meta Ads Library ONLY.** If an ID isn't a Meta ad, skip it and note why — never touch TikTok here
  (that's `crawl_describe_TiktokAds_Template`).
- **One ad at a time, strictly sequential.** No batch runs, no farming the list to other models, no
  parallel Apify runs or downloads. Finish and write one entry fully before starting the next — avoids
  hammering fbcdn and congesting our own agent.
- **Country lock** (same vocabulary as the siblings): only keep ads from **US, CA, VN, AU, GB**. VN is
  allowed here (this by-ID path reaches it, unlike the discovery actor's enum).

## ⚠️ Library ID vs Page ID — the #1 mistake (read before anything)

The Meta Ads Library "Dữ liệu tóm tắt / summary" panel shows **two different ID numbers**. Only one
of them fetches the ad:

| Label in the panel | What it is | Use it? |
|---|---|---|
| **"ID thư viện: 1011140987557803"** / **"Library ID: …"** (chip at top) | the ad's `adArchiveID` | ✅ **THIS is what to crawl** |
| **"ID: 212603805259188"** under "Giới thiệu về nhà quảng cáo / About the advertiser" | the advertiser's **Page ID** | ❌ never — returns `no_items` |

Verified live 2026-07-29: fetching by the Page ID `212603805259188` returned `no_items` on two
independent actors, while fetching by the Library ID `1011140987557803` returned the ad immediately
(that ad's own `pageId` field then *equals* the Page ID — confirming the two are distinct roles). If
a user hands you a number, confirm it's from the **"Library ID"** chip, not the advertiser block.

## Input — the user's LIBRARY-ID list

The user names a list file (or pastes inline) containing **Library IDs** — one per line is enough. A
full `.../ads/library/?id={library_id}` URL is also fine; the skill just needs the ID. `niche`/`format`
are optional hints the researcher confirms (or derives) from the footage itself:

```yaml
- library_id: 1011140987557803        # the "ID thư viện" chip, NOT the advertiser Page ID
  niche:  Fashion-Apparel             # optional
  format: product-demo                # optional
- library_id: 813008458082217
```

## Step 0 — Load list + open/repair the progress checklist

Progress file: `BASE/BRAND KITs/2b. Script_Template/_crawl-progress-meta.md`
(distinct filename from the TikTok skill's `_crawl-progress.md`, so a Meta run and a TikTok run never
clobber each other's checklist).

1. If it **exists**, this is a resumed run: read it, trust its `[x]` marks, continue from the first
   unchecked item. Do **not** re-fetch or re-describe anything already `[x]`.
2. If it **does not exist**, create it from the user's list — one checkbox per ad:

```markdown
# Meta crawl progress — started {{YYYY-MM-DD HH:MM}} — {{N}} ads
Source list: {{list file path}}

- [ ] {{library_id}} — status: pending
- [ ] {{library_id}} — status: pending
...
```

Update this file after **every** ad (Step 6). It is the single source of truth for resumability.

## Per-ad loop (repeat strictly one at a time)

For the first `[ ]` item only:

### Step 1 — Fetch the ad through Apify (by Library ID)

`APIFY_API_TOKEN` lives in `D:\1. SOLOFLOWS\.env.ops` — never paste the token value into any output,
commit, or Notion page. Actor: **`apify/facebook-ads-scraper`** (URL-based; verified 2026-07-29).

```bash
export APIFY_API_TOKEN="$(sed -n 's/^APIFY_API_TOKEN=//p' 'D:/1. SOLOFLOWS/.env.ops' | tr -d '\r\n')"

# Input: single-ad-by-id URL. No country param needed — by-ID resolves any country incl. VN.
cat > "{{staging}}/input.json" <<'JSON'
{"startUrls":[{"url":"https://www.facebook.com/ads/library/?id={{library_id}}"}],"resultsLimit":3,"isDetailsPerAd":true}
JSON

RUN=$(curl -s -X POST "https://api.apify.com/v2/acts/apify~facebook-ads-scraper/runs?token=$APIFY_API_TOKEN" \
  -H "Content-Type: application/json" -d @"{{staging}}/input.json")
RID=$(echo "$RUN" | python -c "import sys,json;print(json.load(sys.stdin)['data']['id'])")
DS=$(echo "$RUN"  | python -c "import sys,json;print(json.load(sys.stdin)['data']['defaultDatasetId'])")

# Poll until done (single ad finishes in ~1 poll; cap the loop anyway)
for i in $(seq 1 18); do
  S=$(curl -s "https://api.apify.com/v2/actor-runs/$RID?token=$APIFY_API_TOKEN" \
      | python -c "import sys,json;print(json.load(sys.stdin)['data']['status'])")
  case "$S" in SUCCEEDED|FAILED|ABORTED|TIMED-OUT) break;; esac; sleep 8
done
curl -s "https://api.apify.com/v2/datasets/$DS/items?token=$APIFY_API_TOKEN&clean=true" -o "{{staging}}/ad.json"
```

**`activeStatus` gotcha:** the actor only accepts `""`/`"active"`/`"inactive"` — `"all"` throws
`invalid-input`. Omit it (as above) to get the ad regardless of status.

**If the returned item is `{"error":"no_items", ...}`:** almost always the number was a **Page ID**,
not a Library ID (see the ⚠️ table). Re-confirm the ID with the user; do not retry blindly.

### Step 1b — Pull metrics + the signed video URL from the Apify result

Parse `{{staging}}/ad.json` (always run Python with `PYTHONUTF8=1 PYTHONIOENCODING=utf-8` — Vietnamese
page names crash cp1252 consoles otherwise):

```python
import json, re
d = json.load(open(r"{{staging}}/ad.json", encoding="utf-8"))
it = d[0]
snap = it.get("snapshot") or {}
# video URL: prefer HD, fall back to SD; DPA/carousel ads carry theirs under cards[]
vids = []
for v in (snap.get("videos") or []):
    u = v.get("videoHdUrl") or v.get("videoSdUrl")
    if u: vids.append(u)
for c in (snap.get("cards") or []):
    u = c.get("videoHdUrl") or c.get("videoSdUrl")
    if u: vids.append(u)
open(r"{{staging}}/video_url.txt", "w", encoding="utf-8").write(vids[0] if vids else "")
```

Record for `performance_metrics` (Meta exposes far less than TikTok — be honest about it):
- `adArchiveID` (the Library ID), `pageName`, `pageId`, `displayFormat` (VIDEO / DPA / CAROUSEL / …),
- `isActive`, `startDate` → `endDate` (run duration is the closest longevity signal),
- `publisherPlatform` (FACEBOOK / INSTAGRAM / AUDIENCE_NETWORK / MESSENGER — placement breadth),
- landing page (`snapshot.linkUrl`), and the ad's own caption/title/CTA text (paraphrase later).
- **Engagement/spend numbers do NOT exist** for ordinary commercial ads in Meta's public Ad Library
  (only EU/political ads carry reach/spend, sometimes surfaced by `isDetailsPerAd`). Never invent a
  like/reach count — set `engagement_metrics_available: false` and say so in `performance_signal`.

If `video_url.txt` is empty, the ad is image/DPA-static/text-only → mark the item
`skipped (no video)` and move on; this skill describes video ads.

### Step 2 — Download the video

The `*.fbcdn.net` URL is **signed and expiring**. Download with a browser UA + a Facebook referer:

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
curl -sL -A "$UA" -e "https://www.facebook.com/" "$(cat {{staging}}/video_url.txt)" \
  -o "{{staging}}/{{library_id}}.mp4" \
  -w "HTTP %{http_code} | %{size_download} bytes\n"
```

Expect `HTTP 200`. A `403`/tiny file means the signed URL expired between Step 1 and here → **re-run
Step 1** (a fresh Apify fetch mints a new signed URL); never guess/rebuild the URL by hand. Stage into
`node/staging/meta-{{library_id}}/` (transient).

### Step 3 — Verify + extract

- `ffprobe` for real `duration`, resolution, and that both a video and audio stream exist (confirms
  it's the right file, not an error page).
- **Frames**: sample with ffmpeg, cap ~100 frames, width ≤512px, density adaptive to length. A montage
  tile (`fps=1/N,scale=...,tile=RxC`) is the cheapest way to read the whole ad at once; pull individual
  full-res frames only for beats whose on-screen text/product detail the montage can't resolve.
- **Transcript**: extract 16kHz mono WAV (`ffmpeg -i in.mp4 -ac 1 -ar 16000 a.wav`), then the
  `whisperx` CLI directly (on PATH) — e.g.
  `whisperx a.wav --model small --language {{vi|en}} --output_format json --compute_type int8 --output_dir wx`.
  Prefix every call with `PYTHONIOENCODING=utf-8 PYTHONUTF8=1`. Real ad audio is human speech, so trust
  WhisperX boundaries. **`segments: []` is valid** (music/text-only ad) → record `Dialogue / VO: none`,
  don't retry.
- **Time-sync** frames to nearest transcript segment before describing — matched visual+VO pairs, not
  two unsynced streams.

### Step 4 — Watch + describe (the deep pass)

Write the breakdown to the **canonical schema** in
`BASE/BRAND KITs/2b. Script_Template/_shooting-script-template.md`. Fill it at full granularity — for
every scene populate the fine fields the schema asks for:
- `Product presence` (how the product enters/exits frame, angle, prominence, timing),
- `Element motion` (every moving element as from → to, with speed/easing; camera moves),
- `VFX` (effect + on which element + what it visualizes),
- `On-screen text` (paraphrased copy + position + animate-in/out + persistent-badge vs scene-caption),
- `Dialogue / VO` (rhetorical structure, not verbatim),
- `Emphasis / Pacing` (cuts/sec, foregrounded beat, claim-repetition count),
- `Transition out`, and the **`Keyframes`** list (one line per visually distinct instant).
Also fill `script_mode` (narrative / message-stack / tutorial-usecase / hybrid), `## CTA Analysis`,
and `## Conversion Mechanics`. **Paraphrase all copy/VO — never verbatim** (IP rule).

### Step 5 — Save entry + keep the video

Final location (create the niche folder if new) — `platform` segment is **`meta`**:
```
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-meta-{content-slug}-{library_id}.md
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-meta-{content-slug}-{library_id}.mp4
```
Move the staged `.mp4` here beside its `.md`. Discard staging frames + `audio.wav` (transient).
`{content-slug}` is a hand-written 2-5 word brand+product label.

In the entry's front-matter, `source_url` is the stable Meta permalink
`https://www.facebook.com/ads/library/?id={library_id}` (Meta Ad Library permalinks are long-lived,
unlike the signed fbcdn video URL — never store the fbcdn URL as if it were stable).

### Step 6 — Mark progress

Flip that item to `- [x] {{library_id}} — status: done → {{final .md filename}}` in
`_crawl-progress-meta.md`. Then return to the per-ad loop for the next `[ ]` item.

## Step 7 — Finish the batch

When every item is `[x]` (done or skipped), **delete `_crawl-progress-meta.md`** so the next run
starts clean. Report a one-line summary per ad (niche/format/mode + final filename, or skip reason).

## Do / Don't
- DO confirm the ID is the **"Library ID"** chip, not the advertiser **Page ID** — the single most
  common failure (`no_items`).
- DO process strictly one ad at a time; fully write + save + mark before the next.
- DO update `_crawl-progress-meta.md` after every single ad so any interruption is recoverable.
- DO delete `_crawl-progress-meta.md` only after the whole list is resolved.
- DO keep the source `.mp4` beside its breakdown (human QA); discard frames/audio staging.
- DO re-run the Apify fetch (Step 1) to mint a fresh signed URL if the download 403s.
- DON'T `curl` the Meta Ads Library page HTML expecting content — it's a JS bot-challenge, always
  empty/error for non-browser clients. The Apify by-ID fetch is the only path.
- DON'T use the auto-discovery sibling for a hand-picked ID (and don't use this skill for TikTok).
- DON'T run parallel Apify runs / downloads or hand the list to another model (DDoS + agent
  congestion).
- DON'T invent Meta engagement/spend numbers — they aren't exposed for ordinary commercial ads.
- DON'T quote a source ad's dialogue/on-screen text verbatim anywhere (IP rule).
- DON'T crawl any country outside US/CA/VN/AU/GB.

## Graph
**Owner role:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/researcher|researcher]]
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Canonical schema:** [[BASE/BRAND KITs/2b. Script_Template/_shooting-script-template|shooting-script template]]
**TikTok manual-curation sibling:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_describe_TiktokAds_Template/SKILL|crawl_describe_TiktokAds_Template]]
**Apify-discovery sibling (TikTok + Meta):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_SocialAds_Template_apify/SKILL|crawl_SocialAds_Template_apify]]
**Feeds (future work, not yet wired):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-shooting-script/SKILL|write-shooting-script]]
