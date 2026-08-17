# How David edits davidlefkowitz.com by talking to Claude

The site's content lives in a GitHub repository; publishing is automatic
(any accepted change goes live in ~2 minutes). David describes changes to
Claude in plain English; Claude edits the repository; done.

## One-time setup (do together with Alex, ~15 minutes)

1. **David gets a Claude account**: claude.ai → sign up with lefko@ucla.edu →
   subscribe to Claude Pro (~$20/mo — replaces the Replit subscription,
   which can be cancelled).
2. **David gets a GitHub account** (it's just a login; he never has to look
   at it): github.com → sign up with lefko@ucla.edu.
3. **Alex grants access**: github.com/rattrayalex/davidlefkowitz.com →
   Settings → Collaborators → Add → David's GitHub username.
   David accepts the email invitation.
4. **Connect Claude to the site**: in David's Claude account, open
   claude.ai/code ("Claude Code"), connect GitHub when prompted, authorize
   the davidlefkowitz.com repository, and create an environment for it
   (defaults are fine; working branch: static-conversion).
5. **Test together**: David starts a session and says
   "Fix a typo on my About page: change X to Y." Watch it go live.

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
