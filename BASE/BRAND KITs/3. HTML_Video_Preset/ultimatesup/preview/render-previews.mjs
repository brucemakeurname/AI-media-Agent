import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, '..');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1220, height: 1200 }, deviceScaleFactor: 1 });
await page.goto(`file://${join(root, 'index.html')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

await page.screenshot({ path: join(output, 'sample.png'), fullPage: true });
for (const tile of await page.locator('[data-preview]').all()) {
  const name = await tile.getAttribute('data-preview');
  await tile.screenshot({ path: join(root, `${name}.png`) });
}

await browser.close();
console.log('Rendered Ultimate Sup preview gallery and six module previews.');
