# Prompt to paste into Claude Code (round two)

First unzip this update inside your project folder (the one with `CLAUDE.md`) and choose "replace all", so the files in `CLAUDE.md`, `CHANGES-ROUND-2.md`, `docs/`, `reference/`, `content-seed/` and `assets/` replace the old ones. Your code isn't touched. Then paste this:

---

The client sent a second round of feedback, and I've updated the handoff files in this repo.

1. Read `CHANGES-ROUND-2.md` first, then re-read `CLAUDE.md` and these updated docs: `docs/01-project-brief.md`, `docs/03-design-system.md`, `docs/04-content-model.md`, `docs/05-pages-and-sections.md`, `docs/07-integrations-later.md`, `docs/09-qa-checklist.md`, `docs/10-open-items.md` and the new `docs/11-ai-assistant-later.md`.
2. Serve the updated prototype (`cd reference/prototype && python3 -m http.server 8765`) and look at `#home`, `#growth`, `#bundle` and `#workshop` at 1280px and 390px. Use the presenter panel's date switcher to see the price and banner states.
3. Tell me which phase we're in, and give me a short plan for applying every item in `CHANGES-ROUND-2.md` to what's already built. Include the schema changes (`heroFounder`, `bundle`, `announcementBanner`, the new `growthCall` singleton) and how you'll update the seed data without losing edits made in the Studio.
4. Apply the changes. Build the `/growth-strategy` page with the stubbed `submitForm('growth', ...)`. Don't build Stripe, GoHighLevel or the AI chat yet.
5. Run the "Round-two checks" in `docs/09-qa-checklist.md` plus the visual parity checks for the homepage and `/growth-strategy`. Fix any differences, then stop and summarise what changed.

After that, continue with the next phase in `docs/06-build-plan.md` as normal.

---

## Already applied round two with Licorice? Paste this instead

Unzip this update over the project again ("replace all"), then paste:

> The client wants the handwritten accents in Benedict, the script her current site uses. Read section 3 of `CHANGES-ROUND-2.md` and "Handwritten font setup" in `docs/03-design-system.md`, then switch the handwritten font to Benedict with Licorice as the fallback, exactly as described there. Don't download or commit a Benedict font file. Tune its size-adjust so every handwritten accent matches the prototype at 1280px and 390px, run the font checks under "Round-two checks" in `docs/09-qa-checklist.md`, update `docs/10-open-items.md`, then stop and summarise.
