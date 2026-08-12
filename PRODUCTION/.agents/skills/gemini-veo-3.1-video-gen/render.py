"""CLI: render a Veo 3.1 video via Vertex AI.

Usage:
    # Text-to-video
    python render.py --prompt "A cat walks on a beach at sunset" --out output/cat.mp4

    # Image-to-video (first frame)
    python render.py --prompt "Camera slowly pulls back" --first-frame keyframe.jpg --out output/clip.mp4

    # First+last frame (Veo 3.1 only)
    python render.py --prompt "Smooth transition" --first-frame a.jpg --last-frame b.jpg --out output/morph.mp4

    # Higher quality (full 3.1, not Fast)
    python render.py --prompt "..." --model full --duration 8 --resolution 1080p --out output/hero.mp4
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from client import (
    MODEL_VEO_30,
    MODEL_VEO_31,
    MODEL_VEO_31_FAST,
    VeoVertexClient,
    VeoVertexError,
)

MODEL_ALIAS = {
    "fast": MODEL_VEO_31_FAST,
    "lite": MODEL_VEO_31_FAST,
    "full": MODEL_VEO_31,
    "3.1": MODEL_VEO_31,
    "3.0": MODEL_VEO_30,
}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Render a Veo 3.1 video via Vertex AI")
    p.add_argument("--prompt", required=True, help="Text prompt for the clip")
    p.add_argument("--out", required=True, help="Output mp4 path")
    p.add_argument("--model", default="3.0", choices=list(MODEL_ALIAS), help="Model tier (3.0 GA = default; 3.1 preview needs project allowlist)")
    p.add_argument("--duration", type=int, default=4, choices=[4, 6, 8])
    p.add_argument("--aspect", default="9:16", choices=["16:9", "9:16", "1:1"])
    p.add_argument("--resolution", default="720p", choices=["720p", "1080p"])
    p.add_argument("--first-frame", help="Path to starting keyframe image")
    p.add_argument("--last-frame", help="Path to ending keyframe image (Veo 3.1 only)")
    p.add_argument("--negative", help="Negative prompt")
    p.add_argument("--seed", type=int, help="Reproducibility seed")
    p.add_argument("--no-audio", action="store_true", help="Disable audio generation")
    p.add_argument(
        "--person",
        default="allow_adult",
        choices=["allow_adult", "allow_all", "dont_allow"],
    )
    p.add_argument("--gcs", help="gs://bucket/path/ — store output in GCS instead of inline")
    return p.parse_args()


async def main() -> int:
    args = parse_args()
    out_path = Path(args.out)
    model = MODEL_ALIAS[args.model]

    print(f"[render] model={model} duration={args.duration}s aspect={args.aspect} res={args.resolution}")
    print(f"[render] prompt: {args.prompt[:80]}{'...' if len(args.prompt) > 80 else ''}")
    if args.first_frame:
        print(f"[render] first_frame: {args.first_frame}")
    if args.last_frame:
        print(f"[render] last_frame:  {args.last_frame}")

    async with VeoVertexClient() as client:
        try:
            result = await client.generate_video(
                args.prompt,
                model=model,
                duration_seconds=args.duration,
                aspect_ratio=args.aspect,
                resolution=args.resolution,
                generate_audio=not args.no_audio,
                person_generation=args.person,
                first_frame=args.first_frame,
                last_frame=args.last_frame,
                negative_prompt=args.negative,
                seed=args.seed,
                storage_uri=args.gcs,
            )
        except VeoVertexError as e:
            print(f"[render] FAILED: {e}", file=sys.stderr)
            return 1

    print(f"[render] op:     {result.operation_name}")
    print(f"[render] took:   {result.generation_time_ms / 1000:.1f}s")

    if result.gcs_uri:
        print(f"[render] gcs:    {result.gcs_uri}")
        return 0

    written = await client.save_video(result, out_path)
    size_kb = written.stat().st_size / 1024
    print(f"[render] saved:  {written} ({size_kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
