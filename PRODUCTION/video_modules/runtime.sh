#!/usr/bin/env bash
set -euo pipefail

if [ -n "${BASH_SOURCE:-}" ]; then
  RUNTIME_SOURCE="${BASH_SOURCE[0]}"
elif [ -n "${ZSH_VERSION:-}" ]; then
  RUNTIME_SOURCE="${(%):-%x}"
else
  RUNTIME_SOURCE="$0"
fi
VIDEO_MODULES_ROOT="$(cd "$(dirname "$RUNTIME_SOURCE")" && pwd)"
export VIDEO_MODULES_ROOT
export INFRA_ROOT="$(cd "$VIDEO_MODULES_ROOT/../.." && pwd)"
export FLOWKIT_ROOT="$VIDEO_MODULES_ROOT/flowkit"
export FLOWKIT_PYTHON="$FLOWKIT_ROOT/.venv/bin/python"
export F5_TTS_ROOT="$VIDEO_MODULES_ROOT/F5-TTS"
export F5_TTS_PYTHON="$F5_TTS_ROOT/.venv/bin/python"
export WHISPERX_PYTHON="$VIDEO_MODULES_ROOT/hyperframes/.venv-tools/bin/python"
export WHISPERX_MODULE_ROOT="$VIDEO_MODULES_ROOT/WhisperX"
export WHISPERX_MODEL_ROOT="$WHISPERX_MODULE_ROOT/models"
export WHISPERX_ASR_MODEL="$WHISPERX_MODEL_ROOT/asr-large-v3"
export WHISPERX_ALIGN_MODEL="$WHISPERX_MODEL_ROOT/align-vi-vlsp2020"
export WHISPER_LOCAL_FILES_ONLY="1"
export WATERMARK_BIN="$VIDEO_MODULES_ROOT/VeoWatermarkRemover/GeminiWatermarkTool-Video"
export AUDIO_TSX="$INFRA_ROOT/PRODUCTION/.agents/skills/[html-video]-audio-mix/scripts/node_modules/.bin/tsx"
export SUBTITLE_TSX="$INFRA_ROOT/PRODUCTION/.agents/skills/[html-video]-subtitle-burn-talking-head/scripts/node_modules/.bin/tsx"
export FFMPEG_BIN="${FFMPEG_BIN:-$VIDEO_MODULES_ROOT/hyperframes/.venv-tools/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1}"

if [ ! -x "$FFMPEG_BIN" ]; then
  FFMPEG_BIN="$(command -v ffmpeg || true)"
  export FFMPEG_BIN
fi

if [ -z "${FFPROBE_BIN:-}" ] && command -v ffprobe >/dev/null 2>&1; then
  export FFPROBE_BIN="$(command -v ffprobe)"
fi
