#!/usr/bin/env python3
"""
combine_analysis.py

Merges Gemini 2.5 Flash audio detections with WhisperX word timestamps to produce
precise exclude_regions, then updates analysis.json.

Run from any directory:
  python scripts/combine_analysis.py
"""

import json
import re
import sys
from pathlib import Path

PROJECT = Path("D:/1. SOLOFLOWS/5. INFRASTRUCTURE/INHOUSE TEAMS/2. Media Team/5. Video Hub/top-heading-editing/Test/proj_teleprompter_01")

def w(s):
    sys.stdout.buffer.write((s + "\n").encode("utf-8"))

def load_json(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def save_json(p, data):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Gap discovery helpers
# ---------------------------------------------------------------------------

def get_gaps(words, min_dur=0.4):
    """Return all inter-word gaps >= min_dur as list of dicts."""
    gaps = []
    for i in range(len(words) - 1):
        gap_start = words[i]["end"]
        gap_end   = words[i + 1]["start"]
        dur = gap_end - gap_start
        if dur >= min_dur:
            gaps.append({
                "idx_before": i,
                "idx_after":  i + 1,
                "word_before": words[i]["word"],
                "word_after":  words[i + 1]["word"],
                "gap_start":  round(gap_start, 3),
                "gap_end":    round(gap_end,   3),
                "duration":   round(dur,        3),
            })
    return gaps

def nearest_gap_before(gaps, target_time, window=5.0):
    """
    Return the gap closest to target_time that straddles or precedes it.
    The gap's gap_start must be before target_time + 0.5s (false start gap can
    end slightly after the scaled keep_from estimate due to calibration error).
    """
    candidates = [g for g in gaps if g["gap_start"] <= target_time + 0.5
                                  and g["gap_start"] >= target_time - window]
    if not candidates:
        return None
    # Prefer the gap whose start is closest to target_time (latest qualifying gap)
    return max(candidates, key=lambda g: g["gap_start"])

def scale_gemini(g_time):
    """
    Gemini 2.5 Flash timestamps are compressed relative to actual audio time.
    Calibrated from three anchors:
      g=3.55  -> actual=13.24s  (WhisperX "why" at 13.237)   scale=3.73
      g=11.95 -> actual=47.07s  (WhisperX "If"  at 47.071)   scale=3.94
      g=22.30 -> actual=98.06s  (existing analysis anchor)    scale=4.40
    Linear interpolation between anchors.
    """
    if g_time <= 0:
        return 0.0
    anchors = [(0.0, 0.0), (3.55, 13.24), (11.95, 47.07), (22.30, 98.06)]
    for i in range(len(anchors) - 1):
        g0, a0 = anchors[i]
        g1, a1 = anchors[i + 1]
        if g0 <= g_time <= g1:
            t = (g_time - g0) / (g1 - g0)
            return a0 + t * (a1 - a0)
    # Beyond last anchor: extrapolate with last slope
    g0, a0 = anchors[-2]
    g1, a1 = anchors[-1]
    slope = (a1 - a0) / (g1 - g0)
    return a1 + (g_time - g1) * slope


# ---------------------------------------------------------------------------
# Main analysis
# ---------------------------------------------------------------------------

def main():
    transcript = load_json(PROJECT / "logs/transcript.json")
    gemini     = load_json(PROJECT / "logs/gemini_analysis.json")
    analysis   = load_json(PROJECT / "logs/analysis.json")

    words = transcript["words"]
    gaps  = get_gaps(words, min_dur=0.4)

    # ---- Print all significant gaps for reference ----
    w("=== WhisperX gaps >= 0.4s ===")
    for g in gaps:
        w(f"  {g['word_before']}[end={g['gap_start']:.3f}] --(gap {g['duration']:.3f}s)-> {g['word_after']}[start={g['gap_end']:.3f}]")

    # ---- Map Gemini issues -> exclude regions ----
    w("\n=== Gemini issue mapping ===")
    computed_regions = []

    for issue in gemini:
        itype   = issue["type"]
        g_from  = issue["from"]
        g_keep  = issue.get("keep_from")
        desc    = issue.get("description", "")

        actual_from = scale_gemini(g_from)
        actual_keep = scale_gemini(g_keep) if g_keep is not None else None

        w(f"\n[{itype}] Gemini {g_from:.1f}s  desc: {desc}")
        w(f"  -> actual_from~{actual_from:.2f}s  actual_keep~{actual_keep:.2f}s" if actual_keep is not None
          else f"  -> actual_from~{actual_from:.2f}s  keep_from=null")

        if itype == "false_start" and g_keep is not None:
            # Find the gap that immediately precedes the clean restart word
            gap = nearest_gap_before(gaps, actual_keep, window=5.0)
            if gap and gap["duration"] >= 0.4:
                w(f"  anchor gap: {gap['word_before']}[{gap['gap_start']:.3f}] -> {gap['word_after']}[{gap['gap_end']:.3f}]  dur={gap['duration']:.3f}s")

                # Special handling: pre-speech silence (no words before gap)
                if gap["idx_before"] == 0 and gap["gap_start"] < 3.0:
                    # Extend the pre-speech exclusion to cover false start
                    excl_from = 0.0
                    excl_to   = round(gap["gap_end"] - 0.1, 3)  # end 0.1s before clean word
                    w(f"  => PRE-SPEECH: exclude 0.0 -> {excl_to:.3f}")
                    computed_regions.append({
                        "source": "footage/main.mp4",
                        "from": excl_from,
                        "to": excl_to,
                        "reason": "false_start+silence",
                        "note": f"pre-speech dead air + false start: {desc}"
                    })
                else:
                    # Cut the gap region (false start content lives inside the gap)
                    # Use a 0.05s buffer on each side for clean cuts
                    excl_from = round(gap["gap_start"] + 0.05, 3)
                    excl_to   = round(gap["gap_end"]   - 0.05, 3)

                    # For large gaps (>1.0s transition gaps), also shorten to 0.3s natural pause
                    if gap["duration"] > 1.0:
                        # Keep 0.3s of breathing room before the clean word
                        excl_from = round(gap["gap_start"] + 0.2, 3)
                        excl_to   = round(gap["gap_end"]   - 0.32, 3)

                    if excl_to > excl_from:
                        w(f"  => EXCLUDE {excl_from:.3f} -> {excl_to:.3f}")
                        computed_regions.append({
                            "source": "footage/main.mp4",
                            "from": excl_from,
                            "to": excl_to,
                            "reason": "false_start",
                            "note": f"{desc}"
                        })
                    else:
                        w(f"  SKIP: computed region inverted ({excl_from} >= {excl_to})")
            else:
                w(f"  SKIP: no qualifying gap found near {actual_keep:.2f}s")

        elif itype == "repeat" and g_keep is not None:
            # Check if this repeat region is already covered by an existing exclusion.
            # A repeat is "covered" when any existing region starts at or before
            # actual_from and ends at or after actual_from.
            covered = any(
                r["from"] <= actual_from + 1.0 and r["to"] >= actual_from - 1.0
                for r in analysis.get("exclude_regions", [])
            )
            if covered:
                w(f"  SKIP: already covered by existing exclude_region")
            else:
                w(f"  NOTE: repeat not in existing regions — check manually")

        elif itype == "stumble" and g_keep is None:
            # Stumbles without a clean restart point: don't cut
            # WhisperX likely captured the correct word; cutting without precise bounds risks
            # removing good audio.
            w(f"  SKIP: stumble with keep_from=null — no safe cut boundary")

        else:
            w(f"  SKIP: {itype} unhandled combination")

    # ---- Build final exclude_regions ----
    # Start from existing analysis.json regions
    existing = list(analysis.get("exclude_regions", []))

    # Update pre-speech exclusion: extend to 2.0s to cover false start
    for r in existing:
        if r.get("from", -1) == 0.0 and r.get("to", 0) < 2.1:
            old_to = r["to"]
            r["to"] = 2.0
            r["note"] = r.get("note", "") + f" [extended from {old_to} to 2.0 — false start 'Everyone is']"
            w(f"\n[existing region update] pre-speech: to={old_to} -> 2.0")

    # Filter out pre-speech regions from computed (already handled above)
    new_regions = [r for r in computed_regions if r["from"] > 0.1]

    all_regions = existing + new_regions
    all_regions.sort(key=lambda r: r["from"])

    # Merge overlapping/adjacent regions (within 0.3s of each other)
    merged = []
    for r in all_regions:
        if merged and r["from"] <= merged[-1]["to"] + 0.3:
            old = merged[-1]
            old["to"] = max(old["to"], r["to"])
            old["note"] = old.get("note", "") + " | " + r.get("note", "")
        else:
            merged.append(dict(r))

    w("\n=== Final exclude_regions ===")
    total_cut = 0.0
    for r in merged:
        dur = r["to"] - r["from"]
        total_cut += dur
        w(f"  [{r['from']:.3f} -> {r['to']:.3f}]  dur={dur:.3f}s  [{r['reason']}]  {r.get('note','')[:90]}")

    source_dur = analysis.get("source_duration", 125.67)
    w(f"\nTotal cut: {total_cut:.2f}s / {source_dur:.2f}s source  ({100*total_cut/source_dur:.1f}%)")
    w(f"Clean duration after Phase 0: {source_dur - total_cut:.2f}s")

    if total_cut / source_dur > 0.40:
        w("\nWARNING: >40% of source duration excluded — review before proceeding")

    # Write updated analysis.json
    analysis["exclude_regions"] = merged
    save_json(PROJECT / "logs/analysis.json", analysis)
    w("\nanalysis.json updated.")


if __name__ == "__main__":
    main()
