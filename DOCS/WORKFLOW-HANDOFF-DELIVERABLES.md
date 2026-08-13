# Workflow Video Creative — Gói Bàn Giao

Last updated: 2026-08-13

Tài liệu này quy định cách bàn giao task **Tinh chỉnh Workflows Video Creative**. Mục tiêu bàn giao là để người giám sát có thể clone repository, cung cấp các quyền nội bộ cần thiết, chạy lại một ticket mẫu và đối chiếu được kết quả với video test.

> `env.local`, token Notion, token crawler, SSH key, cookie, và phiên đăng nhập Google Flow không phải là deliverable Git. Cấp chúng qua kênh nội bộ được phê duyệt; không dán vào issue, tài liệu, commit, hay ảnh chụp màn hình.

## Phạm Vi Bàn Giao

```text
Notion Post + Campaign
          │
          ▼
notion2goal → Ticket.md + node/GOAL.md
          │
          ▼
Skills được GOAL.md gọi theo thứ tự role
          │
          ▼
Campaign unit: node/ traceability + final video + manifest.json
```

## Sơ Đồ Kiến Trúc Module & Tương Tác Workflow

Workflow kết hợp 5 khối module chính. Các module trao đổi dữ liệu qua contract file trong campaign unit, chủ yếu là `Ticket.md`, `node/GOAL.md`, script, media assets, render logs, và `manifest.json`; không phụ thuộc bộ nhớ tạm của agent.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                1. NOTION INTEGRATION                                     │
│  Social Media Post + Campaign ── notion2goal ──> Ticket.md + node/GOAL.md                 │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ locked brief + execution prompt
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                2. CONTENT EXECUTIVE                                      │
│  write-shooting-script ──> shooting-script.md + timing-lock.json + dialogue WAVs         │
│  write-ai-ugc-video-sequence-script ──> ugc-sequence-script.md (JSON Omni)               │
│  tea-ugc-ai-realism ──> refined visual fields; preserves JSON schema, dialogue, claims   │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ locked sequence JSON + timing/audio contract
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                     3. DESIGNER                                           │
│  photography-direction / creative-direction ──> reference + thumbnail prompts             │
│  acad-image-gen ──> character/reference assets + thumbnail.jpg                            │
│  FlowKit ref registration ──> project + reference media IDs                               │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ full JSON + reference media IDs + duration
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                           4. VIDEO GENERATION: FLOWKIT                                   │
│  Google Flow / Omni generation ──> raw clips (4 / 6 / 8 / 10 seconds)                     │
│  FlowKit upscale ──> scene_{N}_1080p_raw.mp4 (mandatory before downstream processing)    │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ upscaled scene clips + authoritative voice WAVs
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                         5. POST-PRODUCTION & VOICE                                       │
│  Applio brand voice ──> synced scene audio; ffmpeg ──> concat + thumbnail at frame 0     │
│  subtitle-burn-talking-head ──> burned subtitles; audio-mix ──> BGM ducking + SFX         │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ final MP4 + evidence bundle
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                6. QA & PUBLISHING GATE                                   │
│  Technical/brand/claim QA ──> manifest.json ──> optional Notion writeback/publish         │
│  Final root output: thumbnail.jpg + [final-deliverable].mp4                               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Module 1 — Notion Integration (`notion2goal`)

| Nội dung | Mô tả |
| --- | --- |
| **Chức năng** | Đọc Social Media Post và Campaign đã link; map field theo `Visual Type` để tạo campaign unit trên filesystem. |
| **Input** | Notion Post/Campaign có quyền đọc; goal template phù hợp trong `PRODUCTION/goal/`. |
| **Output contract** | `Ticket.md` tại root và `node/GOAL.md`; mọi placeholder phải được thay, hoặc workflow dừng và ghi blocker. |
| **Bàn giao sang module sau** | Brief, product/claim/CTA, visual concept, reference URL và execution prompt đã khóa. |

### Module 2 — Content Executive

| Thành phần | Chức năng | Output truyền tiếp |
| --- | --- | --- |
| `write-shooting-script` | Chuyển brief thành shooting script và lock timing thoại bằng audio. | `node/shooting-script.md`, `node/timing/timing-lock.json`, WAVs. |
| `write-ai-ugc-video-sequence-script` | Chuyển shooting script đã lock thành sequence prompt Omni. | `node/ugc-sequence-script.md`, gồm JSON theo sequence và audio/BGM spec. |
| `tea-ugc-ai-realism` | Tăng độ chân thực của các field visual: ánh sáng, chất liệu da, camera, environment, motion. | Cập nhật nội dung trong JSON hiện hữu; không đổi key/schema, dialogue, claim, duration, ref hoặc scene order. |

**Cách phối hợp:** Đầu ra content là contract cho Designer và Video Editor. Duration được pack theo timing lock, chỉ dùng `4`, `6`, `8`, hoặc `10` giây để giảm số clip và vẫn đủ thoại.

### Module 3 — Designer

| Nội dung | Mô tả |
| --- | --- |
| **Chức năng** | Tạo/refine visual direction, bảo đảm nhân vật nhất quán, chuẩn bị asset tham chiếu, và tạo thumbnail. |
| **Skills** | `photography-direction` cho prompt character/reference; `creative-direction` cho thumbnail concept; `acad-image-gen` để render asset. |
| **Output contract** | Reference image trong `node/` và `thumbnail.jpg` tại root campaign; các image reference được đăng ký vào FlowKit để có media ID. |
| **Bàn giao sang module sau** | Locked sequence JSON + tối đa 3 FlowKit reference media IDs/sequence + thumbnail. |

### Module 4 — Video Generation & Upscale (`PRODUCTION/video_modules/flowkit`)

| Nội dung | Mô tả |
| --- | --- |
| **Chức năng** | Qua FlowKit extension, gửi full JSON Omni cùng reference media IDs đến Google Flow để sinh video theo sequence. |
| **Input** | Full sequence JSON, `duration_s` là `4|6|8|10`, portrait aspect ratio, reference media IDs. |
| **Output contract** | Raw render metadata/media ID, sau đó `node/scenes/scene_{N}_1080p_raw.mp4`. |
| **Bắt buộc** | Mỗi clip raw phải upscale `VIDEO_RESOLUTION_1080P` bằng FlowKit trước Applio voice sync/download downstream. Fallback được phê duyệt phải được log trong `manifest.json`. |

### Module 5 — Post-production & Voice

| Thành phần | Chức năng | Output truyền tiếp |
| --- | --- | --- |
| `PRODUCTION/video_modules/Applio` + `applio-brand-voice` | Chuyển/đồng bộ voice WAV theo voice brand rồi remux vào từng scene 1080p. | Scene đã voice sync. |
| `ffmpeg` | Concat đúng thứ tự sequence, chèn `thumbnail.jpg` thành frame đầu tiên. | `node/video_concat.mp4` và final composition. |
| `[html-video]-subtitle-burn-talking-head` | Burn subtitle theo thoại khi ticket yêu cầu. | Video có subtitle trong safe area. |
| `[html-video]-audio-mix` | Mix BGM/SFX và ducking để thoại luôn ưu tiên. | Video có final audio mix. |

**Cách phối hợp:** Chỉ nhận scene đã upscale và voice đã lock. Thumbnail được prepend ở frame 0, nên không cần burn lại subtitle sau khi chèn thumbnail nếu không có thay đổi thoại.

### Module 6 — QA & Publishing Gate

| Nội dung | Mô tả |
| --- | --- |
| **Chức năng** | Kiểm technical format, claim/brand/variant/CTA, artifact traceability và điều kiện review. |
| **Input** | Final MP4, thumbnail, `Ticket.md`, `node/` artifacts và render/voice logs. |
| **Output contract** | `manifest.json` chỉ được viết sau khi final artifact tồn tại và verification pass. |
| **Notion interaction** | `notion-publisher` chỉ writeback/publish khi ticket cho phép; nghiệm thu PASS không tự động cấp quyền publish. |


| Thành phần | Bàn giao gồm | Cách kiểm tra |
| --- | --- | --- |
| **Repository GitHub** | Source, `AGENTS.md`, `DOCS/`, `PRODUCTION/goal/`, production skills, cấu hình module không nhạy cảm | Clone đúng revision bàn giao; `git status --short` phải trống trước khi chạy test. |
| **Notion input** | Một Post mẫu có Campaign đã link, cùng dữ liệu editorial/visual cần cho video | Chạy `notion2goal`; đối chiếu trường đã pull với page nguồn. |
| **GOAL contract** | Goal template trong `PRODUCTION/goal/` và `node/GOAL.md` đã điền cho ticket | Không còn `{{placeholder}}`; role, skill và thứ tự thực thi rõ ràng. |
| **Skill contract** | `SKILL.md` của từng skill được GOAL.md nhắc tới | Mỗi skill có input, output, điều kiện dừng và đường dẫn artifact. |
| **Video test** | Final `.mp4`, `thumbnail.jpg`, `manifest.json`, và artifact trong `node/` | Video đạt thông số ticket; traceability đủ để tái kiểm. |

## 1. Hợp Đồng Đầu Vào Notion

`notion2goal` là điểm chuyển giao từ database sang filesystem. Người bàn giao cung cấp quyền đọc page/database nội bộ và một Post mẫu đã liên kết Campaign; người nghiệm thu không suy đoán hoặc tự điền dữ liệu thiếu.

Đầu ra bắt buộc của bước này:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
├── Ticket.md
└── node/
    └── GOAL.md
```

- `Ticket.md` lưu snapshot các field editorial/business không rỗng, brief, traceability URL và nguồn goal template.
- `node/GOAL.md` chỉ lấy phần prompt của template phù hợp với `Visual Type`, sau đó thay toàn bộ placeholder bằng dữ liệu đã pull.
- Nếu thiếu field bắt buộc, nhiều URL reference mâu thuẫn, hoặc có placeholder chưa thay, workflow phải dừng và ghi rõ blocker; không được tạo brief giả định.

## 2. Hợp Đồng GOAL và Skills

Workflow AI UGC short video hiện dùng `PRODUCTION/goal/[social]_[ai-ugc-short-video].md`. File goal xác định thứ tự role và là nguồn giao việc, không thay thế `Ticket.md`.

| Role | Skills/chức năng bắt buộc | Artifact tối thiểu |
| --- | --- | --- |
| `content-executive` | `write-shooting-script` → `write-ai-ugc-video-sequence-script` → `tea-ugc-ai-realism` | `node/shooting-script.md`, timing lock/audio, `node/ugc-sequence-script.md` với JSON Omni hợp lệ. |
| `designer` | `photography-direction` hoặc `creative-direction`; `acad-image-gen`; FlowKit reference tools khi cần | Character/reference assets trong `node/`, `thumbnail.jpg` tại root campaign. |
| `video-editor` | FlowKit Omni generation, **FlowKit 1080p upscale**, `applio-brand-voice`, `[html-video]-subtitle-burn-talking-head`, `[html-video]-audio-mix` | Scene 1080p, scene đã voice sync, file post-production, final MP4. |
| `notion-publisher` | Publish/handoff chỉ khi ticket cho phép | `manifest.json` sau khi các artifact đã pass; update Notion chỉ khi có quyền publish. |

Quy tắc quan trọng khi nghiệm thu:

- `tea-ugc-ai-realism` chỉ cải thiện nội dung field visual của JSON Omni. Không đổi schema/key, scene order, thời lượng, reference assignment, dialogue, claim, hay cấu trúc Part A/Part C.
- Omni phải nhận toàn bộ JSON prompt theo từng sequence. Thời lượng sequence chỉ dùng `4`, `6`, `8`, hoặc `10` giây và được pack theo timing lock để giảm số clip.
- Mỗi raw Omni clip phải qua FlowKit upscale 1080p trước voice sync/download downstream. Nếu có fallback đã được phê duyệt, phải ghi rõ lý do và thông số trong `manifest.json`.
- Hậu kỳ phải burn subtitle khi ticket yêu cầu, mix SFX/BGM, và prepend `thumbnail.jpg` để thumbnail ở frame đầu tiên của video.

## 3. Gói Artifact Một Campaign Unit

Lưu theo `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`; không để output mới trong Brand Kit hoặc `PRODUCTION/`.

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
├── Ticket.md
├── caption.md                         # Nếu ticket yêu cầu
├── thumbnail.jpg
├── [final-deliverable].mp4
├── manifest.json                      # Viết sau khi verification pass
└── node/
    ├── GOAL.md
    ├── shooting-script.md
    ├── ugc-sequence-script.md
    ├── timing/
    ├── scenes/
    ├── references/                    # Hoặc thư mục ref tương đương
    └── [render, QA, voice, post-production logs]
```

`node/` là bằng chứng tái lập, không phải thư mục final delivery. Root campaign chỉ có final deliverables, `Ticket.md`, `caption.md` khi áp dụng, và `manifest.json`.

## 4. Video Test Là Bằng Chứng Bàn Giao

Video test không chỉ là file `.mp4`; gói bằng chứng cần cho phép trace ngược từ output đến input:

1. `Ticket.md` xác định product/variant, platform, language, CTA, claim source và acceptance criteria.
2. `node/GOAL.md` chứng minh prompt được tạo từ Notion/template phù hợp.
3. Shooting script, sequence script, reference assets và render logs chứng minh thứ tự xử lý.
4. `thumbnail.jpg`, final MP4 và `manifest.json` chứng minh output đã được kiểm kỹ thuật.

`manifest.json` phải tối thiểu ghi: tên final video, thumbnail, platform/format, resolution, FPS, codec, scene count, FlowKit render/upscale status, voice-sync status, review status, và ngày tạo. Giá/claim/offer trong manifest hoặc video vẫn phải khớp `Ticket.md` và nguồn được duyệt.

## 5. Điều Kiện Bàn Giao Hoàn Tất

Người thực hiện bàn giao khi và chỉ khi:

- Đã push revision nguồn lên repository và chia sẻ commit SHA/branch cho người giám sát.
- Đã gửi quyền truy cập Notion, Google Flow/FlowKit extension, và các credential cần thiết bằng kênh nội bộ riêng.
- Đã chỉ rõ campaign unit của video test và không có secret trong tracked files.
- Đã cung cấp `DOCS/WORKFLOW-VERIFICATION-CHECKLIST.md` để người giám sát thực hiện nghiệm thu độc lập.

