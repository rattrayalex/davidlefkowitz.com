# Content-Fidelity Audit — rebuilt davidlefkowitz.com (static)

Audited 2026-08-09 against source-of-truth in `/workspace/davidlefkowitz.com/static-data/`.
Site under test: `http://localhost:8080` (dist/public served by `scripts/serve-static.mjs`).
Methods: full JSON diff of every API endpoint vs source; headless-Chromium (Playwright) renders of
composition, recording, and blog pages; HTTP checks of every image and cross-link.

## Verdict summary

| # | Audit area | Result |
|---|------------|--------|
| 1 | Counts (compositions / blog / recordings) | PASS — 200 / 34 / 21 |
| 2 | Typography fidelity (10 exacting titles) | PASS — byte-exact in API and browser render |
| 3 | Program notes (all 200 checked, 10 browser-rendered) | PASS — 157/157 notes present, 0 artifacts |
| 4 | Recordings (21 covers, tracklists, year/label, 102 links) | PASS at data level; 1 low note |
| 5 | Cross-links | **FAIL — 33 of 42 recording→composition links broken** |
| 6 | Blog | **FAIL — all 34 blog post pages show "Post Not Found"** |

---

## DEFECT 1 — CRITICAL: Every blog post detail page is broken ("Post Not Found")

All 34 posts. Reproduced in headless Chromium: navigating from `/blog` (clicking the first card)
lands on `http://localhost:8080/blog/Quartet%20Integra` showing `data-testid="post-not-found-title"`
("Post Not Found"). Same for every `/blog/<slug>` URL tested (`Quartet Integra`,
`Chaconne_and_Triple_Fugue`, `The_Cosmologist`, `Drums`, ...).

**Root cause.** The client (`client/src/pages/blog-post.tsx`) fetches
`/api/blog-posts/<slug>` and `/api/blog-posts/<slug>/navigation`. In the deployed build,
`dist/public/api/blog-posts` is a single JSON **file** (the list), so no per-post endpoint exists;
the SPA fallback returns `index.html` with HTTP 200 (`content-type: text/html`), `res.json()` throws,
and the error state renders. The current `scripts/assemble-static.py` (lines 80–91) *does* emit
`api/blog-posts/{slug}/index.html` + `.../navigation` — the deployed `dist/public` (and the checked-in
`static-api/`) predate that script and were never regenerated.

**Consequences:**
- Field affected: `content`, `comment`, `title`, navigation prev/next — none reachable in the UI.
- Audit item 6a (purple-box comment) FAILS as a consequence: the purple box
  (`data-testid="post-excerpt"`, blog-post.tsx line 171) never renders because the page never loads.
  The **data** is correct: all 34 API list entries have a non-empty `comment` (the source's final
  `content_blocks` entry, correctly split out per the purple-box rule) and a non-empty `excerpt`.

**Exact URLs (all 34 fail identically):** `http://localhost:8080/blog/` + each of:
`Quartet Integra`, `Chaconne_and_Triple_Fugue`, `The_Cosmologist`, `The_Alarmist`, `Drums`,
`The_Pompous_One`, `Dancing_with_the_Moon`, `The_Pedagogue`, `Pelog`, `The_Majestic_One`,
`Animal_Motion`, `The_Contrarian`, `Mainstream_Klezmer`, `Klezmer_Modes_Explainer`,
`Klezmer_Sorrow_and_Joy`, `Lydian_Mode_Explainer`, `The_Convalescent`,
`Single_Double_and_Triple_Fugues_Explainer`, `The_Optimist`, `Orphic_Color`, `The_Climber`,
`A_Music_Box`, `A_Spiral_Galaxy_Oracle`, `Slendro`, `The_Dreamer`, `Mechanical_Motion`, `Birdsong`,
`Bells`, `Diatonic_Answers_Explainer`, `The_Skeptic`, `Funk`, `Exploding_Solo_Piano`,
`Exploding_Preludes_and_Fugues`, `Preludes_and_Fugues_Have_Been_Released`.

---

## DEFECT 2 — HIGH: 33 of 42 recording→composition links land on "Composition Not Found"

Every recording's `composition` field (faithful to `static-data/recordings.json`) links with
**underscore** slugs (e.g. `/compositions/Green_Mountains`), and the repo's own
`scripts/verify-site.mjs` line 21 expects `/compositions/Green_Mountains` to work. But the static API
tree was emitted under **space** slugs (`dist/public/api/compositions/Green Mountains`), so
`/api/compositions/Green_Mountains` soft-404s to `index.html` (HTTP 200, `text/html`) and the page
renders `"Composition Not Found"` (verified in headless Chromium for 10 of the 33). Only single-word
or hyphen-only slugs (9 of 42) survive. Note `scripts/assemble-static.py`'s `comp_slug()`
("spaces→underscore", replicating `server/sync.ts`) would produce the underscore form — further
evidence the deployed API tree is a stale build.

**All 33 broken links (recording slug → broken href):**

| Recording page | Broken composition href |
|---|---|
| /recordings/Carter_Dewberry | /compositions/Possible_Worlds |
| /recordings/Chroma | /compositions/Suite_for_Piano |
| /recordings/Debussy_Trio_Art | /compositions/Rage_Denial_Hope |
| /recordings/Debussy_Trio_Look_Ahead | /compositions/Rage_Denial_Hope |
| /recordings/Dialoghi | /compositions/Amour_et_Biaute_Parfaite |
| /recordings/Fukui_1st_Music_for_Harp_CD | /compositions/Calders_Closet_Harp_Tubular_Bells |
| /recordings/Fukui_2nd_Music_for_Harp_CD | /compositions/Ancient_Rituals |
| /recordings/Garlands_for_Stucky | /compositions/In_Memoriam_Steven_Stucky |
| /recordings/Harp’s_Desire | /compositions/Ancient_Rituals |
| /recordings/Harp’s_Desire | /compositions/Before_the_Solstice_Flute__Harp |
| /recordings/Harp’s_Desire | /compositions/Calders_Closet_Harp_Percussion |
| /recordings/Harp’s_Desire | /compositions/On_Hearing |
| /recordings/Harp’s_Desire | /compositions/who_write_on_clouds |
| /recordings/Inner_World | /compositions/Deep_Dreams |
| /recordings/Inner_World | /compositions/E_Duo_Unum_Viola_Duo |
| /recordings/Inner_World | /compositions/Miniature_I |
| /recordings/Inner_World | /compositions/Miniature_VI |
| /recordings/Inner_World | /compositions/Miniature_VIII_Unbearable_Longing_Violin-Viola |
| /recordings/Inner_World | /compositions/Within-Without_Flute |
| /recordings/Janaki_Trio | /compositions/Miniature_VIII_Unbearable_Longing_Violin |
| /recordings/Music_of_Contradictions | /compositions/Canonical_Variations |
| /recordings/Music_of_Contradictions | /compositions/E_Duo_Unum_Viola_Duo |
| /recordings/Music_of_Contradictions | /compositions/Fashionable_Suite |
| /recordings/Music_of_Contradictions | /compositions/Sur-Real_Cine-Music_Flute_version |
| /recordings/Music_of_Contradictions | /compositions/Surfers_Guide_Oboe_Clarinet |
| /recordings/Petteri_Iivonen_Art_of_the_Sonata | /compositions/Miniature_VIII_Unbearable_Longing_Violin |
| /recordings/Petteri_Iivonen_Art_of_the_Violin | /compositions/Eli_Eli |
| /recordings/Preludes_and_Fugues | /compositions/Expanded_Universe |
| /recordings/Preludes_and_Fugues | /compositions/Parallel_Universes |
| /recordings/Quartet_Integra | /compositions/Green_Mountains |
| /recordings/Solazur | /compositions/Before_the_Solstice_Cello__Guitar |
| /recordings/Sounds_Beyond_the_Century | /compositions/White_Clouds |
| /recordings/Virginia_Figueiredo | /compositions/Miniature_VI |

The 9 that resolve: `Bagatelle`, `Berceuse`, `Etude`, `Revertigo`, `Ruminations`, `Duo`,
`With-Without` (×3 pages).

**Reverse direction PASSES:** all 41 compositions whose source has a `recording` reference expose a
valid `recording_info` array (id, slug, title, album_cover) in their detail API; browser renders of 8
of them (e.g. `/compositions/Green%20Mountains`, `/compositions/who%20write%20on%20clouds`,
`/compositions/Bagatelle`) show the "Recording (click on image...)" card with the cover image loaded,
and the card's `/recordings/<slug>` targets resolve (checked `Quartet_Integra`, `Harp’s_Desire`,
`Music_of_Contradictions` — all render with correct H1).

---

## LOW / INFORMATIONAL

1. **Recording year never displayed.** `client/src/pages/recording-detail.tsx` renders title, label,
   performers, images, links — but no year field, on any of the 21 pages (e.g.
   `/recordings/Harp’s_Desire` shows "Albany Records Troy 1499" but never "2014"). The `year` values
   in `/api/recordings` are all correct vs source; this is a presentation omission, not data loss.
2. **Composition↔blog cross-links absent, faithful to a source gap.** All 200 composition details
   have `related_blogposts: []`. The 37 `related_compositions` refs in `static-data/blog/*.json` are
   Notion URLs (e.g. `https://app.notion.com/p/53167b7c2fe683c296888122c4d55e98`) whose page-ids match
   **no** composition id in `static-data/compositions/` — the mapping cannot resolve from the given
   source data. Flagging in case the referenced parent pages were meant to be extracted.
3. **"...who write on clouds..." uses three ASCII periods, not U+2026.** The audit brief wrote the
   title with a real ellipsis; source (`static-data/compositions/who write on clouds.json`), API, and
   the rendered page all use `...` (ASCII). Site is byte-faithful to source; no action unless the
   source itself is wrong.
4. **"Calder‘s Closet" uses U+2018 (LEFT single quote) as its apostrophe** in all three source files
   and is preserved verbatim on the site. Faithful, but likely a typo in the source data.

---

## PASS details (evidence)

**1. Counts — PASS.** `/api/compositions` `pagination.total` = 200 = 200 files in
`static-data/compositions/`. `/api/blog-posts` = 34 = 35 files minus
`EXCLUDED-4d367b7c-draft-funk-duplicate.json.bak`. `/api/recordings` = 21.

**2. Typography — PASS (10/10).** Verified byte-identical source→API, then rendered in headless
Chromium and matched the exact string in the page body/H1:
`...who write on clouds...`, `Un- (Time) –less` (EN DASH preserved), `Frère Adam` (è preserved, both
versions), `Y'Fei Nof` (straight apostrophe, per source), `Na'aritz'cha`, `E Duo Unum` (all three
versions), `in memoriam: DORFMAn/RAUCH`, `2ème Prix de Fukui de Musique Pour Harpe 1995`
(`/recordings/67967b7c-2fe6-839e-8d4f-016c4b290edb`), `Harp’s Desire` with RIGHT SINGLE QUOTATION MARK
(`/recordings/1ca67b7c-2fe6-8208-b2ab-0178f8d2f2da`), and curly `’cello` (12/12 occurrences in
`/api/recordings`; rendered on `/recordings/02c67b7c-2fe6-820d-ac54-81de9065d899` — curly present,
straight absent). Zero `?`/mojibake (`â€`, U+FFFD) anywhere in the API corpus.

**3. Program notes — PASS.** All 200 detail endpoints fetched: the 157 compositions whose source has
a `program_note` all serve it byte-identical; zero occurrences of `**`, `\[`, `<span ... underline`,
or mojibake. Browser-rendered 10 across decades (1980s–2020s): Wines Suite (7 ¶), The Fashionable
Suite (9 ¶), Canonical Variations (9 ¶), Calder's Closet Harp+Perc (2 ¶), Revertigo (2 ¶),
...who write on clouds... (11 ¶), On Hearing Her Play the Harp (20 ¶), Berceuse (5 ¶),
Milken's Freylekh (2 ¶), Expanded Universe (3 ¶) — all render as real `<p>` paragraphs inside
`data-testid="composition-program-note"`, no artifacts in rendered text.

**4. Recordings — PASS.** All 21: `album_cover` returns HTTP 200 with valid JPEG/PNG magic bytes; at
least one `album_track_listing` image, each verified 200 + image bytes; `year` and `label` identical
to `static-data/recordings.json` (21/21). Browser-verified image loading
(`complete && naturalWidth>0`) on `Quartet_Integra` (11 media images), `Harp’s_Desire` (11),
`Fukui_2nd_Music_for_Harp_CD` (2). Streaming links: 102 hrefs across 16 recordings — 100% `https://`,
and every anchor label's domain is appropriate (Spotify→spotify.com, Apple Music→music.apple.com,
Tidal→tidal.com, Amazon→amazon.com, YouTube→youtube.com/youtu.be, Deezer→deezer.com,
BeMusic→vebto.com), not just the 10-link sample requested. The 5 recordings with no links
(`Sounds_Beyond_the_Century`, `Chroma`, `Debussy_Trio_Art`, both Fukui CDs) have none in source
either — faithful.

**6. Blog internal links — N/A (vacuously true).** Post bodies contain 81 hrefs, **zero** of which
point to davidlefkowitz.com or any site-relative path (all external: youtu.be ×34, youtube.com ×33,
wikimedia/wikiart/metmuseum/etc.). No inline `/api/media-cache/blog_*` images are referenced in any
post's content. So there is nothing to resolve — but note the pages that would display these links are
themselves broken (Defect 1).
