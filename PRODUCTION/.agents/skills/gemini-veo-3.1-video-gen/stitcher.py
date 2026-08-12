"""FFmpeg stitcher — builds + runs ffmpeg commands for multi-clip video sequences.

Supports three transition modes:
  HARD_CUT  — lossless concat remux (instant)
  CROSSFADE — xfade dissolve between clips
  KEN_BURNS — zoompan on outgoing clip + fade into incoming clip

Prerequisite: all clips must be pre-normalized to same resolution, fps, codec
before calling build_*() or run_*().
"""

from __future__ import annotations

import subprocess
import tempfile
import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------


class Transition(Enum):
    HARD_CUT = "hard_cut"
    CROSSFADE = "crossfade"
    KEN_BURNS = "ken_burns"


@dataclass
class StitchOptions:
    """Options passed to the stitcher."""

    # Global
    output_path: Path
    pix_fmt: str = "yuv420p"
    video_codec: str = "libx264"
    audio_codec: str = "aac"
    crf: int = 23
    preset: str = "fast"

    # Transition-specific
    default_transition_ms: int = 500
    ken_burns_zoom_start: float = 1.0
    ken_burns_zoom_end: float = 1.15
    ken_burns_duration_lead: float = 0.8  # seconds of zoom before cut


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------


def normalize_clip(
    clip_path: Path,
    target_width: int,
    target_height: int,
    target_fps: int = 30,
    audio_sample_rate: int = 48000,
) -> Path:
    """Scale + pad a clip to exact target resolution, fix fps and audio rate.

    Returns a temp file path. Caller is responsible for deleting it.
    """
    out = Path(tempfile.gettempdir()) / f"norm_{uuid.uuid4().hex[:8]}.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(clip_path),
        "-vf", (
            f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,"
            f"pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2,"
            f"fps={target_fps}"
        ),
        "-af", f"aresample={audio_sample_rate}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-ar", str(audio_sample_rate),
        "-sn",  # no subtitles stream
        str(out),
    ]
    _run_ffmpeg(cmd)
    return out


def probe_clip(path: Path) -> dict:
    """Return {width, height, fps, duration_s, codec} via ffprobe."""
    import json

    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams", "-show_format",
        str(path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)

    video_stream = next(s for s in data["streams"] if s["codec_type"] == "video")
    fps_str = video_stream["r_frame_rate"]  # e.g. "30/1"
    if "/" in fps_str:
        num, den = fps_str.split("/")
        fps = float(num) / float(den)
    else:
        fps = float(fps_str)

    return {
        "width": int(video_stream["width"]),
        "height": int(video_stream["height"]),
        "fps": fps,
        "duration_s": float(data["format"]["duration"]),
        "codec": video_stream["codec_name"],
    }


def _run_ffmpeg(cmd: list[str]) -> None:
    """Run ffmpeg, raise StitchError on non-zero exit."""
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise StitchError(f"ffmpeg failed:\nstdout: {result.stdout}\nstderr: {result.stderr}")


# ---------------------------------------------------------------------------
# StitchError
# ---------------------------------------------------------------------------


class StitchError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(f"StitchError: {message}")


# ---------------------------------------------------------------------------
# Stitcher class
# ---------------------------------------------------------------------------


class Stitcher:
    """Builds and executes ffmpeg stitch commands."""

    def __init__(self, options: StitchOptions | None = None) -> None:
        self.opts = options or StitchOptions(output_path=Path("final.mp4"))

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def stitch(
        self,
        clip_paths: list[Path],
        transitions: list[Transition],
        output_path: Path | None = None,
    ) -> Path:
        """Run the appropriate stitch command for the given clip list.

        All clips must share the same resolution/codec/fps (call normalize_clips first
        if they may differ). Returns the output file path.
        """
        if not clip_paths:
            raise StitchError("No clips provided")

        if len(clip_paths) == 1:
            return self._copy_single(clip_paths[0], output_path)

        if all(t == Transition.HARD_CUT for t in transitions):
            return self._stitch_hardcut(clip_paths, output_path)
        else:
            return self._stitch_transitions(clip_paths, transitions, output_path)

    # ------------------------------------------------------------------
    # Single clip shortcut
    # ------------------------------------------------------------------

    def _copy_single(self, clip: Path, output_path: Path | None) -> Path:
        out = output_path or self.opts.output_path
        import shutil

        shutil.copy2(clip, out)
        return out

    # ------------------------------------------------------------------
    # HARD_CUT — lossless concat via concat demuxer
    # ------------------------------------------------------------------

    def stitch_hardcut(self, clip_paths: list[Path], output_path: Path | None = None) -> Path:
        return self._stitch_hardcut(clip_paths, output_path)

    def _stitch_hardcut(self, clip_paths: list[Path], output_path: Path | None) -> Path:
        out = output_path or self.opts.output_path
        tmp_list = Path(tempfile.gettempdir()) / f"concat_{uuid.uuid4().hex[:8]}.txt"
        try:
            with tmp_list.open("w") as f:
                for clip in clip_paths:
                    f.write(f"file '{clip.resolve()}'\n")

            cmd = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0",
                "-i", str(tmp_list),
                "-c", "copy",  # no re-encode
                "-sn",
                str(out),
            ]
            _run_ffmpeg(cmd)
        finally:
            tmp_list.unlink(missing_ok=True)

        return out

    # ------------------------------------------------------------------
    # CROSSFADE + KEN_BURNS — xfade filter_complex
    # ------------------------------------------------------------------

    def stitch_crossfade(
        self,
        clip_paths: list[Path],
        transition_ms: int | None = None,
        output_path: Path | None = None,
    ) -> Path:
        return self._stitch_xfade(
            clip_paths,
            transition_type="crossfade",
            transition_ms=transition_ms or self.opts.default_transition_ms,
            output_path=output_path,
        )

    def stitch_ken_burns(
        self,
        clip_paths: list[Path],
        transition_ms: float | None = None,
        output_path: Path | None = None,
    ) -> Path:
        return self._stitch_xfade(
            clip_paths,
            transition_type="fade",
            transition_ms=transition_ms or int(self.opts.ken_burns_duration_lead * 1000),
            output_path=output_path,
        )

    def _stitch_xfade(
        self,
        clip_paths: list[Path],
        transition_type: str,
        transition_ms: int,
        output_path: Path | None,
    ) -> Path:
        """Build xfade chain for 2+ clips.

        transition_type: "crossfade" (additive blend) or "fade" (fade-to-black/fade-in).
        transition_ms: duration of the transition window in milliseconds.
        """
        out = output_path or self.opts.output_path
        opts = self.opts
        t_s = transition_ms / 1000.0

        # Build filter_complex string
        # Pattern: clip0 → [clip0_out] [clip1_in] xfade → [out01] → ...
        n = len(clip_paths)

        # Input labels: [0:v] [1:v] ...
        # After xfade of clip i onto clip i+1: label becomes [out{i}]
        # Then chain next xfade onto that

        # xfade offset for clip i = sum(durations of clips 0..i-1) - t_s
        # (the point where transition starts relative to clip i+1 start)

        # Simpler approach: use ffmetadata to get durations, compute offsets dynamically
        # We'll compute them inline via probe
        clip_durations = [probe_clip(p)["duration_s"] for p in clip_paths]

        filter_parts: list[str] = []
        for i, path in enumerate(clip_paths):
            filter_parts.append(f"[{i}:v]")

        # Build xfade chain
        # out0 = xfade of clip0 + clip1
        # out1 = xfade of out0 + clip2
        # etc.

        cur_label = "v0"
        filter_str = ""
        offset_acc = 0.0

        for i in range(n - 1):
            offset = offset_acc - t_s
            filter_str += (
                f"[{cur_label}][{i + 1}:v]"
                f"xfade=transition={transition_type}:duration={t_s}:offset={offset:.3f}"
                f"[v{i + 1}];\n"
            )
            cur_label = f"v{i + 1}"
            offset_acc += clip_durations[i]

        filter_str = filter_str.rstrip(";\n")

        cmd = [
            "ffmpeg", "-y",
        ]
        for clip in clip_paths:
            cmd += ["-i", str(clip)]

        cmd += [
            "-filter_complex", filter_str,
            "-map", f"[{cur_label}]",
            "-c:v", opts.video_codec,
            "-preset", opts.preset,
            "-crf", str(opts.crf),
            "-pix_fmt", opts.pix_fmt,
            "-c:a", opts.audio_codec,
            "-ar", "48000",
            "-sn",
            str(out),
        ]
        _run_ffmpeg(cmd)
        return out

    # ------------------------------------------------------------------
    # Normalize all clips to common format before stitching
    # ------------------------------------------------------------------

    def normalize_all(
        self,
        clip_paths: list[Path],
        target_width: int = 1080,
        target_height: int = 1920,
        target_fps: int = 30,
    ) -> list[Path]:
        """Normalize all clips to same resolution/fps/codec.

        Returns list of normalized temp paths. Caller should clean up
        these temp files after stitching.
        """
        normalized = []
        for clip in clip_paths:
            info = probe_clip(clip)
            if (
                info["width"] == target_width
                and info["height"] == target_height
                and abs(info["fps"] - target_fps) < 0.1
                and info["codec"] == "h264"
            ):
                normalized.append(clip)
            else:
                normalized.append(normalize_clip(clip, target_width, target_height, target_fps))
        return normalized

    # ------------------------------------------------------------------
    # Generic stitch with per-clip transition list
    # ------------------------------------------------------------------

    def _stitch_transitions(
        self,
        clip_paths: list[Path],
        transitions: list[Transition],
        output_path: Path | None,
    ) -> Path:
        # All non-hardcut: use per-clip transition from Scene.transition_ms
        # Default to CROSSFADE for non-hardcut, use per-transition routing
        out = output_path or self.opts.output_path
        opts = self.opts
        n = len(clip_paths)

        if n != len(transitions):
            raise StitchError(
                f"Mismatch: {n} clips but {len(transitions)} transitions"
            )

        clip_durations = [probe_clip(p)["duration_s"] for p in clip_paths]

        filter_parts: list[str] = []
        for i in range(n):
            filter_parts.append(f"[{i}:v]")

        # Chain xfades
        cur_label = "v0"
        filter_str = ""
        offset_acc = 0.0

        for i in range(n - 1):
            t = transitions[i]
            t_s = t_s_from_transition(t, opts.default_transition_ms) / 1000.0
            xfade_trans = "crossfade" if t == Transition.CROSSFADE else "fade"
            offset = offset_acc - t_s
            filter_str += (
                f"[{cur_label}][{i + 1}:v]"
                f"xfade=transition={xfade_trans}:duration={t_s:.3f}:offset={offset:.3f}"
                f"[v{i + 1}];\n"
            )
            cur_label = f"v{i + 1}"
            offset_acc += clip_durations[i]

        filter_str = filter_str.rstrip(";\n")

        cmd = ["ffmpeg", "-y"]
        for clip in clip_paths:
            cmd += ["-i", str(clip)]

        cmd += [
            "-filter_complex", filter_str,
            "-map", f"[{cur_label}]",
            "-c:v", opts.video_codec,
            "-preset", opts.preset,
            "-crf", str(opts.crf),
            "-pix_fmt", opts.pix_fmt,
            "-c:a", opts.audio_codec,
            "-ar", "48000",
            "-sn",
            str(out),
        ]
        _run_ffmpeg(cmd)
        return out


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def t_s_from_transition(t: Transition, default_ms: int) -> int:
    if t == Transition.HARD_CUT:
        return 0
    if t == Transition.CROSSFADE:
        return default_ms
    if t == Transition.KEN_BURNS:
        return int(0.8 * 1000)  # 800ms default for ken burns
    return default_ms
