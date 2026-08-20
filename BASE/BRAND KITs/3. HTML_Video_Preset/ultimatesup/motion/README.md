# Motion selection

The motion system is intentionally small. Select the module by scene purpose, then use its named
animator from `animation.js`. Timing values live in `motion-tokens.json`; composition HTML should
not contain a second, one-off GSAP timeline. Motion acts on the `bf-*` frame grammar, not on a
generic card abstraction.

| Purpose | Module | Focal motion |
| --- | --- | --- |
| Introduce one SKU | `product-pop-up` | Packshot rise and yellow edge sweep |
| Explain product facts | `product-information` | Fact rows stagger in |
| Mark an offer | `sale-badge` | Badge scale-in and rule draw |
| Show a lineup | `gallery-products` | Product tiles stagger left-to-right |
| Emphasise a deal | `hot-deal` | Deal block lift and price reveal |
| Show progress/threshold | `slide-bar` | Bar fill and value count-in |
