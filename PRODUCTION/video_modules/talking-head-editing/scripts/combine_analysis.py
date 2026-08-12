#!/usr/bin/env python3
"""
combine_analysis.py
Phase 0 — Merge Gemini 2.5 Flash audio detections with WhisperX word timestamps
           to produce precise exclude_regions. Updates logs/analysis.json.

Gemini timestamps are non-linearly compressed vs actual audio time.
This script calibrates Gemini against WhisperX anchors (3-point linear interpolation)
before computing cut boundaries.

Usage:
  python scripts/combine_analysis.py <project_path>

Reads:
  logs/transcript.json        (WhisperX on original source)
  logs/gemini_analysis.json   (Gemini 2.5 Flash issue detections)
  logs/analysis.json          (master config with existing exclude_regions)

Writes:
  logs/analysis.json          (updated with merged exclude_regions)

After running: review printed output, then run Phase 0 FFmpeg cuts manually
or via the agent (this script only updates analysis.json, does not execute cuts).
"""

import json
import sys
from pathlib import Path


def w(s):
    sys.stdout.buffer.write((s + "\n").encode("utf-8"))


def load_json(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def save_json(p, data):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_gaps(words, min_dur=0.4):
    """Return all inter-word gaps >= min_dur."""
    gaps = []
    for i in range(len(words) - 1):
        gap_start = words[i]["end"]
        gap_end   = words[i + 1]["start"]
        dur = gap_end - gap_start
        if dur >= min_dur:
            gaps.append({
                "idx_before":  i,
                "idx_after":   i + 1,
                "word_before": words[i]["word"],
                "word_after":  words[i + 1]["word"],
                "gap_start":   round(gap_start, 3),
                "gap_end":     round(gap_end, 3),
                "duration":    round(dur, 3),
            })
    return gaps


def nearest_gap_before(gaps, target_time, window=5.0):
    """Return the gap closest to target_time that precedes it (within window)."""
    candidates = [g for g in gaps
                  if g["gap_start"] <= target_time + 0.5
                  and g["gap_start"] >= target_time - window]
    if not candidates:
        return None
    return max(candidates, key=lambda g: g["gap_start"])


def scale_gemini(g_time, anchors):
    """
    Gemini timestamps are compressed vs actual audio time.
    anchors: list of (gemini_time, actual_time) tuples — at least 3 points.
    Performs piecewise linear interpolation.
    Calibrate by finding 3 known words in WhisperX and matching to Gemini output.
    """
    if g_time <= 0:
        return 0.0
    for i in range(len(anchors) - 1):
        g0, a0 = anchors[i]
        g1, a1 = anchors[i + 1]
        if g0 <= g_time <= g1:
            t = (g_time - g0) / (g1 - g0)
            return a0 + t * (a1 - a0)
    # Extrapolate beyond last anchor
    g0, a0 = anchors[-2]
    g1, a1 = anchors[-1]
    slope = (a1 - a0) / (g1 - g0)
    return a1 + (g_time - g1) * slope


def main():
    if len(sys.argv) < 2:
        w("Usage: python combine_analysis.py <project_path>")
        sys.exit(1)

    PROJECT = Path(sys.argv[1])

    transcript = load_json(PROJECT / "logs/transcript.json")
    gemini     = load_json(PROJECT / "logs/gemini_analysis.json")
    analysis   = load_json(PROJECT / "logs/analysis.json")

    words = transcript.get("words", [])
    gaps  = get_gaps(words, min_dur=0.4)

    # ── Calibration anchors ──────────────────────────────────────────────────
    # Edit these for each new project:
    # Find 3 words in gemini_analysis output with known WhisperX timestamps.
    # Format: [(gemini_time, whisperx_actual_time), ...]
    # Default anchors from proj_teleprompter_01 — REPLACE for new projects.
    anchors = analysis.get("gemini_calibration_anchors", [
        [0.0,   0.0],
        [3.55,  13.24],
        [11.95, 47.07],
        [22.30, 98.06],
    ])
    w(f"Calibration anchors: {anchors}")

    # ── Print gaps for reference ─────────────────────────────────────────────
    w("\n=== WhisperX gaps >= 0.4s ===")
    for g in gaps:
        w(f"  {g['word_before']}[end={g['gap_start']:.3f}] --(gap {g['duration']:.3f}s)-> {g['word_after']}[start={g['gap_end']:.3f}]")

    # ── Map Gemini issues → exclude regions ──────────────────────────────────
    w("\n=== Gemini issue mapping ===")
    computed_regions = []

    for issue in gemini:
        itype  = issue["type"]
        g_from = issue["from"]
        g_keep = issue.get("keep_from")
        desc   = issue.get("description", "")

        actual_from = scale_gemini(g_from, anchors)
        actual_keep = scale_gemini(g_keep, anchors) if g_keep is not None else None

        w(f"\n[{itype}] Gemini {g_from:.1f}s  desc: {desc}")
        if actual_keep is not None:
            w(f"  -> actual_from~{actual_from:.2f}s  actual_keep~{actual_keep:.2f}s")
        else:
            w(f"  -> actual_from~{actual_from:.2f}s  keep_from=null")

        if itype == "false_start" and g_keep is not None:
            gap = nearest_gap_before(gaps, actual_keep, window=5.0)
            if gap and gap["duration"] >= 0.4:
                w(f"  anchor gap: {gap['word_before']}[{gap['gap_start']:.3f}] -> {gap['word_after']}[{gap['gap_end']:.3f}]  dur={gap['duration']:.3f}s")

                if gap["idx_before"] == 0 and gap["gap_start"] < 3.0:
                    excl_from = 0.0
                    excl_to   = round(gap["gap_end"] - 0.1, 3)
                    w(f"  => PRE-SPEECH: exclude 0.0 -> {excl_to:.3f}")
                    computed_regions.append({
                        "from": excl_from, "to": excl_to,
                        "reason": "false_start+silence",
                        "note": f"pre-speech + false start: {desc}",
                    })
                else:
                    excl_from = round(gap["gap_start"] + 0.05, 3)
                    excl_to   = round(gap["gap_end"]   - 0.05, 3)
                    if gap["duration"] > 1.0:
                        excl_from = round(gap["gap_start"] + 0.2,  3)
                        excl_to   = round(gap["gap_end"]   - 0.32, 3)
                    if excl_to > excl_from:
                        w(f"  => EXCLUDE {excl_from:.3f} -> {excl_to:.3f}")
                        computed_regions.append({
                            "from": excl_from, "to": excl_to,
                            "reason": "false_start",
                            "note": desc,
                        })
                    else:
                        w(f"  SKIP: inverted region ({excl_from} >= {excl_to})")
            else:
                w(f"  SKIP: no qualifying gap found near {actual_keep:.2f}s")

        elif itype == "repeat" and g_keep is not None:
            covered = any(
                r["from"] <= actual_from + 1.0 and r["to"] >= actual_from - 1.0
                for r in analysis.get("exclude_regions", [])
            )
            if covered:
                w(f"  SKIP: already covered by existing exclude_region")
            else:
                w(f"  NOTE: repeat not covered — review manually")

        elif itype == "stumble" and g_keep is None:
            w(f"  SKIP: stumble with keep_from=null — no safe cut boundary")

        else:
            w(f"  SKIP: {itype} unhandled")

    # ── Merge with existing regions ──────────────────────────────────────────
    existing   = list(analysis.get("exclude_regions", []))
    new_regions = [r for r in computed_regions if r["from"] > 0.1]
    all_regions = existing + new_regions
    all_regions.sort(key=lambda r: r["from"])

    merged = []
    for r in all_regions:
        if merged and r["from"] <= merged[-1]["to"] + 0.3:
            merged[-1]["to"]   = max(merged[-1]["to"], r["to"])
            merged[-1]["note"] = merged[-1].get("note", "") + " | " + r.get("note", "")
        else:
            merged.append(dict(r))

    w("\n=== Final exclude_regions ===")
    total_cut = 0.0
    for r in merged:
        dur = r["to"] - r["from"]
        total_cut += dur
        w(f"  [{r['from']:.3f} -> {r['to']:.3f}]  dur={dur:.3f}s  [{r['reason']}]  {r.get('note','')[:90]}")

    source_dur = analysis.get("source_duration", 0)
    if source_dur:
        w(f"\nTotal cut: {total_cut:.2f}s / {source_dur:.2f}s  ({100*total_cut/source_dur:.1f}%)")
        w(f"Clean duration after Phase 0: {source_dur - total_cut:.2f}s")
        if total_cut / source_dur > 0.40:
            w("\nWARNING: >40% of source excluded — review before proceeding")

    analysis["exclude_regions"] = merged
    save_json(PROJECT / "logs/analysis.json", analysis)
    w("\nanalysis.json updated.")


if __name__ == "__main__":
    main()
