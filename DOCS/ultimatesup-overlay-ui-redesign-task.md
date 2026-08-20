# Task Handoff: Redesign UI Elements — Ultimate Sup Overlay

## Mục tiêu

Thiết kế lại hệ thống UI element của preset overlay Ultimate Sup để các block nhìn đơn giản, mạnh, sạch và gần với screenshot reference hơn. Đây là task **redesign visual UI**, không phải task viết lại motion system hay tạo một handoff package khác.

Preset cần chỉnh:

`/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/`

Screenshot UI reference:

`/Users/test/Desktop/Screenshot 2026-08-20 at 11.11.35.png`

Preview baseline hiện tại:

`/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/sample.png`

## Context bắt buộc

- Structural base: `blockframe`, stage `1080×1920`.
- Overlay là full-stage transparent overlay; chỉ các UI block có chủ đích được phép paint pixel.
- Overlay được burn **trước**, subtitle được burn **sau**.
- Subtitle-safe area: `y=0.72–0.90`.
- Thị trường: Ultimate Sup Singapore. Không tự thêm giá, offer, claim, ngày tháng, CTA hoặc campaign copy thật.
- Product brand và retailer phải được phân biệt đúng: Ultimate Sup là retailer, sản phẩm có thể thuộc Mutant, PVL, Dymatize, C4, Applied Nutrition hoặc brand khác.

## Design rules đã chốt

### Typography

- Chỉ dùng bold/black sans-serif.
- Font hiện tại: `Archivo`, `Arial`, `sans-serif`.
- Text đứng riêng, nội dung thông thường: fill trắng, stroke đen.
- Text đứng riêng, nội dung nhấn mạnh: fill Ultimate Sup yellow, stroke đen.
- Không dùng serif, light/thin font, JetBrains Mono hoặc font trang trí.
- Font size phải tiếp tục đi qua `var(--v-text-scale)`.

### Product presentation

- Chỉ dùng PNG product có alpha.
- Không thêm background, card, plinth, panel hoặc nền tự fill phía sau sản phẩm.
- Chiều cao product mặc định: `320px`, tương đương `1/6` chiều cao frame.
- Tên sản phẩm luôn nằm ngay bên dưới product image.
- Product xuất hiện dưới `1.5s`: đặt giữa frame.
- Product xuất hiện trên `1.5s`: đặt ở lower third theo trục Y.

### Information UI

- Information box rộng `720px`, tương đương `2/3` chiều rộng video.
- Information box căn giữa theo trục X.
- Information box cách đáy frame `200px`.
- Background information box phải là **solid white 100%**, không translucent.
- Có thể dùng hình bình hành/parallelogram hoặc mép xiên giống screenshot.
- Hình học phải rõ nhưng tiết chế: không biến toàn bộ overlay thành các polygon rối mắt.
- Nội dung bên trong phải giữ vùng padding an toàn, không bị clip bởi `clip-path`.
- Không tạo lại lower-third bar full-width.

### Shared UI language

Thiết kế lại các primitive dùng chung trước khi chỉnh từng module:

1. Ultimate Sup brand ribbon.
2. Metric chip.
3. Bookmark/date metadata strip.
4. Solid-white information box.
5. Information rows và highlighted row.
6. Standalone outlined text.
7. Transparent product lockup.
8. Engagement/play-count marker.
9. Offer badge, price accent và progress bar.

Ưu tiên sửa bằng CSS/layout hiện có. Không tạo abstraction mới nếu selector hiện tại đã đủ để sửa.

## Sáu module phải được review

| Module | Blueprint mapping | Yêu cầu visual |
| --- | --- | --- |
| `product-pop-up` | `product-unboxing-callouts` + `process-step-reveal` | Product là focal point; callout/rule gọn; không thêm product card hoặc plinth. |
| `product-information` | `process-step-reveal` + `document-highlight-sweep` | Fact rows theo ledger rõ ràng; chỉ highlight một row; information box phải solid white. |
| `sale-badge` | `kinetic-type-beats` + `cta-button-scene` | Offer hierarchy rõ; badge/CTA compact; không làm thành poster che footage. |
| `gallery-products` | `stagger-grid-reveal` + `grid-card-assemble` | Lineup tối đa theo layout hiện tại; product PNG rời; một SKU được emphasis. |
| `hot-deal` | `kinetic-type-beats` + `titlecard-reveal` | Headline → offer → price/CTA; giữ bố cục bounded và đọc được trên footage. |
| `slide-bar` | `data-story-flow` + `bilateral-data-comparison-bars` | Ưu tiên single metric/progress; bilateral comparison chỉ dùng khi brief yêu cầu. |

Blueprint chỉ cung cấp hierarchy và signature move. Không import nguyên background, glass card, full-frame surface hoặc style xa lạ của blueprint vào Ultimate Sup preset.

## File ownership và phạm vi chỉnh sửa

### Ưu tiên chỉnh

- `/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/style.css`
- `/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/blocks/`
- `/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/modules/`
- `/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/preview/index.html`
- `/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/GUIDELINE.md` nếu token/documentation không còn khớp implementation.

### Phải giữ ổn định

- `animation.js` và tên animator của sáu module.
- `modules/module-map.json`, field names và module purpose.
- `scene-map.json`, stage `1080×1920`, transparent background.
- `animations/blueprint-map.json`, trừ khi có lý do rõ ràng và phải ghi lại thay đổi.
- `motion/motion-tokens.json`.
- Product asset paths và alpha-cutout contract.

Không tự viết animation mới chỉ để làm UI trông bắt mắt hơn. Nếu thật sự cần thay đổi motion, phải ghi rõ lý do và đánh dấu `REVIEW REQUIRED`.

## Quy trình thực hiện

1. Mở screenshot reference và `sample.png`; ghi nhận ba lỗi visual lớn nhất trước khi sửa.
2. Refine shared primitives trong `style.css` trước.
3. Apply primitives vào cả sáu module.
4. Kiểm tra riêng `product-information`, `hot-deal`, `slide-bar` vì đây là các module dễ bị rối hoặc thành lower-third.
5. Render lại preview gallery.
6. Soi ở full module size, không chỉ nhìn contact sheet thu nhỏ.
7. Cập nhật `GUIDELINE.md` nếu token solid-white/parallelogram geometry đã thay đổi.
8. Báo cáo file đã sửa, quyết định visual chính, preview paths và vấn đề còn lại.

## Lệnh render và kiểm tra

```bash
node "/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/preview/render-previews.mjs"
node "/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/validate.mjs"
node --check "/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup/animation.js"
git diff --check
```

Nếu Playwright chưa có trong runtime local, cài/repair theo workflow dependency hiện có rồi mới render; không thêm dependency không cần thiết vào brand kit.

## Acceptance criteria

- [ ] Cả sáu module đều render được.
- [ ] Brand ribbon, metric chip và information UI có geometry gần screenshot, bao gồm mép xiên/parallelogram hợp lý.
- [ ] Information box là solid white, rộng `720px`, centered và cách đáy `200px`.
- [ ] Không có full-frame background hoặc lower-third bar generic.
- [ ] Typography chỉ là bold sans-serif.
- [ ] Text thường là white fill/black stroke; text nhấn là yellow fill/black stroke.
- [ ] Product chỉ là PNG alpha, không có background/card/plinth tự thêm.
- [ ] Product name nằm dưới product image và đúng placement rule theo duration.
- [ ] Subtitle mock nằm trên overlay trong preview; subtitle-safe area vẫn được giữ.
- [ ] Blueprint mapping và named animator của sáu module vẫn được giữ.
- [ ] Không có historical offer/price/date/claim/CTA bị biến thành dữ liệu campaign hiện tại.
- [ ] `validate.mjs`, `node --check` và `git diff --check` đều pass.

## Output agent phải bàn giao

1. Các file đã chỉnh trong thư mục `ultimatesup`.
2. Preview mới: `sample.png` và sáu preview module.
3. Tóm tắt visual direction đã chọn.
4. Danh sách blueprint/module mapping được giữ nguyên hoặc thay đổi.
5. Kết quả các lệnh kiểm tra.
6. Mọi vấn đề chưa giải quyết phải ghi rõ `REVIEW REQUIRED`; không tự đoán hoặc tự chốt thay người review.
