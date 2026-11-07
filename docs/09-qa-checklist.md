# 09. QA checklist

## Visual parity with the prototype

- Serve the prototype (`cd reference/prototype && python3 -m http.server 8765`) and the app side by side.
- `tests/visual/parity.spec.ts`: for each route in the 02 routing map, capture full-page screenshots of the prototype (`http://localhost:8765/index.html#<route>`) and the app at 1280x900 and 390x844. Before capturing:
  - hide the cookie notice and the prototype's presenter button
  - set the header to `position: relative`
  - disable `.rv` scroll animations (`.rv{animation:none!important;opacity:1!important}`), because scroll-driven animations leave off-screen content invisible in full-page shots
  - scroll the page once so the IntersectionObserver animations run
- Compare by eye, page by page. Pixel-perfect is not the goal. The same structure, copy, typography, colours, spacing rhythm and brand details are.
- Also check automatically on every route at both widths: no element wider than the viewport (no horizontal scroll), no broken images, no clipped text (the book cover title clips on purpose).

## Behaviour

- Banner: the correct variant and day count for each `?now=` state, dismiss works and is remembered.
- Prices and labels flip at each cutoff: course intro to regular, workshop early-bird to standard, "opens Dec 1" to "on demand now", and countdowns hide after the workshop.
- Seats: setting `seatsSold` to 10 in Sanity shows sold out and leaves Zoom only (checkout disables in person).
- Menus: hover and click, keyboard (Tab, Enter, Escape), the mobile menu traps focus and closes on Escape.
- Scene transition: plays on internal navigation, lands at the top of the new page, handles rapid clicks, is skipped with reduced motion and for same-page state changes.
- Calendar: Day 1 lights first, the ripple fills, Replay re-runs it, and there's no horizontal scroll at 390px.
- Forms: required fields, email and URL validation, optional consent, success state, spam traps.
- Assessment: a guard without details, answer required, back and next, submit, then thank-you.
- Blog: topic filter via URL, related posts, progress bar, copy link.
- Hidden pages (book, podcast) return 404 and disappear from the nav and sitemap.

## Round-two checks

- Home hero: the copy matches content-seed `homeHero`; there's no emblem, brush, floating card or handwritten line in the hero.
- Exactly two R watermarks on the homepage: one in the method section, one in the footer. No R badge on the homepage.
- The handwritten accents render in Benedict (check with network access), with Licorice only as the fallback in `--font-hand`. No Benedict font file is committed to the repo yet. No accent clips or wraps badly at 390px.
- Before launch: Benedict loads from `assets/fonts/benedict.woff2` through `next/font/local`, and nothing requests `db.onlinewebfonts.com`.
- Bundle shows $399 with $597 struck before `introEndsAt` and $597 with $797 struck after. Course intro prices end on Jan 15, 2027 (check with `?now=2027-01-15T20:00:00Z` and `?now=2027-01-16T15:00:00Z`).
- Banner shows the right one of four variants for `?now=` of Nov 20, Dec 5, Dec 20 and Jan 20.
- Growth call: the calendar is locked until the form validates (clicking it shows the locked message), Continue captures the lead, Edit returns to the form, day then slot then Confirm shows the booked state, there's no horizontal scroll at 390px, and the hero's primary button and the workshop page link both open it.

## CMS (the client's promises, from 01)

Edit and publish each of these in the Studio, then confirm it on the site: page text, an image, a button; a banner variant and its dates; adding, removing and reordering offer cards; prices and dates; FAQ, proof numbers and testimonials; a new blog post; the workshop venue and agenda; a new team member; hiding the book page; building a brand-new page from sections; SEO title and description; previewing a draft; rolling back to an earlier version; changes live within about a minute.

## White label

`grep -ri` the repo, the built output and the Studio for the agency's name: zero results. The footer shows only Reel Good News.

## Copy rules

`grep` for "—" (em dash) in all copy and seed data: zero results. The Careers page contains no "trust".

## Accessibility and performance

axe shows no violations. The keyboard walkthrough passes. Lighthouse mobile is 90+ on the key pages. LCP under 2.5s, CLS under 0.1.
