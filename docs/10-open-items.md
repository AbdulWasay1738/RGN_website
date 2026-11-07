# 10. Open items (waiting on the client)

Keep the visible `[placeholders]` in place until these arrive. Update this list as items close.

## Closed in round two

| Item | Decision |
|---|---|
| Handwritten font | Benedict, the script on her current site (her choice). Licorice stays as the self-hosted fallback. |
| Social media templates | Received as a Canva export, now in `reference/brand-templates/`. The street texture comes from them. |
| Bundle intro price | $399 until the intro period ends. |
| Intro period end | January 15, 2027 (was Black Friday). |
| Homepage hero copy | The client's advisor copy (see 03 and content-seed `homeHero`). |
| Hero call to action | "Claim your 2027 growth strategy" leads to the new growth call page. The assessment stays as the secondary button. |

## Still open

| Item | Where it shows | Status |
|---|---|---|
| **Benedict web licence (launch blocker)** | All handwritten accents | Loaded for now from the same font host her current site uses (see 03). The client is buying the licence (Benedict by Joanne Marie, sold as a duo with Mistress Benedict). Then self-host the licensed file and remove the remote face. |
| Wording of the two new banner windows (Dec 11 to Jan 15, and the "courses on sale" line now ending Jan 15) | Announcement banner | Drafted, awaiting approval |
| Growth call: intro, steps, call length and format, available days and times, who takes the call | `/growth-strategy` | Drafted, awaiting approval. Real times come from her GoHighLevel calendar. The calendar file assumes a 30-minute call (Growth call > Call length) until she confirms. |
| Growth call step labels and messages ("Fill out the form", "Book your call", "Details saved. Our team has them now.", "Booked. Confirmation text on the way.", "Add to calendar") | `/growth-strategy` | Taken from the prototype, editable in the Studio |
| Hero copy uses "build trust", which her round-one rules avoid | Home hero | Kept verbatim because it is her advisor's copy. Flagged to her. |
| AI chat assistant | Site-wide | Approach proposed in `11-ai-assistant-later.md`. Not in the current build. |
| Workshop venue | Workshop page, order page, checkout | `[Location to be announced]` |
| Workshop agenda times | Workshop agenda | `[TIME]` |
| Report turnaround days | Assessment report and thank-you page, contact reply time | `[number] business days` |
| Final assessment questions | Assessment flow | Five draft questions, marked "Draft question" |
| Book: publication date, price, pre-order link, bonus | Book page | Placeholders. The page can be hidden. |
| Podcast name, episodes and links | Podcast page | Placeholders. The page can be hidden. |
| Team members beyond Jenna (names, titles, photos) | About page | One placeholder card |
| Company timeline dates | About page | Uses Jenna's career timeline for now |
| LinkedIn URL and other social channels | Footer, socials page | `[LinkedIn URL]` |
| Legal page text (counsel) | Four legal pages | Template banner shows |
| SMS and email consent wording (counsel, must match the A2P registration) | Assessment, partner, growth call and checkout forms | Draft wording marked "[Counsel to review]" |
| Client quote permissions | Testimonials | Each needs written permission (the `permissionConfirmed` flag) |
| Forbes and Shark Tank links | Jenna page, media band | Placeholder buttons |
| Blog posts: edit to the new voice rules? | Blog | Left in the client's voice for now |
| Accounts (domain, Google Workspace, Stripe, GoHighLevel) | Launch | The client is sorting out a Google Workspace sign-up issue first |
| Blog publish dates | Blog posts (byline, sitemap, structured data) | `publishedAt` is empty, so posts show `[Publish date]`. Set each date in the Studio. |
| Legal "last updated" dates | Four legal pages | `[date]` until counsel supplies the text |
| Podcast Spotify and YouTube links | Podcast page hero and episodes | Buttons stay as inactive placeholders until the URLs are set (the page can be hidden) |
| LinkedIn URL for the Socials card | Socials page | The card is not clickable until Site settings > LinkedIn URL is set |
| Job board location | Careers ("View job openings", open roles) | The button scrolls to the open-roles list for now; `[Role title]` placeholder card |
| Payment step copy | Checkout modal | Bracketed placeholder until Stripe is connected (phase 6) |
| Book pre-order dialog | Book page, when no pre-order link is set | Bracketed placeholder message |
| Course lesson hosting | Course pages ("Hosted on"), order page ("Access") | `[Zoom or Circle]` (plan: GoHighLevel course area, phase 6) |

## Notes for the client

- **Bundle math table after January 15.** The prototype keeps the "Intro, through Jan 15" column after the intro period ends. The site hides that column (and its expired prices) once the intro period is over, and shows only the regular prices. Easy to change back if she prefers.
- **Live site before launch.** The site at the Vercel address is a production deployment, so search engines may index it, and it already loads Benedict from the temporary font host. Keep it unannounced until the licence item above is closed, or ask for a "no indexing until launch" switch.

## Accessibility adjustments to the prototype (for the client's awareness)

- Small white text on the brand orange (#F23300) measures 4.0:1, below the AA minimum of 4.5:1. Chips, ticket stubs, small tags, the orange cards, the orange closing bands and the selected day on the growth call calendar use the button orange (#D92E00, 4.8:1). Large headlines, decorative shapes and accent words keep #F23300.
- The testimonial dots are 24px touch targets (WCAG 2.2), so they sit slightly further apart, and the carousel has a pause button (WCAG 2.2.2).
- Footer eyebrows use lavender instead of dark lavender for contrast on the dark footer.
- Growth call calendar: while it is locked, it is greyed out with colours that keep the numbers readable (4.5:1) instead of being faded to 45% opacity, and the "Book your call" step label is slightly darker than in the prototype. Unavailable days are a darker grey than in the prototype for the same reason.
