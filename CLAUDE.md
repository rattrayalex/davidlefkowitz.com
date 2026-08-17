# davidlefkowitz.com — guide for Claude sessions

This is the live website of composer David S. Lefkowitz (davidlefkowitz.com),
a **fully static site**: a React/Vite frontend that reads JSON files served
under `/api/*`. There is no server, no database, and no Notion — the old
Replit/Notion stack is retired. Deploys go to Cloudflare Pages.

Most sessions here are content edits requested by David himself (the
composer) or his nephew Alex. David is not a programmer: interpret his
requests generously, confirm understanding by describing what you changed in
plain language, and never ask him to read code.

## Where content lives (edit THESE, never `dist/` or `static-api/`)

| Content | File(s) |
|---|---|
| Recordings/albums | `static-data/recordings.json` (album covers/tracklists: `site-images/`) |
| Compositions | `static-data/compositions/<Name>.json` (one file per work) |
| Blog essays | `static-data/blog/<notion-id>.json` (`content_blocks` = HTML strings) |
| Bio ("About") | `static-data/profile.json` |
| Media-page photos | `static-data/media.json` + `photos/` |
| Press quotes | `static-data/media-reviews.json` |
| Streaming logos | `static-data/logos.json` + `site-images/logos/` |
| Home "Latest Release" box, FYC page | hardcoded in `client/src/pages/home.tsx`, `fyc.tsx` |

## Golden rules

1. **Slugs are permanent URLs.** Composition slugs come from the file's
   `slug` field transformed by `scripts/assemble-static.py` (spaces→`_`,
   strip special chars). Never rename a slug — external links depend on them.
   New works: pick a sensible `Name of Page`-style slug once.
2. **Typography matters enormously to David.** Curly apostrophes (’), true
   ellipses (…), accented characters, exact punctuation in titles. He resents
   "typewriter dots" — always match his originals. ’cello has a leading
   curly apostrophe.
3. Every album should keep: cover image, at least one tracklist image, year,
   label (+ URL), performers (newlines preserved), streaming links as
   `<a href target=_blank rel="noopener noreferrer">` joined by `<br>`.
4. **Build + verify before pushing**: `bash scripts/build-site.sh`, then
   serve `node scripts/serve-static.mjs dist/public 8080 &` and check the
   affected pages (Playwright chromium is at
   `/opt/pw-browsers/chromium-*/chrome-linux/chrome` in Claude cloud envs;
   otherwise `curl` the `/api/...` files).
5. **Pushing to the deploy branch publishes the live site** (GitHub Actions
   → Cloudflare Pages, project `davidlefkowitz`). Commit with clear messages.
6. Never touch DNS, the `mx.` mail records, or Cloudflare settings from
   these sessions unless Alex explicitly asks.
7. If a request is destructive or confusing (delete a section, replace the
   whole catalog), restate what you understood and confirm before doing it.

## Common tasks

- **New album**: append to `recordings.json` matching an existing object's
  shape; add `cover_<slug>.jpg` (and `tracklist_<slug>_0.jpg`) to
  `site-images/`; the build copies them to `/api/media-cache/`.
- **New blog essay**: create `static-data/blog/<any-unique-id>.json` with
  `id`, `slug` (underscores), `title`, `published_date` (YYYY-MM-DD),
  `content_blocks` (array of paragraph HTML strings; the LAST paragraph
  becomes the purple highlight box), `tags: []`, `published: true`.
- **Edit bio**: `profile.json` `bio` field (paragraphs separated by \n\n,
  inline HTML links allowed).
- **FYC/Grammy season updates**: `client/src/pages/fyc.tsx` and the Latest
  Release box in `home.tsx`.

## History

Migrated from Replit+Notion in July–Aug 2026 (see
`static-data/CONVERSION-SPEC.md` and `critique/` for provenance and the
review that shaped the current content). The Replit app is retired: do not
sync from it, and politely flag if anyone suggests editing there.
