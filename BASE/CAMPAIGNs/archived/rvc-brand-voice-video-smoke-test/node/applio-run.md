# Applio macOS Smoke Test

- Repository: `IAHispano/Applio`, cloned at workspace root as `Applio/`.
- Environment: Python 3.12, PyTorch 2.11.0, macOS arm64.
- Training: MPS, 9 clips derived from the 24.96-second brand reference, 10 epochs, 90 steps, RVC v2 / 40 kHz / HiFi-GAN.
- Feature extraction: contentvec embeddings and FCPE F0 on CPU.
- Inference: FCPE on CPU, pitch `0`, volume envelope `0.25`, protect `0.33`, index rate `0`.
- Retrieval finding: the generated Faiss index was valid but inference with `index_rate=0.75` terminated with native exit code `139`; it was deliberately not used in the delivery.
- Status: **REVIEW REQUIRED**. The source reference is too short for production-quality voice conversion.

## V2: 10-minute Reference

- Voice source: `BASE/BRAND KITs/voice/voice_1_male_10_mins.WAV` (`609.38s`, SHA-256 `8e71369a87044032cae653b7f332d9464265278d3a366e481423f5568d85880a`).
- Validation: stereo 44.1 kHz PCM, mean volume `-20.6 dB`, peak `-4.1 dB`, and no detected silence interval of five seconds or more.
- Training: 225 three-second clips; 224 valid records; MPS; 5 epochs; batch size 4; 285 steps; RVC v2 / 40 kHz / HiFi-GAN.
- Inference: FCPE on CPU with pitch `0`, volume envelope `0.25`, protect `0.33`, and index rate `0`.
- Retrieval finding remains unchanged: Faiss retrieval inference is not used because the macOS arm64 native path exits with code `139`.
- Status: **REVIEW REQUIRED**. This is a materially better dataset but still only a 5-epoch technical test, not a production-trained clone.
