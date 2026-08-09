import { chromium } from 'playwright';
const OUT = '/workspace/davidlefkowitz.com/critique/shots-ux';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Click-through from blog index
await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('a[href^="/blog/"]').first().click();
await page.waitForTimeout(1500);
console.log('after click url:', page.url());
console.log('h1/h2:', await page.locator('h1, h2').allTextContents().then(a => a.slice(0,3).join(' | ')));
await page.screenshot({ path: OUT + '/desktop-blogpost-click-full.png', fullPage: true });

// Media page photo count
await page.goto('http://localhost:8080/media', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const imgs = await page.evaluate(() => Array.from(document.querySelectorAll('main img, img')).map(i => ({src: i.src.split('/').pop().slice(0,40), w: i.naturalWidth, h: i.naturalHeight, complete: i.complete})));
console.log('media imgs:', JSON.stringify(imgs, null, 0));
// reviews tab
const rev = page.locator('button:has-text("Reviews")');
if (await rev.count()) { await rev.click(); await page.waitForTimeout(800); await page.screenshot({ path: OUT + '/desktop-media-reviews-full.png', fullPage: true }); }

await browser.close();
