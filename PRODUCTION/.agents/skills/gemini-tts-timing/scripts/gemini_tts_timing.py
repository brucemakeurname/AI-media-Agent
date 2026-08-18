#!/usr/bin/env python3
"""Generate per-line Google Gemini TTS audio and a measured timing lock."""

from __future__ import annotations

import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path


def load_env_key() -> str:
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"].strip()

    # Try finding env.local up the directory tree
    curr = Path.cwd()
    for _ in range(5):
        env_local = curr / "env.local"
        if env_local.is_file():
            for line in env_local.read_text(encoding="utf-8").splitlines():
                if line.startswith("GEMINI_API_KEY="):
                    val = line.split("=", 1)[1].strip()
                    if val:
                        return val
        if curr.parent == curr:
            break
        curr = curr.parent
    raise RuntimeError("GEMINI_API_KEY not found in environment or env.local")


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


def synthesize_line(api_key: str, model: str, text: str, out_wav_path: Path, voice_name: str = "Puck", max_retries: int = 5) -> None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    ffmpeg = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg") or "/Users/test/miniforge3/envs/flowkit/bin/ffmpeg"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"Speak in a natural, energetic Singapore Singlish gym bro tone: {text}"}
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "voiceName": voice_name
                }
            }
        }
    }

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                parts = res["candidates"][0]["content"]["parts"]
                pcm_data = None
                for p in parts:
                    if "inlineData" in p:
                        pcm_data = base64.b64decode(p["inlineData"]["data"])
                        break
                if not pcm_data:
                    raise RuntimeError(f"No audio data returned for text: {text}")

                temp_pcm = out_wav_path.with_suffix(".pcm")
                temp_raw_wav = out_wav_path.with_suffix(".raw.wav")
                temp_pcm.write_bytes(pcm_data)

                # Convert PCM to WAV
                subprocess.run(
                    [ffmpeg, "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(temp_pcm), str(temp_raw_wav)],
                    check=True,
                    capture_output=True
                )
                if temp_pcm.exists():
                    temp_pcm.unlink()

                # Trim leading/trailing silence
                subprocess.run(
                    [
                        ffmpeg, "-y", "-i", str(temp_raw_wav),
                        "-af", "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-40dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-40dB:detection=peak,areverse",
                        str(out_wav_path)
                    ],
                    check=True,
                    capture_output=True
                )
                if temp_raw_wav.exists():
                    temp_raw_wav.unlink()
                return
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 10 * (attempt + 1)
                print(f"  Rate limited (429), waiting {wait_time}s...", file=sys.stderr)
                time.sleep(wait_time)
            else:
                raise e


def get_duration(path: Path) -> float:
    ffprobe = os.environ.get("FFPROBE_BIN") or shutil.which("ffprobe") or "/Users/test/miniforge3/envs/flowkit/bin/ffprobe"
    res = subprocess.run(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
        check=True,
        capture_output=True,
        text=True
    )
    return float(res.stdout.strip())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("lines_json", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--model", default="gemini-2.5-flash-preview-tts")
    parser.add_argument("--voice", default="Puck")
    args = parser.parse_args()

    api_key = load_env_key()
    lines = load_lines(args.lines_json)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    locked_lines = []
    cursor = 0.0

    for index, line in enumerate(lines, start=1):
        out_path = args.output_dir / f"{line['id']}.wav"
        print(f"Synthesizing {line['id']}: {line['text']}...")
        synthesize_line(api_key, args.model, line["text"], out_path, voice_name=args.voice)
        dur = get_duration(out_path)
        locked_lines.append({
            "id": line["id"],
            "text": line["text"],
            "spoken_text": line["text"],
            "audio": str(out_path),
            "duration_sec": round(dur, 3),
            "in_sec": round(cursor, 3),
            "out_sec": round(cursor + dur, 3)
        })
        cursor += dur
        if index < len(lines):
            time.sleep(4)

    lock = {
        "engine": "google-gemini-tts",
        "model": args.model,
        "voice": args.voice,
        "measured_dialogue_duration_sec": round(cursor, 3),
        "lines": locked_lines
    }
    (args.output_dir / "timing-lock.json").write_text(
        json.dumps(lock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"OK: {len(locked_lines)} Google Gemini TTS lines, {cursor:.3f}s -> {args.output_dir / 'timing-lock.json'}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"gemini-tts-timing failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
