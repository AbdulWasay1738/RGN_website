# 05. Pages and sections

For each page, open the matching prototype route and copy its structure, copy and behaviour. The prototype templates live in the `P.<route>` functions inside `reference/prototype/index.html`.

## Global (every page)

Every page has the announcement banner (date-driven variant, live day countdown, dismissible), a sticky header (logo, nav with Education and Media dropdowns, "Ready to scale" button, menu button under 1080px), a skip link, the main content, the footer, the cookie notice (shown once, after about 1.6s) and the scene transition between routes.

The footer has: newsletter signup (email, validated, success toast), logo, tagline, handwritten line, a LinkedIn button, three link columns, legal links, disclaimer and copyright. **No agency credit.**

## Page by page

| Route | Source (prototype) | Content source | Notes |
|---|---|---|---|
| `/` | `P.home` | page "home" (sections) | Sections in order: heroFounder, ticker, methodCalendar, howItWorks, offerGrid (workshop ticket, 3 course cards, bundle card, book card), assessmentCta (ink, torn top edge), statsBlock ("Recent wins & milestones" plus R badge), testimonials (plus logo strip), founderStory (felt plus shards frame), faqBlock, finalCta (orange, R watermark, countdown) |
| `/workshop` | `P.workshop` | workshop singleton | Hero with the ticket card and countdown, statement, outcomes grid, agenda plus "who it is for" plus "no need for", tickets (early-bird and standard cards by date, attendance toggle, seats row), host, archive gallery, FAQs, orange closing band. "Reserve my seat" opens the checkout modal. |
| `/courses/[slug]` | `coursePage()` | course | Hero with the sticky price card (intro countdown until `introEndsAt`), the 4-step path bar (Attract to workshop to Create to Broadcast, current one highlighted), problem statement with highlight, "What the course covers" tiles, outcome plus detail tiles, bundle upsell, FAQs plus a "Taught by our team" card |
| `/courses/content-machine` | `P.bundle` | bundle | Card fan art (it must fit at 390px), path list, maths table, workshop pairing, FAQs |
| `/book` | `P.book` | book | 3D book cover (single font on the cover title), statement, inside tiles, quote, optional pre-order bonus. Hidden when `book.hidden`. |
| `/assessment` | `P.assessment` | assessment | Intro plus the form (first name, last name, work email, mobile, company, role, company size, **optional unticked** SMS consent), five areas, report section |
| `/assessment/questions` | `P['assessment-step']` | assessment.questions | Client-side flow: one question per step, area tracker, progress bar, answer required before Next, Back works, Submit shows "Sending your answers to our team…" then redirects to thank-you. Guard: arriving without form details sends the visitor back to `/assessment`. |
| `/assessment/thank-you` | `P['assessment-thanks']` | assessment.thankYou | Status tracker, three "Meanwhile" cards |
| `/order/confirmed` | `P.order` | fixed layout, copy in siteSettings or a small `orderConfirmation` singleton | Reads the order from the query string (phase 6: the Stripe session). Shows a ticket for the workshop or an enrolment card for courses, plus "What happens next" with calendar buttons (generate .ics) |
| `/partner` | `P.partner` | page | pageHero with the steps art, statement plus "what happens next" list, formSection(partner) |
| `/contact` | `P.contact` | page | Email card with copy button, formSection(contact): name, email, subject pills (Workshop, Courses, Work with us, Other), message. Quick-link cards. |
| `/about` | `P.about` | page | pageHero (quote mark art), statement ("The industry needs your voice. We can help."), valuesGrid, teamGrid (Jenna card, placeholder card, hiring card), timeline, ctaPanels |
| `/about/jenna-colombo` | `P.jenna` | teamMember (Jenna) plus page sections | Hero cutout plus reel, stats strip (lavender), bio, quote card, record cards, client words (testimonials), media and press band |
| `/speaking` | `P.speaking` | page | Hero with the orange portrait card, recent sessions gallery plus next-workshop card, formSection(speaking): name, organization, event name, event date, topic, audience size, message |
| `/podcast` | `P.podcast` | page | Cover art, episodes (play toggles a waveform animation; links open Spotify or YouTube), formSection(guest): name, company, topic, link. Hidden when the page is hidden. |
| `/socials` | `P.socials` | page | Hero plus LinkedIn card, socialFeed (four sample cards) |
| `/careers` | `P.careers` | page | Hero, valuesGrid (numbered), open roles (from a list, empty-state card), formSection(talent). **The word "trust" must not appear on this page** (client rule). |
| `/blog` | `P.blog` | posts | Topic tabs (All plus 5 topics, via `?topic=`), featured post ticket, grid of cards with coloured covers that rotate through navy, lavender and paper |
| `/blog/[slug]` | `P.post` | post | Reading progress bar, cover, share buttons (LinkedIn, copy link), body with pull quote and decision rule, sources, assessment CTA, three related posts |
| `/legal/[slug]` | `P.legal` | legalPage | Side nav of the four legal pages, a "counsel-reviewed text pending" banner while the flag is on |
| 404 | `P.notfound` | fixed | "This page isn't *good news.*" plus four buttons |
| `/[...slug]` | none | page | Any page the client creates from sections |

## Forms (first build)

Build every form with client and server validation (server actions), accessible errors, an honeypot plus a time-trap for spam, and the success state from the prototype. In this phase, the action validates and returns success and logs the payload in development. Phase 6 swaps in GoHighLevel. Keep the payload shape in one `lib/forms.ts` with a `submitForm(kind, data)` interface, so only that function changes later.

Consent checkboxes are **optional and unticked**. Their wording is editable and marked "[Counsel to review]".

## Checkout (first build)

"Enroll now", "Get the bundle" and "Reserve my seat" open the checkout modal from the prototype: attendance choice for the workshop (in-person disabled when sold out), name, email, mobile, an optional SMS consent box and the total. For now, "Continue to payment" shows a placeholder step and links to `/order/confirmed?demo=1`. Phase 6 replaces this with a redirect to Stripe Checkout. The book's pre-order button goes to `book.preorderUrl` when it's set.

## SEO per page

Every route gets metadata from its `seo` object, with fallbacks: title template, description, canonical URL, Open Graph and Twitter tags, and an OG image (static default plus a per-page override). JSON-LD: Organization (site-wide), Course (each course), Event (workshop: date, location or online, offers), Product or Book (book), FAQPage (pages with FAQs), BlogPosting (posts), BreadcrumbList. Build `sitemap.ts` from Sanity (skip hidden and noIndex pages) and `robots.ts` (disallow everything on preview deployments, and always disallow `/studio`).
