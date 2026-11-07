# CLAUDE.md: Reel Good News website

You are building the production website for **Reel Good News** (reelgoodnews.com), a B2B content and communications company. The founder is Jenna Colombo. The site sells three online courses, a bundle, a live workshop and a book pre-order. It also captures leads through a free Marketing ROI Assessment.

The site is **white-labelled**. The agency building it must never appear anywhere: no names in code comments, package names, meta tags, the Studio title, commit messages, the footer or anywhere else. The only brand is Reel Good News.

## Source of truth

1. `reference/prototype/index.html` is the approved clickable prototype, already revised after the client's first feedback round. It decides **layout, visual design, animation, copy and behaviour**. Open it in a browser (serve the folder over HTTP, see below) and match it at 1280px and 390px widths.
2. `docs/` holds the build spec. Read `docs/00-index.md` first. `CHANGES-ROUND-2.md` (repo root) lists what changed after the client's second feedback round; the docs below already include those changes.
3. `reference/client-brief/` holds the client's own documents: requirements, website copy, GTM strategy, bio, blog posts and her feedback rounds one and two. `reference/brand-templates/` holds her social and presentation templates, which define the visual identity (texture, emblem, colour, type, paper shapes). Use them for intent. Where they conflict with the prototype, the prototype wins, because it already includes her later feedback. Flag any conflict you notice.
4. `content-seed/` holds structured content extracted from the prototype, used to seed the CMS.

To view the prototype: `cd reference/prototype && python3 -m http.server 8765`, then open http://localhost:8765/index.html. It must be served over HTTP, not opened from file://, because the CSS masks need it. The prototype uses hash routes (`#workshop`, `#post-7`). The bottom-right "Presenter" panel exists only for client demos. **Do not build it.**

## Stack (decided, do not change without asking)

- Next.js (App Router, TypeScript, React Server Components), deployed on Vercel
- Sanity as the CMS, with Sanity Studio embedded at `/studio` (this is "the dashboard" the client edits in)
- Plain CSS: global design tokens plus CSS Modules. No Tailwind and no UI kit, because the prototype's CSS is the design and should be ported, not re-imagined.
- Fonts: Anton and Nunito Sans self-hosted with `next/font/local` (files in `assets/fonts/`). Handwritten accents use **Benedict**, loaded from a temporary remote `@font-face` until the client's licence arrives, with Licorice (self-hosted) as the fallback. Follow "Handwritten font setup" in `docs/03-design-system.md`, and never commit a Benedict font file until the licence is bought.
- Later phases: Stripe Checkout (payments) and GoHighLevel (CRM, texts and course access). Do not build these until asked. See `docs/07-integrations-later.md`.

Use the current stable versions of Next.js, React, `sanity` and `next-sanity` at setup time, and check their docs for current APIs rather than relying on memory.

## Working rules

- Work phase by phase from `docs/06-build-plan.md`. Finish a phase's acceptance checks before starting the next. Summarise what changed at the end of each phase.
- **Every piece of client-visible text must be editable in Sanity**, unless `docs/04-content-model.md` marks it as fixed UI text (for example, form validation messages).
- Copy comes from the prototype verbatim. Never invent marketing copy. If something is missing, use a visible `[placeholder in brackets]` and list it in `docs/10-open-items.md`.
- Follow the client's writing rules in `docs/08-voice-and-copy.md` for any text you must write, such as alt text, error messages and Studio help text. **No em dashes, ever.**
- Accessibility target: WCAG 2.2 AA. Honour `prefers-reduced-motion` for every animation.
- Performance target: LCP under 2.5s on a mid-range phone over 4G. Use `next/image` and modern formats.
- Never commit secrets. Use `.env.local` and keep `.env.example` up to date.
- Keep components small, typed and named after what they show (`OfferCard`, `YearCalendar`), not how they look.
- Check visual parity with Playwright screenshots against the prototype (see `docs/09-qa-checklist.md`).

## Commands (fill in as the project takes shape)

- `npm run dev`: Next.js plus the Studio at http://localhost:3000/studio
- `npm run typegen`: regenerate Sanity types
- `npm run seed`: import `content-seed/` into the Sanity dataset
- `npm run lint`, `npm run build`, `npm run test:visual`
