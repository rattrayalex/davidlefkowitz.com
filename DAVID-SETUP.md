# How David edits davidlefkowitz.com by talking to Claude

The site's content lives in a GitHub repository; publishing is automatic
(any accepted change goes live in ~2 minutes). David describes changes to
Claude in plain English; Claude edits the repository; done.

Status: David's GitHub account **@lefko-w** already exists and already has
Write access to this repository. Repo secrets are set, so pushes deploy
automatically. Remaining: David's Claude Pro account + connecting Claude
to GitHub (steps 1 and 3 below). Sep 2026: David got stuck at the old
step 3d — the GitHub App install picker, which can only ever list repos
HE owns. Step 3 below is the corrected flow (App install is not needed
for access; OAuth + collaborator visibility is what matters, per
https://code.claude.com/docs/en/web-quickstart).

The user-facing version of this guide was emailed to David (Aug + Sep
2026) and lives in a Google Doc shared with lefko@ucla.edu:
https://docs.google.com/document/d/1Km5iRPx5xm-z2gaLbikLW73pT6zwkFQd2anSaQEozvc/edit

## One-time setup (~15 minutes, with Alex or solo)

1. **David gets a Claude account**: claude.ai → sign up with lefko@ucla.edu →
   subscribe to Claude Pro (~$20/mo — replaces the Replit subscription,
   which can be cancelled).
2. **GitHub account**: already done — @lefko-w, already a collaborator with
   Write. If the password is forgotten: github.com → Sign in → "Forgot
   password?" with lefko@ucla.edu.
3. **Connect Claude to GitHub** (corrected Sep 2026):
   a. Open claude.ai/code ("Claude Code").
   b. Click "Connect GitHub" / "Sign in with GitHub"; sign in as lefko-w
      and click the green Authorize button (plain OAuth — this is the
      step that grants access).
   c. If a screen asks to "install the Claude GitHub App" and lists
      repositories: click **Skip**. That picker only shows repos David
      owns; the website will never appear there. Installing on lefko-w
      is neither needed nor harmful (it only enables Auto-fix webhooks).
   d. Back at claude.ai/code, create the environment (defaults fine) and
      pick rattrayalex/davidlefkowitz.com in the repository picker — it
      appears because his account can see it as a collaborator (working
      branch: static-conversion).
   e. If the repo does not appear: verify, signed in as lefko-w, that
      github.com/rattrayalex/davidlefkowitz.com opens; then reconnect
      GitHub and retry.
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

## Domain name (Network Solutions)

Network Solutions is only the **registrar** for davidlefkowitz.com (the
name itself; paid through April 2027, keep auto-renew on). Site + email
forwarding run on Cloudflare. David needs no hosting/builder products
from Network Solutions — before he cancels any line items there, review
the list with Alex.

## What NOT to do

- Don't edit in Replit (retired — changes there go nowhere).
- Don't change DNS or Cloudflare settings; those live with Alex.
- If anything looks broken, email Alex — he has monitoring and history and
  can roll back any change in one command.
