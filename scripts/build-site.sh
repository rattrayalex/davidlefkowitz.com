#!/usr/bin/env bash
# Build the fully static site into dist/public.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 scripts/assemble-static.py

npx vite build

# static API tree (extensionless JSON files served at the same paths the SPA fetches)
cp -r static-api/api dist/public/api

# images: recovered album art + logos + repo media cache + photos
mkdir -p dist/public/api/media-cache
for f in site-images/cover_* site-images/tracklist_*; do
  cp "$f" "dist/public/api/media-cache/$(basename "$f")"
done
cp site-images/logos/* dist/public/api/media-cache/
[ -d site-images/blog ] && cp site-images/blog/* dist/public/api/media-cache/ 2>/dev/null || true
cp server/media-cache/* dist/public/api/media-cache/ 2>/dev/null || true
cp media-cache/* dist/public/api/media-cache/ 2>/dev/null || true
# Home page hardcodes these hashed minibutton names
cp site-images/logos/logo_spotify_minibutton.png \
   "dist/public/api/media-cache/logo_spotify_minibutton_bdf3c836.png"
cp site-images/logos/logo_youtube_minibutton.png \
   "dist/public/api/media-cache/logo_youtube_minibutton_811dfb93.png"

# FYC and Listen Now pages reference this exact legacy cache filename
cp site-images/cover_Preludes_and_Fugues.jpg \
   "dist/public/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"

# photos: downscale for web (originals are up to 12MB each)
mkdir -p dist/public/photos
python3 - << 'PY'
from PIL import Image
import os, glob
for src in glob.glob("photos/*"):
    dst = os.path.join("dist/public/photos", os.path.basename(src))
    try:
        im = Image.open(src); im.load()
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im = im.convert("RGB")
        im.save(dst, "JPEG", quality=86, optimize=True, progressive=True)
    except Exception as e:
        import shutil; shutil.copy(src, dst); print("copied raw:", src, e)
PY

# sitemap from assembled routes
python3 - << 'PY'
import glob, os, urllib.parse
base = "https://www.davidlefkowitz.com"
urls = [f"{base}/", f"{base}/about", f"{base}/compositions", f"{base}/recordings",
        f"{base}/blog", f"{base}/media", f"{base}/contact", f"{base}/fyc"]
for f in sorted(glob.glob("static-api/api/compositions/*")):
    n = os.path.basename(f)
    if n != "index.html": urls.append(f"{base}/compositions/{urllib.parse.quote(n)}")
for f in sorted(glob.glob("static-api/api/recordings/*")):
    n = os.path.basename(f)
    if n != "index.html" and "-" not in n[:9]: urls.append(f"{base}/recordings/{urllib.parse.quote(n)}")
for d in sorted(glob.glob("static-api/api/blog-posts/*/")):
    n = os.path.basename(d.rstrip("/"))
    if len(n) != 36 or n.count("-") != 4: urls.append(f"{base}/blog/{urllib.parse.quote(n)}")
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
xml += "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls)
xml += "</urlset>\n"
open("dist/public/sitemap.xml", "w").write(xml)
print(f"sitemap: {len(urls)} urls")
PY

# SPA fallback for client-side routing (Pages serves real files first)
cat > dist/public/_redirects <<'EOF'
/listennow  /fyc/listennow  301
/*  /index.html  200
EOF

echo "Built: $(du -sh dist/public | cut -f1)"
