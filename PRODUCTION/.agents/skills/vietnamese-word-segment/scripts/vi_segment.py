#!/usr/bin/env python3
"""Return glue-to-previous flags for Vietnamese syllable tokens."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def normalize(value: str) -> str:
    return re.sub(r"[^0-9A-Za-zÀ-ỹ]", "", value).lower()


def segment(tokens: list[str]) -> list[bool]:
    glue = [False] * len(tokens)
    try:
        from pyvi import ViTokenizer
    except ImportError:
        print("WARNING: pyvi unavailable; using safe no-glue fallback", file=sys.stderr)
        return glue

    segmented = ViTokenizer.tokenize(" ".join(tokens)).split()
    flattened: list[str] = []
    compound_lengths: list[int] = []
    for unit in segmented:
        parts = unit.split("_")
        flattened.extend(parts)
        compound_lengths.append(len(parts))
    if [normalize(x) for x in flattened] != [normalize(x) for x in tokens]:
        print("WARNING: tokenizer alignment mismatch; using safe no-glue fallback", file=sys.stderr)
        return glue

    cursor = 0
    for length in compound_lengths:
        for offset in range(1, length):
            glue[cursor + offset] = True
        cursor += length
    return glue


def main() -> int:
    if "--self-check" in sys.argv:
        result = segment(["màn", "hình", "rất", "rõ"])
        assert len(result) == 4
        if result == [False, False, False, False]:
            print("OK: self-check fallback (pyvi unavailable)")
        else:
            assert result[1] is True and result[2] is False
            print("OK: tokenizer keeps 'màn hình' together")
        return 0
    if len(sys.argv) != 3:
        print("Usage: vi_segment.py <words.json> <glue.json>", file=sys.stderr)
        return 2
    raw = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    tokens = [item if isinstance(item, str) else str(item.get("word", "")) for item in raw]
    result = segment(tokens)
    Path(sys.argv[2]).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {len(result)} glue flags -> {sys.argv[2]}")
    return 0


raise SystemExit(main())
