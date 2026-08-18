#!/usr/bin/env python3
"""Generate per-line local F5-TTS audio and a measured timing lock."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


TIMECODE_LINE = re.compile(
    r"^\s*(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}\s+-->\s+(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}"
)


def duration_seconds(path: Path) -> float:
    try:
        import soundfile as sf

        return float(sf.info(str(path)).duration)
    except Exception:
        ffprobe = os.environ.get("FFPROBE_BIN") or shutil.which("ffprobe")
        if not ffprobe:
            raise RuntimeError("soundfile could not read generated audio and ffprobe is unavailable")
        result = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
            check=True,
            capture_output=True,
            text=True,
        )
        return float(result.stdout.strip())


def load_lines(path: Path) -> list[dict[str, str]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    lines = []
    for index, item in enumerate(raw, start=1):
        if isinstance(item, str):
            text = item.strip()
            line_id = f"line_{index:02d}"
        else:
            text = str(item.get("text", "")).strip()
            line_id = str(item.get("id", f"line_{index:02d}"))
        if not text:
            raise ValueError(f"empty dialogue at index {index}")
        lines.append({"id": line_id, "text": text})
    if not lines:
        raise ValueError("lines.json contains no dialogue")
    return lines


def plain_reference_text(text: str) -> str:
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if (
            not stripped
            or stripped.upper() == "WEBVTT"
            or stripped.isdigit()
            or TIMECODE_LINE.match(stripped)
        ):
            continue
        lines.append(re.sub(r"<[^>]+>", "", stripped))
    return " ".join(lines)


def make_tts(model_name: str, device: str | None):
    import soundfile as sf
    import torch
    import torchaudio

    def load_audio(uri, *args, channels_first=True, **kwargs):
        samples, sample_rate = sf.read(str(uri), dtype="float32", always_2d=True)
        waveform = torch.from_numpy(samples.T.copy())
        return waveform if channels_first else waveform.transpose(0, 1), sample_rate

    torchaudio.load = load_audio
    try:
        from f5_tts.api import F5TTS
    except ImportError as exc:
        raise RuntimeError("f5_tts is unavailable; run this script with the local F5-TTS Python environment") from exc
    kwargs = {"model": model_name}
    if device:
        kwargs["device"] = device
    return F5TTS(**kwargs)


def synthesize(tts, ref_audio: Path, ref_text: str, text: str, output: Path, seed: int) -> None:
    result = tts.infer(ref_file=str(ref_audio), ref_text=ref_text, gen_text=text, file_wave=str(output), seed=seed)
    if output.exists() and output.stat().st_size > 0:
        return
    if not result or len(result) < 2:
        raise RuntimeError(f"F5-TTS returned no audio for {output.name}")
    import soundfile as sf

    sf.write(str(output), result[0], result[1])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("lines_json", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--ref-audio", required=True, type=Path)
    parser.add_argument("--ref-text-file", required=True, type=Path)
    parser.add_argument("--model", default="F5TTS_v1_Base")
    parser.add_argument("--device", default=None)
    parser.add_argument("--seed", default=42, type=int)
    args = parser.parse_args()

    if not 0 <= args.seed <= 4_294_967_295:
        raise ValueError("--seed must be between 0 and 4294967295")

    lines = load_lines(args.lines_json)
    if not args.ref_audio.is_file():
        raise FileNotFoundError(args.ref_audio)
    ref_text = plain_reference_text(args.ref_text_file.read_text(encoding="utf-8"))
    if not ref_text:
        raise ValueError("reference transcript is empty")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    tts = make_tts(args.model, args.device)

    locked_lines = []
    cursor = 0.0
    for index, line in enumerate(lines, start=1):
        audio_path = args.output_dir / f"line_{index:02d}.wav"
        synthesize(tts, args.ref_audio, ref_text, line["text"], audio_path, args.seed)
        duration = duration_seconds(audio_path)
        locked_lines.append(
            {
                "id": line["id"],
                "text": line["text"],
                "spoken_text": line["text"],
                "audio": str(audio_path),
                "duration_sec": round(duration, 3),
                "in_sec": round(cursor, 3),
                "out_sec": round(cursor + duration, 3),
            }
        )
        cursor += duration

    lock = {
        "engine": "f5-tts-local",
        "model": args.model,
        "device": args.device or "auto",
        "seed": args.seed,
        "reference_audio": str(args.ref_audio),
        "reference_text": str(args.ref_text_file),
        "measured_dialogue_duration_sec": round(cursor, 3),
        "lines": locked_lines,
    }
    (args.output_dir / "timing-lock.json").write_text(
        json.dumps(lock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"OK: {len(locked_lines)} F5-TTS lines, {cursor:.3f}s -> {args.output_dir / 'timing-lock.json'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"f5-tts-timing failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
