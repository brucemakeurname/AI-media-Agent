#!/usr/bin/env python3
"""Upscale a downloaded video into a 1080x1920 portrait canvas with ffmpeg."""

from __future__ import annotations

import shutil
import subprocess
import sys
import os
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: upscale_video.py <input.mp4> <output.mp4>", file=sys.stderr)
        return 2
    source, output = map(Path, sys.argv[1:])
    if not source.is_file() or source.resolve() == output.resolve():
        print("input must exist and output must be a different path", file=sys.stderr)
        return 2
    ffmpeg = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg")
    if ffmpeg is None:
        print("ffmpeg not found", file=sys.stderr)
        return 1
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            ffmpeg, "-y", "-i", str(source),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(output),
        ],
        check=True,
    )
    if not output.is_file() or output.stat().st_size == 0:
        raise RuntimeError(f"ffmpeg produced no output: {output}")
    print(f"OK: {output}")
    return 0


raise SystemExit(main())
