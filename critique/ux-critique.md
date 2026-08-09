# davidlefkowitz.com — UX/Design Critique

Reviewed 2026-08-09 against the static build at `dist/public` (desktop 1440x900 and mobile 390x844, Chromium).
Screenshots: `critique/shots-ux/`.

---

## 1. Top 5 must-fix issues

### 1. The blog is unreachable: every post link 404s
- **Page:** `/blog` -> any post (e.g. "Quartet Integra's Debut Album!")
- **What:** Clicking any card on the blog index navigates to `/blog/Quartet%20Integra` and renders **"Post Not Found — The blog post you're looking for doesn't exist or has been removed."** (see `desktop-blogpost-click-full.png`). Reproduced with a real click, not just a typed URL: all 34 essays are dead ends in this build. The root cause is the slug scheme: blog and composition slugs contain literal spaces (`/blog/Quartet Integra`, `/compositions/Green Mountains`), while recordings use underscores (`/recordings/Quartet_Integra`) — and the static API lookup does not survive the `%20` round-trip. The same inconsistency means the natural guess `/compositions/Green_Mountains` 404s while `/compositions/Green%20Mountains` works.
- **Why:** The blog is a third of the site's content and its freshest signal of an active composer. A promo screencast that says "thirty-four essays preserved" while every essay link is broken is a credibility disaster.
- **Fix:** Normalize all slugs to one URL-safe convention (underscores or hyphens, ASCII only — note `Harp’s_Desire` even embeds a curly apostrophe) across compositions, recordings, and blog; decode `encodeURIComponent`'d params before the static-API lookup; add redirects from the old space-slugs; crawl every internal link in CI.

### 2. Broken images are the first thing visitors see on the homepage
- **Page:** `/` (desktop and mobile)
- **What:** Two broken-image placeholders with alt text "Listen on Spotify" / "Listen on YouTube" sit directly under the header on every viewport (`desktop-home-full.png`, `mobile-home-full.png`). `client/src/pages/home.tsx` references `/api/media-cache/logo_spotify_minibutton_bdf3c836.png`, but the built asset is `logo_spotify_minibutton.png` (no hash). Worse, the static server answers the missing path with `200 text/html` (SPA fallback), so the browser renders the broken-image glyph instead of failing gracefully.
- **Why:** Above-the-fold breakage on the front door of a professional site reads as neglect — the exact impression a "rebuilt in 2026" site must not give.
- **Fix:** Correct the two filenames (or import the assets through the bundler so hashes stay in sync); make the static server return real 404s for missing files under `/api/` and `/photos/` instead of index.html.

### 3. The homepage doesn't present the composer — or his music
- **Page:** `/`
- **What:** One sparse screen: name (duplicated — it's already in the header), a photo, a two-line title, and a single "Preludes and Fugues" card. No music to hear inline, no featured works, no news, no upcoming performances, no bio hook, no path in ("Which piece should I hear first?"). Meanwhile the site is sitting on excellent material: 21 album covers, a 200-work catalog, strong press quotes ("near-Mahlerian", David Starobin's endorsement) that only appear on the buried FYC page.
- **Why:** For a distinguished composer the homepage is the concert program: it must establish stature and route three audiences (presenters/performers, press, listeners) in one screen. Right now it establishes neither.
- **Fix:** Add: (a) a one-paragraph bio lede with "Read more" -> About; (b) a "Recent recordings" strip of 3–4 covers linking to detail pages; (c) one embedded or one-click audio feature; (d) latest blog post / news line. Keep it to two viewport-heights; the lavender geometry can stay as texture.

### 4. Media page ships ~60 MB of original photographs
- **Page:** `/media`
- **What:** The Photos tab renders 12 images at their original resolution — up to 4200px and 8.9–12.3 MB per file (`photos/` totals 62 MB) — in a single centered column. First meaningful photo also appears only after a full viewport of header/tabs/whitespace.
- **Why:** On a phone or conference Wi-Fi this page takes tens of seconds and real bandwidth; journalists grabbing a press photo are precisely the audience with the least patience. It also makes scrolling janky (huge decode cost).
- **Fix:** Serve responsive derivatives (~1600px wide, quality ~80, `srcset` + `loading="lazy"`), arrange a 2–3 column masonry of thumbnails that open a lightbox, and put a "Download hi-res" link per photo so the originals remain available deliberately, not accidentally.

### 5. `/listennow` is a dead URL with a developer-facing 404
- **Page:** `/listennow` (and site-wide 404 handling)
- **What:** The route 404s with **"404 Page Not Found — Did you forget to add the page to the router?"** (`desktop-listennow-full.png`). The real page lives at `/fyc/listennow`, which the FYC "LISTEN NOW" button opens via `window.open` in a new tab. Any shortlink, email, or QR pointing at `/listennow` — the obvious guessable form — dies, and every mistyped URL on the site shows debugger copy to the public.
- **Why:** FYC/listen-now pages exist to be shared during awards season; a broken shareable link defeats the page's entire purpose, and the dev-tone 404 breaks the site's voice.
- **Fix:** Register `/listennow` as an alias (or redirect) to `/fyc/listennow`; replace the default 404 with a branded page ("This page seems to have gone quiet…") linking to Compositions, Recordings, and Home; drop `window.open` for a normal link.

---

## 2. Five quick wins

1. **Per-page `<title>` and meta descriptions.** Every page (except FYC) is titled "David S. Lefkowitz". Tabs, history, bookmarks, and search snippets are indistinguishable. Add "Compositions — David S. Lefkowitz", etc., in the route components.
2. **Trim the font payload and commit to a real typeface.** `index.html` requests ~25 Google font families (Poppins, Oxanium, Space Grotesk…), yet the CSS resolves to `Georgia` and `Inter`. Cut the request to the two families actually used — better, self-host them (offline testing shows everything falls back to default serif when fonts.googleapis.com is unreachable) — and choose a distinctive display serif (e.g. Playfair, Libre Baskerville, Source Serif) for headings so the site stops looking like default-Georgia.
3. **De-duplicate the streaming buttons on recording pages.** `/recordings/Quartet_Integra` shows two identical "YouTube" buttons stacked (one is presumably YouTube Music with the wrong logo). Label them distinctly, and consider a 2-column grid for the 9-button stack — the right half of the panel is empty while the list runs long.
4. **Calm the compositions list.** The category pills use six saturated hues (red, green, purple, gray, blue…) that fight the refined lavender identity, and their varying widths make every title start at a different x-position, so the eye can't scan the column of titles. Use one accent hue (tints for categories), give the badge a fixed-width column — or move it to the row's right edge — and the 200-row list becomes scannable.
5. **Fix the two smallest-but-visible layout bugs.** (a) Contact copy promises "reach out using the form" but there is no form, and the page's right half is empty — either add the form or say "by email" and let the content breathe in two columns. (b) On mobile, `/compositions` opens with ~500px of empty hero above the search box and the H1 sits off-center to the right; on mobile `/recordings`, card covers are cropped by `object-fit: cover` (the Quartet Integra title and label credit are sliced off) — use `contain` for album art, which should never be cropped.

---

## 3. Three things done well

1. **The recording detail template is genuinely useful.** Cover art, the scanned back-cover track listing with timings, performers, catalog number, and a full battery of purchase/streaming links in one card — this is exactly what a presenter, reviewer, or listener needs, and it stacks cleanly at 390px. (Add real-text tracklists alongside the scan for accessibility/search, but the layout is right.)
2. **The compositions catalog takes findability seriously.** Dual search (title + instrument) plus quick-filter chips (Chamber / Solo or Duo / Choir/Vocal / Large Ensemble) over ~200 works, with year, instrumentation, and duration visible in every row. Performers looking for "viola piece under 10 minutes" can actually succeed here — rare on composer sites.
3. **A coherent visual identity, consistently applied.** The lavender field, the spirograph star-polygon motif (a nicely nerdy nod to compositional geometry), purple accent links, and the uniform header/footer hold together across all eleven routes; the FYC page successfully shifts register into a richer campaign gradient without breaking family resemblance.

---

## 4. Screencast caption notes (`verify-screens/site-tour.vtt`)

**Pacing**
- The first caption doesn't appear until **0:14.7** — fifteen seconds of unnarrated video. Open with the tagline at 0:00.
- Dwell times are wildly uneven and mostly far too long: caption 2 holds one short line for **17s**, captions 3, 5, 6, 7, 9, 12, 13, 15, 16 hold **17–19s** each, and caption 14 sits for **24s**. Meanwhile captions 4, 8, 10, and 18 flash by in 4–6s. Target 5–8s per line, and where the footage genuinely needs 19 seconds, split the thought into two captions so the screen never feels stalled.
- Total runtime 4:37 for 18 lines is a demo, not a promo. A cut for sharing should land at 60–90s.

**Order**
- The route order (home → about → compositions → work detail → recordings → album detail → blog → media → FYC → contact) mirrors the nav — good spine.
- Caption 12 (Harp's Desire) is a second album detail after the streaming-links payoff of 10–11; it stalls the arc. Fold "front and back covers preserved" into caption 9 or cut it.
- Captions 6 and 7 both describe the work-detail page (program note + recording link twice). Merge.

**Wording**
- The template "The X page/section: …" opens captions 3, 4, 8, 13, 15, and 17 — vary the sentence shapes.
- The script is written for the site's owner, not its audience: "rebuilt", "fully restored", "every cover recovered", "nothing left to break" is migration changelog language. A presenter or fan doesn't care that it used to be broken; lead with the music ("Two hundred works. Twenty-one albums. One place to hear them."). Keep the restoration story for an internal demo cut.
- Caption 2, "nothing left to break," is a double negative that plants the idea of fragility — rephrase positively ("on fast, permanent hosting").
- Caption 17, "one click to reach David directly," oversells a page whose email is deliberately obfuscated ("lefko at ucla.edu"); say "with direct email and office details."
- Caption 18's "every note where it belongs" is the best line in the script — plant it (or its setup) in the opening caption to close the frame.

**Accuracy (verify before publishing)**
- Caption 4 says "two hundred works"; the About page says "more than 150 compositions." Pick one number and use it everywhere.
- Caption 6 promises "each work has its own page: … and its recording" — true of Green Mountains, but many catalog entries have no recording; soften to "and recordings where they exist."
- Most painful: captions 13–14 celebrate the 34 blog essays while, in the current build, every blog link 404s (Issue #1). Do not ship this screencast until that is fixed.
