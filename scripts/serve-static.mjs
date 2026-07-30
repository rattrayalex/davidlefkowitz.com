// Minimal static server mimicking Cloudflare Pages resolution:
// exact file -> dir index.html -> SPA fallback to /index.html
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist/public");
const port = Number(process.argv[3] || 8080);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const candidates = [
      path.join(root, url),
      path.join(root, url, "index.html"),
      path.join(root, "index.html"),
    ];
    for (const c of candidates) {
      try {
        const st = await fs.stat(c);
        if (st.isFile()) {
          const body = await fs.readFile(c);
          res.writeHead(200, { "content-type": types[path.extname(c)] || "application/octet-stream" });
          return res.end(body);
        }
      } catch {}
    }
    res.writeHead(404); res.end("not found");
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(port, () => console.log(`serving ${root} on :${port}`));
