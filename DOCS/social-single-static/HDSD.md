# SINGLE STATIC — Hướng Dẫn Sử Dụng

**Last updated:** 2026-08-17
**Workflow chính:** `PRODUCTION/goal/[social]_[single-static].md`

Runbook chạy một ảnh tĩnh xã hội từ Notion đến final image + `manifest.json`. Đọc cùng `Architecture.md`; không thay thế `AGENTS.md`, `PRODUCTION/AGENT.md`, `Ticket.md`, hoặc `SKILL.md` của từng tool.

> Không đưa `env.local`, API key, token, service key, hoặc asset nội bộ vào Git/Lark.

## 1. Setup Một Lần Trên Máy Mới

```bash
git clone <approved-repo-url>
cd AI-media-Agent
```

Pipeline static không cần clone `PRODUCTION/video_modules/`. Cần có `git`, Node.js, Python 3, nested `agy` CLI, và service entitlement nội bộ cho image generation.

## 2. Access Setup

1. Nhận `PRODUCTION/env.local` qua kênh nội bộ; file phải có `NOTION_TOKEN`.
2. Notion integration phải được share vào Posts DB `38d0831f990c802db2b1e2a7b03a05da` và Campaigns DB `3990831f990c80119e4bf38f9c68bea9`.
3. Xác minh credential không bị track:

```bash
test -f PRODUCTION/env.local
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local must not be tracked'; exit 1; } \
  || echo 'PASS: env.local is local-only'
```

## 3. Input Preparation

Chọn Notion Post có `Visual Type = SINGLE STATIC` và linked Campaign hợp lệ. Cần đủ các field mà workflow đọc trực tiếp từ Post:

- `Format`, `Channel`, `Topic`, `Pillar`, `Post Message`, `Headline/Hook`, `Date`.
- `{{slogan}}` và `{{big_idea}}` được lấy qua relation `Social Media Campaigns`.
- Product/variant, offer, giá, CTA và claim phải đối chiếu với nguồn được duyệt.

Dừng nếu thiếu field bắt buộc, thiếu quyền Notion, hoặc offer/claim chưa được duyệt. Không tự điền fact thiếu.

## 4. Execution Sequence

### Bước 1 — Tạo campaign contract

Chạy `notion2goal` cho page ID hoặc title:

```text
Use skill notion2goal for page <notion_page_id>
```

Kết quả bắt buộc:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/Ticket.md
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/node/GOAL.md
```

Kiểm tra không còn placeholder trong `node/GOAL.md`:

```bash
CAMPAIGN_DIR='BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]'
test -s "$CAMPAIGN_DIR/Ticket.md"
test -s "$CAMPAIGN_DIR/node/GOAL.md"
! rg -n '\{\{[^}]+\}\}' "$CAMPAIGN_DIR/node/GOAL.md" || { echo 'BLOCKED: placeholder remains'; exit 1; }
```

### Bước 2 — Content Executive

1. Dùng `wiki-query` lấy brand voice.
2. Viết `caption.md` và `node/creative-brief.md`.
3. Bắt buộc rewrite tiếng Việt bằng nested `agy --dangerously-skip-permissions`; giữ nguyên fact, số, tên, CTA.
4. Kiểm tra rewrite không đổi nội dung so với draft.

### Bước 3 — Designer

1. Đọc `node/creative-brief.md`; chạy `creative-direction` (mode: initial).
2. Nếu direction là human/vibe-led, chạy `photography-direction`.
3. Resolve brand/product/reference cần thiết bằng `element-resolver`.
4. Render bằng `acad-image-gen`; dùng `flowkit-nano-banana-image-gen` khi direction yêu cầu Nano Banana/reference-guided.
5. Lưu final image tại campaign root; lưu `node/images-prompts.md` cho traceability.

### Bước 4 — QA và Delivery

```bash
FINAL_IMAGE="$CAMPAIGN_DIR/<final-image>.png"
test -s "$FINAL_IMAGE"
file "$FINAL_IMAGE"
```

PASS khi image có aspect ratio/kích thước khả dụng, headline/copy nằm trong safe zone, brand/product/claim đúng ticket, không còn mark bị cấm, và `node/images-prompts.md` có traceability.

`notion-publisher` writeback theo bảng Write-back của goal:

| Artifact | Posts field |
|---|---|
| caption body | `Post Message` |
| headline/hook | `Headline/Hook` |
| hashtags | `Hashtag` |
| final image | `THUMBNAIL` |
| completion | `Status = Submit to Review` |

Chỉ writeback/publish khi ticket cho phép. Viết `manifest.json` cuối, sau khi mọi QA pass.

## 5. Lỗi Phổ Biến và Cách Xử Lý

| Hiện tượng | Kiểm tra trước | Hành động |
| --- | --- | --- |
| Không tạo được `Ticket.md`/`GOAL.md` | Notion access, Visual Type, field mapping | Sửa input/quyền Notion; không tự điền fact |
| Copy tiếng Việt cứng | Nested `agy` rewrite đã chạy chưa | Chạy lại rewrite; re-read để xác nhận fact không đổi |
| Image sai aspect ratio | Ticket và skill renderer supported size | Render lại đúng size theo ticket |
| On-image text vỡ/sai | Text-in-image instruction | Regenerate với instruction chặt hơn trước khi chấp nhận |
| Brand/claim sai | `Ticket.md` + approved listing | Dừng delivery, sửa source/copy và QA lại |
| `env.local` bị track | `git ls-files` | Ngừng, xóa khỏi Git và luân chuyển credential |

## 6. Handoff Record

Sau khi chạy, ghi lại:

```text
[commit SHA / repository revision]
[Notion Post URL]
[campaign folder]
[final image path]
[manifest.json path]
[review status / blocker nếu có]
```

Final deliverables ở root campaign; `node/` giữ `GOAL.md`, creative brief, direction, prompts và QA để tái lập.
