# Reel Good News website

The production site for [reelgoodnews.com](https://reelgoodnews.com): Next.js (App Router) on Vercel, with Sanity as the content studio at `/studio`.

- Build spec: `CLAUDE.md` and `docs/` (start with `docs/00-index.md`)
- Approved design and copy: `reference/prototype/index.html`
- Client guide to the Studio: `docs/editor-guide.md`
- Open items waiting on the client: `docs/10-open-items.md`

## Requirements

- Node.js 22.12 or newer
- A Sanity project with a `production` dataset
- Python 3 (only to serve the prototype for visual comparison)

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
```

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage, project overview |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | a date, for example `2026-11-04` |
| `SANITY_API_READ_TOKEN` | sanity.io/manage > API > Tokens > Add token, **Viewer**. Powers preview and draft mode. |
| `SANITY_API_WRITE_TOKEN` | an **Editor** token, only for `npm run seed`. Never add it to Vercel. |
| `SANITY_REVALIDATE_SECRET` | any long random string; the same value goes in the Sanity webhook |
| `NEXT_PUBLIC_SITE_URL` | `https://reelgoodnews.com` in production, the preview URL elsewhere |

In sanity.io/manage > API > CORS origins, add `http://localhost:3000` and the Vercel domains, with **Allow credentials** ticked.

## Seed the content

The seed creates every page, offer, post and setting with the approved prototype copy. It is idempotent (fixed document IDs), so running it again resets seeded documents to the prototype content.

```bash
# Option A: with the Editor token in .env.local
npm run seed

# Option B: with your own Sanity login
npx sanity login
npm run seed
```

Only seed an empty or throwaway dataset: it replaces seeded documents with the prototype copy. After the client starts editing, bring the dataset up to date after a feedback round with that round's migration instead. It changes only the fields the round changed, and only while they still hold the old seed text, and lists anything edited in the Studio that it left alone:

```bash
npm run migrate:round-2 -- -- --dry-run   # list the changes, write nothing
npm run migrate:round-2                   # write them (deploy the matching code first)
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Site at http://localhost:3000 and the Studio at http://localhost:3000/studio |
| `npm run dev:offline` | The site rendered from `content-seed/`, with no Sanity connection (local development and tests only) |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm test` | Unit tests (sales calendar and bundle prices, growth call calendar and form, text helpers) |
| `npm run typegen` | Regenerate `sanity.types.ts` from the schema and queries |
| `npm run seed` | Import `content-seed/` and the prototype copy into an empty dataset |
| `npm run migrate:round-2` | Apply the client's round-two changes to a dataset already in use, keeping Studio edits (`-- -- --dry-run` to preview) |
| `npm run test:visual` | Screenshots of the prototype and the site at 1280px and 390px for every route, plus overflow and broken-image checks. Output in `tests/visual/__screenshots__/` |
| `npm run test:a11y` | axe accessibility checks on every route |
| `npm run test:e2e` | Behaviour checks: sales states, bundle prices, banner, menus, checkout, assessment, growth call, blog filter, the round-two home page (two R marks, Benedict) |
| `npm run prototype` | Serves the prototype at http://localhost:8765/index.html |

Playwright tests start `npm start` in offline mode, so run `SANITY_OFFLINE=1 npm run build` first (or set `BASE_URL` to test a running site). Install the browser once with `npx playwright install chromium`.

## How it fits together

```
app/
  (site)/            public site: layout (banner, header, footer, cookie notice, scene transition) and routes
    page.tsx         home (the "home" page document)
    [...slug]/       every page-builder page: about, partner, contact, careers, speaking, podcast, socials,
                     about/jenna-colombo, and any page the client creates
    workshop/, courses/[slug]/, courses/content-machine/, book/   the offer pages (singletons and course documents)
    assessment/, order/confirmed/, blog/, legal/[slug]/
    growth-strategy/ the growth strategy call: lead form first (captured on Continue), then day and time
  studio/            the embedded Sanity Studio
  api/revalidate     publish webhook (signature checked) -> revalidateTag
  api/draft-mode/    enable / disable preview
  actions/forms.ts   the server action every form posts to
components/          brand/, ui/, layout/, sections/ (one per page-builder section), features/
lib/
  sanity/            client, fetch (tags, draft mode, offline mode, link resolution), queries, types (the content contract)
  sales-calendar.ts  pure, unit-tested price and date rules
  growth-call.ts     pure, unit-tested booking calendar rules (Eastern Time)
  forms.ts           form field sets, validation and the delivery seam for phase 6
  seo.ts, analytics.ts, text.ts
sanity/              schemas, Studio structure, Presentation config, seed, migrations (one per feedback round)
styles/              tokens.css, base.css, brand.css (ported from the prototype); CSS Modules sit next to components
```

### Content and caching

- Every read goes through `sanityFetch` (`lib/sanity/fetch.ts`). Published content is cached with tags and a 60 second fallback, so changes show within about a minute even without the webhook.
- The publish webhook calls `/api/revalidate`, which refreshes the cache right away.
- In draft mode (the Studio's Presentation tool), pages read drafts with click-to-edit overlays.
- Link fields store references; `href`s are resolved at fetch time, so renaming a slug never breaks a link. Links to hidden pages disappear from navigation.

### Fonts

Anton, Nunito Sans and Licorice are self-hosted with `next/font/local`. The handwritten accents use **Benedict**, the client's choice, loaded for now with a plain `@font-face` from a remote font host (`styles/tokens.css`) until her web licence is bought; Licorice is the fallback. Components use `var(--font-hand)` and never name a font. When the licence arrives, save the file as `assets/fonts/benedict.woff2`, load it with `next/font/local`, and delete the remote face and the preconnect in `app/(site)/layout.tsx`. Never commit a Benedict file before then. Launching on the real domain waits for this.

### Time-dependent content

Course and bundle prices, the banner variant, "opens Dec 1" labels, ticket states and countdowns follow the dates in **Sales calendar & seats**. Bundle texts can use the price tokens `{price}`, `{introPrice}`, `{compareAt}`, `{compareAtIntro}` and `{save}`, and the Education menu line can use `{bundlePrice}`, so prices are typed once. Pages render on the server with the request time and the browser re-checks every minute, so cached pages switch at each cutoff. On previews and in draft mode, add `?now=2026-12-20T15:00:00Z` to any URL to see another sales state. This never works in production for visitors.

## Deploying to Vercel

1. Import the GitHub repo into Vercel (framework preset: Next.js).
2. Add the environment variables above for Production and Preview (not the write token).
3. Deploy. Preview deployments send `X-Robots-Tag: noindex`; production is indexable.
4. In sanity.io/manage > API > Webhooks, add:
   - **Revalidate**: URL `https://<your-domain>/api/revalidate`, dataset `production`, trigger on create, update and delete, filter empty, projection `{_type}`, HTTP method POST, secret = `SANITY_REVALIDATE_SECRET`.
   - **Redirects** (redirects load at build time): a Vercel deploy hook URL, filter `_type == "redirect"`.
5. Add the production domain to the Sanity CORS origins.

## Phase 6 (not built yet)

Stripe Checkout and GoHighLevel are described in `docs/07-integrations-later.md`. The seams are ready: `lib/forms.ts#deliverForm` (including the `growth` lead, which should alert the client straight away), the growth call's Confirm step (`components/features/growth/GrowthBooking.tsx`, marked `Phase 6`) and `lib/growth-call.ts` (replaced by GoHighLevel free slots), the checkout modal's payment step (`components/features/CheckoutModal.tsx`, marked `Phase 6`), `salesCalendar.seatsSold`, and `lib/analytics.ts#track`.
