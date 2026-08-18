# WhisperX Local Model Pack

Install and verify the models without the WhisperX CLI:

```bash
source ../runtime.sh
"$WHISPERX_PYTHON" PRODUCTION/video_modules/WhisperX/install_models.py
```

The pack contains `faster-whisper-large-v3` for Vietnamese word timestamps and
`nguyenvulebinh/wav2vec2-base-vi-vlsp2020` for optional WhisperX forced alignment. Production
subtitle transcription uses the Python API with local files only.
