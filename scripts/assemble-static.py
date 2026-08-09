#!/usr/bin/env python3
"""Assemble static-data/ into the static /api file tree the client expects.

Replicates the response shapes of server/routes.ts and the content pipeline
of server/sync.ts (purple box, tab indents, excerpt, read time).

Run from the repo root after the per-page JSON extraction is complete:
    python3 scripts/assemble-static.py
Output goes to static-api/ (later copied into dist/public by the build).
"""
import json, os, re, glob, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SD = os.path.join(ROOT, "static-data")
OUT = os.path.join(ROOT, "static-api")

def read(p):
    with open(p) as f: return json.load(f)

def write(path, data):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

# ---- blog posts -----------------------------------------------------------
def blog_content(blocks, images, page_id_nodash):
    # substitute image placeholders with local img tags
    out = []
    for b in blocks:
        m = re.match(r'<img data-blog-image="(\d+)">', b.strip())
        if m:
            n = int(m.group(1))
            img = images[n] if n < len(images) else None
            if img:
                ext = os.path.splitext(img.get("s3_filename", "x.jpg"))[1] or ".jpg"
                out.append(f'<img src="/api/media-cache/blog_{page_id_nodash}_{n}{ext}" alt="" style="max-width:100%;border-radius:0.5rem;margin:1rem 0;" />')
            continue
        if b.strip():
            out.append(b)
    return out

def purple_box(blocks):
    if not blocks: return [], ""
    last = blocks[-1]
    if len(blocks) >= 2:
        stl = blocks[-2]
        if (stl.endswith("…") or stl.endswith(",") or not re.search(r"[.!?]$", stl)) and \
           (last.startswith(",") or len(last) < 100):
            return blocks[:-2], (stl + " " + last).strip()
    return blocks[:-1], last.strip()

def indent(blocks):
    out = []
    for b in blocks:
        if not (b.startswith("#") or b.startswith("•") or b.startswith("1.")
                or b.startswith(">") or b.startswith("```")):
            b = "\t" + (b[1:] if b.startswith("\t") else b)
        out.append(b)
    return out

posts = []
for p in sorted(glob.glob(os.path.join(SD, "blog", "*.json"))):
    d = read(p)
    nodash = d["id"].replace("-", "")
    blocks = blog_content(d.get("content_blocks", []), d.get("images", []), nodash)
    body, box = purple_box([b for b in blocks if b.strip()])
    content = "\n".join(indent(body)).strip()
    words = len(content.split())
    posts.append({
        "id": d["id"], "slug": d.get("slug") or "", "title": d["title"],
        "excerpt": (content.split("\n\n")[0] or "")[:150],
        "content": content, "comment": box,
        "published_date": d["published_date"], "read_time": max(1, -(-words // 200)),
        "tags": d.get("tags", []), "published": True,
        "_related": d.get("related_compositions", []),
    })
posts.sort(key=lambda x: x["published_date"], reverse=True)
clean = [{k: v for k, v in p.items() if k != "_related"} for p in posts]
write("api/blog-posts/index.html", clean)
for i, p in enumerate(clean):
    nav = {
        "next": ({"id": clean[i-1]["id"], "title": clean[i-1]["title"], "slug": clean[i-1]["slug"],
                   "published_date": clean[i-1]["published_date"]} if i > 0 else None),
        "previous": ({"id": clean[i+1]["id"], "title": clean[i+1]["title"], "slug": clean[i+1]["slug"],
                       "published_date": clean[i+1]["published_date"]} if i < len(clean) - 1 else None),
    }
    for key in {p["slug"], p["id"]}:
        if key:
            write(f"api/blog-posts/{key}/index.html", p)
            write(f"api/blog-posts/{key}/navigation", nav)

# ---- compositions ---------------------------------------------------------
recordings = read(os.path.join(SD, "recordings.json"))
rec_by_slug = {r["slug"]: r for r in recordings}
rec_by_title = {r["title"].strip(): r for r in recordings}

def comp_slug(name):
    # replicate sync.ts: spaces->underscore, then strip non [a-zA-Z0-9_-]
    return re.sub(r"[^a-zA-Z0-9_-]", "", re.sub(r"\s+", "_", name))

comps = []
for p in sorted(glob.glob(os.path.join(SD, "compositions", "*.json"))):
    c = read(p)
    c["slug"] = comp_slug(c.get("slug") or c["title"])
    comps.append(c)
comps.sort(key=lambda c: (c.get("year") or 0), reverse=True)

listing = [{
    "id": c["id"], "slug": c["slug"], "title": c["title"],
    "instrumentation": ", ".join(c.get("instrumentation", [])),
    "ensemble": ", ".join(c.get("ensemble", [])),
    "year": c.get("year"),
    "category": (c.get("ensemble") or [""])[0],
    "duration": c.get("duration", ""),
    "premiere_info": c.get("premiere_info", ""),
    "publisher": ", ".join(c.get("publisher", [])),
    "recording": c.get("recording", []) and c["recording"][0] or "",
} for c in comps]
write("api/compositions/index.html", {"compositions": listing,
    "pagination": {"total": len(listing), "page": 1, "limit": len(listing), "totalPages": 1}})

# map notion page url -> blog post for related_blogposts
blog_by_url_id = {}
for p in posts:
    nodash = p["id"].replace("-", "")
    blog_by_url_id[nodash] = p

for c in comps:
    rec_info = []
    for r in c.get("recording", []):
        key = r.split("/recordings/")[-1] if "/recordings/" in r else r
        m = rec_by_slug.get(key) or rec_by_title.get(key.strip())
        if m:
            rec_info.append({"id": m["id"], "slug": m["slug"], "title": m["title"],
                             "album_cover": m.get("album_cover") or ""})
    related = []
    comp_nodash = c["id"].replace("-", "")
    for p in posts:
        for rel in p["_related"]:
            if comp_nodash in rel.replace("-", ""):
                related.append({"id": p["id"], "title": p["title"], "slug": p["slug"],
                                "published_date": p["published_date"]})
    detail = {
        "id": c["id"], "slug": c["slug"], "title": c["title"],
        "instrumentation": ", ".join(c.get("instrumentation", [])),
        "ensemble": ", ".join(c.get("ensemble", [])),
        "year": c.get("year"),
        "category": (c.get("ensemble") or [""])[0],
        "duration": c.get("duration", ""),
        "premiere_info": c.get("premiere_info", ""),
        "publisher": c.get("publisher", []),
        "recording": c.get("recording", []) and c["recording"][0] or "",
        "streaming_links": c.get("streaming_links", ""),
        "recording_info": rec_info or None,
        "program_note": c.get("program_note", ""),
        "related_blogposts": related,
    }
    write(f"api/compositions/{c['slug']}", detail)

# ---- simple endpoints -----------------------------------------------------
write("api/profile", read(os.path.join(SD, "profile.json")))
write("api/logos", read(os.path.join(SD, "logos.json")))
write("api/media/index.html", read(os.path.join(SD, "media.json")))
write("api/media/reviews", read(os.path.join(SD, "media-reviews.json")))
write("api/recordings/index.html", recordings)
for r in recordings:
    write(f"api/recordings/{r['slug']}", r)
    write(f"api/recordings/{r['id']}", r)

print(f"blog posts: {len(posts)}; compositions: {len(comps)}; recordings: {len(recordings)}")
missing_slug = [c['slug'] for c in comps if not c.get('slug')]
if missing_slug: print("MISSING SLUGS:", missing_slug, file=sys.stderr)
