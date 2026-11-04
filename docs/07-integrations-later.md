# 07. Integrations (phase 6, do not build yet)

Read this now so the first build leaves clean seams: `lib/forms.ts#submitForm`, the checkout modal's "Continue to payment" handler, `salesCalendar.seatsSold`, and `lib/analytics.ts#track`.

## Decided approach

Sign-ups happen on the website. Stripe takes payment. GoHighLevel (GHL) handles everything after the sale. Zoom only hosts the live workshop. The on-demand courses live in GHL's built-in course area (Memberships). No Shopify, and no Zoom paid registration.

## Stripe

- One Stripe Product per offer, each with two Prices where needed: course intro and regular; workshop early-bird and standard; bundle; optionally the book.
- The server picks the Price by `lib/sales-calendar.ts` at session creation, **never trusting the client**.
- `POST /api/checkout` validates the offer and attendance, checks seats for in-person tickets, creates a Checkout Session (customer email, phone collection, metadata: offer, attendance, SMS consent), and redirects to it. Success URL: `/order/confirmed?session_id={CHECKOUT_SESSION_ID}`. Cancel returns to the page.
- `POST /api/stripe/webhook` (verify the signature) handles `checkout.session.completed`: record the order, increment in-person seats atomically (use a small KV or database store, for example Vercel KV or Upstash, or a Sanity document mutation with optimistic locking), then call GHL.
- In-person sell-out: when seats reach the cap, in-person checkout is refused and the UI switches to Zoom-only.
- The order page reads the session server-side to show the ticket or enrolment details.

## GoHighLevel

Use the GHL API v2 with a location-level private integration token. Scope access to the client's sub-account.

- **Contacts:** create or update by email and phone for every form and purchase. Add tags by source: `workshop-buyer`, `workshop-in-person`, `workshop-zoom`, `course-attract`, `course-create`, `course-broadcast`, `bundle`, `assessment`, `partner-application`, `contact`, `speaking-request`, `podcast-guest`, `talent`, `newsletter`, and `sms-consent` only when the box was ticked.
- **Workflows** (built in GHL by the team; the site only triggers them through tags or webhooks): purchase confirmation text and email, workshop reminders (7 days, 1 day, 1 hour, including the Zoom link or venue), course access (grant the course offer in GHL Memberships, then send the login email), assessment alert to the team plus the prospect's confirmation (**must not mention the bonus video**), and the partner application alert.
- **SMS compliance:** texts go out only after the A2P 10DLC brand and campaign are approved. Marketing texts only go to contacts with `sms-consent`. Transactional texts follow the approved campaign. The consent wording on the site must match what was registered.
- **Assessment answers:** store them as a note or custom fields on the contact, so the team can review them before writing the report.

## Analytics

The cookie notice controls consent. On accept, load GTM (`NEXT_PUBLIC_GTM_ID`) and push events. `track(name, props)` maps to `dataLayer.push`. Events: every CTA click (the prototype names them in `data-track` attributes, for example `hero_reserve` and `banner_click`), form submits, checkout start, and purchase (from the order page, once per session).

## Seat count

Once the webhook increments a counter, `seatsSold` in Sanity becomes read-only (or is replaced by the counter), and the seat visuals read the live value with short revalidation.
