# AI CLONE CREATIVE — Hướng Dẫn Sử Dụng

**Last updated:** 2026-08-17
**Workflow chính:** `PRODUCTION/goal/[social]_[ai_clone_creative].md`
**Workflow gốc:** `PRODUCTION/goal/[social]_[single-static].md`

Runbook chạy một creative AI clone từ reference + Notion ticket đến final image, cặp template reusable, và `manifest.json`. Đọc cùng `Architecture.md`; không thay thế `AGENTS.md`, `PRODUCTION/AGENT.md`, `Ticket.md`, hoặc `SKILL.md` của từng tool.

> Không đưa `env.local`, API key, token, service key, hoặc reference attachment private vào Git/Lark.

## 1. Setup Một Lần Trên Máy Mới

```bash
git clone <approved-repo-url>
cd AI-media-Agent
```

Pipeline static không cần `PRODUCTION/video_modules/`. Cần `git`, Node.js, Python 3, nested `agy` CLI, và service entitlement nội bộ cho `acad-image-gen`.

## 2. Access Setup

1. Nhận `PRODUCTION/env.local` qua kênh nội bộ; file phải có `NOTION_TOKEN`.
2. Notion integration phải được share vào Posts DB `38d0831f990c802db2b1e2a7b03a05da` và Campaigns DB `3990831f990c80119e4bf38f9c68bea9`.
3. Xác minh credential:

```bash
test -f PRODUCTION/env.local
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local must not be tracked'; exit 1; } \
  || echo 'PASS: env.local is local-only'
```

## 3. Input Preparation

Chọn Notion Post có `Visual Type = AI CLONE CREATIVE` và linked Campaign hợp lệ. Ngoài field giống `single-static`, cần có:

- `{{reference_images}}`: local files, public URLs, hoặc downloaded Notion attachments; phải resolve thành local file trước khi reverse-prompt.
- `{{brand_template_dir}}` = `BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/{brand}/`.
- `{{campaign_folder}}` theo `BASE/CAMPAIGNs/CAMPAIGNs-STRUCTURE.md`.

Dừng nếu thiếu reference, thiếu brand/product/logo guideline, hoặc offer/claim chưa được duyệt. Ghi `REVIEW REQUIRED` vào `node/clone-adaptation.md`, không tự điền.

## 4. Execution Sequence

### Bước 1 — Tạo campaign contract

Chạy `notion2goal` cho page ID hoặc title. Kết quả bắt buộc:

```text
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/Ticket.md
BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/node/GOAL.md
```

Kiểm tra placeholder:

```bash
CAMPAIGN_DIR='BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]'
test -s "$CAMPAIGN_DIR/Ticket.md"
test -s "$CAMPAIGN_DIR/node/GOAL.md"
! rg -n '\{\{[^}]+\}\}' "$CAMPAIGN_DIR/node/GOAL.md" || { echo 'BLOCKED: placeholder remains'; exit 1; }
```

### Bước 2 — Content Executive

1. `wiki-query` lấy brand voice.
2. Viết `caption.md` + `node/creative-brief.md`.
3. Bắt buộc nested `agy --dangerously-skip-permissions` để rewrite tiếng Việt; re-read để giữ nguyên fact/số/tên/CTA.

### Bước 3 — Reference Ingestion

1. Download từng reference vào `{{brand_template_dir}}/` với descriptive stable filename.
2. Inspect composition, hierarchy, typography, lighting, subject, background, props, crop, aspect ratio, visible text.
3. Reverse-prompt bằng `reverse_prompt_template`; viết JSON đủ schema: `project_info`, `main_subject`, `composition_elements`, `lighting_and_atmosphere`, `technical_specs`, `reference_elements`, `generated_prompt_string`, `negative_prompt`.
4. Lưu JSON cùng basename với image; validate parseable.

```bash
python3 -m json.tool "$BRAND_TEMPLATE_DIR/<stable-basename>.json" >/dev/null
```

### Bước 4 — Designer

1. Đọc `node/creative-brief.md` và cặp reverse-prompt JSON.
2. Chạy `creative-direction` (mode: initial); dùng `photography-direction` nếu human/vibe-led.
3. Resolve product/logo/brand qua `element-resolver`.
4. Lập structure map normalized 0–1 cho từng major element; ghi `node/clone-adaptation.md`.
5. Adapt JSON: giữ visual mechanism, thay brand identity, logo, product, person, copy, giá, voucher, ngày, claim, colour, typography, CTA.
6. Render bằng `acad-image-gen` với reference image là primary reference, product/logo là secondary, và structure map là hard constraint.
7. Lưu final image tại root; prompt, local refs, source JSON path, generation result vào `node/images-prompts.md`.

### Bước 5 — QA và Delivery

```bash
FINAL_IMAGE="$CAMPAIGN_DIR/<final-image>.png"
test -s "$FINAL_IMAGE"
file "$FINAL_IMAGE"
```

PASS khi:

- Side-by-side scorecard đạt ≥ 9/10 structural fidelity.
- Exact copy legible trong safe zone.
- Product/variant/offer/price/date/CTA/claim đúng approved source.
- Không còn third-party logo/product/person/price/claim/date hoặc asset bị cấm.
- Cặp reference/JSON reusable tồn tại trong `{{brand_template_dir}}/`.
- `node/clone-adaptation.md` và `node/images-prompts.md` có traceability.

`notion-publisher` writeback theo bảng Write-back:

| Artifact | Posts field |
|---|---|
| caption body | `Post Message` |
| headline/hook | `Headline/Hook` |
| hashtags | `Hashtag` |
| final image | `THUMBNAIL` |
| completion | `Status = Submit to Review` |

Chỉ writeback/publish khi ticket cho phép. Viết `manifest.json` cuối.

## 5. Lỗi Phổ Biến và Cách Xử Lý

| Hiện tượng | Kiểm tra trước | Hành động |
| --- | --- | --- |
| Không tạo được `Ticket.md`/`GOAL.md` | Notion access, Visual Type, field mapping | Sửa input/quyền Notion; không tự điền fact |
| Reverse-prompt JSON lỗi | Schema + `python3 -m json.tool` | Sửa JSON theo template; không collapse composition thành prose |
| Fidelity dưới 9/10 | Structure map, reference chính, prompt constraint | Tạo revision mới; không khai báo complete |
| Còn third-party brand/logo | Primary reference so với approved substitutions | Thay thế bằng approved equivalent; ghi lại trong `clone-adaptation.md` |
| On-image text vỡ/sai | Text-in-image instruction | Regenerate với instruction chặt hơn trước khi chấp nhận |
| Ghi đè cặp template cũ | Basename đã tồn tại | Thêm revision suffix/basename mới; không overwrite |
| Claim/offer chưa rõ | `Ticket.md` + approved listing | Dừng, ghi `REVIEW REQUIRED`; không bịa |

## 6. Handoff Record

Sau khi chạy, ghi lại:

```text
[commit SHA / repository revision]
[Notion Post URL]
[campaign folder]
[final image path]
[brand template reference image + JSON paths]
[manifest.json path]
[review status / blocker nếu có]
```

Final deliverables ở root campaign; cặp reference/JSON reusable ở Brand Template; `node/` giữ `GOAL.md`, brief, clone-adaptation, prompts và QA để tái lập.
