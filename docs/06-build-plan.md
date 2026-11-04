# 06. Build plan

Work one phase at a time. At the end of each phase: run the checks, update `docs/10-open-items.md`, write a short summary of what changed and how to see it, and stop for review before the next phase.

## Phase 0. Project setup

1. Create the Next.js app (App Router, TypeScript, ESLint) at the repo root, keeping the handoff folders (`docs`, `reference`, `content-seed`, `assets`) in place. Add Prettier.
2. Install `sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/vision`, and Playwright for tests.
3. Add `.env.example` (see 02), `.gitignore` (including `.env*.local`) and a README with setup steps.
4. Copy fonts to load via `next/font/local`, and copy static images to `public/img/`.
5. Add npm scripts: `dev`, `build`, `lint`, `typegen`, `seed`, `test:visual`.
6. Add a Vercel config if needed. Preview deployments must send `X-Robots-Tag: noindex`.

**Done when:** `npm run dev` serves a blank page at `/` and a working Studio at `/studio` (once the env vars are set), `npm run build` passes and lint is clean.

## Phase 1. Design system and global layout

1. Port the prototype CSS into `styles/tokens.css`, `styles/base.css` and `styles/brand.css`, plus CSS Modules.
2. Build the UI primitives (Button, Chip, Eyebrow, Heading with accentText parsing, Band, Wrap, Grid, Stack, Accordion, Countdown, Seats, Field, Consent).
3. Build the brand components (Watermark, RBadge, Brush, Felt, Shard, Tear, Reel, QuoteMark, Grain) with the SVG filter defs in the root layout.
4. Build the global layout: AnnouncementBanner (with `lib/sales-calendar.ts` and its unit tests), Header with MegaMenu and MobileMenu, Footer, CookieNotice, SceneTransition, skip link, reduced-motion handling.
5. Add a temporary `/dev/kitchen-sink` page showing every component (remove it before launch, or block it in production).

**Done when:** the header, banner, footer and menus match the prototype at 1280px and 390px, the keyboard works through the menus, and the transition plays between two test routes and is skipped with reduced motion.

## Phase 2. Sanity dashboard (the client's control panel)

1. Write all schemas from `04-content-model.md`: shared objects, singletons, documents and section types, with titles, descriptions, validation and previews (list previews show useful titles and thumbnails).
2. Write the Studio structure (sidebar groups, singletons pinned, orderable courses) and the branding (title "Reel Good News", R icon). Remove default templates for singletons.
3. Add the Presentation tool and draft mode, so preview opens the real page with unpublished changes and click-to-edit overlays.
4. Add the revalidation webhook route plus instructions for creating the webhook in Sanity.
5. Write the seed script from `content-seed/` plus the prototype copy. Seed a `production` dataset (and optionally a `staging` one).
6. Generate types with Sanity TypeGen, and write the GROQ queries in `lib/sanity/queries.ts`.
7. Write `docs/editor-guide.md`: a plain-English guide for the client covering how to edit each item on the promised list in 01, how to preview, publish and roll back, how to switch banner variants, change prices and dates, hide a page and build a new page from sections. Follow the voice rules in 08.

**Done when:** every item on the "Who edits the site" list in 01 can be done in the Studio, and you've checked each one by hand and listed it in the phase summary. Publishing updates the deployed page within about a minute. Preview shows drafts.

## Phase 3. Pages

Build the routes in this order, each with real Sanity data:
1. Home (all sections, including YearCalendar exactly as specified in 03)
2. Workshop, Courses (x3), Bundle, Book (the money pages)
3. Assessment (plus the questions flow and thank-you), Order confirmed
4. Partner, Contact, About, Jenna, Speaking, Podcast, Socials, Careers
5. Blog index (topic filter), blog post, Legal (x4), 404, the catch-all page builder route

Include the checkout modal (placeholder payment step) and all forms (validated, stubbed `submitForm`).

**Done when:** every route matches the prototype at 1280px and 390px (see 09), there's no horizontal scroll at 390px, every interactive behaviour in 02 works, and the date states render correctly with `?now=` for each of: before Nov 28, Nov 28 to Dec 10, Dec 11 to Feb 4, after Feb 4.

## Phase 4. SEO, performance and accessibility

1. Metadata, JSON-LD, sitemap, robots and OG images (see 05).
2. A redirects document wired into routing.
3. Image sizes and priorities, font preloading, Lighthouse mobile pass (LCP under 2.5s, CLS under 0.1).
4. Accessibility pass: axe on every route, keyboard-only walkthrough, focus states, alt text, colour contrast, reduced motion.

**Done when:** Lighthouse mobile is 90+ for Performance, Accessibility, Best Practices and SEO on the home, workshop, course and blog post pages. There are no axe violations, and the sitemap lists every visible page.

## Phase 5. QA and handover prep

Run the full checklist in 09, fix everything, then deploy to a Vercel preview URL to share with the client. Update the editor guide with screenshots.

## Phase 6. Integrations (start only when asked)

Follow `07-integrations-later.md`: Stripe Checkout and webhooks, GoHighLevel contacts, tags, workflows and texts, course access in GoHighLevel's course area, consent-gated GTM and analytics events, live seat counts and form delivery.
