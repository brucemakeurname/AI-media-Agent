# Project DaVinci — Mission 30 ngày (10/08–08/09/2026)

## 1. Mục tiêu

### Nhiệm vụ 1 — Workflow Creative (30 ngày)

Build và productize 4 workflow AI Media mới để bất kỳ teammate AI Media nào cũng có thể chạy theo setup, input contract, prompt/template, SOP, QA checklist và failure log thống nhất:

1. Video Creative (Omni)
2. Video Clone
3. Summary HTML Video
4. Creative 2D

### Nhiệm vụ 2 — DaVinci Bot trên Lark (10/09–09/11/2026)

Chỉ sau khi các workflow trên đạt exit gate, tích hợp chúng vào Lark Task để DaVinci Bot nhận task, route, thực thi, trả status/preview/job log và bàn giao qua Human QA. Bot không tự publish output.

## 2. Thực trạng

### a. Những gì UltimateSup có hiện tại

- Tool, skill và prototype rời rạc; chưa có creative workflow end-to-end có thể bàn giao cho teammate.
- Google Flow shared tool và các prototype tham chiếu: `dttstk-lab/teaclonenonelab` (Read Video → Analyze → Storyboard → Obsidian), `dttstk-lab/tiktok-ads-diagnostics`.
- Kho workflow cá nhân chứa raw workflows cần pull/migrate vào project structure chuẩn hoá.
- Tính khả thi kỹ thuật đã được kiểm chứng; 30 ngày này là giai đoạn build, batch-run, đo và cải thiện, không phải feasibility research.

### b. Các workflow UltimateSup cần

- Video Creative: tạo video từ brief/script đến asset hoàn chỉnh.
- Video Clone: phân tích video tham chiếu, chuyển hoá góc triển khai và sản xuất biến thể hợp lệ.
- Summary HTML Video: chuyển article/script thành video HTML/animation có voice và hậu kỳ.
- Creative 2D: tạo hoặc clone/reverse-prompt asset 2D từ brief/reference.

## 3. Định hướng

| Workflow | Cơ chế | Techstack cần thiết |
|---|---|---|
| Video Creative | Brief/hook → visual direction → prompt/ref/shot list → render A-roll/B-roll → voice sync → hậu kỳ | Google Flow và tool render đã được duyệt; prompt/template; FFmpeg; voice layer có license; run log |
| Video Clone | URL/video → ingest hợp lệ → phân tích script/storyboard → paraphrase/re-angle → prompt pipeline → render → QA | Raw workflow cá nhân; `teaclonenonelab`/`tiktok-ads-diagnostics` làm tham chiếu; video analysis; FFmpeg; source-rights check |
| Summary HTML Video | Article/script → tách frame → HTML/CSS/JS hyperframe → render animation → voice/audio → hậu kỳ | HTML/CSS/JS; renderer được duyệt; FFmpeg; voice layer; template library |
| Creative 2D | Brief/reference → reverse prompt/style ref → render → select/retouch → QA | Image generation tool/API được duyệt; prompt library; asset/reference store; QA checklist |

Lớp dùng chung cho mọi workflow: project structure, input/output contract, setup guide, prompt/template, SOP, QA checklist, failure log và run log. Không thêm automation router hoặc Lark integration trong giai đoạn 30 ngày.

## 4. Kế hoạch 30 ngày

- **Ngày 1 — 10/08:** Chuẩn hoá project structure; kết nối tool/API; pull raw workflows từ kho workflow cá nhân; xác nhận nơi lưu asset/log.
- **Ngày 2–5 — 11/08–14/08:** Mỗi ngày refine 1 workflow theo thứ tự Video Creative, Video Clone, Summary HTML Video, Creative 2D.
- **Ngày 6–7 — 15/08–16/08:** Chuẩn hoá package chung và productize 4 workflow: setup, input/output, prompt/template, SOP, QA checklist, failure log và runnable sample.
- **Ngày 8–14 — 17/08–23/08:** Mỗi ngày tạo batch nội dung cho ngày kế tiếp từ các workflow đã build; ghi run log, QA result và failure case.
- **Ngày 15–21 — 24/08–30/08:** Thu thập dữ liệu từ video/batch; đánh giá current state của từng workflow; cải thiện logic, dataset, skill, prompt/template và QA gate.
- **Ngày 22–30 — 31/08–08/09:** Teammate-run pilot; đo success rate, cycle time, QA/rework và traceability; chốt exit gate cho Nhiệm vụ 2.
- **09/09:** Xác nhận kết quả/owner/quyền trước khi bắt đầu Nhiệm vụ 2 vào 10/09.

## 5. Đo lường, đánh giá

- **Build completeness:** 4/4 workflow có đủ setup, input/output contract, SOP, QA checklist, failure log và runnable sample.
- **Run success:** tỷ lệ batch hoàn thành có output đúng spec; phân loại theo lỗi prompt, render, voice, hậu kỳ hoặc input.
- **Cycle time:** median thời gian từ request hợp lệ đến preview/asset QA.
- **QA & rework:** tỷ lệ pass Human QA lần đầu, tỷ lệ cần sửa và lý do sửa.
- **Traceability:** 100% run có status `processing/done/failed`, preview, tham số chính và log.
- **Pilot readiness:** teammate ngoài người build chạy được bằng SOP; không cần hỗ trợ kỹ thuật ngoài các exception đã ghi.

## Ràng buộc

- Không đưa private brief, customer data hoặc thông tin sản phẩm chưa duyệt vào external tool.
- AI Voice chỉ dùng khi consent/license, mục đích dùng và quyền lưu trữ đã được duyệt.
- Mọi asset qua Human QA về visual, voice, brand, claim và file spec trước handoff/publish.
- Owner, quota/API access, job-log location và exit-gate approver: `TO CONFIRM`.
