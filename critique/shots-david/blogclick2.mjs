import { chromium } from 'playwright';
const S = '/workspace/davidlefkowitz.com/critique/shots-david';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [text, name] of [['The Pedagogue', '14c-essay-pedagogue'], ['Quartet Integra’s Debut Album', '14d-essay-integra']]) {
  await page.goto('http://localhost:8080/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.getByText(text, { exact: false }).first().click();
  await page.waitForTimeout(1500);
  console.log(name, '->', page.url());
  await page.screenshot({ path: `${S}/${name}.png`, fullPage: true });
}
await browser.close();
