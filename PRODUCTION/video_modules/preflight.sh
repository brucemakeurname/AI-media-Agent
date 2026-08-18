#!/usr/bin/env bash
set -euo pipefail

MODULES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$MODULES_DIR/runtime.sh"

failures=0
require_exec() {
  if [ ! -x "$1" ]; then
    printf 'MISSING: %s\n' "$1" >&2
    failures=$((failures + 1))
  else
    printf 'OK: %s\n' "$1"
  fi
}

require_exec "$FLOWKIT_PYTHON"
require_exec "$WHISPERX_PYTHON"
require_exec "$WATERMARK_BIN"
require_exec "$AUDIO_TSX"
require_exec "$SUBTITLE_TSX"
require_exec "$FFMPEG_BIN"

if "$WHISPERX_PYTHON" -c 'import faster_whisper, pyvi; print("WhisperX/pyvi import ok")'; then :; else failures=$((failures + 1)); fi
if (cd "$FLOWKIT_ROOT" && "$FLOWKIT_PYTHON" -c 'import agent; print("Flowkit agent import ok")'); then :; else failures=$((failures + 1)); fi
if "$WATERMARK_BIN" --version >/dev/null 2>&1; then printf 'OK: watermark remover\n'; else printf 'FAIL: watermark remover\n' >&2; failures=$((failures + 1)); fi
if "$WHISPERX_PYTHON" "$INFRA_ROOT/PRODUCTION/.agents/skills/vietnamese-word-segment/scripts/vi_segment.py" --self-check >/dev/null; then printf 'OK: Vietnamese tokenizer\n'; else printf 'FAIL: Vietnamese tokenizer\n' >&2; failures=$((failures + 1)); fi

applio_model="$(find "$VIDEO_MODULES_ROOT/Applio/logs" -name '*.pth' -print -quit 2>/dev/null || true)"
if [ -n "$applio_model" ]; then printf 'OK: Applio model\n'; else printf 'MISSING: Applio model\n' >&2; failures=$((failures + 1)); fi
sfx_count="$(find "$INFRA_ROOT/PRODUCTION/.agents/skills/[html-video]-audio-mix/scripts/assets/sfx" -type f 2>/dev/null | wc -l | tr -d ' ')"
bgm_count="$(find "$INFRA_ROOT/PRODUCTION/.agents/skills/[html-video]-audio-mix/scripts/assets/bgm" -type f 2>/dev/null | wc -l | tr -d ' ')"
if [ "$sfx_count" -gt 0 ] && [ "$bgm_count" -gt 0 ]; then printf 'OK: SFX/BGM library (%s/%s files)\n' "$sfx_count" "$bgm_count"; else printf 'MISSING: SFX/BGM library\n' >&2; failures=$((failures + 1)); fi

if [ -f "$WHISPERX_ASR_MODEL/model.bin" ] && [ -f "$WHISPERX_ASR_MODEL/config.json" ]; then
  printf 'OK: WhisperX ASR model pack\n'
else
  printf 'MISSING: WhisperX ASR model pack\n' >&2
  failures=$((failures + 1))
fi
align_weights="$(find "$WHISPERX_ALIGN_MODEL" -maxdepth 1 \( -name '*.bin' -o -name '*.safetensors' \) -print -quit 2>/dev/null || true)"
if [ -f "$WHISPERX_ALIGN_MODEL/config.json" ] && [ -n "$align_weights" ]; then
  printf 'OK: WhisperX Vietnamese alignment pack\n'
else
  printf 'MISSING: WhisperX Vietnamese alignment pack\n' >&2
  failures=$((failures + 1))
fi

health="$(curl -fsS --max-time 10 http://127.0.0.1:8100/health 2>/dev/null || true)"
if printf '%s' "$health" | rg -q '"extension_connected"[[:space:]]*:[[:space:]]*true'; then
  printf 'OK: Flowkit extension connected\n'
else
  printf 'FAIL: Flowkit health/extension (%s)\n' "${health:-unreachable}" >&2
  failures=$((failures + 1))
fi

if [ "$failures" -gt 0 ]; then
  printf 'Preflight failed: %s check(s)\n' "$failures" >&2
  exit 1
fi
printf 'Preflight passed\n'
