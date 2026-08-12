"""Keyword search across LLM-Wiki + brand knowledge roots.

Prints ranked files with a matching snippet. Retrieval is keyword-based (no embeddings) —
pass a few meaningful terms, not a whole sentence.

Usage:
    python search.py --query "Bruce tiktok voice tone" [--roots p1 p2] [--top 8]
"""
import argparse
import os
import re
import sys

# Windows consoles default to cp1252; wiki files are UTF-8 (with BOM) + Vietnamese.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

DEFAULT_ROOTS = [
    "D:/1. SOLOFLOWS/INHOUSE TEAMS/4. Marketing Team/03. LLM_Wiki",
    "D:/1. SOLOFLOWS/BASE/BRAND KITs",
    "D:/1. SOLOFLOWS/BASE/STRATEGIES",
]
EXT = (".md", ".txt")


def score(text, terms):
    t = text.lower()
    return sum(t.count(term) for term in terms)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--query", required=True)
    ap.add_argument("--roots", nargs="*", default=DEFAULT_ROOTS)
    ap.add_argument("--top", type=int, default=8)
    a = ap.parse_args()

    terms = [w.lower() for w in re.findall(r"\w+", a.query) if len(w) > 2]
    if not terms:
        print("no usable search terms"); return

    hits = []
    for root in a.roots:
        for dp, _, files in os.walk(root):
            norm = dp.replace("\\", "/")
            if "node_modules" in norm or "/.obsidian" in norm:
                continue
            for fn in files:
                if not fn.lower().endswith(EXT):
                    continue
                p = os.path.join(dp, fn)
                try:
                    with open(p, encoding="utf-8", errors="ignore") as f:
                        text = f.read()
                except OSError:
                    continue
                sc = score(text, terms)
                if sc:
                    hits.append((sc, p, text))

    hits.sort(reverse=True, key=lambda x: x[0])
    for sc, p, text in hits[: a.top]:
        snippet = ""
        for line in text.splitlines():
            if any(t in line.lower() for t in terms):
                snippet = line.strip()[:200]
                break
        print(f"[{sc}] {p}\n    {snippet}")


if __name__ == "__main__":
    main()
