# Changes: client feedback round two (Nov 7, 2026)

The client reviewed the prototype again. Her notes are in `reference/client-brief/Website Feedback - Round Two (Nov 7).md`. Every change below is already in the updated prototype (`reference/prototype/index.html`), docs and seed content. **Apply this checklist to anything already built**, then carry on with the build plan.

Open the prototype over HTTP (`cd reference/prototype && python3 -m http.server 8765`) and compare `#home`, `#growth`, `#bundle` and `#workshop`.

## 1. Homepage hero: new copy, calmer layout (feedback #2 and #3)

- Eyebrow: "Strategic content. Built for business growth."
- Headline, two lines: "Attract more best fit customers." then "Win more business." in coral (Anton, same font), with the lavender swoosh under "business."
- Lead: "Reel Good News turns your expertise, customer stories, and industry knowledge into a year of strategic content. One focused production day gives your business the case studies, insights, and social proof it needs to educate buyers, build trust, and drive sales." (her advisor's copy, verbatim except "the" added before "case studies")
- Buttons: primary "Claim your 2027 growth strategy" goes to `/growth-strategy`; outline "Take the free assessment".
- Support line under the buttons, with a coral left rule: "One strategic production day. Twelve months of sales enablement. A stronger case for choosing your business."
- Art: the portrait cutout on the textured navy with only a faint lavender glow, plus the Founder lower-third. **Remove** the R emblem and the brush scribble behind her photo, both floating cards ("Live workshop", "250 founders coached") and the handwritten "Hook. Line. Heart." line above the headline.
- Update the `heroFounder` schema and seed (see `docs/04-content-model.md`, `content-seed/singletons.json` → `homeHero`).

## 2. R emblem: two subtle marks only (feedback #4)

- Homepage: keep one low-contrast R in the method section (near the top) and one in the footer (bottom). Remove every other R: how-it-works, offers, the assessment band, Recent wins (including the R badge), FAQ and the orange final CTA.
- Never stack two R marks in neighbouring sections, and never put one behind the client's photo.

## 3. Handwritten font: Benedict (feedback #5)

- Use **Benedict** (Joanne Marie, 2016) for every handwritten accent. It's the script her current site uses, and it's her choice.
- Until her web licence is bought, load it with a plain `@font-face` from the same font host her current site uses. Don't commit a copy of the file. The exact CSS is in `docs/03-design-system.md` under "Handwritten font setup".
- Keep Licorice (`assets/fonts/licorice.woff2`, OFL) self-hosted with `next/font/local` as the fallback in the same stack.
- Tune Benedict's `size-adjust` so the accents match the prototype at 1280px and 390px.
- Remove the old Comforter stand-in and delete `comforter.woff2` if it's in the repo.
- The "Benedict Family" font she linked on 1001freefonts is a different font (a sans serif). Don't use it.

## 4. Pricing and dates (feedback #6)

- `introEndsAt` = **2027-01-16T05:00:00Z** (end of January 15, 2027, ET). Course intro prices and the bundle intro price both end then.
- Bundle: **$399** intro (struck $597, chip "Intro price through Jan 15"), then $597 (struck $797, "Save $200"). Add `introPrice` and `compareAtIntro` to the bundle schema.
- Bundle math table: two columns, Intro (through Jan 15) and Regular. Separately: $447 and $797. Bundle: $399 and $597.
- Everywhere the bundle price shows (home offer card, mega menu line, course page link and upsell, bundle page, checkout) must follow the date.
- Replace every "Black Friday" or "November 27" with January 15.
- Banner, four windows (wording of the new ones awaits approval; it's in the seed):
  1. until Dec 1: "Our courses are on sale now at introductory prices through January 15." (countdown to intro end)
  2. Dec 1 to Dec 10: the early-bird workshop message (unchanged)
  3. Dec 11 to Jan 15: "Introductory course and bundle prices end January 15." (countdown to intro end)
  4. Jan 16 to Feb 4: the live workshop message (unchanged)
- Update `lib/sales-calendar.ts` tests for the new dates.

## 5. New page: growth strategy call (feedback #2 CTA question, plus the booking widget she sent)

Route `/growth-strategy` (prototype `#growth`), new `growthCall` singleton. The full spec is in `docs/05-pages-and-sections.md`, and her example is `reference/client-brief/booking-widget-example.png`.

- Two steps in one card: "Fill out the form" then "Book your call".
- Step 1: mobile (US +1 prefix), first name, last name, work email, optional unticked SMS consent, a Terms and Privacy line, Continue.
- The calendar sits below the form, locked until step 1 validates. Clicking it shows "Please fill out the form before choosing your time slot."
- **Continue captures the lead immediately** through `submitForm('growth', ...)`, because the client wants an alert so she can call them directly even if they never book.
- Step 2: available days (Tue to Thu, next 30 days, from the singleton until GoHighLevel provides real slots), times in ET, Confirm, then the booked state with Add to calendar (.ics).
- Links: the hero primary button, a line under the workshop tickets ("Not sure the in-person workshop fits? Book a growth strategy call") and the footer "Learn" column.

## 6. Visual identity from her templates (feedback #1, Canva export)

- Her templates are now in `reference/brand-templates/` (21 pages). Use them as the visual reference for texture, emblem, colour, type and paper shapes.
- `texture-street.jpg` was rebuilt from her template. Use it with `background-size: cover` (not tiled) on navy and ink bands, ticket cards, course covers, the footer and the transition strip.
- Don't reuse any photos from the templates. They are Canva stock, licensed only inside Canva.

## 7. AI chat (feedback #7): not in this build

Read `docs/11-ai-assistant-later.md`. Leave room for an "Ask Reel Good News" widget and a `knowledgeEntry` content type later. **Never** give a public chatbot the GTM strategy document directly, because it contains internal plans.

## Done when

- Every item in "Round-two checks" in `docs/09-qa-checklist.md` passes.
- The homepage and `/growth-strategy` match the prototype at 1280px and 390px.
- `docs/10-open-items.md` is current.
- A short summary lists what changed and anything that didn't match the prototype.
