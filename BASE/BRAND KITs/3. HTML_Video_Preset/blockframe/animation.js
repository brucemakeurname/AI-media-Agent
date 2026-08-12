const by = (scene, selector) => scene.querySelector(selector);
const byAll = (scene, selector) => Array.from(scene.querySelectorAll(selector));
const rise = (scene, tl, start, selector = ".bf-title,.bf-display,.bf-quote,.bf-jumbo") => {
  const nodes = byAll(scene, selector);
  if (nodes.length) tl.fromTo(nodes, { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: .52, stagger: .1, ease: "power2.out" }, start + .15);
  const image = by(scene, ".bf-image");
  if (image) tl.fromTo(image, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .42 }, start + .08);
};
window.SFV_ANIMATORS = {
  hook: (s, t, a) => rise(s, t, a),
  "vignelli-stat": (s, t, a) => rise(s, t, a, ".bf-jumbo,.bf-strand-title"),
  "data-flow": (s, t, a) => rise(s, t, a, ".bf-title,.bf-row"),
  callout: (s, t, a) => rise(s, t, a, ".bf-quote,.bf-kicker"),
  timeline: (s, t, a) => rise(s, t, a, ".bf-title,.bf-row"),
  outro: (s, t, a) => rise(s, t, a),
  "nyt-chart": (s, t, a) => { rise(s, t, a); t.fromTo(byAll(s, ".bf-bar"), { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", duration: .55, stagger: .1 }, a + .35); },
  "before-after": (s, t, a) => rise(s, t, a, ".bf-compare-line,.bf-kicker"),
  "elastic-reveal": (s, t, a) => rise(s, t, a, ".bf-display,.bf-stats"),
  "swiss-reveal": (s, t, a) => rise(s, t, a),
  "decision-tree": (s, t, a) => rise(s, t, a, ".bf-tree-root,.bf-tree-branches,.bf-tree-leaves"),
  conversation: (s, t, a) => rise(s, t, a, ".bf-speech"),
  highlighter: (s, t, a) => rise(s, t, a, ".bf-title,.bf-highlight"),
  "stagger-demo": (s, t, a) => rise(s, t, a, ".bf-title,.bf-measure-rule"),
  magnifier: (s, t, a, d) => { rise(s, t, a, ".bf-title,.bf-lede,.bf-lens"); const lens = by(s, ".bf-lens"); if (lens) t.to(lens, { x: -120, y: -110, duration: Math.max(.5, d - 1) }, a + .55); },
};
