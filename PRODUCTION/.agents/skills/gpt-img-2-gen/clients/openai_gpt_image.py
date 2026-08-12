"""GPT Image 2 client via OpenAI API directly.

CLI usage:
    python openai_gpt_image.py --prompt "..." --output "slide_01.png"
    python openai_gpt_image.py --prompt "..." --output "slide_01.png" --size "1024x1024"
    python openai_gpt_image.py --prompt "..." --output "slide_01.png" --reference "path/to/ref.jpg"
    python openai_gpt_image.py --prompt "..." --output "slide_01.png" --reference "ref1.jpg" "ref2.jpg" "logo.png"

OPENAI_API_KEY must be set in .env (Design Hub root) or in environment.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load .env (or .env.local) from the nearest ancestor dir that has one, walking up from this file
_here = Path(__file__).resolve()
for _parent in _here.parents:
    for _env_name in (".env", ".env.local"):
        _env = _parent / _env_name
        if _env.exists():
            load_dotenv(_env)
            break
    else:
        continue
    break

MODEL_ID = "gpt-image-2"

SIZE_OPTIONS = {
    "1:1": "1024x1024",
    "9:16": "1024x1792",
    "16:9": "1792x1024",
}

VALID_SIZES = {"1024x1024", "1024x1792", "1792x1024", "1536x1024", "1024x1536"}

# gpt-image-2 native large-output constraints (see split-4-image/SKILL.md): max edge <= 3840px,
# both edges a multiple of 16, aspect ratio <= 3:1, total pixels <= 8,294,400 (~8.3MP).
MAX_EDGE = 3840
MAX_PIXELS = 8_294_400
MAX_ASPECT_RATIO = 3.0


def _validate_size(size: str) -> None:
    if size in VALID_SIZES:
        return
    try:
        w_str, h_str = size.lower().split("x")
        w, h = int(w_str), int(h_str)
    except ValueError:
        raise ValueError(f"Invalid size '{size}'. Expected WIDTHxHEIGHT (e.g. 2880x2880).") from None
    if w <= 0 or h <= 0:
        raise ValueError(f"Invalid size '{size}'. Width/height must be positive.")
    if w > MAX_EDGE or h > MAX_EDGE:
        raise ValueError(f"Invalid size '{size}'. Max edge is {MAX_EDGE}px.")
    if w % 16 != 0 or h % 16 != 0:
        raise ValueError(f"Invalid size '{size}'. Both edges must be a multiple of 16.")
    if w * h > MAX_PIXELS:
        raise ValueError(f"Invalid size '{size}'. Total pixels {w * h} exceeds max {MAX_PIXELS}.")
    if max(w, h) / min(w, h) > MAX_ASPECT_RATIO:
        raise ValueError(f"Invalid size '{size}'. Aspect ratio exceeds {MAX_ASPECT_RATIO}:1.")


@dataclass
class ImageResponse:
    image_url: str | None
    output_path: str | None
    generation_time_ms: int
    model: str


class GPTImage2Client:
    """Thin client for GPT Image 2 via OpenAI API."""

    def __init__(self, api_key: str | None = None) -> None:
        key = api_key or os.environ.get("OPENAI_API_KEY")
        if not key:
            raise ValueError("OPENAI_API_KEY not set — add to .env (Design Hub root) or pass --openai-key")
        self._client = OpenAI(api_key=key)

    def generate(
        self,
        prompt: str,
        *,
        size: str = "1024x1024",
        reference_image_paths: list[str] | None = None,
        output_path: str | Path | None = None,
    ) -> ImageResponse:
        """Generate an image and optionally save to disk.

        Without --reference: calls /images/generations (text-to-image).
        With --reference: calls /images/edits (style anchor for carousel consistency).
        Supports up to 16 reference images per the OpenAI edits endpoint (image[] array).

        Args:
            prompt: Plain text or JSON-stringified NBP prompt.
            size: One of VALID_SIZES.
            reference_image_paths: Local paths to reference images (e.g. slide 1, logo, product shot).
            output_path: If given, save the result here.

        Returns:
            ImageResponse with local path if saved.
        """
        _validate_size(size)

        refs = [p for p in (reference_image_paths or []) if Path(p).exists()]
        if refs and len(refs) > 16:
            raise ValueError(f"OpenAI edits endpoint accepts at most 16 reference images, got {len(refs)}")

        t0 = time.perf_counter()

        if refs:
            # Edits mode — anchors visual style/subjects to reference image(s)
            ref_files = [open(p, "rb") for p in refs]
            try:
                result = self._client.images.edit(
                    model=MODEL_ID,
                    image=ref_files,
                    prompt=prompt,
                    size=size,
                )
            finally:
                for f in ref_files:
                    f.close()
        else:
            # Standard generation
            result = self._client.images.generate(
                model=MODEL_ID,
                prompt=prompt,
                size=size,
            )

        elapsed = int((time.perf_counter() - t0) * 1000)

        items = result.data
        if not items:
            raise RuntimeError(f"No images returned. Full response: {result}")

        item = items[0]
        saved_path = None

        if output_path:
            out = Path(output_path)
            out.parent.mkdir(parents=True, exist_ok=True)

            if item.b64_json:
                out.write_bytes(base64.b64decode(item.b64_json))
            elif item.url:
                import urllib.request
                urllib.request.urlretrieve(item.url, out)
            else:
                raise RuntimeError("Response has neither b64_json nor url")

            saved_path = str(out)

        return ImageResponse(
            image_url=getattr(item, "url", None),
            output_path=saved_path,
            generation_time_ms=elapsed,
            model=MODEL_ID,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="GPT Image 2 via OpenAI API")
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--output", required=True, help="Output file path (.png or .jpg)")
    parser.add_argument(
        "--size",
        default="1024x1024",
        help="Image dimensions WIDTHxHEIGHT (e.g. 1024x1024, or 2880x2880 for split-4-image native)",
    )
    parser.add_argument(
        "--aspect-ratio",
        choices=["1:1", "9:16", "16:9"],
        help="Shorthand for size (overrides --size)",
    )
    parser.add_argument(
        "--reference",
        nargs="+",
        help="Path(s) to reference image(s) for visual continuity — pass multiple paths for style + subject + logo refs (max 16)",
    )
    parser.add_argument("--openai-key", help="OpenAI API key (defaults to OPENAI_API_KEY in .env)")
    args = parser.parse_args()

    size = SIZE_OPTIONS.get(args.aspect_ratio, args.size) if args.aspect_ratio else args.size

    client = GPTImage2Client(api_key=args.openai_key)
    resp = client.generate(
        args.prompt,
        size=size,
        reference_image_paths=args.reference,
        output_path=args.output,
    )

    print(json.dumps({
        "output": resp.output_path,
        "generation_time_ms": resp.generation_time_ms,
        "model": resp.model,
    }, indent=2))


if __name__ == "__main__":
    main()
