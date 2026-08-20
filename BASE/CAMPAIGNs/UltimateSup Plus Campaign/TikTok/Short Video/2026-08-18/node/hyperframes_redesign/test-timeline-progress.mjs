import playwright from '/Users/test/node_modules/playwright/index.js';
const { chromium } = playwright;
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
page.on('pageerror', (err) => console.log('pageerror', err.message)); page.on('crash', () => console.log('CRASH'));
await page.goto('file:///Users/test/Documents/AI%20Media/Hoa%CC%80i%20Nam/INFRA/BASE/CAMPAIGNs/UltimateSup%20Plus%20Campaign/TikTok/Short%20Video/2026-08-18/node/hyperframes_redesign/overlay_01_product-pop-up.html', {waitUntil:'load'});
await page.evaluate(() => { const scene=document.querySelector('.us-overlay'); const tl=gsap.timeline({paused:true}); window.SFV_ANIMATORS['product-pop-up'](scene,tl,0,4); window.__timeline=tl; });
console.log('ready');
for (let i=0;i<20;i++) { await page.evaluate((p)=>window.__timeline.progress(p), i/19); console.log('progress', i); }
await browser.close(); console.log('done');
