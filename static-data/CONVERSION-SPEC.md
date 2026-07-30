# Notion → static JSON conversion spec

Purpose: rebuild the site's database content as static JSON, faithful to what
`server/sync.ts` produced for the live site. Source of truth: Notion databases
in Alex's workspace, accessed via the Notion MCP tools (`mcp__Notion__*`,
loaded via ToolSearch).

## General transform rules (match sync.ts)

- **Links in rich text** → `<a href="URL" target="_blank" rel="noopener noreferrer">TEXT</a>`.
  The MCP fetch tool returns properties as markdown: `[TEXT](URL)` → apply the
  rule above. `<br>` in property markdown = line separator.
- **program_note / plain-text fields** → strip ALL markdown formatting
  (`**`, `*`, links become their plain text). Keep paragraph breaks as `\n\n`.
- Unescape markdown backslash-escapes (`\[` → `[`, `\*` → `*`, etc.).
- Curly quotes/apostrophes: keep exactly as-is from Notion.
- Empty/missing property → `""` (or `[]`/`null` as the schema says).

## Compositions

Source data source: `collection://07967b7c-2fe6-827e-a61f-07b3f83f6acf`
("Compositions (Long Version)"). Get your slice with SQL, e.g.:

```
SELECT url, "Name of Page" FROM "collection://07967b7c-2fe6-827e-a61f-07b3f83f6acf"
WHERE "Year ©" >= 2016
```

(NULL years: use `"Year ©" IS NULL`.) Then `notion-fetch` each `url` and build
from the returned properties:

Write one file per composition:
`/workspace/davidlefkowitz.com/static-data/compositions/<slug>.json`
where `<slug>` = the "Name of Page" property verbatim (spaces and unicode kept —
it is used in URLs as-is; do NOT slugify).

```json
{
  "id": "<notion page id, dashed lowercase>",
  "slug": "<Name of Page>",
  "title": "<Name, newlines stripped, trimmed>",
  "instrumentation": ["<multi_select values in order>"],
  "ensemble": ["<multi_select values in order>"],
  "year": 2016,
  "duration": "<Duration plain text>",
  "publisher": ["<segments>"],
  "premiere_info": "<Date of premier start date, YYYY-MM-DD, or empty>",
  "recording": ["<each nonempty line of the Recording property, plain text, trimmed>"],
  "streaming_links": "<Streaming Links as HTML: links per link rule, <br> between lines>",
  "program_note": "<Program Note as PLAIN TEXT, paragraphs joined with \n\n>",
  "blog_relation": ["<Blog relation page URLs if any>"]
}
```

- `publisher`: convert Publisher property to HTML (link rule), then split the
  HTML string on `,` and `;`, trim each piece, drop empties → array.
- `streaming_links`: keep the line structure using `<br>` separators between
  streaming services, links per the link rule.
- `recording`: plain-text lines only (often site URLs like
  `https://www.davidlefkowitz.com/recordings/<slug>` or album titles).

## Blog posts

Source data source: `collection://fae67b7c-2fe6-83ec-a500-0751f498c139` (Blog).
List with SQL (`SELECT url, "Name of Page" FROM ...`), fetch each page, and write
`/workspace/davidlefkowitz.com/static-data/blog/<notion-page-id-nodash>.json`:

```json
{
  "id": "<notion page id, dashed lowercase>",
  "slug": "<Name of Page property, or empty>",
  "title": "<Post Title, newlines→space, trimmed>",
  "published_date": "<Publication Date or Date property start, YYYY-MM-DD>",
  "tags": [],
  "published": true,
  "content_blocks": ["<HTML string per content block, see below>"],
  "images": [{"caption": "", "url_note": "see images section"}],
  "related_compositions": ["<Composition relation page URLs if any>"]
}
```

`content_blocks` — convert the page CONTENT (not properties) block by block:
- paragraph → the rich text as HTML (link rule; `**x**`→`<strong>x</strong>`,
  `*x*`→`<em>x</em>`)
- heading 1 → `<h1 class="text-3xl font-bold mt-8 mb-4">…</h1>`
- heading 2 → `<h2 class="text-2xl font-bold mt-6 mb-3">…</h2>`
- heading 3 → `<h3 class="text-xl font-bold mt-4 mb-2">…</h3>`
- bulleted item → `<li class="ml-4 mb-1">• …</li>`
- numbered item → `<li class="ml-4 mb-1">1. …</li>`
- quote → `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">…</blockquote>`
- image blocks: do NOT put the signed URL in content. Instead append an entry to
  `images`: `{"caption": "<caption if any>", "s3_filename": "<the filename part of the S3 URL path>", "signed_url": "<full signed URL>"}`
  AND immediately download it with Bash curl to
  `/workspace/davidlefkowitz.com/site-images/blog/<page-id-nodash>_<n>.<ext>`
  (signed URLs expire ~5 minutes after the fetch, so download right away).
  Then put a placeholder block `<img data-blog-image="<n>">` in content_blocks
  at the image's position.
- skip empty blocks; drop KaTeX/equation blocks.

Do NOT compute excerpt/comment/read_time — post-processing does that.

## Reporting

When done, report: how many files written, any pages that failed to fetch or
had missing slugs/dates, and any block types you encountered that are not in
the list above.
