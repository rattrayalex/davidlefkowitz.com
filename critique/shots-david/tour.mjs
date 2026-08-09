import { chromium } from 'playwright';
const S = '/workspace/davidlefkowitz.com/critique/shots-david';
const B = 'http://localhost:8080';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
async function go(url, name, opts={}) {
  await page.goto(url, { waitUntil: 'networkidle' }).catch(()=>page.goto(url));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${S}/${name}.png`, fullPage: !!opts.full });
  console.log('shot', name);
}
await go(`${B}/`, '01-home', {full:true});
await go(`${B}/about`, '02-about', {full:true});

// Recordings grid — full page
await page.goto(`${B}/recordings`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// scroll to bottom to trigger lazy loads
await page.evaluate(async () => { for (let y=0; y<document.body.scrollHeight; y+=800) { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150)); } });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${S}/03-recordings-full.png`, fullPage: true });
console.log('shot recordings');

await go(`${B}/recordings/Quartet_Integra`, '04-quartet-integra', {full:true});
await go(`${B}/recordings/Preludes_and_Fugues`, '05-preludes-fugues', {full:true});
await go(`${B}/recordings/Harp%E2%80%99s_Desire`, '06-harps-desire', {full:true});

// Compositions + searches
await go(`${B}/compositions`, '07-compositions', {full:false});
for (const [q,name] of [['Ruminations','08-search-ruminations'],['Green Mountains','09-search-green-mountains'],['Tipot','10-search-tipot']]) {
  await page.goto(`${B}/compositions`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const input = page.locator('input[type="search"], input[type="text"], input[placeholder*="earch"]').first();
  await input.fill(q);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${S}/${name}.png` });
  console.log('shot', name);
}

// Program notes / work pages
await go(`${B}/compositions/Green%20Mountains`, '11-work-green-mountains', {full:true});
await go(`${B}/compositions/Ruminations`, '12-work-ruminations', {full:true});

// Blog + one essay
await go(`${B}/blog`, '13-blog', {full:true});
await go(`${B}/blog/Chaconne_and_Triple_Fugue`, '14-essay-chaconne', {full:true});

await go(`${B}/media`, '15-media', {full:true});
await go(`${B}/fyc`, '16-fyc', {full:true});
await browser.close();
