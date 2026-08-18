#!/usr/bin/env python3
"""Download and verify the local WhisperX ASR and Vietnamese alignment pack."""

from __future__ import annotations

import json
from pathlib import Path

from faster_whisper import WhisperModel
from faster_whisper.utils import download_model
from huggingface_hub import snapshot_download
from whisperx import load_align_model


MODULE_ROOT = Path(__file__).resolve().parent
MODEL_ROOT = MODULE_ROOT / "models"
ASR_ROOT = MODEL_ROOT / "asr-large-v3"
ALIGN_ROOT = MODEL_ROOT / "align-vi-vlsp2020"
ALIGN_REPO = "nguyenvulebinh/wav2vec2-base-vi-vlsp2020"


def main() -> int:
    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    download_model("large-v3", output_dir=str(ASR_ROOT))
    snapshot_download(ALIGN_REPO, local_dir=str(ALIGN_ROOT))

    WhisperModel(str(ASR_ROOT), device="cpu", compute_type="int8", local_files_only=True)
    load_align_model(
        language_code="vi",
        device="cpu",
        model_name=str(ALIGN_ROOT),
        model_dir=str(ALIGN_ROOT),
        model_cache_only=True,
    )

    manifest = {
        "engine": "whisperx-python-api",
        "asr": {
            "repo": "Systran/faster-whisper-large-v3",
            "path": str(ASR_ROOT),
        },
        "alignment": {
            "repo": ALIGN_REPO,
            "language": "vi",
            "path": str(ALIGN_ROOT),
        },
        "local_files_only": True,
    }
    (MODEL_ROOT / "model-pack.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"OK: WhisperX model pack -> {MODEL_ROOT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
