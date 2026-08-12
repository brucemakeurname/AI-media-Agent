# Brand BGM Library

Curated tracks for brand consistency. Max 5 files, named 01.mp3 – 05.mp3.
Pipeline rotates through them deterministically (hash of article title → index).

## How to populate

Download TikTok sounds via yt-dlp (already installed in pipeline):

```bash
# From a TikTok sound page URL:
yt-dlp -x --audio-format mp3 -o "assets/bgm/brand/01.mp3" "https://www.tiktok.com/music/[sound-name]-[id]"

# From any TikTok video (extracts its background sound):
yt-dlp -x --audio-format mp3 -o "assets/bgm/brand/02.mp3" "https://www.tiktok.com/@user/video/[id]"
```

## Target track profile (Vietnamese news shorts)

| #   | Style               | BPM     | Feel                          |
| --- | ------------------- | ------- | ----------------------------- |
| 01  | Corporate minimal   | 95–105  | Clean, neutral, authoritative |
| 02  | Documentary ambient | 80–90   | Cinematic, understated        |
| 03  | Uplifting news      | 110–120 | Positive, forward-moving      |
| 04  | Tense investigative | 85–95   | Dark, building tension        |
| 05  | Soft feature        | 75–85   | Warm, human-interest          |

## Search on TikTok

Use TikTok Creative Center → Sounds → filter by:

- Category: News, Corporate, Documentary
- No vocals (instrumental only)
- Duration > 30s
- High usage count = trending + algorithm-friendly

URL: https://ads.tiktok.com/business/creativecenter/music/pc/en

## Rules

- Instrumental only — no lyrics
- ≤ 120 BPM
- Must be at least 60s (pipeline loops/fades automatically)
- File naming: 01.mp3, 02.mp3, ..., 05.mp3 (leading zero, sequential)
