# Start here: building the Reel Good News site with Claude Code

This folder is the complete handoff: the spec (`CLAUDE.md` plus `docs/`), the approved prototype (`reference/prototype/`), the client's brief (`reference/client-brief/`), seed content (`content-seed/`) and brand assets (`assets/`).

## 1. Accounts to set up (about 20 minutes)

Use the team address you set up for client work, not a personal email. Everything moves to the client's ownership before launch.

1. **GitHub:** create a private repo, for example `reelgoodnews-web`.
2. **Sanity** (sanity.io): create a project called "Reel Good News" with a dataset called `production`, and note the Project ID. Under API, create two tokens: Viewer (read) and Editor (write, for the seed script only). Add `http://localhost:3000` and your Vercel preview domain as CORS origins, with credentials allowed.
3. **Vercel:** import the GitHub repo once the first commit is pushed.

## 2. Start the project

```bash
mkdir reelgoodnews-web && cd reelgoodnews-web
# unzip this handoff here so CLAUDE.md sits at the repo root
git init
claude
```

Claude Code reads `CLAUDE.md` automatically.

## 3. Prompts to paste, one phase at a time

**Phase 0 and 1 (codebase plus design system):**

> Read CLAUDE.md and every file in docs/ in order, then skim reference/prototype/index.html (serve it over HTTP as CLAUDE.md describes). Give me a short plan for phases 0 and 1 from docs/06-build-plan.md, listing anything unclear. Then build phase 0, then phase 1. Run the acceptance checks for each phase and stop with a summary when phase 1 is done.

**Phase 2 (the dashboard):**

> Build phase 2 from docs/06-build-plan.md: all Sanity schemas from docs/04-content-model.md, the Studio structure, Presentation preview, the revalidation webhook, the seed script and docs/editor-guide.md. My Sanity project ID and tokens are in .env.local. Seed the production dataset, then walk through every item on the "Who edits the site" list in docs/01-project-brief.md and confirm each one works.

**Phase 3 (pages):**

> Build phase 3: every route in docs/05-pages-and-sections.md, using Sanity data, in the order listed. After each group of pages, run the visual parity checks in docs/09-qa-checklist.md at 1280 and 390 and fix the differences before moving on.

**Phases 4 and 5 (SEO, performance, QA):**

> Build phases 4 and 5 from docs/06-build-plan.md. Run the full docs/09-qa-checklist.md and report results with anything still open.

**Phase 6 (Stripe plus GoHighLevel), later:**

> Read docs/07-integrations-later.md and build phase 6. Start with Stripe in test mode.

## 4. Tips

- Let it finish a phase before redirecting it. Review the summary, then try things yourself at `localhost:3000` and `localhost:3000/studio`.
- When something looks off, give a screenshot and the route ("on /workshop at 390px the ticket stub wraps"). It's much faster than describing it.
- Commit after each phase, and push to get a Vercel preview link you can share with the client.
- For each new round of client feedback, add a `CHANGES-ROUND-N.md` with the updated docs and prototype, then paste a prompt like `PROMPT-ROUND-2.md`.
