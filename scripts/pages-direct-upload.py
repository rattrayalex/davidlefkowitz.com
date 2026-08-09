#!/usr/bin/env python3
"""Deploy dist/public to Cloudflare Pages via the Direct Upload API.

Mirrors wrangler's algorithm: per-file hash = blake3(base64(content) + extension)
hex digest truncated to 32 chars; check-missing → upload buckets → create
deployment with a manifest of path→hash.
"""
import base64, json, mimetypes, os, sys, urllib.request
import blake3

ROOT = "dist/public"
ACCOUNT = os.environ["CLOUDFLARE_ACCOUNT_ID"]
TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]
JWT = open(sys.argv[1]).read().strip()
PROJECT = "davidlefkowitz"

def api(url, data=None, jwt=False, method=None, ctype="application/json"):
    req = urllib.request.Request(url, method=method or ("POST" if data is not None else "GET"))
    req.add_header("Authorization", f"Bearer {JWT if jwt else TOKEN}")
    if data is not None:
        req.add_header("Content-Type", ctype)
        req.data = data if isinstance(data, bytes) else json.dumps(data).encode()
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)

files = {}
for dirpath, _, names in os.walk(ROOT):
    for n in names:
        full = os.path.join(dirpath, n)
        rel = "/" + os.path.relpath(full, ROOT).replace(os.sep, "/")
        raw = open(full, "rb").read()
        b64 = base64.b64encode(raw).decode()
        ext = os.path.splitext(n)[1].lstrip(".")
        h = blake3.blake3((b64 + ext).encode()).hexdigest()[:32]
        ct = mimetypes.guess_type(n)[0]
        if n == "index.html" or n.endswith(".html"): ct = "text/html"
        if not ct:
            ct = "application/json" if rel.startswith("/api/") else "application/octet-stream"
        files[rel] = {"hash": h, "b64": b64, "ct": ct, "size": len(raw)}

print(f"{len(files)} files, {sum(f['size'] for f in files.values())//1024//1024} MB")

hashes = [f["hash"] for f in files.values()]
missing = api("https://api.cloudflare.com/client/v4/pages/assets/check-missing",
              {"hashes": hashes}, jwt=True)["result"]
print(f"{len(missing)} to upload")

by_hash = {}
for rel, f in files.items():
    by_hash.setdefault(f["hash"], f)

batch, size = [], 0
def flush():
    global batch, size
    if not batch: return
    payload = [{"key": f["hash"], "value": f["b64"], "metadata": {"contentType": f["ct"]}, "base64": True} for f in batch]
    r = api("https://api.cloudflare.com/client/v4/pages/assets/upload", payload, jwt=True)
    assert r.get("success"), r
    print(f"  uploaded batch of {len(batch)}")
    batch, size = [], 0

for h in missing:
    f = by_hash[h]
    if size + f["size"] > 40_000_000 or len(batch) >= 800:
        flush()
    batch.append(f); size += f["size"]
flush()

r = api("https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes", {"hashes": hashes}, jwt=True)
print("upsert:", r.get("success"))

manifest = {rel: f["hash"] for rel, f in files.items()}
boundary = "----claudeboundary42"
parts = []
parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="manifest"\r\n\r\n{json.dumps(manifest)}\r\n')
parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="branch"\r\n\r\nmain\r\n')
parts.append(f'--{boundary}--\r\n')
body = "".join(parts).encode()
r = api(f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/{PROJECT}/deployments",
        body, ctype=f"multipart/form-data; boundary={boundary}")
print("deployment:", r.get("success"), r["result"]["url"] if r.get("success") else r.get("errors"))
