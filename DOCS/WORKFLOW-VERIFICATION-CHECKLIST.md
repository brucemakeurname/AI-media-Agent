# Workflow Video Creative — Hướng Dẫn Nghiệm Thu

Last updated: 2026-08-13

Tài liệu này dành cho người giám sát nghiệm thu độc lập task **Tinh chỉnh Workflows Video Creative**. Nghiệm thu dựa trên khả năng tái lập workflow từ repository và một Notion Post mẫu, không chỉ dựa vào việc mở được video cuối.

> Kiểm trước khi tin: không dùng token/SSH key/Google session được dán vào tài liệu hoặc chat. Nhận quyền truy cập qua kênh nội bộ; `PRODUCTION/env.local` phải là local-only và không được commit.

## A. Điều Kiện Trước Khi Chạy

### A1. Repository và revision

```bash
git clone git@github.com:brucemakeurname/AI-media-Agent.git
cd AI-media-Agent
git status --short
git log -1 --oneline
```

- [ ] Repo clone được bằng quyền được cấp.
- [ ] Revision đang kiểm đúng commit SHA người bàn giao cung cấp.
- [ ] `git status --short` không có thay đổi trước smoke test.

### A2. Quyền và công cụ local

- [ ] Có quyền đọc Notion Post mẫu và Campaign liên kết.
- [ ] `PRODUCTION/env.local` được cung cấp qua kênh nội bộ, tồn tại local, và không xuất hiện trong `git ls-files`.
- [ ] Chrome FlowKit extension đã mở trong đúng Google profile có quyền Google Flow; không dùng profile khác để nghiệm thu.
- [ ] Có runtime mà skill yêu cầu, tối thiểu `git`, Node.js, Python, `ffmpeg`/`ffprobe`, và WhisperX khi crawl/transcribe reference.
- [ ] Đã đọc `AGENTS.md`, `PRODUCTION/AGENT.md`, goal cần kiểm và `SKILL.md` của tool trước khi chạy.

Kiểm tra credential file không bị track:

```bash
git ls-files --error-unmatch PRODUCTION/env.local >/dev/null 2>&1 \
  && { echo 'FAIL: env.local is tracked'; exit 1; } \
  || echo 'PASS: PRODUCTION/env.local is local-only'
```

## B. Smoke Test Tái Lập Từ Notion

Chọn Post mẫu có `Visual Type = AI UGC SHORT VIDEO`, Campaign link hợp lệ, platform/format đã xác định và dữ liệu đủ cho ticket. Không chạy trên post live nếu chưa được cho phép.

### B1. Kiểm `notion2goal`

- [ ] Chạy skill `PRODUCTION/.agents/skills/notion2goal/SKILL.md` theo page ID hoặc tên Post được chỉ định.
- [ ] Campaign folder được tạo đúng hợp đồng `BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]/`.
- [ ] `Ticket.md` có snapshot field, Post URL, Campaign URL và Goal Template.
- [ ] `node/GOAL.md` lấy đúng prompt template cho `Visual Type` và không còn placeholder `{{...}}`.

```bash
CAMPAIGN_DIR='BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]'
test -s "$CAMPAIGN_DIR/Ticket.md"
test -s "$CAMPAIGN_DIR/node/GOAL.md"
! rg -n '{{[^}]+}}' "$CAMPAIGN_DIR/node/GOAL.md"
```

**Pass:** Dữ liệu trong hai file khớp Notion source; không có trường bắt buộc bị bịa.  
**Fail/blocker:** Thiếu field, URL reference mâu thuẫn, hoặc placeholder còn lại. Dừng workflow và ghi owner cần bổ sung.

### B2. Kiểm content-executive

- [ ] Có `node/shooting-script.md` từ `write-shooting-script`.
- [ ] Có timing lock/audio theo hướng dẫn skill, dùng làm nguồn pack sequence `4/6/8/10s`.
- [ ] Có `node/ugc-sequence-script.md` từ `write-ai-ugc-video-sequence-script`.
- [ ] `tea-ugc-ai-realism` đã chỉnh nội dung visual hợp lệ nhưng giữ nguyên JSON schema, scene order, duration, reference, dialogue và claim.

**Pass:** JSON Omni parse được; dialogue vẫn khớp approved shooting script và ticket.  
**Fail:** JSON sai cấu trúc, sequence duration ngoài `4|6|8|10`, hoặc realism pass làm đổi thoại/claim/schema.

### B3. Kiểm designer

- [ ] Prompt nhân vật/reference được tạo qua `photography-direction` khi thiếu human reference; product asset ưu tiên Brand Kit được duyệt.
- [ ] Có character/reference asset dùng xuyên sequence nếu ticket yêu cầu continuity.
- [ ] `video-thumbnail` tạo `node/thumbnail-brief.md` từ first beat trước khi render.
- [ ] `thumbnail.jpg` được tạo bằng `acad-image-gen` tại root campaign.

**Pass:** Product/variant/logo/claim trên thumbnail khớp ticket; asset reference có trace trong `node/`.

### B4. Kiểm video-editor

- [ ] Mỗi sequence JSON được gửi vào FlowKit Omni đầy đủ và tạo scene đúng duration.
- [ ] Có bằng chứng raw clip được FlowKit upscale `VIDEO_RESOLUTION_1080P`, hoặc `ffmpeg-upscale-video` fallback được log.
- [ ] Từng scene đã download rồi mới remove watermark; raw và `_nowm` được giữ để QA.
- [ ] Có `node/scene-qa.json` với QA sau download và sau upscale/watermark removal; mọi scene có `render_verified: true`.
- [ ] Product B-roll dùng approved Brand Kit ref, có `node/broll-manifest.json`, và map video B-roll với audio A-roll/approved voice cùng timeline window.
- [ ] Đã concat, dead-air/boundary check, WhisperX đối chiếu approved voice text, HyperFrames overlay QA, burn subtitle `MAX_TOKENS=5` ở `SUB_Y_RATIO=0.75`, mix BGM/SFX, và prepend thumbnail frame 0.

**Pass:** Mọi scene và final output có traceability path; fallback kỹ thuật (nếu được phê duyệt) được ghi trong `manifest.json` cùng lý do.

## C. Kiểm Tra Final Video

Đặt `CAMPAIGN_DIR` tới campaign unit đang nghiệm thu; đặt `FINAL_VIDEO` theo tên final MP4 trong `manifest.json`.

```bash
CAMPAIGN_DIR='BASE/CAMPAIGNs/[IP] Campaign/[Platform]/[Format]/[Date Folder]'
FINAL_VIDEO="$CAMPAIGN_DIR/[final-deliverable].mp4"

test -s "$CAMPAIGN_DIR/Ticket.md"
test -s "$CAMPAIGN_DIR/thumbnail.jpg"
test -s "$CAMPAIGN_DIR/manifest.json"
test -s "$FINAL_VIDEO"

ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name \
  -of default=noprint_wrappers=1 "$FINAL_VIDEO"

mkdir -p "$CAMPAIGN_DIR/node/qa"
ffmpeg -y -i "$FINAL_VIDEO" -frames:v 1 "$CAMPAIGN_DIR/node/qa/frame-000001.jpg"
```

- [ ] Final MP4 tồn tại tại root campaign, không phải chỉ trong `node/`.
- [ ] Video là portrait `1080x1920`, FPS/codec khớp ticket hoặc manifest.
- [ ] `node/qa/frame-000001.jpg` hiển thị đúng `thumbnail.jpg`: thumbnail đã ở frame đầu tiên.
- [ ] Subtitle đúng thoại, trong safe area, không che CTA/packshot.
- [ ] Voice rõ, BGM/SFX không lấn át thoại; không có audio drop/cut không chủ ý.
- [ ] Product, flavour/variant, price/offer, claim, logo và CTA khớp `Ticket.md`/nguồn được duyệt.
- [ ] HyperFrames product/price/text overlays không che mặt, packshot label, CTA hoặc subtitle; `alpha_verified` và timing được ghi trong `node/hyperframes-overlay-manifest.json`.

## D. Ma Trận Nghiệm Thu

| Hạng mục | Bằng chứng bắt buộc | Điều kiện PASS |
| --- | --- | --- |
| GitHub | Repo URL, branch/commit SHA, clean clone | Người giám sát clone và đọc được toàn bộ goal/skill/docs. |
| Notion → filesystem | `Ticket.md`, `node/GOAL.md`, trace URLs | Mapping đúng, không placeholder, không bịa field. |
| GOAL → skills | Goal, `SKILL.md`, artifacts từng role | Đúng thứ tự `content-executive → designer → video-editor → notion-publisher`. |
| FlowKit → 1080p | Scene logs/media IDs, scene files, manifest | Upscale 1080p trước post-production; mọi exception có log. |
| Hậu kỳ | Final video, thumbnail, subtitle/audio artifacts | Thumbnail frame 0; sub, voice, BGM/SFX đạt ticket. |
| Traceability | `node/`, `manifest.json` | Có thể truy ngược final MP4 về Notion input và goal/template. |
| Claim/brand QA | Ticket và approved source | Không có claim/offer/variant sai hoặc chưa được duyệt. |

## E. Kết Luận Nghiệm Thu

- **PASS:** Tất cả điều kiện bắt buộc ở phần D đạt; lưu ghi nhận nghiệm thu cùng commit SHA, Notion Post URL, campaign folder và đường dẫn final video.
- **CONDITIONAL PASS:** Workflow chạy được nhưng có một fallback được phê duyệt; manifest nêu rõ giới hạn và owner/ngày khắc phục.
- **FAIL / BLOCKED:** Thiếu quyền, Notion mapping không đầy đủ, FlowKit sai profile/không upscale, artifact không trace được, hoặc video vi phạm ticket/claim safety. Không publish; ghi blocker vào `DOCS/BLOCKERS.md` hoặc campaign `node/` theo phạm vi.

Nghiệm thu đạt không đồng nghĩa được publish tự động. Chỉ `notion-publisher` thực hiện writeback/publish khi `Ticket.md` cho phép.
