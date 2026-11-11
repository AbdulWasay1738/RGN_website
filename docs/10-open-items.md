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

## Closed in round three (client notes, Nov 11)

| Item | Decision |
|---|---|
| "Build trust" in the hero | Keep it. Her concern was with other uses of "trust" in the original copy, which are already gone. |
| Book price | $18. Her photo of a reader with the book now sits beside the statement on the book page. |
| Workshop agenda times | Noon, 1 PM, 2 PM, 3 PM, 4 PM |
| Growth call length and host | 45-minute calls, taken by the client. Step 2 shows her Google Calendar booking page until the GoHighLevel calendar link arrives (Growth call > Booking calendar link). |
| AI chat assistant | Not now. She expects many clients will want it, so the plan in `11-ai-assistant-later.md` stays on file. |
| Handwritten font | Always lowercase, everywhere (her rule). Done in the CSS, so capitals typed in the Studio still show lowercase. |
| Copy edits from her PDF | Home FAQ heading and note, newsletter heading, the "Build a Year of Content" subheadline, workshop host heading, About team section ("Join the team.", her card and the placeholder card removed, "We are hiring"), and the founder story on the home page (no handwritten line, signature or years). |

## Still open

| Item | Where it shows | Status |
|---|---|---|
| **Benedict web licence (launch blocker)** | All handwritten accents | Loaded for now from the same font host her current site uses (see 03). She asked whether Canva's Benedict could be used: no, Canva's font licence covers designs made in Canva, not serving the font on a website. Options: buy the web licence (Benedict by Joanne Marie, sold as a duo with Mistress Benedict), then self-host it, or switch to Licorice (free for web use, already the fallback). |
| GoHighLevel booking calendar link | `/growth-strategy` step 2 | She will send it. Paste it into Growth call > Booking calendar link to replace the Google Calendar page. |
| "Leadership" label on the About team section | About page | The section now shows only the "We are hiring" card. Keep the label or change it? |
| "Reel Good News. The last good news there is." | Course page subheadline | Used on "Build a Year of Content" as marked. Should the other two courses get it too? |
| Book photo | Book page | Confirm it may be used on the website (if it was made with Canva or an image tool, its licence should allow web use). |
| Wording of the two new banner windows (Dec 11 to Jan 15, and the "courses on sale" line now ending Jan 15) | Announcement banner | Drafted, awaiting approval |
| Growth call: intro, steps and call format (phone or video) | `/growth-strategy` | Drafted, awaiting approval. Length (45 minutes) and host (the client) are confirmed. |
| Growth call step labels and messages ("Fill out the form", "Book your call", "Details saved. Our team has them now.", "Booked. Confirmation text on the way.", "Add to calendar") | `/growth-strategy` | Taken from the prototype, editable in the Studio |
| Workshop venue | Workshop page, order page, checkout | `[Location to be announced]` |
| Report turnaround days | Assessment report and thank-you page, contact reply time | `[number] business days` |
| Final assessment questions | Assessment flow | Five draft questions, marked "Draft question" |
| Book: publication date, pre-order link, bonus | Book page | Placeholders. The page can be hidden. |
| Podcast name, episodes and links | Podcast page | Placeholders. The page can be hidden. |
| Team members (names, titles, photos) | About page | Removed for now at her request: the team section shows only the "We are hiring" card. Add members in the Studio when ready. |
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
