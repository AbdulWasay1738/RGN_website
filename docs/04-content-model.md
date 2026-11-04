# 04. Content model (Sanity)

Goal: the client can change everything listed in `01-project-brief.md` without a developer, and cannot break the design. Every field gets a plain-English title and description written in the client's voice rules. Add validation (required fields, max lengths for headlines, URL formats, alt text required on images).

## Studio structure (sidebar)

```
Reel Good News
├─ Site
│  ├─ Site settings          (singleton)
│  ├─ Announcement banner    (singleton)
│  └─ Sales calendar & seats (singleton)
├─ Pages                     (page documents: Home, About, Partner, Contact, Careers, Speaking, Podcast, Socials, plus any new page)
├─ Offers
│  ├─ Workshop               (singleton)
│  ├─ Courses                (3 course documents, orderable)
│  ├─ Content Machine bundle (singleton)
│  └─ Book                   (singleton)
├─ Assessment                (singleton)
├─ Blog posts
├─ Library
│  ├─ Testimonials
│  ├─ FAQs
│  ├─ Proof numbers
│  ├─ Team members
│  └─ Timeline entries
├─ Legal pages
└─ Redirects
```

Title the Studio "Reel Good News", with the R badge as its icon. Enable the Presentation tool (live preview on the real page) and document history.

## Shared objects

- `seo`: metaTitle (max 60), metaDescription (max 160), ogImage, noIndex (boolean)
- `link`: either an internal reference (page, course, workshop, bundle, book, assessment, post, legal) or an external URL, plus an optional "open in new tab"
- `cta`: label plus link plus style (primary, dark, outline)
- `imageWithAlt`: image (hotspot on) plus alt (required) plus optional caption
- `accentText`: a short headline string where the client marks accent words with `*asterisks*`. The renderer turns them into a coloured `<span>` in the **same font**, never a font change. Use it for every headline that has a coloured word in the prototype (for example "Choose a *starting point.*", "Recent wins & *milestones*").
- `sectionBase` (spread into every section): anchorId, background (`white` | `paper` | `navy` (textured) | `ink` (textured) | `lavender` | `lavender-tint` | `orange`), watermark (`none` | `top-right` | `bottom-left` | `bottom-right`, with tone auto-picked from the background), hidden

## Singletons

**siteSettings**
- logo (full colour), logoInverted, logoStacked
- headerNav: items[] (label, link, or a dropdown with children[] of label, link, description and optional price-line source)
- headerCta: cta (default "Ready to scale" to the workshop)
- megaMenuFeature: eyebrow, headline, date line, cta (the navy workshop card inside the Education menu)
- mobileMenuGroups: groups[] (title, links[]), plus a bottom CTA and a note
- footer: newsletterEyebrow, newsletterHeadline (accentText), newsletterBody, tagline, handwrittenLine, columns[] (title, links[]), socialLinks[], legalLinks[], disclaimer (text), copyright
- cookieNotice: title, body, acceptLabel, declineLabel
- contactEmail
- defaultSeo: seo, plus a titleTemplate ("%s · Reel Good News")
- organization data for JSON-LD: name, url, logo, sameAs[]

**announcementBanner**
- enabled
- variants[]: label (for example "NEW"), message, ctaLabel, ctaLink, showFrom (datetime), showUntil (datetime)
- The site shows the first variant whose window contains `now`. Seed it with the three variants from the client's copy (see content-seed/singletons.json). Hide the banner after the workshop.

**salesCalendar**
- introEndsAt, coursesOpenAt, earlyBirdEndsAt, workshopAt (datetimes, with help text in ET)
- inPersonSeatCap (default 10), seatsSold (manual until Stripe is connected; read-only once phase 6 syncs it)

**workshop**
- title, slug, hand line (Benedict), headline, lead, dateLabel, timeLabel, venue (default "[Location to be announced]"), zoomAvailable
- earlyBirdPrice (149), standardPrice (199), includes[] ("Workshop instruction", "Production planning workbook")
- whatThisIs: statement (accentText), body (portable text)
- outcomes[] (the five "Leave with a practical plan to" items)
- agenda[]: time, title, description
- whoItIsFor (text), noNeedFor[] (strings)
- hostSection: eyebrow, headline, body, image, chips[]
- archive: headline, lead, images[] (imageWithAlt)
- faqs: references to FAQ documents
- closingBand: headline, cta
- stepLabel ("Step 02 · Capture")
- seo

**bundle**
- title, slug, headline (accentText), subline, price (597), compareAt (797), pathItems[] (course reference, line), mathsBlock, pairWithWorkshop (headline, body, cta), faqs, seo

**book**
- hidden (boolean, so the client can hide it until the book exists), title, subtitle line, publicationDate, price, preorderUrl, cover text, statement, body, insideItems[] (word, line), quote, preorderBonus (optional), seo

**assessment**
- intro (eyebrow, headline (accentText), subline, body), formTitle, consentText (counsel to review), submitLabel
- areas[]: name, description
- questions[]: area, question, options[] (2 to 6), status (draft or final)
- report: eyebrow, headline, body, steps[]
- thankYou: headline (accentText), body, turnaroundDays (number, which replaces "[number]"), tracker labels, related cards[]
- Never mention the bonus video anywhere (client rule). Add this as Studio help text.

## Repeatable documents

**course** (three documents)
- order (1 to 3), stepNumber ("01", "03", "04"), word (Benedict label: Attract, Create, Broadcast), title, fullTitle, slug, headline, summary, shortLine (used in the mega menu price line)
- regularPrice, introPrice
- problemLabel ("The problem" or "Who it is for"), problem (with an optional highlight phrase), learn[] (strings), outcome, outcomeNote, bestFor, format, hostedOn
- faqs (references), seo
- Seed from `content-seed/courses.json`.

**post**
- title, slug, number, coverLine, topic (`OFFERS` | `CONTENT` | `POSITIONING` | `GROWTH` | `MEASUREMENT`), featured (boolean, only one at a time), author (reference, default Jenna), publishedAt, excerpt (defaults to the first paragraph), readingTime (computed), body (portable text with custom blocks: `pullQuote`, `decisionRule`, plus the standard lists and h2), sources (text), seo
- Seed from `content-seed/posts.json`. Body items are strings, `{ol:[]}`, `{ul:[]}`, `{h:''}`, `{pull:''}`, `{rule:''}`. Map `**bold**` to strong marks.

**testimonial**: quote, name, company, permissionConfirmed (boolean, required true to publish, because the client's copy notes that each quote needs written permission). Seed: `testimonials.json`.

**faq**: question, answer, tags[] (home, workshop, course, bundle). Seed: `faqs.json`.

**stat** (proof numbers): value (number), prefix ("$"), suffix ("M", "+"), label, footnote. Seed from the home "Recent wins & milestones" block and the Jenna page strip.

**teamMember**: name, title, photo, cutout (optional), bio, link (for Jenna, the Jenna page), order.

**timelineEntry**: year or range, organisation, description, highlight (boolean).

**legalPage**: title, slug (privacy, terms, dmca, do-not-sell), lastUpdated, body (portable text), plus a template banner flag "Counsel-reviewed text pending".

**redirect**: from (path), to (path or URL), permanent (default true). Read these in `next.config` or middleware at build time or on request. They'll be filled with the old WordPress URLs at launch.

## Page builder (`page` document)

Fields: title, slug (Home uses `/`), hidden, seo, sections[] (array of the section types below). The client can add, remove, reorder and hide sections and create new pages, which satisfies "build new pages from ready-made sections".

Section types (each maps to a prototype block; build each as `components/sections/<Name>.tsx`):

| Section | Used on | Key fields |
|---|---|---|
| `heroFounder` | Home | handLine, headline (accentText; the swoosh word marked with `_underscores_`), lead, primaryCta, secondaryCta, portrait cutout, floating cards (workshop date card, stat card), lower-third name and title |
| `pageHero` | Most inner pages | eyebrow, handLine, headline (accentText), lead, ctas[], art (none, portrait cutout, quote mark, reel, steps list, LinkedIn card), background |
| `ticker` | Home | phrases[] |
| `methodCalendar` | Home | eyebrow, headline (accentText), body, caption, labels (all strings shown in the calendar card) |
| `howItWorks` | Home | eyebrow, headline, note, steps[] (number, name, icon, text, link label, link) |
| `offerGrid` | Home | eyebrow, headline, note, items[] (references to workshop, course, bundle, book, in display order) |
| `assessmentCta` | Home, blog posts | eyebrow, headline, body, cta, show areas, show report mock |
| `statsBlock` | Home | eyebrow, headline (accentText), showBadge, stats (references), footnote |
| `testimonials` | Home | items (references), logo strip label and names[] |
| `founderStory` | Home | eyebrow, headline, handLine, body, photo, signature, timeline (references), cta |
| `faqBlock` | Home and others | eyebrow, headline (accentText), note, cta, faqs (references) |
| `finalCta` | Home | eyebrow, headline, cta, showCountdown |
| `statement` | About, Workshop, Partner | eyebrow, statement (accentText), body (portable text), optional side list |
| `valuesGrid` | About, Careers | headline, eyebrow, items[] (title, text), style (cards or numbered) |
| `timeline` | About | headline, entries (references) |
| `teamGrid` | About | headline, members (references), show hiring card plus its text and link |
| `ctaPanels` | About | panels[] (headline, cta, tone) |
| `gallery` | Speaking, Workshop | headline, eyebrow, items[] (image, caption, optional link card) |
| `formSection` | Contact, Partner, Speaking, Podcast, Careers | form (contact, partner, speaking, guest, talent), headline, intro, side content (quote or list), submitLabel, successTitle, successBody |
| `episodes` | Podcast | items[] (number, guest, title, summary, spotifyUrl, youtubeUrl) |
| `socialFeed` | Socials | cards[] (style, text) |
| `richText` | Any | body |
| `imageText` | Any | image, eyebrow, headline, body, cta, side |

Form field sets are fixed in code to match the client's copy document (see 05). Their headings, intros, button labels and success messages are editable.

## Roles

Jenna is Administrator. Invited teammates get Editor (they can publish content, not change the schema). The agency keeps Developer access until handover.

## Seeding

Write `sanity/seed/import.ts` (run with `npm run seed`). It reads `content-seed/*.json` and the prototype's copy and creates all documents and singletons, so the site launches with exactly the prototype content. Make it idempotent with deterministic `_id`s.
