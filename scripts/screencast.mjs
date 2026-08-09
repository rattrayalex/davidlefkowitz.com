// Record a scroll-through video of the main sections.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:8080";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: "verify-screens/video", size: { width: 1280, height: 800 } },
});
const page = await ctx.newPage();

async function tour(path, scrolls = 3) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  for (let i = 0; i < scrolls; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(700);
  }
}

await tour("/", 2);
await tour("/recordings", 5);
await tour("/recordings/Quartet_Integra", 3);
await tour("/compositions", 4);
await tour("/compositions/Green_Mountains", 2);
await tour("/blog", 3);
await tour("/about", 3);
await tour("/media", 3);

await ctx.close();
await browser.close();
console.log("video recorded");
