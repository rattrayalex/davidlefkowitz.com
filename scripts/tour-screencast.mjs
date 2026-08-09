// Captioned screencast tour of davidlefkowitz.com.
// Burns captions into the video via a fixed overlay, and emits a matching
// WebVTT file (verify-screens/site-tour.vtt) for proper closed captions.
import { chromium } from "playwright";
import { promises as fs } from "node:fs";

const BASE = process.env.BASE || "http://localhost:8080";
const OUT = "verify-screens";
await fs.mkdir(OUT + "/video", { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: OUT + "/video", size: { width: 1280, height: 800 } },
});
const page = await ctx.newPage();

const t0 = Date.now();
const cues = [];
let cueOpen = null;

async function caption(text) {
  if (cueOpen) { cueOpen.end = Date.now() - t0; cues.push(cueOpen); }
  cueOpen = text ? { text, start: Date.now() - t0 } : null;
  await page.evaluate((t) => {
    let el = document.getElementById("__cc");
    if (!el) {
      el = document.createElement("div");
      el.id = "__cc";
      Object.assign(el.style, {
        position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)",
        maxWidth: "85%", background: "rgba(10,10,24,0.85)", color: "#fff",
        font: "600 21px/1.45 Georgia, 'Times New Roman', serif", padding: "10px 22px",
        borderRadius: "10px", zIndex: 999999, textAlign: "center",
        boxShadow: "0 4px 18px rgba(0,0,0,0.35)", letterSpacing: "0.01em",
        transition: "opacity 220ms", pointerEvents: "none",
      });
      document.body.appendChild(el);
    }
    el.textContent = t || "";
    el.style.opacity = t ? "1" : "0";
  }, text);
}

async function go(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(400);
}
const pause = (ms) => page.waitForTimeout(ms);
async function scroll(steps, px = 560, wait = 850) {
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, px); await pause(wait); }
}

// ---------- the tour ----------
await go("/");
await caption("davidlefkowitz.com — the music of composer David S. Lefkowitz.");
await pause(2600);
await caption("Two hundred catalog entries, twenty-one albums, thirty-four essays — one home.");
await scroll(1); await pause(2200);

await go("/about");
await caption("From Eastman, Penn, and Cornell to thirty-one years teaching at UCLA.");
await pause(2600); await scroll(2, 560, 750);

await go("/recordings");
await caption("The Recordings: every album from 1993 to 2025, covers and all.");
await pause(2800); await scroll(3, 560, 800);
await caption("Bridge, Yarlung, Albany, Navona — labels that keep coming back.");
await scroll(3, 560, 800);

await go("/recordings/Preludes_and_Fugues");
await caption("The crown jewel: 52 Preludes and Fugues asking what a fugue means in a post-tonal world.");
await pause(3400); await scroll(1);
await caption("Four concert pianists, a cantor — and a piano prepared with chopsticks and playing cards.");
await pause(3000);

await go("/recordings/Quartet_Integra");
await caption("The newest release: Green Mountains, Now Black, for Quartet Integra.");
await pause(2800); await scroll(1);
await caption("Monteverdi's love duets woven against the Los Angeles fires of 2025.");
await pause(2800); await scroll(1);
await caption("Every album: one click to listen, on any service.");
await pause(2400);

await go("/compositions");
await caption("The complete catalog — searchable by title, instrument, or ensemble.");
await pause(2600);
const input = page.locator('input').first();
if (await input.count()) { await input.fill("harp"); await pause(1600); await input.fill(""); }
await scroll(2, 560, 750);

await go("/compositions/Ruminations");
await caption("Each work carries its program note — Ruminations, after Rumi, for the Sibelius Piano Trio.");
await pause(3200); await scroll(2, 560, 800);

await go("/compositions/Green_Mountains");
await caption("Notes link to recordings, recordings link back — the catalog is one connected web.");
await pause(3000); await scroll(1);

await go("/blog");
await caption("Thirty-four essays on fugues, Bach, and musical life — all preserved.");
await pause(2600); await scroll(1);

const posts = await (await page.request.get(BASE + "/api/blog-posts")).json();
const funk = posts.find(p => /funk/i.test(p.title)) || posts[0];
await go("/blog/" + encodeURIComponent(funk.slug || funk.id));
await caption("Formatting, links, and each essay's closing thought — intact.");
await pause(2800); await scroll(2, 560, 750);

await go("/media");
await caption("Media: portrait and performance photography, with credits, ready for press use.");
await pause(2600); await scroll(1);

await go("/fyc");
await caption("For Your Consideration: the Preludes and Fugues, with the reviews to match.");
await pause(2800); await scroll(1);

await go("/contact");
await caption("And one click to reach David himself.");
await pause(2200);

await go("/");
await caption("davidlefkowitz.com — every note where it belongs.");
await pause(3000);
await caption(null);
await pause(500);

// ---------- finish ----------
if (cueOpen) { cueOpen.end = Date.now() - t0; cues.push(cueOpen); }
await ctx.close();
await browser.close();

const ts = (ms) => {
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor(ms / 60000) % 60).padStart(2, "0");
  const s = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
  const f = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${s}.${f}`;
};
let vtt = "WEBVTT\n\n";
cues.forEach((c, i) => { vtt += `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n\n`; });
await fs.writeFile(OUT + "/site-tour.vtt", vtt);

const files = await fs.readdir(OUT + "/video");
const webm = files.find(f => f.endsWith(".webm"));
await fs.rename(`${OUT}/video/${webm}`, `${OUT}/site-tour-captioned.webm`);
console.log(`recorded ${cues.length} captions, video: ${OUT}/site-tour-captioned.webm`);
