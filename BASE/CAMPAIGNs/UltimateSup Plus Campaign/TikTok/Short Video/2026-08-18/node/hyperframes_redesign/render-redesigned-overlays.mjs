import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const preset = '/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/3. HTML_Video_Preset/ultimatesup';
const logo = '/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/BRAND KITs/UltimateSup/assets/logo/ultimate-sup-horizontal_20260811.png';
const product = '/Users/test/Documents/AI Media/Hoài Nam/INFRA/BASE/CAMPAIGNs/UltimateSup Plus Campaign/TikTok/Short Video/2026-08-18/node/elements/pvl_cutout_transparent.png';
const gsapPath = '/Users/test/Documents/AI Media/Hoài Nam/INFRA/PRODUCTION/video_modules/hyperframes/node_modules/.bun/node_modules/gsap/dist/gsap.min.js';
const css = await readFile(join(preset, 'style.css'), 'utf8');
const animation = await readFile(join(preset, 'animation.js'), 'utf8');
const gsap = await readFile(gsapPath, 'utf8');
const logoUrl = pathToFileURL(logo).href;
const productUrl = pathToFileURL(product).href;

const svgChart = '<svg class="us-icon-lucide us-icon-chart" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
const svgBookmark = '<svg class="us-icon-lucide us-icon-bookmark" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';
const svgPlay = '<svg class="us-icon-lucide us-icon-play" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

const brand = `<div class="us-brand-strip"><img src="${logoUrl}" alt="Ultimate Sup"/></div>`;
const infoChrome = '<div class="us-info-meta"><span>PVL ISO GOLD</span><span>SHOPEE SG</span></div>';
const campaignOverrides = `<style>
#stage[data-preset="ultimatesup"] .us-product-pop-up .us-product-lockup.is-long { top: 550px; left: auto; right: 54px; width: 560px; transform: none; }
#stage[data-preset="ultimatesup"] .us-product-pop-up .us-product-image { height: 550px; }
#stage[data-preset="ultimatesup"] .us-product-pop-up .us-product-note { top: 1260px; }
#stage[data-preset="ultimatesup"] .us-product-information .us-info-box { top: 500px; bottom: auto; }
#stage[data-preset="ultimatesup"] .us-sale-badge .us-info-box { top: 900px; bottom: auto; transform: translateX(-50%) scale(.78); transform-origin: center top; }
</style>`;

const modules = [
  {
    id: 'overlay_01_product-pop-up',
    module: 'product-pop-up',
    duration: 4,
    body: `<div class="bf-frame us-product-pop-up" data-module="product-pop-up">${brand}<div class="us-product-lockup is-long"><img class="us-product-image" src="${productUrl}" alt="PVL ISO Gold"/><div class="us-product-name us-text-regular">PVL ISO GOLD</div><div class="us-product-variant">POST-WORKOUT SHAKE</div></div><div class="us-product-note">PRODUCT / PACKSHOT</div></div>`
  },
  {
    id: 'overlay_02_product-information',
    module: 'product-information',
    duration: 8,
    body: `<div class="bf-frame us-product-information" data-module="product-information">${brand}<div class="us-metric-chip">${svgChart}<span class="us-metric-value">27G</span></div><div class="us-info-box">${infoChrome}<div class="us-info-body"><h2 class="us-info-title"><span class="us-text-regular">PVL ISO GOLD</span></h2><div class="us-info-row"><span>INPUT 01</span><strong>27G PROTEIN / SERVING</strong></div><div class="us-info-row is-emphasis"><span>INPUT 02</span><strong>WHEY PROTEIN ISOLATE</strong></div><div class="us-info-row"><span>INPUT 03</span><strong>ADDED ENZYMES</strong></div></div></div></div>`
  },
  {
    id: 'overlay_03_sale-badge',
    module: 'sale-badge',
    duration: 6,
    body: `<div class="bf-frame us-sale-badge" data-module="sale-badge">${brand}<div class="us-info-box">${infoChrome}<div class="us-info-body us-offer-body"><div class="us-offer-badge">SHOP<br/>SG</div><div class="us-offer-copy"><span class="us-text-regular">CHECK CURRENT</span><br/><span class="us-text-emphasis">PVL ISO GOLD LISTING</span></div></div><div class="us-info-footer"><span>SHOPEE SG</span><strong>TAP YELLOW BASKET</strong></div></div></div>`
  }
];

const htmlFor = (entry) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style><style>html,body{width:1080px;height:1920px;margin:0;padding:0;background:transparent!important;overflow:hidden}#stage{width:1080px;height:1920px;background:transparent!important}</style>${campaignOverrides}</head><body><div id="stage" data-preset="ultimatesup"><div class="us-overlay">${entry.body}</div></div><script>${gsap}</script><script>${animation}</script><script>window.__ready=true;</script></body></html>`;

const browser = await chromium.launch({ headless: true });
for (const entry of modules) {
  const htmlPath = join(root, `${entry.id}.html`);
  const frameDir = join(root, entry.id.replace(/^overlay_\d+_/, 'frames_'));
  await mkdir(frameDir, { recursive: true });
  await writeFile(htmlPath, htmlFor(entry));
  const probe = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await probe.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await probe.waitForFunction(() => window.__ready === true);
  const timelineDuration = await probe.evaluate(({ module, duration }) => {
    const scene = document.querySelector('.us-overlay');
    const timeline = gsap.timeline({ paused: true });
    window.SFV_ANIMATORS[module](scene, timeline, 0, duration);
    return timeline.duration();
  }, { module: entry.module, duration: entry.duration });
  await probe.close();
  const frameCount = entry.duration * 24;
  console.log(`${entry.id}: starting ${frameCount} frames`);
  for (let index = 0; index < frameCount; index += 1) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true);
    await page.evaluate(({ module, duration, progress }) => {
      const scene = document.querySelector('.us-overlay');
      const timeline = gsap.timeline({ paused: true });
      window.SFV_ANIMATORS[module](scene, timeline, 0, duration);
      timeline.progress(progress);
    }, { module: entry.module, duration: entry.duration, progress: index / Math.max(1, frameCount - 1) });
    await page.screenshot({ path: join(frameDir, `frame_${String(index).padStart(4, '0')}.png`), omitBackground: true });
    await page.close();
  }
  console.log(`${entry.id}: ${frameCount} frames, timeline ${timelineDuration.toFixed(3)}s`);
}
await browser.close();
