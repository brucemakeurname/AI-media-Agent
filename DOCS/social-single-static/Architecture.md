# SINGLE STATIC — Architecture & Handoff Setup

**Handoff date:** 2026-08-17
**Primary workflow authority:** `PRODUCTION/goal/[social]_[single-static].md`
**Workspace:** `/Users/test/Documents/AI Media/Hoài Nam/INFRA`
**Revision:** `ba5eed2` (`main`)

## 1. Purpose and Outcome

Workflow này chuyển một Notion Post có `Visual Type = SINGLE STATIC` thành một bài đăng ảnh tĩnh hoàn chỉnh, có thể truy vết:

```text
UltimateSup Notion Post + linked Campaign
  → Ticket.md + node/GOAL.md
  → caption.md + node/creative-brief.md
  → creative/photography direction + element resolution
  → final image tại campaign root + node/images-prompts.md
  → Notion writeback + manifest.json + Status = Submit to Review
```

Không sinh video, không cần script. Đây là pipeline image-led một ticket/một ảnh.

## 2. Component Table

| Layer | Component | Verified responsibility | Input/output contract |
| --- | --- | --- | --- |
| Workspace governance | `AGENTS.md`, `BASE/BASE-STRUCTURE.md`, `PRODUCTION/AGENT.md` | Singapore market, claim safety, role order, storage contract | Mọi output đặt tại `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/` |
| Input interface | UltimateSup Notion Posts DB + Campaigns DB | Cung cấp format, channel, brand, pillar, topic, post message, headline, slogan/big idea, date, visual type | `notion2goal` đọc Post và chỉ nhảy quan hệ Campaign cho slogan/big idea |
| Workflow compiler | `PRODUCTION/.agents/skills/notion2goal/SKILL.md` | Pull Notion, chọn goal theo `Visual Type`, tạo `Ticket.md` và `node/GOAL.md` | Không còn `{{placeholder}}`; thiếu field bắt buộc thì dừng |
| Instruction workflow | `PRODUCTION/goal/[social]_[single-static].md` | Điều phối role tuần tự `content-executive → designer → notion-publisher` | `Ticket.md` là brief/claim authority; `node/GOAL.md` là prompt đã fill |
| Content module | `content-executive` + `wiki-query` + nested `agy` Vietnamese rewrite | Draft caption/brief, bắt buộc rewrite tiếng Việt | `caption.md` root; `node/creative-brief.md` |
| Design module | `designer` + `creative-direction`, `photography-direction`, `element-resolver` | Chọn visual concept, resolve brand/product refs, viết direction | Direction files trong `node/`; prompt/traceability trong `node/images-prompts.md` |
| Image renderer | `acad-image-gen`; `flowkit-nano-banana-image-gen` khi cần Nano Banana/reference-guided | Render ảnh final theo aspect ratio ticket | Final image ở campaign root, không phải `node/` |
| QA/publish gate | `notion-publisher`, `notion-upload`, `manifest.json` | Writeback caption/hook/hashtag/thumbnail, set `Submit to Review`, viết manifest cuối | `manifest.json` chỉ sau QA; không publish nếu ticket không cấp quyền |

## 3. Core Execution Flow

1. `notion2goal` tạo `Ticket.md` + `node/GOAL.md` từ Notion page ID và linked Campaign.
2. `content-executive` dùng `wiki-query` lấy brand voice, viết `caption.md` + `node/creative-brief.md`, rồi chạy bắt buộc nested `agy --dangerously-skip-permissions` để rewrite tiếng Việt.
3. `designer` đọc `node/creative-brief.md`, chạy `creative-direction` (mode: initial), dùng `photography-direction` khi hướng human/vibe-led, và resolve reference qua `element-resolver`.
4. `designer` render final image với `acad-image-gen`; dùng `flowkit-nano-banana-image-gen` khi direction yêu cầu Nano Banana/reference-guided. Lưu image tại root, prompt/refs tại `node/images-prompts.md`.
5. QA technical/brand/claim; nếu đạt, `notion-publisher` writeback các field theo bảng Write-back và viết `manifest.json`. Không publish nếu không được phép.

## 4. Canonical Storage

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/
├── Ticket.md
├── caption.md
├── <final-image>.<png|jpg>
├── manifest.json
└── node/
    ├── GOAL.md
    ├── creative-brief.md
    ├── images-prompts.md
    └── direction/QA/handoff files
```

- `[IP] Campaign` mặc định là `UltimateSup Plus Campaign` nếu Ticket không chỉ rõ IP khác.
- `[Platform]`/`[Format]` phải khớp folder có sẵn trong `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`.
- `[Date Folder]` dùng ngày publish, dạng `YYYY-MM-DD`; thêm `-2`, `-3` cho unit độc lập cùng ngày.
- Final deliverables ở root; prompts, drafts, QA, logs ở `node/`. Không ghi đè asset đã approved.

## 5. New-Machine Setup

Pipeline static chỉ cần repository chính; không cần `PRODUCTION/video_modules/`.

```bash
git clone <approved-repo-url>
cd AI-media-Agent
```

Yêu cầu runtime đã xác minh:

- macOS/Linux, `git`, `zsh`/`bash`, Node.js, Python 3.
- Nested `agy` CLI cho bước rewrite tiếng Việt bắt buộc.
- Các skill được dùng nằm sẵn trong `PRODUCTION/.agents/skills/` và không cần clone thêm.
- `acad-image-gen` và `flowkit-nano-banana-image-gen` cần service entitlement nội bộ, không cài từ repository.

## 6. Access/Security

Người nhận cần nhận qua kênh nội bộ được phê duyệt:

- `PRODUCTION/env.local` local-only, chứa `NOTION_TOKEN` cho Notion integration.
- Notion integration có quyền đọc Posts DB `38d0831f990c802db2b1e2a7b03a05da` và Campaigns DB `3990831f990c80119e4bf38f9c68bea9`.
- Quyền dùng `acad-image-gen`/`flowkit-nano-banana-image-gen` theo tài khoản được cấp.
- Không commit, upload, screenshot, hoặc dán `env.local`, token, service key, asset nội bộ.

Xác minh local credential:

```bash
test -f PRODUCTION/env.local
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local must not be tracked'; exit 1; } \
  || echo 'PASS: env.local is local-only'
```

## 7. Test Evidence

| Item | Value |
| --- | --- |
| Governing workflow | `PRODUCTION/goal/[social]_[single-static].md` — 13,144 bytes |
| Referenced skills | `wiki-query`, `creative-direction`, `photography-direction`, `element-resolver`, `acad-image-gen`, `flowkit-nano-banana-image-gen`, `notion-upload` — all present |
| Final media | Không có campaign image test độc lập tại thời điểm bàn giao; đây là bàn giao architecture/workflow, không phải bàn giao một ticket đã chạy |
| Evidence limitation | Vì không có final media, file goal canonical được dùng làm bằng chứng instruction và được nêu rõ trong Lark comment |

## 8. Acceptance Criteria

1. Máy mới clone đúng revision, tạo `PRODUCTION/env.local` và xác minh nó không bị Git track.
2. Notion integration đọc được Posts DB/Campaigns DB và chạy `notion2goal` cho một Post `SINGLE STATIC`.
3. `Ticket.md` và `node/GOAL.md` tồn tại, không còn placeholder.
4. `caption.md`/`node/creative-brief.md` qua rewrite tiếng Việt bắt buộc.
5. Final image ở root campaign có kích thước/aspect ratio và on-image copy đúng ticket.
6. `manifest.json` có traceability; Notion chỉ được update khi ticket cho phép và đạt QA.
7. Không có secret/credential trong repository hoặc attachment Lark.

## 9. Attachment List

1. `Architecture.md` — file này.
2. `HDSD.md` — runbook setup, chạy, QA, xử lý lỗi.
3. `social-single-static-WORKFLOW-DIAGRAM.png` — sơ đồ 9:16 1080×1920.
4. `PRODUCTION/goal/[social]_[single-static].md` — workflow authority, dùng làm bằng chứng architecture-only.
5. `Lark-Message.md` — comment bàn giao sẵn sàng để dán vào Lark.
