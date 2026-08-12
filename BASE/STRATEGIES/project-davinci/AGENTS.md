# Context — Project DaVinci

## Mục đích & Lộ trình 2 Nhiệm vụ

Project DaVinci triển khai theo 2 nhiệm vụ chiến lược, xây dựng hệ thống AI Media end-to-end cho UltimateSup Singapore:
1. **Nhiệm vụ 1 (Ngắn hạn - 1 tháng / 30 ngày):** Xây dựng và productize hoàn chỉnh 4 creative workflow để bất kỳ ai trong team AI Media cũng tự thực thi được.
2. **Nhiệm vụ 2 (Dài hạn - 2 tháng / 10/09–09/11/2026):** Tích hợp các workflow đã đạt chuẩn lên Lark Task, tạo **DaVinci Bot** chính thức đảm nhiệm task AI Media của UltimateSup workspace.

Nhân sự giữ vai trò tối ưu workflow, thu thập dataset và kiểm duyệt QA; Bot/Agent không được tự publish output.

## Lịch trình 30 ngày Nhiệm vụ 1

- **7 ngày đầu (Build & Productize):**
  - *Ngày 1:* Chuẩn hoá project structure, kết nối các tool/API và pull các raw workflows từ kho workflow cá nhân.
  - *Ngày 2–5:* Mỗi ngày refine hoàn chỉnh 1 workflow (Video Creative, Video Clone, Summary HTML Video, Creative 2D).
  - *Ngày 6–7:* Đóng gói productize, hoàn thiện setup, prompt template, SOP, QA checklist và failure log.
- **7 ngày kế tiếp (Batch Production):** Tạo batch nội dung từ các workflows đã build cho ngày kế tiếp.
- **7 ngày tiếp theo (Data & Optimization):** Thu thập dữ liệu từ các video đã phát hành/thử nghiệm, đánh giá thực trạng workflow và cải thiện.
- **9 ngày cuối (Teammate Pilot & Exit Gate):** Teammate-run pilot, đo lường success rate và chốt điều kiện sẵn sàng tích hợp Lark Bot.

## Workflow mục tiêu cần build

1. **Video Creative (Omni):** Brief/Hook → Visual Direction → Prompt Ref/Shot list → Render A-roll/B-roll → Voice Sync → Hậu kỳ.
2. **Video Clone:** URL/Video đầu vào → Phân tích storyboard/script → Paraphrase/Re-angle → Prompt pipeline → Render Omni.
3. **Summary HTML Video:** Bài viết/Script → Phân tách frame/HTML hyperframe → Render HTML animation → Voice/Audio → Hậu kỳ.
4. **Creative 2D:** Image brief/Clone asset → Reverse prompt/Style ref → Render 2D asset → Human QA.

## An toàn và phê duyệt

- AI Voice (F5-TTS, VoxCPM2, RVC, Applio) yêu cầu có consent/license, mục đích sử dụng và quyền lưu trữ được duyệt.
- Dữ liệu khách hàng, brief riêng tư và thông tin sản phẩm chưa duyệt không đưa lên external tool công cộng.
- 100% asset phải qua Human QA trước handoff hoặc publish.
- Log failure case theo loại: prompt, render, voice, hậu kỳ, routing, input.

## Artefact chính

- Kế hoạch chính thức: `node/02-Project-DaVinci-August-2026.docx`.
- Specs, dataset notes, QA report, failure log lưu tại `node/`; cập nhật `manifest.json` khi thêm output.
