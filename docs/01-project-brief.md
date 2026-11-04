# 01. Project brief

## The business

Reel Good News helps businesses turn their expertise, customer results and reputation into a year of content, captured on one planned production day. It serves founders and marketing teams at B2B and technology companies with complex sales. Brand tagline: **Hook. Line. Heart.**

The site has three jobs:
1. **Sell** three online courses, a bundle, a live workshop and a book pre-order.
2. **Capture leads** through the free Marketing ROI Assessment, the Partner With Us application, contact, speaking and podcast-guest forms, and the newsletter.
3. **Build credibility** through proof numbers, testimonials, the founder's story, the blog and media pages.

## Offers, prices and the sales calendar

These values must live in Sanity, not in code, because the client changes them.

| Offer | Format | Regular | Introductory / early-bird |
|---|---|---|---|
| Attract the Right Audience: Nail Your Go-to-Market Strategy First | Online course, lessons open Dec 1, 2026 | $199 | $99 until the intro period ends |
| Build a Year of Content From One Production Day | Online course | $399 | $249 |
| Reach the Right Audience at the Right Time | Online course | $199 | $99 |
| The Reel Good News Content Machine (all three courses) | Bundle | $597 (shown against $797, save $200) | none (open question, see 10-open-items) |
| Reel Good News: Attract More Raving Fans | Live workshop, in person (10 seats, venue TBA) and on Zoom, Thu Feb 4, 2027, noon ET | $199 | $149 early-bird |
| Attract More Raving Fans (book) | Pre-order | [price] | none |

Key dates (store as ISO datetimes in Sanity; the values below are the defaults):

| Key | Value | Effect |
|---|---|---|
| `introEndsAt` | 2026-11-28T05:00:00Z (end of Black Friday, Nov 27, ET) | Course prices switch from intro to regular. Banner switches from variant 1 to 2. |
| `coursesOpenAt` | 2026-12-01T05:00:00Z | "Opens Dec 1" labels become "On demand now". |
| `earlyBirdEndsAt` | 2026-12-11T05:00:00Z (end of Dec 10, ET) | Workshop price $149 becomes $199. Banner switches from variant 2 to 3. |
| `workshopAt` | 2027-02-04T17:00:00Z (noon ET) | Countdown target. After this, show "This workshop has happened" and hide the banner. |

Seat cap: 10 in-person seats. When they are gone, only Zoom tickets sell. Until Stripe is connected (phase 6), `seatsSold` is a number the client sets in Sanity.

## Who edits the site

Jenna and anyone she invites edit in Sanity Studio at `/studio`. She was promised she can, with no developer:
- edit text, images and buttons on every page
- edit the announcement banner, including the versions that switch on the sales dates
- add, remove and reorder offer cards, and change prices and dates
- update FAQ answers, proof numbers and testimonials
- write and publish blog posts
- update workshop details (venue, agenda)
- add team members to the About page
- show or hide pages (book, podcast)
- **build new pages from a library of ready-made Reel Good News sections**
- edit page titles and search descriptions for SEO
- preview every change before it goes live, and roll back to an earlier version
- see changes live within about a minute of publishing

Treat this list as acceptance criteria for the CMS.

## Ownership and white label

All accounts end up in the client's name: GitHub repo, Vercel project, Sanity project, domain, Stripe and GoHighLevel. The agency joins as invited members. During the build, the project may sit in the agency's accounts and be transferred before launch, so keep everything transferable: no hard-coded agency project IDs outside env vars.

No agency branding anywhere, including code comments, package names, the Studio title or the footer.

## Out of scope for the first build

Stripe, GoHighLevel, real form delivery, analytics tags (the consent banner is built and a placeholder `consentGranted` hook is ready), course lesson hosting (the plan is GoHighLevel's course area, phase 6), and migrating the old WordPress site's URLs (a redirects document is built now and filled at launch).
