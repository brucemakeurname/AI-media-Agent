# Run Notes

- RVC clone: `RVC/` at the workspace root, checked out from `RVC-Project/Retrieval-based-Voice-Conversion-WebUI`.
- Environment: `RVC/.venv` with Python 3.12 on macOS arm64.
- RVC's current official instructions target Python 3.12 x64 on Windows/Linux. This local CPU run is a compatibility smoke test.
- Training data is a working copy of the brand reference, never the source file itself.
- Training uses 10 epochs because the reference is only 24.96 seconds. RVC recommends at least 10 minutes of low-noise speech for useful voice quality.
- Alternate implementation: `PRODUCTION/video_module/Applio/`, commit `b9c0ccb`. Training completed on Apple Silicon MPS with 9 three-second clips, 10 epochs, and 90 steps.
- Applio feature extraction and inference use FCPE on CPU. The Faiss retrieval-index inference path exited with native crash code 139, so the delivered Applio output has `index_rate=0`.
