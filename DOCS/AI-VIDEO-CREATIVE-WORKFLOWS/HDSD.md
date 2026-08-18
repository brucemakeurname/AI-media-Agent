# AI VIDEO CREATIVE WORKFLOWS — Hướng Dẫn Sử Dụng

**Last updated:** 2026-08-13  
**Workflow chính:** `PRODUCTION/goal/[social]_[ai-ugc-short-video].md`

Tài liệu này là runbook để người nhận bàn giao chạy một AI UGC short-video từ [Notion database/page UltimateSup](https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link) đến final MP4. Đọc cùng `Architecture.md`; không thay thế quy tắc trong `AGENTS.md`, `PRODUCTION/AGENT.md`, `Ticket.md`, hoặc `SKILL.md` của từng tool.

> Không đưa `env.local`, API key, SSH key, Google cookie/token, model checkpoint, hay asset nội bộ vào GitHub/Lark. Nhận và lưu chúng qua kênh nội bộ được phê duyệt.

## 1. Setup Một Lần Trên Máy Mới

### 1.1 Clone source và các runtime riêng

```bash
git clone git@github.com:brucemakeurname/AI-media-Agent.git
cd AI-media-Agent

git clone https://github.com/IAHispano/Applio.git PRODUCTION/video_modules/Applio
git clone https://github.com/heygen-com/hyperframes.git PRODUCTION/video_modules/hyperframes
```

Giữ đúng cấu trúc sau; các skill/goal dùng đường dẫn này:

```text
PRODUCTION/video_modules/
├── flowkit/                 # Có source trong repo chính
├── Applio/                  # Clone riêng
├── hyperframes/             # Clone riêng
└── talking-head-editing/    # Có source trong repo chính
```

### 1.2 Cài FlowKit và Google Flow bridge

```bash
cd PRODUCTION/video_modules/flowkit
./setup.sh
```

Sau khi script hoàn tất:

1. Mở Chrome → `chrome://extensions` → bật Developer mode.
2. Chọn **Load unpacked** và nạp thư mục `PRODUCTION/video_modules/flowkit/extension/`.
3. Mở Google Flow bằng **đúng Google profile được cấp quyền dùng Flow/Omni**.
4. Khởi động FlowKit theo `PRODUCTION/video_modules/flowkit/README.md`, sau đó kiểm tra extension đã kết nối trước khi gửi job render.

FlowKit cần Python 3.10+, Chrome, `ffmpeg`, `ffprobe`. Không chạy render khi extension đang kết nối profile Google khác hoặc Flow tab chưa mở.

### 1.3 Cài các runtime còn lại

- Làm theo `PRODUCTION/video_modules/Applio/README.md` để cài Applio và nhận model/voice asset thương hiệu qua kênh nội bộ.
- Làm theo `PRODUCTION/video_modules/hyperframes/README.md` nếu cần dùng HTML/post-production preset của HyperFrames.
- Bảo đảm `git`, Node.js, Python 3.10+, `ffmpeg`, `ffprobe` có trong `PATH`.
- Cài WhisperX chỉ khi task có crawl/transcribe video reference.

### 1.4 Nhận quyền nội bộ và tạo local environment

Người phụ trách hệ thống cấp file `PRODUCTION/env.local` bằng kênh nội bộ (hoặc copy từ mẫu an toàn `PRODUCTION/.env.example` rồi điền giá trị thật). File này phải chứa key `NOTION_API_KEY` có quyền truy cập Notion database và các credential đã phê duyệt, tuyệt đối không được track hay đính kèm:

```bash
test -f PRODUCTION/env.local
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local must not be tracked'; exit 1; } \
  || echo 'PASS: env.local is local-only'
```

Người chạy cần có quyền:

- Đọc UltimateSup Notion workspace, database `Social Media Post`, `Campaigns`, và Post test.
- Dùng Google Flow/Omni với Chrome profile đã nạp FlowKit extension.
- Dùng voice/model asset được yêu cầu bởi ticket.

## 2. Chuẩn Bị Input Trước Khi Chạy

1. Mở [Notion database/page UltimateSup](https://app.notion.com/p/Mutant-Big-Greens-Smoothy-making-with-banana-and-chestnut-3bb0831f990c80e191a8cea409ccf6aa?source=copy_link), rồi chọn một Notion Post có `Visual Type = AI UGC SHORT VIDEO` và linked Campaign hợp lệ.
2. Bảo đảm Post/Campaign có: product/variant, target audience, language, CTA, post message, visual concept, headline/hook, campaign information, và video requirement.
3. Kiểm claim, offer, giá, flavour/variant theo nguồn được duyệt. Không dùng external reference để bịa product fact.
4. Xác định platform/format/date folder. Output mới luôn lưu theo:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
```

Nếu field bắt buộc thiếu hoặc URL reference mâu thuẫn, dừng trước khi render; yêu cầu owner sửa Notion input.

## 3. Chạy Workflow Theo Thứ Tự Role

### Bước 1 — Tạo campaign contract từ Notion

Đọc `PRODUCTION/.agents/skills/notion2goal/SKILL.md`, sau đó chạy skill cho page ID/tên Post được chỉ định.

Kết quả bắt buộc:

```text
BASE/CAMPAIGNs/.../[Date Folder]/Ticket.md
BASE/CAMPAIGNs/.../[Date Folder]/node/GOAL.md
```

Kiểm tra:

```bash
CAMPAIGN_DIR='BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]'
test -s "$CAMPAIGN_DIR/Ticket.md"
test -s "$CAMPAIGN_DIR/node/GOAL.md"
! rg -n -F '{{' "$CAMPAIGN_DIR/node/GOAL.md"
```

Không tự sửa đổi fact/claim trong `Ticket.md` để “cho chạy được”. Quay lại Notion/owner khi mapping không đủ.

### Bước 2 — Content Executive: script, timing và JSON Omni

Đọc `node/GOAL.md`, `Ticket.md`, rồi lần lượt dùng:

1. `gemini-tts-timing` → tạo per-line Gemini TTS WAVs và `node/timing/timing-lock.json` trước khi chia sequence.
2. `write-shooting-script` → tạo `node/shooting-script.md` từ timing lock.
3. `write-ai-ugc-video-sequence-script` → tạo `node/ugc-sequence-script.md` với Part A context, Part B JSON Omni sequence blocks và Part C audio/BGM spec.
4. `tea-ugc-ai-realism` → chỉ cải thiện nội dung visual trong JSON hiện có.

**Điểm kiểm bắt buộc:**

- Sequence được pack từ timing lock, duration mỗi sequence chỉ là `4`, `6`, `8`, hoặc `10` giây.
- `tea-ugc-ai-realism` không được đổi JSON keys/schema, scene order, `duration_s`, reference assignments, dialogue, claim, hay Part A/Part C structure.
- Câu thoại trong JSON phải khớp shooting script đã lock.

### Bước 3 — Designer: reference và thumbnail

1. Đọc `PRODUCTION/.agents/skills/photography-direction/SKILL.md` và tạo prompt character reference khi thiếu human/person reference.
2. Ưu tiên product/logo/packshot từ `BASE/BRAND KITs/UltimateSup/`; chỉ generate asset thiếu.
3. Tạo FlowKit project, upload/register asset reference để lấy media IDs cho sequence.
4. Chạy `video-thumbnail` để viết `node/thumbnail-brief.md` từ first beat, rồi dùng `acad-image-gen` render `thumbnail.jpg` tại root campaign.

Kiểm tra: nhân vật nhất quán, product/variant đúng ticket, logo/claim không bị sai, và thumbnail tồn tại tại `$CAMPAIGN_DIR/thumbnail.jpg`.

### Bước 4 — Video Editor: FlowKit Omni và mandatory upscale

1. Xác nhận FlowKit extension có trạng thái connected và Google Flow đang ở đúng profile.
2. Với từng JSON block trong `node/ugc-sequence-script.md`, gửi full JSON làm Omni prompt cùng tối đa 3 reference media IDs và `duration_s` hợp lệ.
3. Sau raw render, **bắt buộc** FlowKit upscale bằng `VIDEO_RESOLUTION_1080P`; nếu lỗi thì chạy `ffmpeg-upscale-video` và ghi rõ fallback.
4. Sau khi download từng scene, chạy `[html-video]-post-production-qa-broll-overlay` ở chế độ download QA; ghi file tồn tại, probe, duration, frame, dimension và audio vào `node/scene-qa.json`.
5. Chỉ sau khi download QA đạt, chạy `gwt-remove-watermark-video` ngay trên từng scene, trước voice/audio xử lý hoặc concat; lưu raw và `_nowm` cạnh nhau.
6. Chạy lại `[html-video]-post-production-qa-broll-overlay` ở chế độ post-processing QA sau watermark removal; chỉ cho `render_verified: true` khi probe/duration/frame/audio đều đạt.
7. Lưu clip đã upscale thành `node/scenes/scene_{N}_1080p_raw.mp4` cùng render metadata.

Nếu FlowKit không upscale được, không im lặng thay thế. Chỉ dùng fallback khi được phê duyệt và ghi rõ nguyên nhân, phương án, resolution và owner trong `manifest.json`.

### Bước 5 — Video Editor: voice sync và hậu kỳ

1. Resolve product B-roll from approved Brand Kit assets; keep the B-roll visual-only and map its video to the matching A-roll/approved voice audio window. Pre-trim each render to its exact slot, use actual `ffprobe` concat durations, and save `node/broll-manifest.json`.
2. Concat scene theo thứ tự trong script, rồi chạy dead-air/boundary check vào `node/concat-qa.json`; full-frame B-roll dùng `-itsoffset` + `eof_action=pass`, không chỉ dùng `enable`.
3. Chạy WhisperX trên audio concat, đối chiếu `node/timing/approved-voice.txt`, chỉ sửa text bằng `correct_whisper_text.py` và giữ nguyên timestamps.
4. Dùng HyperFrames `talking-head-recut`/`motion-graphics` để render transparent product/price/text overlays trên A-roll; ưu tiên ProRes 4444 alpha, dùng `setpts=PTS+start/TB` khi composite và không ghép cùng `-itsoffset`; giữ subtitle band `y=0.72–0.90`, probe alpha/duration và ghi `node/hyperframes-overlay-manifest.json`.
5. Burn subtitle bằng `[html-video]-subtitle-burn-talking-head` với `SEGMENT_MODE=smart MAX_TOKENS=5 SUB_Y_RATIO=0.75` nếu `Ticket.md` yêu cầu.
6. Mix BGM/SFX bằng `[html-video]-audio-mix`, giữ thoại là audio ưu tiên; chạy final technical/brand/claim QA.
7. Prepend `thumbnail.jpg` bằng `ffmpeg` để **frame 0/keyframe đầu tiên** của final MP4 là thumbnail.
8. Lưu final `.mp4` tại root campaign; logs/drafts/intermediates lưu trong `node/`.

### Bước 6 — QA và optional Notion writeback

Kiểm tra technical, brand và claim trước khi tạo manifest. `notion-publisher` chỉ update/publish Notion khi ticket cho phép.

```bash
FINAL_VIDEO="$CAMPAIGN_DIR/[final-deliverable].mp4"
test -s "$FINAL_VIDEO"
test -s "$CAMPAIGN_DIR/thumbnail.jpg"

ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name \
  -of default=noprint_wrappers=1 "$FINAL_VIDEO"

mkdir -p "$CAMPAIGN_DIR/node/qa"
ffmpeg -y -i "$FINAL_VIDEO" -frames:v 1 "$CAMPAIGN_DIR/node/qa/frame-000001.jpg"
```

PASS khi final video có technical format theo ticket/manifest (mặc định portrait 1080x1920), `frame-000001.jpg` hiển thị thumbnail, subtitle/voice/BGM/SFX đúng, product-claim-CTA đúng, và `manifest.json` có traceability. Nếu thiếu một điều kiện, ghi blocker; không publish.

## 4. Công Thức Handoff Sau Khi Chạy

Gửi người review:

```text
[commit SHA / repository revision]
[Notion Post URL]
[campaign folder]
[final MP4 path]
[manifest.json path]
[review status / blocker nếu có]
```

Final deliverable ở root campaign; `node/` giữ bằng chứng tái lập: `GOAL.md`, script, timing, references, scene renders, voice/post-production logs và QA output.

## 5. Lỗi Phổ Biến và Cách Xử Lý

| Hiện tượng | Kiểm tra trước | Hành động |
| --- | --- | --- |
| Không tạo được `GOAL.md` | Notion access, Visual Type, field mapping, URL reference | Sửa input trên Notion hoặc yêu cầu quyền; không tự điền fact thiếu. |
| FlowKit không connected | Chrome profile, Flow tab, extension đã load | Mở Google Flow trong đúng profile, reload extension, chạy health/status FlowKit. |
| Omni clip sai duration/ref | JSON block, media IDs, timing lock | Sửa script/reference trước render lại; chỉ dùng `4|6|8|10`. |
| Raw clip chưa 1080p | Upscale operation/media ID/log | Chạy mandatory FlowKit upscale; ghi fallback đã duyệt nếu không thể. |
| Voice/subtitle lệch | `timing-lock.json`, WAV, sequence order | Re-align audio theo timing lock; không sửa dialogue đã approved. |
| Thumbnail không ở frame đầu | Extract frame 1 với ffmpeg | Prepend lại thumbnail; không cần burn lại subtitle nếu không đổi thoại. |
| Claim/variant/offer sai | `Ticket.md`, label/listing approved | Dừng delivery, sửa source/script/asset và QA lại. |

## 6. Tài Liệu Cần Đọc Khi Có Vấn Đề

- `Architecture.md` — thành phần, dependency và vị trí runtime.
- `AGENTS.md` — safety, Singapore market, claim governance, storage contract.
- `PRODUCTION/AGENT.md` — production runtime authority và role dispatch.
- `PRODUCTION/goal/[social]_[ai-ugc-short-video].md` — workflow instruction chuẩn.
- `DOCS/WORKFLOW-VERIFICATION-CHECKLIST.md` — checklist nghiệm thu độc lập.
- `PRODUCTION/video_modules/flowkit/README.md` — FlowKit setup, extension và troubleshooting.
