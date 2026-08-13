# AI VIDEO CREATIVE WORKFLOWS — Architecture & Handoff Setup

**Handoff date:** 2026-08-13  
**Primary workflow authority:** `/Users/test/Documents/AI Media/Hoài Nam/INFRA/PRODUCTION/goal/[social]_[ai-ugc-short-video].md`  
**Repository-relative authority:** `PRODUCTION/goal/[social]_[ai-ugc-short-video].md`

## 1. Mục Đích Bàn Giao

Hệ thống này chuyển một brief đã có trên Notion thành video AI UGC hoàn chỉnh, có thể truy vết từ dữ liệu đầu vào đến file MP4 cuối:

```text
UltimateSup Notion Post + linked Campaign
  → Ticket.md + node/GOAL.md
  → shooting script + locked timing/audio
  → JSON Omni sequence prompts + character references
  → Google Flow Omni clips + mandatory 1080p upscale
  → Applio voice sync + subtitle + BGM/SFX + frame-0 thumbnail
  → final MP4 + manifest.json + optional Notion writeback
```

Sơ đồ thao tác chi tiết đính kèm riêng: `AI-VIDEO-CREATIVE-WORKFLOW-DIAGRAM.png`.

## 2. Thành Phần Kiến Trúc

| Layer | Thành phần | Chức năng | Contract bàn giao |
| --- | --- | --- | --- |
| Workspace governance | `AGENTS.md`, `BASE/BASE-STRUCTURE.md`, `PRODUCTION/AGENT.md` | Quy tắc Singapore/claim safety, quyền role, vị trí lưu file, cấu hình runtime | Mọi output tuân thủ `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`. |
| Input interface | [UltimateSup Notion database/page](https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link) | Nguồn brief, audience, product/claim, visual concept, reference URL, CTA | User được cấp quyền đọc Notion và key API local. |
| Workflow compiler | `notion2goal` | Pull field từ Notion, chọn goal theo `Visual Type`, tạo `Ticket.md` và `node/GOAL.md` | Không còn placeholder; thiếu/mâu thuẫn field thì dừng và ghi blocker. |
| Instruction workflow | `PRODUCTION/goal/[social]_[ai-ugc-short-video].md` | Điều phối role theo thứ tự: content → designer → video-editor → publisher | `node/GOAL.md` là prompt đã fill; `Ticket.md` là brief/claim authority. |
| Content module | `write-shooting-script`, `write-ai-ugc-video-sequence-script`, `tea-ugc-ai-realism` | Viết shooting script, lock timing/audio, tạo JSON Omni và cải thiện realism visual | `node/shooting-script.md`, `node/timing/`, `node/ugc-sequence-script.md`. |
| Design module | `photography-direction`, `creative-direction`, `acad-image-gen`, FlowKit refs | Tạo character/product references và thumbnail | Reference assets trong `node/`; `thumbnail.jpg` tại root campaign. |
| Video module | `PRODUCTION/video_modules/flowkit` + Google Flow Chrome extension | Tạo Omni clips 4/6/8/10s từ full JSON & media IDs; upscale từng clip lên 1080p | `node/scenes/scene_{N}_1080p_raw.mp4` và render metadata. |
| Voice/post module | `PRODUCTION/video_modules/Applio`, `applio-brand-voice`, `ffmpeg`, subtitle/audio skills | Voice alignment, concat scene, subtitle burn, BGM/SFX mix, chèn thumbnail frame 0 | Final vertical MP4 tại root campaign; working logs trong `node/`. |
| QA/publish gate | `notion-publisher`, `manifest.json` | Chỉ xác nhận/ghi ngược Notion sau QA kỹ thuật, brand và claim | `manifest.json` được tạo sau khi final artifact tồn tại và pass. |

## 3. Luồng Làm Việc Trọng Tâm Theo GOAL

**Notion database/page dùng làm điểm vào workflow:** [https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link](https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link)

### 3.1 Content Executive

1. `write-shooting-script` tạo `node/shooting-script.md`, audio WAV và `node/timing/timing-lock.json`.
2. Timing lock đóng gói thoại thành số sequence ít nhất có thể, mỗi sequence chỉ dài `4`, `6`, `8`, hoặc `10` giây.
3. `write-ai-ugc-video-sequence-script` tạo `node/ugc-sequence-script.md`: Part A reference context, Part B JSON Omni blocks, Part C audio/BGM spec.
4. `tea-ugc-ai-realism` chỉ được cải thiện các field visual hiện hữu trong JSON (ví dụ ánh sáng, texture da, camera, environment, motion). Không được đổi schema/key, dialogue, claim, reference, duration hoặc thứ tự scene.

### 3.2 Designer

1. Với human/character reference còn thiếu: chạy `photography-direction` ở reference mode trước khi tạo ảnh.
2. Dùng asset product/brand đã duyệt trong Brand Kit trước; chỉ gen asset thiếu.
3. Tạo/đăng ký reference vào project FlowKit để lấy media IDs dùng xuyên các scene.
4. Chạy `creative-direction` (hoặc photography direction standalone) trước khi dùng `acad-image-gen` render `thumbnail.jpg`.

### 3.3 Video Editor

1. Parse từng JSON block trong `ugc-sequence-script.md`; gửi **toàn bộ JSON** cùng tối đa 3 reference media IDs vào FlowKit Omni.
2. Nhận raw clip và bắt buộc gọi FlowKit upscale `VIDEO_RESOLUTION_1080P` trước các bước downstream.
3. Align/remux WAV từ Applio vào clip 1080p theo timing lock.
4. Concat scene theo thứ tự, burn subtitle khi ticket yêu cầu, mix BGM/SFX, rồi prepend `thumbnail.jpg` để **frame đầu tiên** của final MP4 là thumbnail.

### 3.4 QA và Publish

- Kiểm product/variant/claim/CTA theo `Ticket.md` và nguồn được duyệt.
- Kiểm final MP4, thumbnail, traceability trong `node/`, rồi mới tạo `manifest.json`.
- `notion-publisher` chỉ writeback/publish khi ticket cấp quyền; PASS technical không tự động có quyền publish.

## 4. Cấu Trúc Lưu Trữ Bắt Buộc

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
├── Ticket.md
├── caption.md                         # Khi áp dụng
├── thumbnail.jpg
├── [final-deliverable].mp4
├── manifest.json
└── node/
    ├── GOAL.md
    ├── shooting-script.md
    ├── ugc-sequence-script.md
    ├── timing/
    ├── scenes/
    ├── references/
    └── [voice, render, QA, post-production logs]
```

`BASE/BRAND KITs/` là thư viện chỉ đọc trong production thông thường. Final output không được lưu mới trong Brand Kit hoặc `PRODUCTION/`.

## 5. Setup Trên Máy Người Nhận Bàn Giao

### 5.1 Clone repository chính

```bash
git clone git@github.com:brucemakeurname/AI-media-Agent.git
cd AI-media-Agent
```

Repository chính chứa authority/rules, `BASE/`, `DOCS/`, `PRODUCTION/goal/`, production skills, FlowKit source, và talking-head-editing source. Trước khi chạy cần đọc theo thứ tự:

```text
AGENTS.md
→ BASE/BASE-STRUCTURE.md
→ PRODUCTION/AGENT.md
→ PRODUCTION/goal/[social]_[ai-ugc-short-video].md
→ Ticket.md của campaign đang chạy
→ SKILL.md của skill/module sẽ dùng
```

### 5.2 Thành phần không nằm đầy đủ trong repository chính

Repository được giữ nhẹ và an toàn: `.gitignore` chủ động loại credentials, virtual environments, `node_modules`, model/dataset lớn, asset runtime/render cache, và media `.mp4/.wav/.png/.jpg`. Hai ứng dụng video bên dưới còn là third-party repositories được version riêng nên không được track trong repository chính.

| Cần tải thêm | Repository nguồn | Vị trí phải clone | Lý do không có đầy đủ trong repo chính |
| --- | --- | --- | --- |
| Applio | `https://github.com/IAHispano/Applio.git` | `PRODUCTION/video_modules/Applio/` | Third-party repo; model/voice assets và runtime local quá nặng/nhạy cảm để push. |
| HyperFrames | `https://github.com/heygen-com/hyperframes.git` | `PRODUCTION/video_modules/hyperframes/` | Third-party repo; `node_modules`, cache render và generated media không track. |
| FlowKit runtime state | Source đã có tại `PRODUCTION/video_modules/flowkit/` | Giữ nguyên vị trí hiện có | Virtual env, Chrome profile/extension state, Google auth/token và output runtime đều local-only. |
| Talking-head runtime dependencies | Source có tại `PRODUCTION/video_modules/talking-head-editing/` | Giữ nguyên vị trí hiện có | `node_modules`, caches và generated media không track. |

Clone hai repository riêng vào đúng vị trí:

```bash
git clone https://github.com/IAHispano/Applio.git PRODUCTION/video_modules/Applio
git clone https://github.com/heygen-com/hyperframes.git PRODUCTION/video_modules/hyperframes
```

Sau khi clone, chạy installer/hướng dẫn native của từng repository tại `README.md` tương ứng. Với FlowKit, chạy `./setup.sh` trong `PRODUCTION/video_modules/flowkit/`; script kiểm tra Python 3.10+, `ffmpeg`, `ffprobe`, Chrome, tạo virtual environment và cài dependencies. Load Chrome extension từ `PRODUCTION/video_modules/flowkit/extension/`, mở Google Flow trong **đúng Google profile được cấp quyền**, rồi xác nhận FlowKit extension connected trước khi render.

### 5.3 Credential và quyền truy cập nội bộ

Người nhận bàn giao cần nhận qua kênh nội bộ được phê duyệt, không nhận qua Git/Lark comment:

- File `PRODUCTION/env.local` local-only (tạo từ mẫu `PRODUCTION/.env.example`), tối thiểu bao gồm `NOTION_API_KEY` và credential cần cho các tool được duyệt.
- Notion API integration key có quyền đọc UltimateSup workspace, database `Social Media Post`, database `Campaigns`, và các page/assets liên quan.
- Quyền truy cập page Notion UltimateSup dùng làm test; workflow không tự bịa field khi thiếu quyền hoặc thiếu dữ liệu.
- Google account/profile có quyền sử dụng Google Flow/Omni và Chrome FlowKit extension.
- Model/voice asset nội bộ cần cho Applio, nếu ticket yêu cầu voice conversion.
- Quyền GitHub SSH hoặc HTTPS hợp lệ để clone revision bàn giao.

**Không được** commit, upload, screenshot, hoặc dán `env.local`, Notion key, Google token/cookie, SSH key, model checkpoint hay asset nội bộ vào Lark task/repository.

### 5.4 Local prerequisites

- macOS/Linux shell, Git, Node.js, Python 3.10+.
- Chrome để chạy FlowKit extension và một Google Flow tab đã đăng nhập.
- `ffmpeg` + `ffprobe` cho FlowKit, concat, frame extraction và video QA.
- WhisperX khi workflow crawl/transcribe reference yêu cầu.
- Dung lượng trống phù hợp cho model, scene renders, WAVs và final output.

## 6. Video Test Đính Kèm

| Thuộc tính | Giá trị |
| --- | --- |
| Campaign unit | `BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-11/` |
| Final video | `PVL-ISO-Gold-Singlish-UGC-2026-08-11-final.mp4` |
| Kích thước file | 76,047,480 bytes (~73 MB) |
| SHA-256 | `4c0657ef629acd5ad1bbab872f4f3bc7b035c8dc5b625618c0cec2ad0f743910` |
| Metadata contract | `manifest.json` trong campaign unit: 1080x1920, 24 FPS, H.264/AAC, 10 scene, thumbnail và FlowKit/Applio traceability. |
| Purpose | Bằng chứng smoke test end-to-end của workflow; kiểm bằng `Ticket.md`, `node/` artifacts và `manifest.json`, không chỉ bằng việc mở MP4. |

## 7. Điều Kiện Nghiệm Thu Tối Thiểu

1. Clone đúng revision repository, khởi tạo các repo/module local vào đúng đường dẫn.
2. Kết nối Notion thành công bằng credential local được cấp; chạy `notion2goal` cho một Post có dữ liệu hợp lệ.
3. Sinh được `Ticket.md` và `node/GOAL.md` không còn placeholder.
4. Tạo được shooting script, JSON Omni hợp lệ, reference/thumbnail và scene FlowKit.
5. Có bằng chứng clip FlowKit được upscale 1080p trước voice/post-production.
6. Final MP4 ở root campaign có thumbnail ở frame đầu tiên, subtitle/audio mix theo ticket, và `manifest.json` sau QA.
7. Không có secret/cookie/key/model binary nội bộ trong Git repository hoặc attachment Lark.

## 8. Files Đính Kèm Trên Lark Task

1. `Architecture.md` — file này.
2. `HDSD.md` — runbook setup, chạy workflow, QA và xử lý lỗi phổ biến.
3. `AI-VIDEO-CREATIVE-WORKFLOW-DIAGRAM.png` — biểu đồ workflow theo GOAL.
4. `PVL-ISO-Gold-Singlish-UGC-2026-08-11-final.mp4` — video test final.
5. `Lark-Message.md` — comment bàn giao sẵn sàng để dán vào Lark task.
