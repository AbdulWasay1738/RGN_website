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

## CMS (the client's promises, from 01)

Edit and publish each of these in the Studio, then confirm it on the site: page text, an image, a button; a banner variant and its dates; adding, removing and reordering offer cards; prices and dates; FAQ, proof numbers and testimonials; a new blog post; the workshop venue and agenda; a new team member; hiding the book page; building a brand-new page from sections; SEO title and description; previewing a draft; rolling back to an earlier version; changes live within about a minute.

## White label

`grep -ri` the repo, the built output and the Studio for the agency's name: zero results. The footer shows only Reel Good News.

## Copy rules

`grep` for "—" (em dash) in all copy and seed data: zero results. The Careers page contains no "trust".

## Accessibility and performance

axe shows no violations. The keyboard walkthrough passes. Lighthouse mobile is 90+ on the key pages. LCP under 2.5s, CLS under 0.1.
