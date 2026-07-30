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
# FYC and Listen Now pages reference this exact legacy cache filename
cp site-images/cover_Preludes_and_Fugues.jpg \
   "dist/public/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"

mkdir -p dist/public/photos
cp photos/* dist/public/photos/

# SPA fallback for client-side routing (Pages serves real files first)
cat > dist/public/_redirects <<'EOF'
/*  /index.html  200
EOF

echo "Built: $(du -sh dist/public | cut -f1)"
