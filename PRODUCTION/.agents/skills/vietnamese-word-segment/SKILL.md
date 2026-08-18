---
name: vietnamese-word-segment
description: Tokenize Vietnamese Whisper words into compound-word glue flags for subtitle segmentation.
---

# vietnamese-word-segment

Vietnamese orthography separates syllables with spaces, so subtitle logic must tokenize before
counting words. This helper uses `pyvi.ViTokenizer` and returns a boolean mask where
`glue_prev[i] = true` means token `i` stays attached to token `i - 1`.

```bash
python scripts/vi_segment.py words.json glue.json
python scripts/vi_segment.py --self-check
```

If `pyvi` is unavailable, the helper returns an all-false mask and exits successfully with a
warning. Install the optional dependency with `python -m pip install -r requirements.txt` before
production; the consumer still enforces the hard maximum of 5 visible tokens.

## Contract

- Preserve WhisperX timestamps; segmentation changes grouping only.
- Never split a tokenizer compound; if a compound does not fit, put it in its own burst.
- The consumer must enforce `MAX_TOKENS=5` after compound grouping.
