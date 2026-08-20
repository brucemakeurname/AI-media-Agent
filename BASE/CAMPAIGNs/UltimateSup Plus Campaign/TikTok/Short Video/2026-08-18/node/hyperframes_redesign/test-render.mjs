import playwright from '/Users/test/node_modules/playwright/index.js';
const { chromium } = playwright;
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1080,height:1920}, deviceScaleFactor:1});
await page.goto('file:///Users/test/Documents/AI%20Media/Hoa%CC%80i%20Nam/INFRA/BASE/CAMPAIGNs/UltimateSup%20Plus%20Campaign/TikTok/Short%20Video/2026-08-18/node/hyperframes_redesign/overlay_01_product-pop-up.html', {waitUntil:'load'});
await page.screenshot({path:'/tmp/overlay-test.png', omitBackground:true});
await browser.close();
console.log('ok');
