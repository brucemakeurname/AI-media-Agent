---
name: acad-image-gen
description: >
  Tạo ảnh bằng AI ngay trong Claude/Antigravity, dùng chính 9Router API key của bạn (key
  cá nhân đã được cài sẵn khi bạn chạy lệnh setup, gắn với email của bạn). Dùng khi nhân sự
  gõ /acad-image-gen hoặc nói "tạo ảnh", "tạo hình", "vẽ giúp tôi cái ảnh", "làm thumbnail",
  "generate image", "tạo banner", "tạo icon", "ảnh minh hoạ". Sinh ảnh qua model
  cx/gpt-5.5-image của 9Router rồi lưu file PNG ra máy. KHÔNG cần API key riêng, KHÔNG cần
  cài thêm gì: chỉ đọc 2 biến môi trường mà setup đã đặt sẵn.
---

# acad-image-gen — Tạo ảnh bằng AI (dùng 9Router key của chính bạn)

Skill này giúp nhân sự Ultimate Sup tạo ảnh bằng AI ngay trong phiên Claude/Antigravity.
Mọi lệnh đều chạy qua **9Router của công ty** bằng **API key cá nhân của chính bạn** (key này
đã được cài vào `~/.claude/settings.json` khi bạn chạy lệnh setup, và gắn với email của bạn,
nên usage tính đúng vào tài khoản của bạn). Bạn KHÔNG cần nhập key, KHÔNG cần cài gì thêm.

## Khoá & endpoint lấy từ đâu (quan trọng)

Lệnh setup đã đặt sẵn 2 biến môi trường trong phiên Claude của bạn:

- `ANTHROPIC_AUTH_TOKEN` = 9Router API key CỦA BẠN (dạng `sk-...`).
- `ANTHROPIC_BASE_URL`   = endpoint 9Router của bạn, kết thúc bằng `/v1` (vd `https://ai.ultimatesup.com/v1`).

Endpoint tạo ảnh = `ANTHROPIC_BASE_URL` + `/images/generations`. Tuyệt đối KHÔNG hardcode key
hay URL nào khác, KHÔNG in key ra màn hình hay gửi đi đâu. Chỉ đọc từ 2 biến trên.

## Quy trình khi nhân sự xin tạo ảnh

### Bước 1 — Hỏi/Chốt mô tả ảnh
Nếu yêu cầu còn mơ hồ, hỏi nhanh 1 câu để rõ chủ thể + phong cách + tỉ lệ. Nếu đã rõ thì làm luôn.
Mẹo prompt: mô tả bằng tiếng Anh cho sát, nêu chủ thể, phong cách, màu, bố cục, nền. Nếu cần chữ
tiếng Việt có dấu trên ảnh thì nói rõ trong prompt (vd: 'with the Vietnamese text "Khai Trương" in bold').

### Bước 2 — Chọn kích thước
`size`: `1024x1024` (vuông, mặc định), `1792x1024` (ngang), `1024x1792` (dọc), hoặc `auto`.

### Bước 3 — Gọi 9Router và lưu PNG
Chạy lệnh sau (thay `PROMPT`, `SIZE`, `OUTPUT`). Dùng `?response_format=binary` để nhận thẳng
file PNG, không cần parse. Đặt OUTPUT vào thư mục làm việc hiện tại của nhân sự với tên gợi nhớ.

```bash
curl -sS -X POST "${ANTHROPIC_BASE_URL}/images/generations?response_format=binary" \
  -H "Authorization: Bearer ${ANTHROPIC_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"model":"cx/gpt-5.5-image","prompt":"PROMPT","size":"1024x1024","quality":"auto","image_detail":"high","output_format":"png"}' \
  --output "OUTPUT.png" -w "HTTP %{http_code} %{content_type} %{size_download}b\n"
```

- Mất khoảng 15-30 giây/ảnh (model vẽ tuần tự). Kiên nhẫn chờ.
- Kiểm tra kết quả: `file OUTPUT.png` phải báo `PNG image data`. Nếu trả về JSON (không phải PNG),
  đó là lỗi — đọc message trong JSON để báo nhân sự (vd hết quota, prompt bị từ chối).

### Bước 4 — Báo kết quả
Cho nhân sự đường dẫn file vừa lưu và mô tả ngắn. Nếu họ muốn chỉnh, sửa prompt rồi tạo lại.

## Ảnh tham chiếu (tuỳ chọn) - img2img / chỉnh sửa / đổi màu / dùng ảnh thật

Khi cần DỰA TRÊN một ảnh có sẵn (đổi màu, đổi phong cách, chỉnh sửa, hoặc lấy ảnh sản phẩm
thật làm gốc), thêm trường `image`. Bỏ qua trường này nếu chỉ tạo ảnh từ chữ.

- File trên máy (khuyên dùng): mã hoá base64 thành data URI rồi truyền vào `image`:
  ```bash
  REF="data:image/png;base64,$(base64 -i /duong/dan/anh-goc.png | tr -d '\n')"
  curl -sS -X POST "${ANTHROPIC_BASE_URL}/images/generations?response_format=binary" \
    -H "Authorization: Bearer ${ANTHROPIC_AUTH_TOKEN}" -H "Content-Type: application/json" \
    -d "{\"model\":\"cx/gpt-5.5-image\",\"prompt\":\"PROMPT mô tả thay đổi\",\"image\":\"$REF\",\"size\":\"1024x1024\",\"output_format\":\"png\"}" \
    --output "OUTPUT.png" -w "HTTP %{http_code} %{content_type}\n"
  ```
- Ảnh online: truyền thẳng URL CÔNG KHAI vào `image` (vd `"image":"https://.../anh.png"`).
  URL phải public vì backend tự tải về; URL nội bộ/localhost sẽ lỗi `407 Error while downloading file`.
- Nhiều ảnh tham chiếu: dùng mảng `"images":["ref1","ref2"]` (mỗi phần tử là URL công khai hoặc data URI).

## Mẹo & giới hạn
- Cần nhiều biến thể: chạy lệnh nhiều lần với OUTPUT khác nhau (vd `anh-1.png`, `anh-2.png`).
- Nền trong suốt: thêm vào prompt yêu cầu nền xanh lá phẳng `#00E000` (chroma key) rồi tự tách nền
  nếu cần, vì model chưa hỗ trợ tham số `background:"transparent"`.
- KHÔNG dùng cho nội dung vi phạm; ảnh tạo ra tính vào hạn mức 9Router của chính bạn.
- Nếu `ANTHROPIC_AUTH_TOKEN` hoặc `ANTHROPIC_BASE_URL` trống: nhân sự chưa chạy setup hoặc chưa
  mở Claude qua cấu hình công ty — hướng dẫn họ chạy lại lệnh setup ở trang /staff.
