# AI CLONE CREATIVE — Architecture & Handoff Setup

**Handoff date:** 2026-08-17
**Primary workflow authority:** `PRODUCTION/goal/[social]_[ai_clone_creative].md`
**Base workflow:** `PRODUCTION/goal/[social]_[single-static].md`
**Workspace:** `/Users/test/Documents/AI Media/Hoài Nam/INFRA`
**Revision:** `ba5eed2` (`main`)

## 1. Purpose and Outcome

Workflow này chuyển một reference creative + Notion ticket thành một ảnh xã hội gốc, an toàn thương hiệu, đồng thời tạo cặp reference image + reverse-prompt JSON dùng lại được trong Brand Template:

```text
Notion Post + linked Campaign + reference image(s)
  → Ticket.md + node/GOAL.md
  → caption.md + node/creative-brief.md
  → reference-ingestion: download + reverse-prompt JSON
  → designer: structure map + adapted prompt
  → acad-image-gen render
  → side-by-side 9/10 fidelity + brand/claim QA
  → Notion writeback + manifest.json + Status = Submit to Review
```

Đây là **adaptation cấu trúc**, không phải copy pixel, tái dùng logo, hay chuyển claim/offer chưa duyệt từ reference.

## 2. Component Table

| Layer | Component | Verified responsibility | Input/output contract |
| --- | --- | --- | --- |
| Workspace governance | `AGENTS.md`, `BASE/BASE-STRUCTURE.md`, `PRODUCTION/AGENT.md` | Singapore market, claim safety, storage/brand-kit contract | Campaign output ở `BASE/CAMPAIGNs/...`; template pair ở `BASE/BRAND KITs/...` |
| Input interface | UltimateSup Notion Posts DB + Campaigns DB + supplied reference images | Cung cấp ticket fields và reference sáng tạo | Reference là inspiration structure; không phải nguồn fact/claim |
| Workflow compiler | `PRODUCTION/.agents/skills/notion2goal/SKILL.md` | Pull Notion, chọn goal theo `Visual Type`, tạo `Ticket.md` + `node/GOAL.md` | Không còn placeholder; thiếu field bắt buộc thì dừng |
| Instruction workflow | `PRODUCTION/goal/[social]_[ai_clone_creative].md` | Mở rộng `single-static` với reference ingestion + structural fidelity 9/10 | `Ticket.md` là brief/claim authority; `node/GOAL.md` là prompt đã fill |
| Content module | `content-executive` + `wiki-query` + nested `agy` Vietnamese rewrite | Draft caption/brief, bắt buộc rewrite tiếng Việt | `caption.md` root; `node/creative-brief.md` |
| Reference ingestion | `reference-ingestion` + `reverse_prompt_template` | Tải reference vào `{{brand_template_dir}}/`, reverse-prompt thành JSON cùng basename | Cặp image/JSON parseable, discoverable theo filename |
| Design module | `designer` + `creative-direction`, `photography-direction`, `element-resolver` | Lập structure map normalized 0–1, adapt JSON, thay brand/logo/product/copy/claim | `node/clone-adaptation.md`; prompt/refs tại `node/images-prompts.md` |
| Image renderer | `acad-image-gen` | Render theo aspect ratio đã duyệt; fidelity layout cao hơn improvisation | Final image ở campaign root, không phải `node/` |
| QA/publish gate | `notion-publisher`, `notion-upload`, `manifest.json` | Writeback caption/hook/hashtag/thumbnail, set `Submit to Review`, viết manifest cuối | Không publish nếu ticket không cấp quyền |

## 3. Core Execution Flow

1. `notion2goal` tạo `Ticket.md` + `node/GOAL.md` từ Notion Post và linked Campaign.
2. `content-executive` viết `caption.md` + `node/creative-brief.md`, rồi chạy nested `agy --dangerously-skip-permissions` cho Vietnamese rewrite.
3. `reference-ingestion` resolve/download từng `{{reference_images}}` vào `{{brand_template_dir}}/`, inspect cấu trúc, reverse-prompt theo `reverse_prompt_template`, lưu JSON cùng basename và validate parseable JSON.
4. `designer` đọc brief + cặp reverse-prompt JSON, lập structure map với tọa độ normalized (0–1), giữ mechanism (composition, framing, hierarchy, lighting, prop) và thay toàn bộ brand-owned elements bằng dữ liệu ticket/brand được duyệt.
5. `designer` render bằng `acad-image-gen` với reference image là primary reference, product/logo là secondary, và structure map là hard layout constraint.
6. QA side-by-side: structural fidelity ≥ 9/10, copy legible, không còn third-party logo/product/person/price/claim/date, cặp reference/JSON reusable. Sau khi đạt, `notion-publisher` writeback và viết `manifest.json`.

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
    ├── clone-adaptation.md
    ├── images-prompts.md
    └── reference/QA/handoff files

BASE/BRAND KITs/1. Creative_Prompt_Template/Brand_Template/{brand}/
├── <stable-reference-basename>.<jpg|png>
└── <stable-reference-basename>.json
```

- Final campaign deliverables ở root; prompts, source map, QA, drafts ở `node/`.
- Brand template chỉ chứa cặp reference/JSON reusable; không đặt campaign output ở đó.
- Không ghi đè cặp reference/JSON đã tồn tại; thêm revision suffix hoặc basename mới.

## 5. New-Machine Setup

Pipeline static không cần `PRODUCTION/video_modules/`. Chỉ cần repository chính:

```bash
git clone <approved-repo-url>
cd AI-media-Agent
```

Yêu cầu runtime:

- macOS/Linux, `git`, `zsh`/`bash`, Node.js, Python 3.
- Nested `agy` CLI cho bước rewrite tiếng Việt bắt buộc.
- Các skill nằm sẵn trong `PRODUCTION/.agents/skills/`; không cần clone thêm.
- `acad-image-gen` cần service entitlement nội bộ.

## 6. Access/Security

Người nhận cần nhận qua kênh nội bộ được phê duyệt:

- `PRODUCTION/env.local` local-only, chứa `NOTION_TOKEN`.
- Notion integration có quyền đọc Posts DB `38d0831f990c802db2b1e2a7b03a05da` và Campaigns DB `3990831f990c80119e4bf38f9c68bea9`.
- Quyền dùng `acad-image-gen` theo tài khoản được cấp.
- Không commit, upload, screenshot, hoặc dán `env.local`, token, service key, hoặc reference attachment private.

Xác minh credential:

```bash
test -f PRODUCTION/env.local
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local must not be tracked'; exit 1; } \
  || echo 'PASS: env.local is local-only'
```

## 7. Test Evidence

| Item | Value |
| --- | --- |
| Campaign unit | `BASE/CAMPAIGNs/UltimateSup Plus Campaign/Instagram/Single Post/2026-08-13-clone-test/` |
| Final image | `mutant-big-green-cloned-creative.png` |
| File size | 2,282,695 bytes (~2.3 MB) |
| Format | PNG 1254×1254, 8-bit RGB |
| SHA-256 | `4d580535662419b81bde6148d88c5cf27e555507b2acfce20b366a3da9d3972c` |
| Manifest | `manifest.json` — goal `[social]_[ai_clone_creative]`, status `test_review_required`, `notion.uploaded = false` |
| What it proves | Smoke test đã tạo được cặp reference/JSON reusable trong `BASE/BRAND KITs/.../UltimateSup/`, final PNG square, không còn third-party reference logo/offer/asset; chưa publish vì không có `notion_page_id` và ticket approval |

## 8. Acceptance Criteria

1. Máy mới clone đúng revision, tạo `PRODUCTION/env.local` và xác minh không bị Git track.
2. Notion integration đọc được Posts/Campaigns DB; `notion2goal` tạo `Ticket.md` + `node/GOAL.md`.
3. Reference images được download vào đúng `{{brand_template_dir}}/`; reverse-prompt JSON parseable và cùng basename.
4. `node/clone-adaptation.md` ghi rõ structure map, fixed_structure, replaced elements, approved substitutions, unresolved gaps.
5. Final image đạt ≥ 9/10 structural fidelity và không còn third-party logo/product/person/price/offer/claim/date.
6. Cặp reference/JSON reusable được lưu trong Brand Template mà không ghi đè dữ liệu cũ.
7. `manifest.json` có traceability; Notion chỉ update khi ticket cho phép và QA pass.
8. Không có secret/credential trong repository hoặc attachment Lark.

## 9. Attachment List

1. `Architecture.md` — file này.
2. `HDSD.md` — runbook setup, chạy, QA, xử lý lỗi.
3. `social-ai-clone-creative-WORKFLOW-DIAGRAM.png` — sơ đồ 9:16 1080×1920.
4. `BASE/CAMPAIGNs/UltimateSup Plus Campaign/Instagram/Single Post/2026-08-13-clone-test/mutant-big-green-cloned-creative.png` — final test image.
5. `Lark-Message.md` — comment bàn giao sẵn sàng để dán vào Lark.
