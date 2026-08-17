# How David edits davidlefkowitz.com by talking to Claude

The site's content lives in a GitHub repository; publishing is automatic
(any accepted change goes live in ~2 minutes). David describes changes to
Claude in plain English; Claude edits the repository; done.

Status: David's GitHub account **@lefko-w** already exists and already has
Write access to this repository. Repo secrets are set, so pushes deploy
automatically. Remaining: David's Claude Pro account + connecting Claude
to GitHub (steps 1 and 3 below).

The user-facing version of this guide was emailed to David (Aug 2026) and
lives in a Google Doc shared with lefko@ucla.edu:
https://docs.google.com/document/d/1cXFCIek4opmzRCjWDFtgrQXMGDCrs4d-gpNAdZQtlI8/edit

## One-time setup (~15 minutes, with Alex or solo)

1. **David gets a Claude account**: claude.ai → sign up with lefko@ucla.edu →
   subscribe to Claude Pro (~$20/mo — replaces the Replit subscription,
   which can be cancelled).
2. **GitHub account**: already done — @lefko-w, already a collaborator with
   Write. If the password is forgotten: github.com → Sign in → "Forgot
   password?" with lefko@ucla.edu.
3. **Connect Claude to GitHub** (the step that lets Claude edit the site):
   a. Open claude.ai/code ("Claude Code").
   b. Click "Connect GitHub" when offered.
   c. Sign in to GitHub as lefko-w in the window that opens.
   d. Authorize Claude (green button); if asked which repositories, choose
      rattrayalex/davidlefkowitz.com.
   e. Back at claude.ai/code, pick davidlefkowitz.com as the repository and
      accept defaults (working branch: static-conversion).
4. **Test**: David says "Fix a typo on my About page: change X to Y."
   Watch it go live ~2 minutes later.

## Everyday use (David alone)

Open claude.ai/code → new session on davidlefkowitz.com → say what you want:

- "Add my new recording. The album is called ___, on ___ Records, released
  ___. Here are the streaming links: ... I'll attach the cover."
- "Update the FYC page for this year's Grammy campaign — feature ___."
- "Add a blog essay. Title: ___. Here's the text: ..."
- "The duration listed for Ruminations is wrong; it should be ___."

Tips that make it go smoothly:
- Attach images (album covers, photos) right in the chat.
- Paste exact text for anything wording-sensitive — program notes, titles
  with special punctuation. Claude preserves your typography exactly.
- Ask "show me before you publish" if you want to preview first.
- Anything Claude can't do safely, it will say so and suggest emailing Alex.

## What NOT to do

- Don't edit in Replit (retired — changes there go nowhere).
- Don't change DNS or Cloudflare settings; those live with Alex.
- If anything looks broken, email Alex — he has monitoring and history and
  can roll back any change in one command.
