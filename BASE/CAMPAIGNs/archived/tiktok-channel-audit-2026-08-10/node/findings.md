# Findings

## Highest observed play count

- **Video:** [Curious about the magic of daily Creatine use?](https://www.tiktok.com/@ultimatesupsingapore/video/7319931383072312583)
- **Published:** 2024-01-03 17:52 UTC
- **Metrics observed:** 2,900,000 plays; 132,000 likes; 721 comments; 4,093 shares.
- **Method:** 1,000 profile-scraper records ranked by `playCount` descending. The profile metadata in the crawl reports 974 videos.

## Compliance note

The historical caption includes outcome-oriented creatine language. Do not reuse its claims without checking the current approved product label/listing and campaign approval.

## Media download execution

- **Downloaded sets:** Top 20 non-slideshow videos by play count + 30 most recent non-slideshow videos.
- **File counts:** 20 files in `videos/top-20/` + 30 files in `videos/recent-30/`.
- **Validation:** 50/50 files confirmed as valid MP4 binaries (`totalBytes: 365,119,188`).
- **Traceability:** Full list mapped by rank and video ID in `node/download-report.json`.
