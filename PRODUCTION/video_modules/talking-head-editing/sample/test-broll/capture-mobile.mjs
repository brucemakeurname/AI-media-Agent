// Capture soloflows.com at iPhone 14 viewport (390x844)
// Produces 3 scroll-position screenshots for phone mockup

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'assets', 'mobile-screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const URL = 'https://soloflows.com';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport(VIEWPORT);
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

console.log('Loading', URL, '...');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Screenshot 1: hero (top of page)
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: path.join(OUT_DIR, 'mobile-hero.png'), type: 'png' });
console.log('Captured mobile-hero.png');

// Screenshot 2: mid-scroll (features section)
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
await page.evaluate((h) => window.scrollTo(0, h * 0.30), pageHeight);
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: path.join(OUT_DIR, 'mobile-features.png'), type: 'png' });
console.log('Captured mobile-features.png');

// Screenshot 3: full-page tall strip for scroll animation (1x DPR for manageable file size)
await page.setViewport({ ...VIEWPORT, deviceScaleFactor: 1 });
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({
  path: path.join(OUT_DIR, 'mobile-fullpage.png'),
  type: 'png',
  fullPage: true
});
console.log('Captured mobile-fullpage.png');

await browser.close();
console.log('Done. Files in:', OUT_DIR);
