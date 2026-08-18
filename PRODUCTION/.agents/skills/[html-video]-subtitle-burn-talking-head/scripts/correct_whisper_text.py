#!/usr/bin/env python3
"""Replace WhisperX word text with approved voice text while preserving timestamps."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


TIMECODE_LINE = re.compile(
    r"^\s*(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}\s+-->\s+(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}"
)


def tokens(text: str) -> list[str]:
    return re.findall(r"[0-9A-Za-zÀ-ỹ]+(?:['’\-][0-9A-Za-zÀ-ỹ]+)?", text, flags=re.IGNORECASE)


def approved_tokens(text: str) -> list[str]:
    content_lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if (
            not stripped
            or stripped.upper() == "WEBVTT"
            or stripped.isdigit()
            or TIMECODE_LINE.match(stripped)
        ):
            continue
        content_lines.append(re.sub(r"<[^>]+>", "", stripped))
    return tokens(" ".join(content_lines))


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: correct_whisper_text.py <approved.txt|approved.srt> <whisper-words.json> <corrected.json>", file=sys.stderr)
        return 2
    approved = approved_tokens(Path(sys.argv[1]).read_text(encoding="utf-8"))
    path = Path(sys.argv[2])
    words = json.loads(path.read_text(encoding="utf-8"))
    if len(approved) != len(words):
        print(f"approved/Whisper token count mismatch: {len(approved)} != {len(words)}; review before burn", file=sys.stderr)
        return 3
    for item, text in zip(words, approved):
        item["word"] = text
    Path(sys.argv[3]).write_text(json.dumps(words, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: corrected {len(words)} WhisperX word labels; timestamps unchanged")
    return 0


raise SystemExit(main())
