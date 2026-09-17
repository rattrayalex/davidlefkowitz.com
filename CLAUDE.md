# davidlefkowitz.com — guide for Claude sessions

This is the live website of composer David S. Lefkowitz (davidlefkowitz.com),
a **fully static site**: a React/Vite frontend that reads JSON files served
under `/api/*`. There is no server, no database, and no Notion — the old
Replit/Notion stack is retired. Deploys go to Cloudflare Pages: a push to
`main` publishes the live site.

Most sessions here are content edits requested by David himself (the
composer) or his nephew Alex. David is not a programmer: interpret his
requests generously, confirm understanding by describing what you changed in
plain language, and never ask him to read code.

## Branches

1. **`main`** is the deploy branch and the GitHub default branch. A push to it
   builds the site and publishes it to the live davidlefkowitz.com (Cloudflare
   Pages project `davidlefkowitz`, whose production branch is also `main`).
2. **`static-conversion`** was the deploy branch until September 2026, when
   `main` replaced it. Nothing deploys from it.
3. **`master`**, **`jekyll`**, **`gh-pages`** and **`musicmaestro-source`**
   hold retired history: the pre-2026 Jekyll site and the old Replit app.
   Do not build or deploy from them.
4. The default branch matters to CI, not only to humans: the Claude review
   action refuses to run unless `.github/workflows/claude-review.yml` on the
   pull request is byte-identical to the copy on the default branch.

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
5. **Pushing to `main` publishes the live site** (GitHub Actions → Cloudflare
   Pages, project `davidlefkowitz`). Commit with clear messages.
6. Never touch DNS, the `mx.` mail records, or Cloudflare settings from
   these sessions unless Alex explicitly asks.
7. If a request is destructive or confusing (delete a section, replace the
   whole catalog), restate what you understood and confirm before doing it.
8. **Content edits push directly** to `main` (that's what keeps David's
   "ask Claude, live in 2 minutes" workflow fast): changes to
   `static-data/`, `site-images/`, `photos/`, or wording in a page's
   hardcoded copy.
   **Larger/structural changes** — anything touching build tooling
   (`scripts/`), component logic, layout/CSS structure, or config — go
   through a pull request against `main` instead: open the PR with
   screenshots and/or a screencast of the change (see
   `.github/pull_request_template.md`). Two workflows then report on it:
   1. "Build check" (`.github/workflows/build-check.yml`) runs the deploy's
      own build and fails if the site does not build.
   2. "Claude (Fable) Code Review"
      (`.github/workflows/claude-review.yml`) reviews the diff. It needs no
      repository secret: the action exchanges a GitHub OIDC token for a
      Claude GitHub App token, which is why the job grants
      `id-token: write`. Setting an `ANTHROPIC_API_KEY` (or
      `CLAUDE_CODE_OAUTH_TOKEN`) secret is optional and switches
      authentication to that key.
   Default to auto-merging once Fable approves cleanly; don't wait on a
   human unless the review flags something.

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
- **FYC/Grammy season updates**: `client/src/pages/fyc.tsx`, the Latest
  Release box in `home.tsx`, AND `client/src/pages/listennow.tsx`
  (`/fyc/listennow`) — all three hardcode the current album's cover and
  streaming links independently and must be updated together each cycle.
  (A past cycle updated only the first two and left listennow.tsx pointing
  at the prior album for months — check it explicitly.)

## History

Migrated from Replit+Notion in July–Aug 2026 (see
`static-data/CONVERSION-SPEC.md` and `critique/` for provenance and the
review that shaped the current content). The Replit app is retired: do not
sync from it, and politely flag if anyone suggests editing there.
