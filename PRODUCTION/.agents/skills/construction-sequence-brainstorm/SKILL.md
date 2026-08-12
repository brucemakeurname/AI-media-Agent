---
name: construction-sequence-brainstorm
description: Brainstorm a technically-correct, building-type-appropriate construction stage sequence (kỹ thuật thi công) plus realistic site-organization details (tổ chức thi công) — grounded in real Vietnamese civil-engineering curriculum (Giáo trình Kỹ thuật thi công, Giáo trình Tổ chức thi công, Luật Xây dựng công trường requirements). Any workflow that needs a believable construction-progress stage list (e.g. `ai-construction-timelapse-short-video`) should consult this skill instead of inventing generic "more progress" stages.
---

# construction-sequence-brainstorm

A construction timelapse (or any content depicting a build progressing) is only believable if the
stage order and site details match how real construction actually happens. This skill is a
knowledge/brainstorm layer — it does not touch images, video, or Veo calls (see `ai-timelapse-
video` for those mechanics). It exists so that stage lists fed into that pipeline are grounded in
real technique and organization practice, not invented from surface-level "watch it get built"
intuition.

Sources: Giáo trình Kỹ thuật thi công (Bộ Xây Dựng / NXB Xây Dựng — chương Thi công đất, Thi công
cọc, Thi công bê tông và bê tông cốt thép, Công tác xây, Công tác hoàn thiện), Giáo trình Tổ chức
thi công (Bộ Xây Dựng — lập tiến độ, thiết kế tổng mặt bằng thi công), Luật Xây dựng's công trường
requirements (Điều 74 — hàng rào, biển báo, an toàn lao động), and web-verified technical detail on
móng nông vs móng cọc classification, cọc ép/cọc ly tâm/cọc khoan nhồi cấu tạo và kỹ thuật thi công
(corrected/expanded 2026-07-22 after a live dry-run test caught internal móng-phase sequencing
errors and missing equipment/safety detail — see the version note at the bottom of this skill).

## Step 1 — Classify building type and scale first

The correct technique/foundation/organization path depends entirely on this classification —
never default to one path without checking it against the ticket's actual subject:

| Building type | Typical scale | Technique path notes |
|---|---|---|
| Nhà dân dụng thấp tầng (nhà phố, biệt thự, nhà cấp 4) | 1-4 tầng | Most common social-content case. Móng băng/móng đơn, khung BTCT đổ tại chỗ theo tầng, xây gạch chèn khung, mái bằng BTCT hoặc mái ngói/tôn. |
| Nhà cao tầng / chung cư | 5+ tầng | Móng cọc/móng bè (thường có tầng hầm), thi công lặp lại theo tầng điển hình (cột-sàn-vách lõi cứng), cẩu tháp, vận thăng lồng, thời gian mỗi tầng lặp theo chu kỳ cố định. |
| Công trình công nghiệp (nhà xưởng, nhà kho) | Nhịp lớn | Móng đơn/móng cọc dưới cột thép tiền chế, kết cấu thép lắp ghép (không đổ tại chỗ như dân dụng), mái tôn nhịp lớn, ít/không có công tác hoàn thiện nội thất kiểu nhà ở. |
| Hạ tầng (cầu, đường) | — | **Out of scope for this skill** — different technique domain entirely (không có phần "hoàn thiện nội thất", quy trình khác hẳn). Flag to CMO rather than force-fit the nhà-dân-dụng stage list onto this. |

Default assumption when a ticket doesn't specify: **nhà dân dụng thấp tầng** (nhà phố/biệt thự) —
this is the overwhelmingly common case for social-content construction reveals/timelapses.

## Step 2 — Pick the foundation (móng) category and type

Móng splits into two families by chiều sâu chôn móng — pick the family first, then the specific
type within it. Real selection depends on soil survey + load, not just building size — but for
content-generation purposes (no real soil report exists for an illustrative/generated site), pick
per this simplified mapping and state the assumption explicitly in the stage brief.

### A. Móng nông (shallow foundation) — no ma sát hông (side friction) load transfer, direct bearing near the surface

| Móng type | Cấu kiện chính | When | Visual signature (get this exact — the #1 realism failure mode after finishing order) |
|---|---|---|---|
| Móng đơn (móng cốc) | One isolated square/rectangular bê tông cốt thép pad per column, độc lập, không liên kết nhau (ngoài giằng móng nhẹ nếu có) | Nhà nhỏ, tải trọng thấp, đất tốt (nhà cấp 4, cột đơn lẻ) | **Large, discrete square/rectangular excavation pits and poured pads**, one per column position, clearly sized (not thin slits) — pits are separate holes with visible gaps of undisturbed earth between them, not a connected trench |
| Móng băng | Continuous bê tông cốt thép strip running under every load-bearing tường/hàng cột, either băng một phương (one direction) or băng giao nhau (cross-grid, two directions) | **Default for nhà phố/biệt thự 2-4 tầng** — tường/khung chịu lực liên tục, đất nền trung bình | **Wide continuous trench** (not a thin line) tracing the building's full perimeter + internal load-bearing lines in a grid, poured as a continuous strip footing with rebar starter bars at every column/grid intersection |
| Móng bè (móng bản/toàn diện) | One continuous bê tông cốt thép slab/bản covering the entire building footprint, optionally with dầm sườn (stiffening ribs) in a grid pattern on top | Đất yếu, công trình có tầng hầm/bể chứa/hồ bơi, hoặc cần độ cứng lớn/chống lún lệch | **Mass excavation of the entire footprint in one operation** (not trenches, not partial) — a single large flat-bottomed pit covering 100% of the plot, later filled by one continuous reinforced concrete slab across the whole footprint (optionally with a visible grid of stiffening dầm sườn ribs on top), rebar starter bars for columns rising from the slab at grid points |

### B. Móng cọc (deep/pile foundation) — load transfers via ma sát hông + mũi cọc down to a deep bearing layer, always paired with đài cọc (pile cap) + giằng móng on top

| Cọc type | Cấu kiện & production | Kỹ thuật thi công | Visual signature |
|---|---|---|---|
| Cọc ép/đóng (cọc bê tông cốt thép đúc sẵn) | Solid square-section (thường 250×250 hoặc 300×300mm) precast reinforced-concrete segments, đúc sẵn tại bãi đúc/nhà máy, nối các đoạn bằng hàn bản mã thép khi hạ xuống sâu | Segments are pressed into the ground by a static hydraulic press rig (robot ép cọc — either ép neo, anchored by ground anchors, or ép tải, weighted down by stacked concrete counterweight blocks) or driven by a diesel/hydraulic búa đóng cọc (pile-driving hammer rig) — no on-site concrete pour for the pile itself | Stacked square precast pile segments waiting on site, a press rig with either a tower of counterweight concrete blocks or ground anchors, welded splice joints visible between segments as each is driven deeper, pile heads left proud of finished grade until cut to level |
| Cọc ly tâm (PC/PHC — cọc bê tông ly tâm ứng suất trước) | Hollow circular-section precast pile (thường D300-D500mm), sản xuất bằng công nghệ quay ly tâm (centrifugal spinning) tại nhà máy với bê tông mác cao/ứng suất trước — higher strength and lighter than solid cọc ép for the same load | Same on-site method as cọc ép — pressed (ép tĩnh) or driven (đóng) by the same rig types — the difference is entirely in how the pile itself was made (factory-spun hollow tube vs solid precast), not in the site equipment | Round hollow pile segments (visibly tubular in cross-section at any cut/joint) instead of square, otherwise same press-rig/counterweight or hammer-rig visual as cọc ép |
| Cọc khoan nhồi (cọc nhồi, cast-in-place/bored pile — "cọc bê tông đổ tại chỗ" is the same category, most sources use the two terms interchangeably; where a project distinguishes them, "đổ tại chỗ" sometimes refers to a smaller manually-dug variant while "khoan nhồi" is the large mechanized version) | Concrete poured directly into a drilled hole in the ground (không đúc sẵn, không ép/đóng) — the pile is created in place | A rotary drilling rig (giàn khoan cọc nhồi) bores a hole (D600-2000mm) using a steel ống vách (casing) near the surface plus bentonite slurry to hold the hole open in deeper soil; hole bottom is cleaned (thổi rửa); a pre-fabricated rebar cage (lồng thép) is lowered in by crane; concrete is poured via ống tremie (tremie pipe) from the bottom up, displacing the bentonite slurry, which is recovered/reused | A tall rotary drilling rig/derrick over each pile position (worked one position at a time, not simultaneously — this is the one sub-step where "the whole footprint progresses at once" does NOT apply the same way, since piles are bored sequentially one hole at a time), a bentonite mixing/storage tank battery on site, mud/spoil piles from each bored hole, a crane lowering rebar cages, no press rig or counterweight blocks (that's cọc ép/ly tâm's signature, not this one) |

**Whichever family/type is chosen, the foundation work must cover the building's ENTIRE footprint
as one operation before moving to the next construction phase** — for móng nông this means the
excavation/pour; for móng cọc this means every pile position across the whole footprint must be
completed (and, for khoan nhồi specifically, bored one at a time in sequence, not simultaneously)
before đài cọc/giằng móng work begins anywhere — see Step 3 item 2's internal ordering rule below.
A keyframe or animation that shows only half the plot's piles/pads/slab done while the rest sits
untouched is wrong regardless of móng type.

## Step 3 — Standard kỹ thuật thi công (technique) stage order, ground to roof shell

This is the real engineering sequence for a nhà dân dụng thấp tầng with khung BTCT (the default
case) — do not reorder these:

1. **Chuẩn bị mặt bằng** — giải phóng/dọn mặt bằng, định vị tim trục công trình bằng cọc mốc và
   dây căng, dựng hàng rào + biển báo công trình (bắt buộc theo Luật Xây dựng Điều 74 — tên công
   trình, giấy phép xây dựng, thời gian khởi công/hoàn thành), lán trại tạm, tập kết đợt vật tư đầu
   (thép, gạch, không phải toàn bộ vật tư của cả công trình).
2. **Thi công móng — strict internal sub-order, never collapse or reorder these. Branches by
   móng family chosen in Step 2:**

   **Nếu móng nông (móng đơn/băng/bè):**
   1. **Đào đất** — đào TOÀN BỘ các hố/hào/mặt bằng theo đúng hình dạng của loại móng đã chọn
      (móng đơn: từng hố rời rạc; móng băng: hào dải liên tục theo chu vi+lưới; móng bè: đào toàn
      bộ diện tích mặt bằng trong một lượt). **The entire footprint's excavation must finish
      before any concrete work starts anywhere on it** — do not pour one section while another
      section is still unexcavated.
   2. **Đổ bê tông lót** — phủ khắp toàn bộ đáy hố/đáy bản vừa đào (tạo phẳng, chống mất nước xi
      măng xuống đất).
   3. **Gia công + lắp đặt cốt thép** — lớp thép bản/đài (lớp dưới) lắp trước, đặt con kê bảo vệ
      lớp bê tông, sau đó lắp thép dầm móng/giằng móng liên kết vào lớp thép bản/đài.
   4. **Lắp dựng cốp pha (ván khuôn)** cho dầm móng/giằng móng — cốp pha gỗ dán/thép trên khung đỡ,
      cố định bằng giàn giáo ống thép nếu dầm nổi cao hơn mặt bản.
   5. **Đổ bê tông móng (bản/đài) và dầm móng/giằng móng** — nguyên tắc đổ xa trước gần sau, đổ
      liên tục trong 1 đợt để tránh mạch ngừng sai vị trí.
   6. **Bảo dưỡng bê tông** — tưới nước/che phủ liên tục 2-3 ngày; tháo cốp pha chỉ sau khi bê tông
      đạt cường độ tối thiểu (không tháo ngay).

   **Nếu móng cọc (cọc ép/ly tâm/khoan nhồi) — a materially different sequence, not a variant of
   the above:**
   1. **Tập kết + huy động thiết bị ép/khoan cọc** — press rig + counterweight blocks or hammer
      rig (cọc ép/ly tâm), or a rotary drilling rig + bentonite mixing station (cọc khoan nhồi),
      mobilized to site before any pile work starts.
   2. **Thi công TOÀN BỘ cọc trên khắp mặt bằng theo lưới thiết kế** — cọc ép/ly tâm: press/drive
      every pile position in sequence, splicing segments deeper as needed; cọc khoan nhồi: bore,
      clean, lower rebar cage, and tremie-pour **one hole at a time** (this method is inherently
      one-at-a-time, not simultaneous across the footprint — but the "entire footprint" rule still
      applies at the phase level: every pile position must be finished before moving to step 3,
      even though each individual pile is bored sequentially). Do not show đài/giằng work starting
      while pile positions elsewhere on the footprint are still incomplete.
   3. **Đào đất lộ đầu cọc đến cao độ cắt** (đào xung quanh/trên đầu các cọc đã thi công xong trên
      toàn bộ mặt bằng), **cắt đầu cọc** đến cao độ thiết kế, loại bỏ bê tông đầu cọc kém chất lượng.
   4. **Đổ bê tông lót** dưới đài cọc.
   5. **Gia công + lắp đặt cốt thép đài cọc + giằng móng**, liên kết vào thép chờ lộ ra từ đầu cọc.
   6. **Lắp dựng cốp pha (ván khuôn)** cho đài cọc + giằng móng.
   7. **Đổ bê tông đài cọc + giằng móng** trên toàn bộ mặt bằng.
   8. **Bảo dưỡng bê tông** — tưới nước/che phủ liên tục 2-3 ngày; tháo cốp pha chỉ sau khi bê tông
      đạt cường độ tối thiểu.

   Rebar starter bars for columns remain exposed at the end of this phase, regardless of family.
3. **Thi công phần thân (khung chịu lực BTCT) — chỉ bắt đầu sau khi Bước 2 hoàn tất TRÊN TOÀN BỘ
   mặt bằng, không phải một phần. The ENTIRE frame, every floor, must top out completely BEFORE
   any tường xây starts anywhere — never interleave "frame floor N → walls floor N → frame floor
   N+1"; walls are a wholly separate phase that starts only after Step 3 item 3 finishes.**
   Sequence, repeating floor by floor from the ground up:
   1. Đổ sàn nền/sàn tầng trệt (ground floor slab) trên móng.
   2. Lắp cốt thép cột tầng 1 — **cốt thép cột phải kéo dài lên trên (thép chờ), trở thành cột
      chờ nối tiếp cho cột tầng 2** (real reinforced-concrete frames never fully terminate a
      column's rebar at each floor slab; the splice always projects upward into the next floor).
   3. Ghép cốp pha cột (ván khuôn gỗ dán hoặc ván khuôn nhôm định hình, ốp quanh cột) → đổ bê tông
      cột tầng 1.
   4. Cốt thép dầm tầng 1 → ghép cốp pha dầm (ván đáy dầm + ván thành dầm) **đỡ bằng hệ thanh
      chống (cây chống thép/gỗ hoặc giáo chống tổ hợp) từ sàn tầng dưới lên** — dầm/sàn không tự
      đứng được khi mới đổ, thanh chống là bắt buộc, không phải tùy chọn.
   5. Cốt thép sàn tầng 2 → ghép cốp pha sàn (đỡ bởi cùng hệ thanh chống ở bước 4) → đổ bê tông
      dầm + sàn tầng 2 đồng thời.
   6. Tháo cốp pha + thanh chống cột/dầm/sàn tầng 1 chỉ sau khi bê tông đạt cường độ tối thiểu
      (~50% ở 7 ngày cho khẩu độ <2m, ~70% ở 10 ngày cho khẩu độ 2-8m, ~90% cho khẩu độ >8m —
      không tháo sớm).
   7. Lặp lại các bước 2-6 cho cột/dầm/sàn tầng tiếp theo, cho đến khi topping out (đổ xong sàn
      mái/tầng cao nhất).
   Giàn giáo bao che kèm lưới an toàn bắt buộc từ tầng 2 trở lên trong suốt quá trình này (Step 5).
   **Any keyframe showing the frame mid-construction (not yet topped out) must show ván khuôn +
   thanh chống actively in place on the current top floor being poured, while fully-cured lower
   floors already have their formwork/shoring struck — never show a bare, formwork-free concrete
   frame while it's still being built.**
4. **Thi công tường xây — chỉ bắt đầu sau khi khung đã topping out hoàn toàn (mọi tầng, kể cả tầng
   mái), bắt đầu từ tầng 1 và đi lên** — xây tường bao + tường ngăn bằng gạch/block chèn vào khung
   (không chịu lực, khác với móng băng chịu lực ở bước 2), để chừa lỗ cửa đi/cửa sổ/lỗ kỹ thuật
   đúng vị trí bản vẽ. Never show walls rising on an upper floor while the frame above it is still
   under construction — walls and frame never happen at the same height at the same time.
5. **Thi công mái** — nếu mái là sàn BTCT phẳng, mái đã được đổ như một tầng trong chu trình ở
   Bước 3 item 3 (không phải bước riêng); bước này chỉ áp dụng khi mái là dạng khung kèo + lợp
   ngói/tôn (phổ biến nhà cấp 4/nhà xưởng, không đổ BTCT phẳng) — dựng khung kèo + lợp mái sau khi
   khung topping out.

**The single most common realism failure in a generated construction sequence: showing phần thô
(or any part of the structure) rising on part of the footprint while another part of the same
footprint still has no foundation, OR showing walls being built on a floor while the frame above
that floor is still under construction/unfinished.** Real construction always completes the entire
foundation across 100% of the footprint before the frame starts anywhere, and always tops out the
entire frame before masonry infill starts anywhere — there is no such thing as "half the house has
a 2nd floor while the other half is still an open foundation pit," and no such thing as "ground
floor already has brick walls while the 3rd floor's columns are still being poured."

**End of phần thô (rough shell): khung-sàn-tường-mái hoàn chỉnh, cửa/cửa sổ CHƯA lắp, tường CHƯA
tô trát, CHƯA sơn, giàn giáo/vật liệu vẫn còn trên site.** This is the correct "phần thô" visual
state — do not depict painted or plastered walls at this stage.

## Step 4 — Standard trình tự hoàn thiện (finishing) order

This order is load-bearing for realism — reversing any of these steps is the single most common
way a generated "finished building" reads as fake to anyone who has watched real construction:

1. **Tô trát tường** (trong và ngoài) — lớp vữa trát phủ lên khối xây gạch thô.
2. **Chống thấm** — mái, sân thượng, nhà vệ sinh, chân tường ngoài (sau tô trát, trước ốp lát/sơn).
3. **Cán nền, trát trần**.
4. **Đi đường điện nước âm tường/âm sàn (M&E rough-in)** — cắt rãnh tường luồn ống, cố định ống,
   trám vữa lại vết cắt (visually: short trench-cut lines in already-plastered walls, or this step
   folded invisibly into stage 1 if the keyframe granularity doesn't need to show it separately).
5. **Ốp lát gạch** — nền, tường, cầu thang, nhà vệ sinh, ban công (ban công cần độ dốc thoát nước —
   a detail worth naming if that element is visible in frame).
6. **Sơn nước** — bả matit → sơn lót → sơn màu hoàn thiện (thường 2 lớp phủ). Never show painted
   walls before tô trát/ốp lát in an earlier keyframe.
7. **Lắp đặt cửa, cửa sổ, lan can, thiết bị điện (công tắc/ổ cắm/đèn), thiết bị vệ sinh** (bồn cầu,
   lavabo, vòi sen).
8. **Dọn dẹp công trường, hoàn thiện ngoại thất** — sân/lối đi lát đá, hàng rào/cổng nhà thật thay
   cho hàng rào công trường tạm, biển tên nhà thay cho biển báo công trình, cây xanh/sân vườn.

## Step 5 — Tổ chức thi công (site organization) details to seed into every keyframe's background

These are cross-cutting realism cues, not separate timelapse stages — weave the ones relevant to
each stage into that keyframe's `composition_elements`:

- **Hàng rào + biển báo công trình** (mandatory by law at chuẩn bị mặt bằng through phần thô;
  legally must show tên công trình, giấy phép xây dựng, thời gian khởi công/hoàn thành) — present
  from stage 1 onward, removed/replaced only at the final hoàn thiện stage (real house
  gate/nameplate replaces it).
- **Vật tư tập kết theo tiến độ, không phải toàn bộ 1 lần** — a pile of rebar/brick at the
  mặt-bằng stage should look like a first delivery, not the full project's material stock; the
  pile composition shifts across stages (steel/brick early, sand/cement bags during phần thô,
  cleared away entirely by hoàn thiện).
- **Giàn giáo + lưới an toàn (not optional from tầng 2 trở lên)** — scaffolding present through
  phần thô and early hoàn thiện (tô trát/sơn need it for upper floors/mái), gone by the final
  stage. **The safety netting must run as ONE CONTINUOUS wrap covering every floor from tầng 2
  all the way up to the topmost floor currently being worked on — never a single band at just one
  floor, and never only covering half of the top floor.** For a 2-storey building this means the
  entire upper floor is netted; for a 6-storey building this means floors 2 through 6 are ALL
  netted continuously, not just the very top one. State the building's floor count explicitly
  when describing this (e.g. "green safety netting wraps continuously from the 2nd floor to the
  6th floor, covering every floor in between") — leaving it as a vague "netting on the scaffolding"
  is exactly what produces a single stray band instead of full coverage. This is a real
  safety-code requirement, not a stylistic option, and partial/single-floor coverage is as much of
  a realism red flag as no netting at all.
- **Site equipment/vật tư thi công, matched to building scale (Step 1):**
  - Nhà thấp tầng (default case): a small motorized **máy trộn bê tông** (drum concrete mixer) on
    the ground near the material pile; a simple **tời/vận thăng** (material hoist — a vertical
    frame with a pulley/winch, not a tower crane) mounted against the building to lift bricks/
    cement/concrete buckets to upper floors — narrow urban lots have no room for a tower crane;
    **ván khuôn (cốp pha)** — plywood/timber or steel formwork panels visibly wrapping columns/
    beams/slab edges during the phần thô stage (partially struck/removed on some members, still
    in place on others, is realistic — don't show a "clean" bare concrete frame with zero
    formwork anywhere, that only happens after full strike).
  - Nhà cao tầng/chung cư: **cần trục tháp** (tower crane) instead of a hoist, **máy bơm bê tông**
    (concrete pump truck/boom) instead of a small ground mixer.
  - **Công nhân** (workers, in mũ bảo hộ + đồ bảo hộ) present during any actively-under-
    construction stage (móng, phần thô) adds realism — safe to omit at the final hoàn thiện
    "reveal" stage where the shot is meant to read as an empty, move-in-ready result.
- **An toàn lao động cues (beyond scaffolding netting)** — biển cảnh báo hố móng/khu vực nguy
  hiểm, rào chắn quanh hố đào sâu.
- **Ngày/đêm — công trường thật hoạt động theo giờ hành chính, không thi công xuyên đêm** (Vietnamese
  construction sites typically work daytime hours only — nighttime work is the exception, not the
  norm, and disallowed by local noise/hour ordinances in residential areas absent a special permit
  or a deadline crunch). This matters because a real project spans weeks/months, so any timelapse
  segment bridging more than a single day must depict the passage of many nights — but a night
  frame should show the site **quiet, dim, security/floodlight-only**, not actively worked under
  lights. See `ai-timelapse-video` §2/§4 for how this translates into the animation prompt (multiple
  day→night→day cycles per segment, ending back at the keyframes' shared daylight condition).
- **Relative timeframe** — for a nhà phố/biệt thự 200-400m², total real build time runs ~3-5
  tháng (móng: vài tuần; phần thô: thường the longest phase, 1-2 tháng; hoàn thiện: 1-2 tháng). Use
  this only to keep each timelapse segment's "time accelerates" narrative proportionate — don't
  imply phần thô finished faster than móng, or hoàn thiện took longer than phần thô, unless the
  ticket's real project timeline says otherwise. Combined with the day/night point above: a
  phần-thô segment spanning 1-2 tháng should narrate noticeably more day/night cycles than a
  móng segment spanning only a few weeks.

## Step 6 — Candidate stage boundaries (not a fixed keyframe count)

The phases in Steps 3-4 above are the **full menu** of candidate keyframe boundaries this domain
has — how many of them a given ticket actually uses is not fixed here. Hand this full menu (with
each candidate's explicit state-delta and Step 5's site-organization details) to
`write-ai-timelapse-video-sequence-script`, which runs the real test per ticket: keep a boundary
as a keyframe only if it's visually distinguishable from its neighbor in a single photo, then
apply the ticket's duration budget backward if one exists (see that skill's Step A). Never assume
a specific count in advance — the candidates below are the same regardless of how many a given
ticket ends up keeping:

- Mặt bằng trống (chuẩn bị mặt bằng, Step 3 item 1)
- Móng giai đoạn 1 — móng nông: đào xong, chưa đổ bê tông (end of Step 3 item 2's sub-step 1);
  móng cọc: toàn bộ cọc đã ép/khoan xong trên mặt bằng, chưa đào lộ đầu cọc/đổ đài (end of sub-step 2)
- Móng giai đoạn 2 — móng nông: đổ xong (end of sub-step 6); móng cọc: đài cọc + giằng móng đổ
  xong (end of sub-step 8)
- Khung topping out — toàn bộ cột/dầm/sàn các tầng đã đổ xong, chưa xây tường (end of Step 3 item 3)
- Phần thô xong — tường xây + mái xong, chưa tô trát (end of Step 3 item 5)
- Hoàn thiện xong (end of Step 4)

**Móng giai đoạn 1/2 are usually two visually distinct keyframes for móng bè/móng cọc** (mass
excavation or bare pile heads look materially different from the poured/capped result — collapsing
them is what previously caused a "half the plot excavated, half already built" animation artifact,
see Step 3 item 2's ordering rule) **and are more often collapsible into one "móng xong" keyframe
for móng đơn/móng băng**, whose excavation-to-pour visual delta is smaller — but this is a
description of what's *usually* visually distinguishable, not a rule to apply without checking the
specific ticket. Khung-topping-out as its own keyframe (separate from phần thô) is usually only
worth keeping for taller buildings where the frame-then-walls distinction (Step 3 item 3/4) is a
significant fraction of the process — a 2-storey nhà phố may reasonably collapse it into phần thô.

## Do / Don't

- DO classify building type (Step 1) and pick a foundation type (Step 2) before writing any stage
  list — don't default to móng băng language for a ticket that's actually a nhà xưởng or chung cư.
- DO complete the entire foundation (excavation through bảo dưỡng, Step 3 item 2) across 100% of
  the footprint before any part of the frame/phần thô begins anywhere — never let a keyframe or an
  animation prompt imply partial-footprint progress (half built, half untouched).
- DO render each móng type's correct visual signature (Step 2 tables) — large discrete pads for
  móng đơn, a wide continuous trench for móng băng, one mass excavation across the whole footprint
  for móng bè. Never draw thin slit trenches for móng bè or móng đơn.
- DO pick the right móng cọc equipment/cross-section for the chosen type — square precast segments
  + a press rig with counterweight blocks (or a hammer rig) for cọc ép; round hollow precast
  segments with the same press/hammer rig for cọc ly tâm; a rotary drilling rig + bentonite tanks
  (no press rig, no counterweight blocks) for cọc khoan nhồi. Never show a khoan nhồi drilling rig
  and a cọc ép press rig on the same site — they're mutually exclusive methods.
- DO show cọc khoan nhồi piles bored one at a time (sequential), not simultaneously across the
  footprint — the "whole footprint together" rule applies at the phase level (all piles done
  before đài/giằng starts) but not to each individual bore.
- DO keep "móng đào xong" and "móng đổ xong" as two separate keyframes (Step 6) whenever the
  foundation type is móng bè or móng cọc and they pass the visual-distinguishability test —
  collapsing them into one keyframe is what causes uneven-progress animation artifacts. Don't
  assume a specific total keyframe count in advance; run the test per ticket.
- DO top out the ENTIRE frame (every floor's cột→dầm→sàn cycle, Step 3 item 3) before any tường
  xây starts anywhere — walls are a separate phase that begins only after the whole frame finishes,
  starting from floor 1 upward. Never narrate or draw walls rising on a floor while the frame above
  it is still under construction.
- DO show ván khuôn (gỗ dán hoặc nhôm định hình cho cột; ván đáy+thành cho dầm/sàn) plus thanh
  chống (cây chống/giáo chống) actively in place on whichever floor's cột/dầm/sàn is currently
  being poured, in any keyframe or animation depicting the frame mid-construction — dầm/sàn
  formwork is never self-supporting, shoring is mandatory, not optional.
- DO keep column rebar starter bars projecting upward past each floor's slab (cột chờ) — a real
  frame's column reinforcement always splices into the floor above, it never terminates flush at
  the slab.
- DO follow the real finishing order (tô trát → chống thấm → cán nền/trát trần → M&E âm tường →
  ốp lát → sơn → lắp thiết bị → ngoại thất) exactly — this is the most-checked realism detail.
- DO keep hàng rào/biển báo/vật tư/giàn giáo+lưới an toàn/ván khuôn/tời-hoặc-cần trục tháp/máy
  trộn-hoặc-máy bơm/công nhân present and evolving across stages per Step 5, not just the bare
  building in isolation against an empty site.
- DO pick keyframe boundaries at real phase-completion points (Step 6) — never split a single
  phase into two visually-indistinguishable keyframes.
- DON'T show painted or ốp-lát'd surfaces before tô trát has happened in an earlier stage.
- DON'T show finished windows/doors installed while the tường around them is still bare brick.
- DON'T show scaffolding reaching a 2nd floor or higher with no safety netting.
- DON'T show safety netting as a single band on only one floor (or half a floor) — it must wrap
  continuously from floor 2 to the current topmost floor, every floor in between included.
- DON'T show a phần thô-stage concrete frame with zero ván khuôn/cốp pha visible anywhere — some
  members mid-strike is realistic, a fully "clean" bare frame is not.
- DON'T interleave frame and walls by floor (e.g. "floor 1 gets walls while floor 2's columns are
  poured") — the entire multi-floor frame tops out first, then walls proceed floor 1 upward.
- DON'T show a bare concrete frame under active construction with no formwork/shoring anywhere on
  its current top floor — that floor's concrete can't stand unsupported yet.
- DON'T invent a "hạ tầng" (bridge/road) stage list — that's out of scope; flag CMO instead.
- DON'T let segment/stage timing imply phần thô is faster than móng, or hoàn thiện longer than
  phần thô, without a ticket-specific reason to override the Step 5 relative-timeframe default.

## Revision note (2026-07-22)

A live dry-run (`_workflow-tests/construction-timelapse-test-v2/`) surfaced two real gaps: (1) the
original Step 3 "Thi công móng" item collapsed excavation→pour→dầm giằng into one undifferentiated
block, which let the animation prompt invent an uneven "half the plot excavated, half already
built" bridging motion — fixed by the explicit 6-step (móng nông) / 8-step (móng cọc) internal
ordering above, plus giving the excavated-vs-poured states their own keyframes (Step 6) when they
pass the visual-distinguishability test; (2) keyframes were missing ván khuôn, tời/cần trục tháp,
máy trộn/máy bơm, lưới an toàn on scaffolding, and công nhân — fixed by Step 5's equipment/safety
list. A follow-up request then asked for the móng nông/móng cọc family split with cấu kiện-level
detail per cọc type (cọc ép, cọc ly tâm, cọc khoan nhồi) — that's Step 2 section B above.
Re-verified via `_workflow-tests/construction-timelapse-test-v3/` (móng bè, 5 keyframes) — see
that folder for the corrected keyframes/segments. **2026-07-22 follow-up:** Step 6's fixed
keyframe-count table (3/4/5/6 with a "default N=4/5") was removed in favor of the candidate-
boundary menu above plus `write-ai-timelapse-video-sequence-script`'s per-ticket
visual-distinguishability test — a fixed default was itself the root cause of collapsing
distinguishable states together.

## Graph

**Consumer (mechanics this feeds):** [[INHOUSE TEAMS/2. Production/Social Media/.claude/skills/ai-timelapse-video/SKILL|ai-timelapse-video]]
**Used by:** [[INHOUSE TEAMS/2. Production/Social Media/WORKFLOWS/[social]_[ai-construction-timelapse-short-video]|ai-construction-timelapse-short-video workflow]]
**Reference sources:** Giáo trình Kỹ thuật thi công (Bộ Xây Dựng/NXB Xây Dựng) · Giáo trình Tổ chức thi công (Bộ Xây Dựng) · Luật Xây dựng Điều 74 (công trường requirements)
