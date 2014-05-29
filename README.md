
# DavidLefkowitz.com

This is the personal website of my beloved Uncle, David Lefkowitz. 

---

### To develop/build/deploy an updated version:

Unfortunately, github-pages doesn't support Jekyll 2.0.3, which this site relies on, making heavy use of Collections, a feature which came in at 2.0. At time of writing gh-pages only supports 1.5.3.

So, we have to deploy "manually". We do this using the method described here: [https://gist.github.com/chrisjacob/825950](https://gist.github.com/chrisjacob/825950). There are scripts to help:

1. The first time you clone this repo, run `bin/setup.py`. You'll need to have run `pip install clint` first.
  - This clones a second copy of the repo into `_site`, checks out the `gh-pages` branch, and deletes the `master` branch from that repo. You write to `master` from above `_site`, and push to `gh-pages` from within `_site`.
2. To build/develop, run `jekyll serve --watch`. Or `jekyll build` or whatever.
3. To deploy, run `bin/deploy.py`.
  - It basically just cd's to `_site` and runs `git push`, to `gh-pages`.

Side note: I strongly recommend the "MarkdownEditing" Sublime Text package's "Markdown GFM" syntax for syntax highlighting. 

Once Github has updated the [Jekyll Version](https://pages.github.com/versions/),
you can get rid of everything in the `bin/` directory
and start pushing everything to `gh-pages`. If you want.
