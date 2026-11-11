# Changes: client feedback round three (Nov 11, 2026)

The client's notes came as a PDF of marked-up screenshots (`Edits_Round3.pdf`) plus answers in an email. Everything below is applied to the code, the seed and, through `npm run migrate:round-3`, the live dataset.

## Copy and content

- Book: price $18. Her photo of a reader with the book (`public/img/book-reader.webp`) sits beside the statement on the book page (new `book.photo` field).
- Workshop agenda times: Noon, 1 PM, 2 PM, 3 PM, 4 PM. The agenda eyebrow drops "times to confirm".
- Workshop host section: "Your host" and "Led by our team *and founder*".
- "Build a Year of Content" subheadline: "Reel Good News. The last good news there is."
- Footer newsletter: "Get *good news* in your inbox."
- Home FAQ: "Got questions? *Get straight answers.*" and the note "It’s time to take back your time & attract best-fit partners."
- Home founder story: no "founder to founder" line, no signature, no years on the timeline cards (new `showYears` switch, off).
- About team section: "Join the team.", her card and the placeholder card removed, hiring card eyebrow "We are hiring".
- Growth call: 45-minute calls, taken by the client. Step 2 shows her booking calendar (Google Calendar now, GoHighLevel later) from the new `growthCall.bookingUrl` field; the sample calendar stays as the fallback.

## Rules

- The handwritten font is always lowercase. Every `--font-hand` style sets `text-transform: lowercase`.
- "Build trust" in the hero is approved.

## Answers and decisions

- Benedict from Canva: not usable on the website (Canva's font licence covers designs made in Canva). Buy the web licence or switch to Licorice.
- AI chat: not now (`docs/11-ai-assistant-later.md` keeps the plan).
- Still open: see `docs/10-open-items.md`.
