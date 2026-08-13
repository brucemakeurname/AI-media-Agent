# Handoff Report — Flowkit Execution & Issue Log

**Date:** 2026-08-13  
**Unit:** `BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-13`  
**Topic:** Mutant Big Greens — Smoothie making with banana and chestnut  

---

## 1. Vấn đề gặp phải với Flowkit

| Bước | Kết quả | Vấn đề / Chi tiết |
|---|---|---|
| **Khởi động Flowkit** | Thành công | Ban đầu port `127.0.0.1:8100` chưa hoạt động. Sau khi chạy `python -m agent.main`, Flowkit agent và Chrome Extension đã kết nối thành công (`PAYGATE_TIER_TWO`). |
| **Tạo Project, Refs & Upload Packshot** | Thành công | Đã tạo project, upload packshot chuẩn Mutant Big Greens (lấy được `media_id`), sinh ref creator/kitchen/ingredients và thumbnail scene. |
| **Gửi Omni Video (10s + 8s)** | Gửi thành công | Flowkit/Google Flow đã nhận 2 Omni reference-to-video requests, trả về workflow name và primary media IDs hợp lệ, tài khoản đã trừ credit. |
| **Poll / Tải Omni Output** | Thất bại | Lệnh `GET /api/flow/media/<primaryMediaId>` liên tục trả lỗi `400 INVALID_ARGUMENT` ("Request contains an invalid argument"), không nhận được `encodedVideo` base64 để lưu file MP4. |
| **Upscale 1080p** | Chưa thực hiện | Do không lấy được raw video MP4 720p nên chưa thể thực hiện bước upscale 1080p bắt buộc. |
| **Fallback queue `GENERATE_VIDEO_REFS`** | Không ổn định | Worker báo `Requested entity was not found`; hệ thống có tự động re-upload ref và retry nhưng chưa kịp sinh ra video hoàn chỉnh trước khi dừng. |

### Hệ quả & Trạng thái hiện tại
- Thư mục `node/scenes/` chưa có video `.mp4` hoàn chỉnh.
- Chưa thể thực hiện ghép thoại Applio TTS, mixing audio background, burn subtitle, prepend thumbnail 1-frame, hay publish Notion & tạo `manifest.json`.
- **Các thành phẩm đã hoàn thành & bảo toàn:** `caption.md`, `node/creative-brief.md`, `node/script-tts.txt`, `node/shooting-script.md`, `node/ugc-sequence-script.md` (đạt 7/7 Realism 7T), bộ file thoại Applio tại `node/timing/` cùng `timing-lock.json`, và file `thumbnail.jpg`.

---

## 2. Nhật ký các bước thực hiện (Timeline)

1. **14:17** — Khởi động local Flowkit agent bằng `python -m agent.main` tại `http://127.0.0.1:8100`, xác nhận WebSocket kết nối thành công với Chrome Extension.
2. **14:17** — Kiểm tra endpoint `/health` (`extension_connected: true`) và danh sách `/api/materials`; xác nhận chọn style `realistic`.
3. **14:18** — Tạo project Flowkit `Mutant Big Greens Smoothie — 2026-08-13` cùng record video 2 scene dọc (9:16).
4. **14:18 - 14:24** — Upload packshot chính thức Mutant Big Greens lấy `media_id`; tạo và generate reference images cho creator, kitchen, ingredients và ly smoothie.
5. **14:25 - 14:32** — Upload 2 keyframes clone (`candidate_01.jpg`, `candidate_05.jpg`) làm visual anchors; tải scene image từ Flowkit về làm `thumbnail.jpg` (đạt kích thước chuẩn 768x1376).
6. **14:33 - 14:40** — Tạo 2 scene records và gửi request Omni reference-to-video (Scene 1: 10s, Scene 2: 8s; mỗi scene dùng 3 refs gồm creator, packshot và keyframe clone).
7. **14:40 - 14:45** — Omni trả về workflow/primary media IDs (`52031fc0...` và `4c0dc033...`). Tuy nhiên, quá trình poll `GET /api/flow/media/<media-id>` bị từ chối với lỗi `400 INVALID_ARGUMENT`, không thu được dữ liệu video.
8. **14:45 - 14:48** — Thử nghiệm các hướng phục hồi: kiểm tra raw endpoint, gán lại `IMAGE_USAGE_TYPE_ASSET`, chuyển hướng sang batch queue `GENERATE_VIDEO_REFS`. Worker báo lỗi entity reference và tự động re-upload ref để retry.
9. **14:49** — Nhận yêu cầu dừng từ người dùng: Gửi tín hiệu `SIGINT` tắt tiến trình Flowkit agent, chấm dứt toàn bộ request gửi/generate mới lên Flowkit.
