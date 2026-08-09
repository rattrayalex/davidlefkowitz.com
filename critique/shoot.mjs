import { chromium } from 'playwright';

const OUT = '/workspace/davidlefkowitz.com/critique/shots-ux';
const BASE = 'http://localhost:8080';
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const desktopPages = [
  ['/', 'home'],
  ['/about', 'about'],
  ['/compositions', 'compositions'],
  ['/compositions/Green_Mountains', 'composition-green-mountains'],
  ['/recordings', 'recordings'],
  ['/recordings/Quartet_Integra', 'recording-quartet-integra'],
  ['/blog', 'blog'],
  ['/media', 'media'],
  ['/contact', 'contact'],
  ['/fyc', 'fyc'],
  ['/listennow', 'listennow'],
];

const browser = await chromium.launch({ executablePath: exe });

async function shoot(ctx, path, name, prefix) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`${prefix}${name}: goto issue ${e.message.slice(0,100)}`);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${prefix}${name}-viewport.png` });
  await page.screenshot({ path: `${OUT}/${prefix}${name}-full.png`, fullPage: true });
  const title = await page.title();
  const h1 = await page.locator('h1').first().textContent().catch(() => '(no h1)');
  console.log(`${prefix}${name} | title="${title}" | h1="${(h1||'').trim().slice(0,80)}" | errors=${errors.length} ${errors.slice(0,2).join(' || ')}`);
  return page;
}

// Desktop
const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const [path, name] of desktopPages) {
  const p = await shoot(dctx, path, name, 'desktop-');
  await p.close();
}

// Blog post: find first link on /blog
{
  const page = await dctx.newPage();
  await page.goto(BASE + '/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const href = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(a => /^\/blog\/.+/.test(a.getAttribute('href') || ''));
    return a ? a.getAttribute('href') : null;
  });
  console.log('blog post href:', href);
  await page.close();
  if (href) {
    const p = await shoot(dctx, href, 'blogpost', 'desktop-');
    await p.close();
  }
}
await dctx.close();

// Mobile
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
for (const [path, name] of [['/', 'home'], ['/recordings', 'recordings'], ['/compositions', 'compositions'], ['/recordings/Quartet_Integra', 'recording-quartet-integra']]) {
  const p = await shoot(mctx, path, name, 'mobile-');
  // also try opening mobile nav on home
  if (name === 'home') {
    const btn = p.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu), [class*="hamburger"]').first();
    if (await btn.count()) {
      await btn.click().catch(() => {});
      await p.waitForTimeout(700);
      await p.screenshot({ path: `${OUT}/mobile-home-menu-open.png` });
      console.log('mobile menu screenshot taken');
    } else {
      console.log('no mobile menu button found');
    }
  }
  await p.close();
}
await mctx.close();
await browser.close();
console.log('DONE');
