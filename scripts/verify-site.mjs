// Screenshot + data-integrity pass over the static build.
import { chromium } from "playwright";
import { promises as fs } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8080";
const OUT = "verify-screens";
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
page.on("requestfailed", r => errors.push(`requestfailed: ${r.url()}`));
page.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/track")) errors.push(`${r.status()} ${r.url()}`); });

const shots = [
  ["home", "/"],
  ["recordings", "/recordings"],
  ["recording-detail", "/recordings/Quartet_Integra"],
  ["compositions", "/compositions"],
  ["composition-detail", "/compositions/Green_Mountains"],
  ["blog", "/blog"],
  ["about", "/about"],
  ["media", "/media"],
  ["contact", "/contact"],
  ["fyc", "/fyc"],
  ["listennow", "/listennow"],
];
const findings = [];
for (const [name, path] of shots) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 }).catch(e => errors.push(`goto ${path}: ${e.message}`));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: name !== "home" });
  const text = await page.evaluate(() => document.body.innerText.length);
  findings.push(`${name}: ${text} chars of text`);
}

// data checks against the API files
const recs = await (await page.request.get(BASE + "/api/recordings")).json();
const comps = await (await page.request.get(BASE + "/api/compositions")).json();
const blog = await (await page.request.get(BASE + "/api/blog-posts")).json();
findings.push(`API: ${recs.length} recordings, ${comps.compositions.length} compositions, ${blog.length} blog posts`);

// recordings page shows all albums?
await page.goto(BASE + "/recordings", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const imgs = await page.evaluate(() => Array.from(document.images).filter(i => i.complete && i.naturalWidth > 0).length);
findings.push(`recordings page: ${imgs} images loaded OK`);

// one blog post
if (blog[0]) {
  await page.goto(`${BASE}/blog/${blog[0].slug || blog[0].id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/blog-post.png`, fullPage: true });
  findings.push(`blog post "${blog[0].title}" rendered`);
}

console.log(findings.join("\n"));
console.log("\n--- errors ---");
console.log(errors.length ? [...new Set(errors)].slice(0, 30).join("\n") : "none");
await browser.close();
