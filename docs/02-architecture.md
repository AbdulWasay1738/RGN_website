# 02. Architecture

## Overview

```
Visitor ──► Vercel (Next.js App Router)
              │  server components fetch content with GROQ
              ▼
           Sanity Content Lake  ◄── Sanity Studio at /studio (client edits here)
              │ publish webhook ──► /api/revalidate ──► revalidateTag()
Phase 6:   Stripe Checkout ──► /api/stripe/webhook ──► GoHighLevel (contact, texts, course access)
           Forms (server actions) ──► GoHighLevel
```

## Repository layout

```
/
├─ CLAUDE.md, docs/, reference/, content-seed/, assets/   (handoff material, keep in the repo)
├─ app/
│  ├─ (site)/                     public site, shares layout (banner, header, footer, cookie notice, scene transition)
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                 home
│  │  ├─ workshop/page.tsx
│  │  ├─ courses/[slug]/page.tsx  the three courses
│  │  ├─ courses/content-machine/page.tsx   bundle (or a course doc of kind "bundle", your call, document it)
│  │  ├─ book/page.tsx
│  │  ├─ assessment/page.tsx, assessment/questions/page.tsx, assessment/thank-you/page.tsx
│  │  ├─ order/confirmed/page.tsx
│  │  ├─ about/page.tsx, about/jenna-colombo/page.tsx
│  │  ├─ partner/page.tsx, contact/page.tsx, careers/page.tsx
│  │  ├─ speaking/page.tsx, podcast/page.tsx, socials/page.tsx
│  │  ├─ blog/page.tsx, blog/[slug]/page.tsx
│  │  ├─ legal/[slug]/page.tsx    privacy, terms, dmca, do-not-sell
│  │  ├─ [...slug]/page.tsx       pages the client builds herself from sections (page builder)
│  │  └─ not-found.tsx
│  ├─ studio/[[...tool]]/page.tsx  embedded Sanity Studio
│  ├─ api/revalidate/route.ts     Sanity webhook (signature-verified)
│  ├─ api/draft-mode/enable/route.ts, disable/route.ts
│  ├─ sitemap.ts, robots.ts
│  └─ layout.tsx                  root: fonts, global CSS, metadata defaults
├─ components/
│  ├─ brand/       Watermark, Brush, Felt, Tear, Reel, RBadge, Hand, QuoteMark, Grain
│  ├─ ui/          Button, Chip, Eyebrow, Heading, Band, Wrap, Grid, Stack, Accordion, Countdown, Seats, Field, Consent
│  ├─ layout/      AnnouncementBanner, Header, MegaMenu, MobileMenu, Footer, CookieNotice, SceneTransition
│  ├─ sections/    one component per page-builder section type (see 05)
│  └─ features/    YearCalendar, OfferCard, WorkshopTicket, CourseCard, TestimonialCarousel, AssessmentFlow, CheckoutModal, ReportMock, ...
├─ lib/
│  ├─ sanity/      client.ts, fetch.ts (sanityFetch with tags), queries.ts, image.ts, live/preview helpers
│  ├─ sales-calendar.ts   pure functions: isIntro(now, settings), isEarlyBird, coursesOpen, workshopDone, priceFor(...)
│  ├─ analytics.ts        track(event) no-op until consent + GTM (phase 6)
│  └─ seo.ts              metadata builders and JSON-LD helpers
├─ sanity/
│  ├─ sanity.config.ts, sanity.cli.ts
│  ├─ schemaTypes/        documents/, objects/, sections/
│  ├─ structure.ts        Studio sidebar (singletons pinned, grouped lists)
│  └─ seed/               import script reading /content-seed
├─ styles/   tokens.css, base.css, brand.css (ported from the prototype)
├─ public/   fonts are loaded via next/font/local from /assets/fonts; static images under public/img
└─ tests/visual/          Playwright parity tests against reference/prototype
```

## Routing map (prototype hash to real URL)

| Prototype | URL |
|---|---|
| `#home` | `/` |
| `#workshop` | `/workshop` |
| `#attract` / `#create` / `#broadcast` | `/courses/attract-the-right-audience`, `/courses/build-a-year-of-content`, `/courses/reach-the-right-audience` |
| `#bundle` | `/courses/content-machine` |
| `#book` | `/book` |
| `#assessment`, `#assessment-step`, `#assessment-thanks` | `/assessment`, `/assessment/questions`, `/assessment/thank-you` |
| `#order` | `/order/confirmed` (Stripe success URL in phase 6) |
| `#partner`, `#contact`, `#about`, `#jenna` | `/partner`, `/contact`, `/about`, `/about/jenna-colombo` |
| `#speaking`, `#podcast`, `#socials`, `#careers` | `/speaking`, `/podcast`, `/socials`, `/careers` |
| `#blog`, `#post-N` | `/blog`, `/blog/[slug]` (slugs in content-seed/posts.json) |
| `#legal-privacy` and so on | `/legal/privacy`, `/legal/terms`, `/legal/dmca`, `/legal/do-not-sell` |
| `#notfound` | `not-found.tsx` |

Pages the client hides in Sanity (the `hidden` flag on book and podcast) return 404 and drop out of nav, the footer and the sitemap.

## Data fetching and caching

- Fetch in server components with a single `sanityFetch({query, params, tags})` helper. Tag by document type (`course`, `workshop`, `siteSettings`, ...).
- A Sanity webhook on publish calls `/api/revalidate` (verify the signature with `SANITY_REVALIDATE_SECRET`), which calls `revalidateTag` for the changed types. This is how "live within about a minute" is met. Also set a sensible time-based fallback revalidation.
- **Draft preview:** enable Next.js draft mode and Sanity's Presentation tool (visual editing), so the client sees unpublished changes on the real page inside the Studio before publishing.
- **Version history and rollback** come with Sanity. Make sure document history is visible in the Studio.

## Time-dependent content (sales calendar)

Prices, banner variant, "opens Dec 1" labels, ticket states and countdowns depend on the current time, and cached pages must not show stale prices after a cutoff.

- Put the rules in `lib/sales-calendar.ts` as pure, unit-tested functions that take `now` and the settings dates.
- Server components render with request-time `now` and pass `serverNow` plus the dates to a small client `SalesCalendarProvider`. Client components (`Price`, `WorkshopPrice`, `AnnouncementBanner`, `Countdown`, `TicketCard`) recompute from the client clock once mounted and every minute. This avoids a stale cache across a cutoff and avoids hydration mismatches.
- **Simulated date for previews:** when draft mode is on, or `VERCEL_ENV !== 'production'`, accept `?now=2026-11-29T15:00:00Z` to override `now`. It replaces the prototype's presenter date switcher, so the client can see each sales state. It must never work in production for normal visitors.

## Environments and secrets

`.env.example` must list:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=        # today's date at setup time
SANITY_API_READ_TOKEN=                 # for draft mode / visual editing
SANITY_API_WRITE_TOKEN=                # seed script only, never shipped to the client
SANITY_REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=https://reelgoodnews.com
# phase 6
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GHL_API_KEY=
GHL_LOCATION_ID=
NEXT_PUBLIC_GTM_ID=
```

Vercel environments: Preview deployments get `noindex` (robots header and meta). Production is indexable.

## Interactions to port from the prototype

The prototype's global click handler becomes ordinary React. Keep these behaviours:
- **Scene-change transition** between routes (film strip, clapperboard, take counter). Hook into App Router navigation: intercept internal link clicks and play the cover, then navigate, then reveal. Reset scroll to top while the screen is covered. Skip it for same-page state changes and for reduced-motion users. Keep it fast (about 1.2s total).
- Mega menu (hover on desktop, click and keyboard on all), full-screen mobile menu, dismissible banner (remember dismissal per session), cookie notice (remember choice), FAQ accordions, testimonial carousel (auto-advance, pause on hover), blog topic filter (URL query `?topic=`), assessment step flow (client state, area tracker, progress bar), checkout modal with an attendance choice (in person or Zoom, sold-out state), calendar and report animations triggered on scroll, count-up numbers, the blog reading progress bar and the copy-to-clipboard buttons.
- Scroll-driven reveals (`.rv`) can stay CSS `animation-timeline: view()` inside `@supports`.
