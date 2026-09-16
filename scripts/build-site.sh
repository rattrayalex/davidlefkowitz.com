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

# Recording covers/tracklists: displayed at ~300-450px CSS width everywhere on
# the site (recordings grid, recording/composition detail, FYC, listennow),
# but source files run up to 3800px and 1.6MB (unedited label press art).
# Cap at 1600px (same ceiling already proven fine for the Media-page photos
# below) at quality 92 -- comfortably sharp past 3x retina at any on-site
# display size, while cutting the oversized ones down substantially. Never
# upscale a source that's already smaller than the cap.
python3 - << 'PY'
from PIL import Image
import os, glob, shutil
MAX_W = 1600
for src in glob.glob("site-images/cover_*") + glob.glob("site-images/tracklist_*"):
    name = os.path.basename(src)
    # recordings.json hardcodes these exact filenames (extension included) --
    # never rename, and encode in the format the extension promises so the
    # server's Content-Type header still matches the bytes.
    dst = f"dist/public/api/media-cache/{name}"
    try:
        im = Image.open(src)
        width = im.size[0]
    except Exception as e:
        shutil.copy(src, dst)
        print("copied raw (couldn't read):", src, e)
        continue
    if width <= MAX_W:
        # Already an appropriate size -- re-encoding a source that's already
        # well-compressed at this resolution can make it BIGGER, not
        # smaller. Only touch files that are actually oversized.
        shutil.copy(src, dst)
        continue
    ext = os.path.splitext(name)[1].lower()
    tmp = dst + ".tmp"
    try:
        im.load()
        # Resizing drops im.info (including any embedded color profile), so
        # grab it before that -- Pillow's JPEG writer only keeps a source's
        # ICC profile if it's explicitly passed back in on save, and without
        # it browsers assume sRGB, visibly darkening/shifting scans that
        # were tagged with a wider-gamut profile.
        icc = im.info.get("icc_profile")
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        if ext == ".png":
            im.save(tmp, "PNG", optimize=True)
        else:
            if im.mode in ("RGBA", "LA", "P"):
                rgba = im.convert("RGBA")
                bg = Image.new("RGB", im.size, (255, 255, 255))
                bg.paste(rgba, mask=rgba.split()[-1])
                im = bg
            else:
                im = im.convert("RGB")
            im.save(tmp, "JPEG", quality=92, optimize=True, progressive=True, icc_profile=icc)
        # Even after downscaling, a source that was already compressed hard
        # for its (oversized) resolution can re-encode larger at this
        # quality. Never ship a result bigger than the untouched original.
        if os.path.getsize(tmp) < os.path.getsize(src):
            os.replace(tmp, dst)
        else:
            os.remove(tmp)
            shutil.copy(src, dst)
    except Exception as e:
        if os.path.exists(tmp):
            os.remove(tmp)
        shutil.copy(src, dst)
        print("copied raw (resize failed):", src, e)
PY

cp site-images/logos/* dist/public/api/media-cache/
[ -d site-images/blog ] && cp site-images/blog/* dist/public/api/media-cache/ 2>/dev/null || true
cp server/media-cache/* dist/public/api/media-cache/ 2>/dev/null || true
cp media-cache/* dist/public/api/media-cache/ 2>/dev/null || true
# Home page hardcodes these hashed minibutton names
cp site-images/logos/logo_spotify_minibutton.png \
   "dist/public/api/media-cache/logo_spotify_minibutton_bdf3c836.png"
cp site-images/logos/logo_youtube_minibutton.png \
   "dist/public/api/media-cache/logo_youtube_minibutton_811dfb93.png"

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
