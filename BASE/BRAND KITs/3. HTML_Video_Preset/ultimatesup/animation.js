const usAll = (scene, selector) => Array.from(scene.querySelectorAll(selector));
const usOne = (scene, selector) => scene.querySelector(selector);

const usExit = (scene, tl, start, duration) => {
  const targets = usAll(scene, '.us-info-box,.us-product-lockup,.us-gallery-row,.us-gallery-label,.us-product-note,.us-engagement');
  if (targets.length) tl.to(targets, { y: -8, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'power2.in' }, start + Math.max(0, duration - 0.5));
};

const usChromeEntry = (scene, tl, start) => {
  const brand = usOne(scene, '.us-brand-strip');
  if (brand) tl.fromTo(brand, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: 'power3.out' }, start + 0.06);
  const metric = usOne(scene, '.us-metric-chip');
  if (metric) tl.fromTo(metric, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: 'power3.out' }, start + 0.14);
};

const usContentEntry = (scene, tl, start, selectors) => {
  const nodes = usAll(scene, selectors);
  if (nodes.length) tl.fromTo(nodes, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, stagger: 0.08, ease: 'power3.out' }, start + 0.32);
};

window.US_BLUEPRINT_MAP = {
  'product-pop-up': ['product-unboxing-callouts', 'process-step-reveal'],
  'product-information': ['process-step-reveal', 'document-highlight-sweep'],
  'sale-badge': ['kinetic-type-beats', 'cta-button-scene'],
  'gallery-products': ['stagger-grid-reveal', 'grid-card-assemble'],
  'hot-deal': ['kinetic-type-beats', 'titlecard-reveal'],
  'slide-bar': ['data-story-flow', 'bilateral-data-comparison-bars']
};

window.SFV_ANIMATORS = {
  'product-pop-up': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const lockup = usOne(scene, '.us-product-lockup');
    if (lockup) tl.fromTo(lockup, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out' }, start + 0.38);
    const image = usOne(scene, '.us-product-image');
    if (image) tl.fromTo(image, { y: 48, scale: 0.72, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.62, ease: 'back.out(1.25)' }, start + 0.62);
    const name = usOne(scene, '.us-product-name');
    if (name) tl.fromTo(name, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: 'power2.out' }, start + 1.03);
    const note = usOne(scene, '.us-product-note');
    if (note) tl.fromTo(note, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, start + 1.2);
    usExit(scene, tl, start, duration);
  },
  'product-information': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const box = usOne(scene, '.us-info-box');
    if (box) tl.fromTo(box, { y: 26, scale: 0.98 }, { y: 0, scale: 1, duration: 0.48, ease: 'power3.out' }, start + 0.3);
    const title = usOne(scene, '.us-info-title');
    if (title) tl.fromTo(title, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: 'power2.out' }, start + 0.72);
    const rows = usAll(scene, '.us-info-row');
    if (rows.length) tl.fromTo(rows, { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.16, ease: 'power2.out' }, start + 0.92);
    const emphasis = usOne(scene, '.us-info-row.is-emphasis');
    if (emphasis) tl.fromTo(emphasis, { backgroundColor: 'rgba(255, 210, 31, 0)' }, { backgroundColor: 'rgba(255, 210, 31, .72)', duration: 0.3, ease: 'sine.inOut' }, start + 1.45);
    usExit(scene, tl, start, duration);
  },
  'sale-badge': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const box = usOne(scene, '.us-info-box');
    if (box) tl.fromTo(box, { y: 26, scale: 0.98 }, { y: 0, scale: 1, duration: 0.46, ease: 'power3.out' }, start + 0.3);
    const badge = usOne(scene, '.us-offer-badge');
    if (badge) tl.fromTo(badge, { scale: 0.68, rotation: -18, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.48, ease: 'back.out(1.35)' }, start + 0.72);
    const copy = usOne(scene, '.us-offer-copy');
    if (copy) tl.fromTo(copy, { x: 22, opacity: 0 }, { x: 0, opacity: 1, duration: 0.36, ease: 'power2.out' }, start + 0.84);
    const footer = usOne(scene, '.us-info-footer');
    if (footer) tl.fromTo(footer, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, start + 1.15);
    usExit(scene, tl, start, duration);
  },
  'gallery-products': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const label = usOne(scene, '.us-gallery-label');
    if (label) tl.fromTo(label, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: 'power2.out' }, start + 0.34);
    const cards = usAll(scene, '.us-product-card');
    if (cards.length) tl.fromTo(cards, { x: -30, y: 24, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.42, stagger: 0.16, ease: 'power3.out' }, start + 0.62);
    const images = usAll(scene, '.us-product-card img');
    if (images.length) tl.fromTo(images, { y: 18, scale: 0.78, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.42, stagger: 0.14, ease: 'power2.out' }, start + 0.96);
    const selected = usOne(scene, '.us-product-card.is-selected');
    if (selected) tl.to(selected, { y: -12, duration: 0.22, ease: 'power2.out' }, start + 1.62).to(selected, { y: 0, duration: 0.28, ease: 'power2.inOut' }, start + 1.84);
    usExit(scene, tl, start, duration);
  },
  'hot-deal': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const box = usOne(scene, '.us-info-box');
    if (box) tl.fromTo(box, { y: 26, scale: 0.98 }, { y: 0, scale: 1, duration: 0.46, ease: 'power3.out' }, start + 0.3);
    const title = usOne(scene, '.us-deal-title');
    if (title) tl.fromTo(title, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: 'power3.out' }, start + 0.72);
    const copy = usOne(scene, '.us-deal-copy');
    if (copy) tl.fromTo(copy, { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: 'power2.out' }, start + 0.98);
    const price = usOne(scene, '.us-price-row');
    if (price) tl.fromTo(price, { scale: 0.78, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.25)' }, start + 1.22);
    usExit(scene, tl, start, duration);
  },
  'slide-bar': (scene, tl, start, duration) => {
    usChromeEntry(scene, tl, start);
    const box = usOne(scene, '.us-info-box');
    if (box) tl.fromTo(box, { y: 26, scale: 0.98 }, { y: 0, scale: 1, duration: 0.46, ease: 'power3.out' }, start + 0.3);
    const value = usOne(scene, '.us-progress-value');
    if (value) tl.fromTo(value, { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.25)' }, start + 0.72);
    const axis = usOne(scene, '.us-progress-axis');
    if (axis) tl.fromTo(axis, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, start + 1.05);
    const fill = usOne(scene, '.us-progress-fill');
    if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 0.68, ease: 'power2.inOut' }, start + 1.3);
    const label = usOne(scene, '.us-progress-label');
    if (label) tl.fromTo(label, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, start + 1.95);
    if (value) tl.to(value, { scale: 1.08, duration: 0.16, ease: 'power2.out' }, start + 2.1).to(value, { scale: 1, duration: 0.24, ease: 'power2.inOut' }, start + 2.26);
    usExit(scene, tl, start, duration);
  }
};
