"""Slice one large image into N tiles (default 2x2 = 4) for split-grid social posts.

Usage:
    python slice.py --input base.png --out-dir ./out --rows 2 --cols 2 --prefix slide
"""
import argparse
import os

from PIL import Image


def slice_image(path, out_dir, rows, cols, prefix):
    img = Image.open(path).convert("RGB")
    W, H = img.size
    tw, th = W // cols, H // rows
    os.makedirs(out_dir, exist_ok=True)
    paths = []
    n = 1
    for r in range(rows):
        for c in range(cols):
            box = (c * tw, r * th, (c + 1) * tw, (r + 1) * th)
            tile = img.crop(box)
            p = os.path.join(out_dir, f"{prefix}_{n}.jpg")
            tile.save(p, "JPEG", quality=95)
            paths.append(p)
            n += 1
    return paths


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--rows", type=int, default=2)
    ap.add_argument("--cols", type=int, default=2)
    ap.add_argument("--prefix", default="slide")
    a = ap.parse_args()
    for p in slice_image(a.input, a.out_dir, a.rows, a.cols, a.prefix):
        print(p)
