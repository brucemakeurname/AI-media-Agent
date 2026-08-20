import playwright from '/Users/test/node_modules/playwright/index.js';
import { readFile } from 'node:fs/promises';
const { chromium } = playwright;
const browser = await chromium.launch({headless:true});
for (const [file, module, progress] of [
  ['overlay_01_product-pop-up.html', 'product-pop-up', 0.5],
  ['overlay_02_product-information.html', 'product-information', 0.5],
  ['overlay_03_sale-badge.html', 'sale-badge', 0.5]
]) {
  const page = await browser.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
  await page.goto(`file:///Users/test/Documents/AI%20Media/Hoa%CC%80i%20Nam/INFRA/BASE/CAMPAIGNs/UltimateSup%20Plus%20Campaign/TikTok/Short%20Video/2026-08-18/node/hyperframes_redesign/${file}`, {waitUntil:'load'});
  const result = await page.evaluate(({module, progress}) => {
    const scene=document.querySelector('.us-overlay'); const tl=gsap.timeline({paused:true}); window.SFV_ANIMATORS[module](scene,tl,0,module==='product-pop-up'?4:module==='product-information'?8:6); tl.progress(progress);
    return Object.fromEntries(['.us-brand-strip','.us-metric-chip','.us-product-lockup','.us-product-image','.us-product-name','.us-product-note','.us-info-box','.us-info-meta','.us-info-body','.us-info-footer','.us-engagement'].map(sel=>{const el=scene.querySelector(sel); if(!el)return [sel,null]; const r=el.getBoundingClientRect(); return [sel,{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}]}));
  }, {module, progress});
  console.log(file, JSON.stringify(result, null, 2));
  await page.close();
}
await browser.close();
