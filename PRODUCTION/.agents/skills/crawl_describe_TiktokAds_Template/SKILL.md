---
name: crawl_describe_TiktokAds_Template
description: Download and deeply describe hand-picked TikTok Ads Library ads (the user supplies only the Creative Center PAGE urls — the skill auto-extracts the real video from the page HTML, NO F12 needed, NO Apify, NO auto-discovery), one at a time, into per-keyframe shooting-script references saved in BASE/BRAND KITs/2b. Script_Template/. Runs off a user-supplied page-URL list, tracks progress in a resumable checklist so an interrupted run can continue, and deletes the checklist when the whole list is done. TikTok Ads Library ONLY. For Apify auto-discovery across TikTok + Meta, use the sibling crawl_SocialAds_Template_apify instead.
---

# crawl_describe_TiktokAds_Template

Turns a **hand-picked list of TikTok Ads Library videos** into richly-described, per-keyframe
shooting-script references in `BASE/BRAND KITs/2b. Script_Template/`. This is the **manual-curation**
path: the human browses TikTok's Ads/Creative Center library, decides which winning ads are worth
studying, and extracts each video's real URL themselves (the sibling `crawl_SocialAds_Template_apify`
does Apify auto-discovery instead — use that when you want the machine to *find* ads, this when you
already know exactly which ones you want).

Owned by the **researcher** role (`.claude/agents/researcher.md`).

## Why a separate skill (not just Apify)

TikTok's Apify actor `keyword` param is effectively non-functional (10 niche terms → 0 ads, verified
2026-07-24 — see the sibling skill's notes), so niche-targeted discovery through Apify is unreliable.
Manual curation sidesteps that entirely: the researcher studies the library visually and picks the
exact ads, then feeds their URLs here. This skill also produces a **finer breakdown** than the Apify
path — per-keyframe element/text/product motion — because a hand-picked ad is worth the deeper pass.

## Scope guardrails

- **TikTok Ads Library / Creative Center ONLY.** If a URL is not a TikTok ad, skip it and note why
  in the checklist — never crawl arbitrary sites, never touch Meta here (that's the sibling skill).
- **One video at a time, strictly sequential.** No batch scripts, no farming the list out to other
  models, no parallel downloads. This is deliberate: it avoids hammering TikTok's CDN (DDoS-shaped
  traffic) and avoids congesting our own agent. Finish and write one entry fully before starting the
  next.
- **Country lock** (same as the sibling): only keep ads from **US, CA, VN, AU, GB**.

## Input — the user's PAGE-URL list (no F12, no video URL needed)

The user names a list file in their prompt containing **only Creative Center page URLs** — one per
line is enough. `niche`/`format` are optional hints the researcher confirms (or derives) from the
footage itself:

```yaml
- page: https://ads.tiktok.com/business/creativecenter/topads/{ad_id}/pc/en?countryCode=VN&period=30
  niche:  Beauty            # optional
  format: product-reveal    # optional
- page: https://ads.tiktok.com/business/creativecenter/topads/{ad_id2}/pc/en
```

**The video URL is NOT supplied by the user — the skill extracts it itself** from the page's own
server-rendered data (verified 2026-07-29). No F12, no Network tab, no manual copy. See Step 1b.
Only the **page URL** (`.../creativecenter/topads/{ad_id}/...`) is needed; the `{ad_id}` in it is the
stable identifier, and the page HTML embeds every render of the video plus the metrics.

## Step 0 — Load list + open/repair the progress checklist

Progress file: `BASE/BRAND KITs/2b. Script_Template/_crawl-progress.md`.

1. If it **exists**, this is a resumed run: read it, trust its `[x]` marks, and continue from the
   first unchecked item. Do **not** re-download or re-describe anything already `[x]`.
2. If it **does not exist**, create it from the user's list — one checkbox line per video:

```markdown
# Crawl progress — started {{YYYY-MM-DD HH:MM}} — {{N}} videos
Source list: {{list file path}}

- [ ] {{ad_id}} — {{page url}} — status: pending
- [ ] {{ad_id}} — {{page url}} — status: pending
...
```

Update this file after **every** video (Step 6). It is the single source of truth for resumability —
an interrupted run must be able to pick up from it with zero lost or duplicated work.

## Per-video loop (repeat strictly one at a time)

For the first `[ ]` item only:

### Step 1 — Metrics from the ad page
`WebFetch` the `page` URL for: ad title/caption, brand, industry, region/country, objective,
like/comment/share counts, CTR-vs-industry line, budget level, landing-page URL, ranking metric —
whatever the page exposes. Record it; these fill `performance_metrics`. Confirm `country` is in the
lock list; if not, mark the item `skipped (country)` and move on.

### Step 1b — Auto-extract the real video URL from the page HTML (no F12, no user input)
The `topads/{ad_id}` page is server-rendered: its `<script id="__NEXT_DATA__">` JSON embeds a
`videoUrl` object with every resolution (`360P`/`480P`/`540P`/`720P`), plus width/height. `WebFetch`
strips `<script>`, so fetch the **raw HTML with curl** (browser UA) and parse it — verified live
2026-07-29 on `topads/7656751576690688007` (720P `v16m-default.tiktokcdn.com` link recovered +
downloaded, no F12):

```bash
# 1) raw page HTML (browser UA; WebFetch can't be used — it drops <script>)
curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  "{{page_url}}" -o "{{staging}}/page.html"
```

```python
# 2) parse __NEXT_DATA__ → highest-res videoUrl (decodes & → & automatically via json.loads)
import json, re
html = open(r"{{staging}}/page.html", encoding="utf-8").read()
data = json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S).group(1))
found = []
def walk(o):
    if isinstance(o, dict):
        if isinstance(o.get("videoUrl"), dict): found.append(o["videoUrl"])
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(data)
vu = found[0]                                   # {'360P':url, ..., '720P':url}
best = max(vu, key=lambda k: int(re.sub(r'\D','',k) or 0))
open(r"{{staging}}/video_url.txt","w").write(vu[best])   # this is the signed CDN url to download
```

The `videoUrl` values are `v16m-default.tiktokcdn.com/...` **signed** links with an embedded expiry —
so extract-then-download in the same run, don't stash the URL for later. (The metrics in Step 1 can
also be read out of this same `__NEXT_DATA__` blob if a page's rendered view is incomplete — WebFetch
is just the simpler default.)

### Step 2 — Download the video
The extracted signed CDN URL needs a browser UA + a TikTok referer or it 403s. Validated pattern:

```bash
curl -sL \
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  -e "https://ads.tiktok.com/" \
  "$(cat {{staging}}/video_url.txt)" \
  -o "{{staging}}/{{ad_id}}.mp4" \
  -w "HTTP %{http_code} | %{size_download} bytes | %{content_type}\n"
```

Expect `HTTP 200 | ...video/mp4`. A `403` means the signed URL expired between Step 1b and here → just
**re-run Step 1b** (re-fetch the page HTML for a fresh signed URL); never guess/rebuild the URL by
hand. Stage into `node/staging/tiktok-{ad_id}/` (transient).

### Step 3 — Verify + extract
- `ffprobe` for real `duration`, resolution, and that both a video and audio stream exist (confirms
  it's the right file, not an error page).
- **Frames**: sample with ffmpeg, cap ~100 frames, width ≤512px, density adaptive to length (denser
  for short ads). A montage tile (`fps=1/N,scale=...,tile=RxC`) is the cheapest way to read the whole
  ad at once; pull individual full-res frames only for beats whose on-screen text/product detail the
  montage can't resolve.
- **Transcript**: extract 16kHz mono WAV (`ffmpeg -i in.mp4 -ac 1 -ar 16000 a.wav`), then the
  `whisperx` CLI directly (on PATH) — e.g.
  `whisperx a.wav --model small --language {{vi|en}} --output_format json --compute_type int8 --output_dir wx`.
  Prefix every call with `PYTHONIOENCODING=utf-8 PYTHONUTF8=1` (Windows consoles crash on Vietnamese
  diacritics otherwise). Real ad audio is human speech, so trust WhisperX boundaries. **`segments: []`
  is valid** (music/text-only ad) → record `Dialogue / VO: none`, don't retry.
- **Time-sync** frames to nearest transcript segment before describing — describe matched visual+VO
  pairs, not two unsynced streams.

### Step 4 — Watch + describe (the deep pass)
Write the breakdown to the **canonical schema** in
`BASE/BRAND KITs/2b. Script_Template/_shooting-script-template.md`. This skill fills it at full
granularity — for every scene, populate the fine fields the schema asks for:
- `Product presence` (how the product enters/exits frame, angle, prominence, timing),
- `Element motion` (every moving element as from → to, with speed/easing; camera moves),
- `VFX` (effect + on which element + what it visualizes),
- `On-screen text` (paraphrased copy + position + animate-in/out + persistent-badge vs scene-caption),
- `Dialogue / VO` (rhetorical structure, not verbatim),
- `Emphasis / Pacing` (cuts/sec, foregrounded beat, claim-repetition count),
- `Transition out`, and the **`Keyframes`** list (one line per visually distinct instant — finer
  than a scene).
Also fill `script_mode` (narrative / message-stack / tutorial-usecase / hybrid), `## CTA Analysis`,
and `## Conversion Mechanics`. **Paraphrase all copy/VO — never verbatim** (IP rule).

### Step 5 — Save entry + keep the video
Final location (create the niche folder if new):
```
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-tiktok-{content-slug}-{ad_id}.md
BASE/BRAND KITs/2b. Script_Template/{biz_niche}/{biz_niche}-{content_format}-tiktok-{content-slug}-{ad_id}.mp4
```
Move the staged `.mp4` here beside its `.md`. Discard staging frames + `audio.wav` (transient).
`{content-slug}` is a hand-written 2-5 word brand+product label.

### Step 6 — Mark progress
Flip that item to `- [x] {{ad_id}} — ... — status: done → {{final .md filename}}` in
`_crawl-progress.md`. Then return to the per-video loop for the next `[ ]` item.

## Step 7 — Finish the batch
When every item is `[x]` (done or skipped), **delete `_crawl-progress.md`** so the next run starts
clean. Report a one-line summary per video (niche/format/mode + final filename, or skip reason).

## Do / Don't
- DO process strictly one video at a time; fully write + save + mark before the next.
- DO update `_crawl-progress.md` after every single video so any interruption is recoverable.
- DO delete `_crawl-progress.md` only after the whole list is resolved.
- DO keep the source `.mp4` beside its breakdown (human QA); discard frames/audio staging.
- DO extract the video URL yourself from the page HTML `__NEXT_DATA__` (Step 1b) — the user only ever
  supplies page URLs; never ask them to F12/Network-tab for a video URL.
- DON'T use Apify or auto-discovery here — the input is always the user's hand-picked page-URL list.
- DON'T batch-download or parallelize across videos or hand the list to another model (DDoS + agent
  congestion).
- DON'T rebuild/guess a video URL by hand — if the extracted signed URL 403s (expired), just re-run
  Step 1b to pull a fresh one from the page.
- DON'T quote a source ad's dialogue/on-screen text verbatim anywhere.
- DON'T crawl anything outside TikTok Ads Library, or any country outside US/CA/VN/AU/GB.

## Graph
**Owner role:** [[INHOUSE TEAMS/2. Production/Social Media/.claude/agents/researcher|researcher]]
**Parent:** [[INHOUSE TEAMS/2. Production/Social Media/AGENTS|Social Media Agents]]
**Canonical schema:** [[BASE/BRAND KITs/2b. Script_Template/_shooting-script-template|shooting-script template]]
**Apify-discovery sibling (TikTok + Meta):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/crawl_SocialAds_Template_apify/SKILL|crawl_SocialAds_Template_apify]]
**Feeds (future work, not yet wired):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/write-shooting-script/SKILL|write-shooting-script]]
