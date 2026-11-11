# Editor guide: the Reel Good News Studio

The Studio is the control panel for reelgoodnews.com. It lives at **reelgoodnews.com/studio**. Sign in with the account our team invited. Every change starts as a draft, shows in the live preview, and goes live only when published.

## Start here: the Home screen

The Studio opens on **Home**: big buttons for the jobs you do most.

| Button | What it does |
|---|---|
| **Edit the website** | Shows the real website. Click any text, image or price to change it in the panel beside it. |
| **Change prices** | Every price and every price-switch date on one screen (see "Change prices and dates" below). |
| **Run a sale** | Black Friday or any offer, set up once; it starts and stops by itself (see "Run a sale"). |
| **Add a course** | A new course appears on the home page and in the menus once published (see "Add a course"). |
| **Write a blog post**, **Change the banner**, **Edit the home page**, **Workshop details**, **Growth call page**, **All pages**, **Menus, footer and contact details** | Open that part of the site straight away. |

The tabs along the top: **Home**, **Prices & sales**, **All content** (everything, in the sidebar), **Edit the website** (the live view) and **Releases** (Sanity's own way to schedule any change; most of the time a sale is all you need).

## The sidebar at a glance (All content)

| Sidebar item | What it controls |
|---|---|
| **Home page** | Every section of the home page, in order |
| **Pages** | About, Partner, Contact, Careers, Speaking, Podcast, Socials, the founder page, and any new page |
| **Courses** | Each course: name, prices, page text. Drag to change their order everywhere on the site. |
| **Sales** | Scheduled sales such as Black Friday |
| **Live workshop**, **Content Machine bundle**, **Book** | Those pages and their cards |
| **Blog** | Blog posts and the blog page settings |
| **Growth call page** | The 2027 growth strategy call page (/growth-strategy): text, form wording, call days and times, the booked message, and the line under the workshop tickets |
| **Assessment** | The Marketing ROI Assessment pages and questions |
| **Banner** | The dark strip above the header and its date-driven messages |
| **Menus, footer and site settings** | Logos, main menu, mobile menu, header button, footer, newsletter text, cookie notice, checkout window text, default SEO |
| **Price switch dates and seats** | The same dates as the Prices screen, plus in-person seats sold |
| **Library** | Testimonials, FAQs, proof numbers, team members, timeline entries. Pages pick these items, so one edit updates every page that uses them. |
| **More settings** | Course page labels, the order confirmation page, legal pages and redirects |

## Text marks

- **Coloured words in headlines.** Wrap words in asterisks: `Choose a *starting point.*` The words change colour; the font stays the same.
- **The underlined word in the home headline.** Wrap it in underscores. It can sit inside coloured words: `*Win more _business._*`
- **A line break in the home headline.** Press Enter where the second line should start.
- **Prices inside bundle texts.** Write `{price}`, `{introPrice}`, `{compareAt}`, `{compareAtIntro}` or `{save}` instead of a number, for example `All three for {introPrice} through January 15, then {price}.` The site fills in the current bundle prices, so a price change never leaves an old number in the text. In the Education menu, `{bundlePrice}` shows the price of the day, for example "$399 intro".
- **Placeholders.** Text in [square brackets] marks a detail still to come, for example `[Location to be announced]`. Replace the whole bracket when the detail is final.
- **"[number]" in the assessment pages.** Set Assessment > Report turnaround. The number replaces "[number]" across the assessment pages.

## Edit text, images and buttons on any page

1. The quickest way: select **Edit the website**, go to the page and click the text you want to change. Or open **Pages** (or **Courses**, **Live workshop**, **Content Machine bundle**, **Book**) in **All content**.
2. Each page is a list of sections. Open a section to edit its text.
3. **Images:** select the image, then **Upload** or **Select**. Fill in **Alternative text**: describe what the image shows, for example "Jenna Colombo, founder of Reel Good News." Drag the circle in the image to set the focal point, so cropping keeps the important part.
4. **Buttons:** each button has a text, a link and a style. For **Link to**, pick **A page on this site** and choose the page, or **Another website** and paste the full address. A link to a hidden page disappears from the site by itself.
5. Select **Publish**.

## Change the announcement banner

1. Open **Site** > **Announcement banner**.
2. Each **version** has a label, a message, a link, a **Show from** and **Show until** date, and the date its "days left" pill counts down to.
3. The site shows the first version whose dates include today, and switches versions on the dates by itself. After the workshop starts, the banner hides.
4. Untick **Show the banner** to turn it off everywhere.

Dates are stored in UTC. Midnight Eastern Time is 05:00 UTC in winter, so "end of January 15, ET" is `2027-01-16 05:00` UTC.

## Change prices and dates

1. Select **Prices & sales** at the top (or **Change prices** on Home).
2. Change any price: each course's regular and intro price, the bundle, the workshop tickets, the book.
3. Change when prices switch, in Eastern Time: when intro prices end, when the early-bird ends, when courses open and when the workshop starts. "Through January 15" means January 16 at 12:00 AM.
4. Select **Save and publish** at the bottom. The website shows the new prices within a few seconds. **Undo changes** puts the screen back as it was.

The course and bundle prices are also in each course's **Basics** tab and on the bundle page in **All content**. The bundle's "bought separately" totals add themselves up from the courses ticked **Part of the Content Machine bundle**.

**Seats:** in **Price switch dates and seats**, set **In-person seats sold**. When it reaches the number of seats, the site shows sold out and sells Zoom tickets only.

The written dates on the pages (for example "Thursday, February 4, 2027") are separate text fields on the Workshop document. Update both when the date moves.

## Run a sale (for example Black Friday)

1. Select **Run a sale** on Home (or **Run a new sale** on the Prices screen).
2. Give it a name, for example "Black Friday sale". Visitors see it beside the countdown.
3. Pick when it **Starts** and **Ends**. The end is the moment sale prices stop: for a sale through November 30, pick December 1 at 12:00 AM (Eastern).
4. Under **Sale prices**, add each course, the workshop or the bundle and its sale price. Anything not listed keeps its usual price.
5. Optional: **Label beside sale prices**, for example "Black Friday price" (empty shows "Save $100" and so on), and a **Banner during the sale** with a short message and a link.
6. Select **Publish**. That's all: the sale switches on at the start time and off at the end time by itself, everywhere prices show (cards, course pages, menus, checkout and the banner).

To cancel a sale, untick **Sale is on** and publish, or delete it. A sale that is not published never runs; the Prices screen marks it "Not published".

## Add a course

1. Select **Add a course** on Home.
2. Fill in the **Basics** tab: short title, full title, the page address (select **Generate**), the handwritten word, the step number, the card summary, the menu line and the prices. Tick **Part of the Content Machine bundle** only if the bundle should include it.
3. Fill in the **Course page** tab (the problem, what it covers, the outcome) and pick **FAQ** questions.
4. Select **Publish**. The course gets its own page and appears on the home page, in the Education menu and in the mobile menu by itself. Drag it in **Courses** to change its place everywhere.

## The growth strategy call

The home page's main button leads to **/growth-strategy**. Visitors fill in the form first; their details reach our team as soon as they select Continue, even if they never pick a time. Then they choose a day and a time.

- Open **Growth call page** in the sidebar to edit the page text, the form wording (the field labels are fixed) and the locked-calendar message.
- **Booking calendar link** (Step 2 tab): paste the link to your booking calendar. Once a visitor fills out the form, the calendar appears on the page and they pick a time in it. It works with a Google Calendar appointment page (the short calendar.app.google link is fine) and with a GoHighLevel calendar link. Bookings, confirmations and reminders come from that calendar.
- With no link, a sample calendar shows instead, using **Days with calls**, **Days ahead to show** and **Call times**.
- **Links elsewhere** holds the line under the workshop tickets ("Not sure the in-person workshop fits?").
- To add the same kind of line to any other page, add the **Growth call link** section.

## Handwritten words

Everything in the handwritten font (course words, the workshop line, card cover words, the footer line) shows in lowercase on the site, even if you type capitals. That is on purpose: it is the house style.

On the home page's **Founder story**, the handwritten line and the signature are optional (leave them empty for none), and **Show years on the timeline cards** is off.

## The R emblem

The client asked for the R to stay subtle: at most two marks on a page, never in neighbouring sections and never behind her photo. On the home page there is one in the method section and one in the footer. Each section's **Layout and visibility** settings hold its **R watermark** choice; leave it on "None" unless a page has no other mark.

## Add, remove and reorder offer cards

1. Open **Home page** and the **Offer cards** section.
2. Under **Offers**, drag the workshop, the courses, the bundle and the book into a new order, or use the **...** menu to remove one. Every published course shows where the first course sits, so new courses need no extra step here.
3. To change the order of the courses (here, in the menus and on the path), open **Courses** in All content and drag them.

## FAQs, proof numbers and testimonials

- **Edit an answer:** Library > FAQs. One edit updates every page that shows the question.
- **Pick which questions a page shows:** open the page's **FAQ** section (or the Workshop, course or bundle **FAQ** tab) and add, remove or drag questions.
- **Proof numbers:** Library > Proof numbers. Type digits only in **Number**; put "$" in **Before the number** and "M+" in **After the number**.
- **Testimonials:** Library > Testimonials. Each quote needs written permission. Tick **Written permission received** once it is on file. The Studio blocks publishing until the box is ticked.

## Write and publish a blog post

1. Open **Blog** > **Blog posts** > **Create** (the pencil icon).
2. Fill in **Title**, **Cover words** (two to four words for the coloured cover) and the **Post**.
3. In the post text: use **Heading** for section titles, the list buttons for lists, and **+** to insert a **Pull quote** or the **Decision rule** box that closes each post.
4. On the **Details** tab: **Generate** the URL slug, set the **Number**, pick a **Topic** and the **Author**.
5. To make it the large featured post, tick **Feature this post** (untick the current featured post first).
6. Select **Publish**.

## Update the workshop venue and agenda

Open **Live workshop** (or **Workshop details** on Home).
- **Venue:** Hero tab > **Venue**.
- **Agenda:** Content tab > **Agenda**. Add the time to each item, edit titles and descriptions, and drag to reorder.

## Add a team member to the About page

1. Open **Library** > **Team members** > **Create**. Add the name, role and a photo (a cut-out with a transparent background looks best on the card).
2. Open **Pages** > **About** > **Team** section > **Team members** > **Add item** and pick the person.
3. Publish both documents.

A team member without a photo shows as a dashed placeholder card.

## Show or hide the book and podcast pages

- **Book:** **Book** in All content > tick **Hide the book page**.
- **Podcast:** Pages > Podcast > **Page settings** tab > tick **Hide this page**.

A hidden page shows "page not found", drops out of the menus and the footer, and leaves the sitemap. Untick the box to bring it back.

## Build a new page from ready-made sections

1. Open **Pages** > **Create**.
2. **Page settings** tab: enter a **Page name** and generate the **Page address** (for example `media-kit`, which becomes reelgoodnews.com/media-kit).
3. **Sections** tab: select **Add item** and pick from the library: page openings, text and story, offers and calls to action, proof, the method, questions and forms, media.
4. Fill in each section. Use **Layout and visibility** inside a section to change its background, add the R watermark, or hide it.
5. Drag sections to reorder them. Check the page in **Edit the website**, then **Publish**.
6. To link to the new page, add it to the menu in **Site settings** > **Main menu**, or to a footer column.

## Page titles and search descriptions (SEO)

Every page, course, post and offer has an **SEO** tab (or a **Search and sharing** field):
- **Search title:** under 60 characters. "· Reel Good News" is added after it.
- **Search description:** one or two sentences, under 160 characters.
- **Sharing image:** shown on LinkedIn and other sites. 1200 x 630 pixels works best.
- **Hide from search engines:** keeps the page out of Google and the sitemap.

Leave the fields empty to use the page headline and the defaults in Site settings > **SEO defaults**.

## Preview before publishing

1. Open **Edit the website** in the top bar, or open a document and select its page under **Used on**.
2. The real site shows on the right with your unpublished drafts. Edits appear within a second or two.
3. Select any text on the preview to jump to the field that controls it.

**Check the sales dates.** In the preview, add `?now=` and a date to the page address to see the site as it looks on that day, for example `/workshop?now=2026-12-11T15:00:00Z`. This works in the preview and on test links, never on the live site.

| To see | Add |
|---|---|
| Intro prices and the "NEW" banner | `?now=2026-11-20T15:00:00Z` |
| Regular course prices, early-bird workshop | `?now=2026-11-29T15:00:00Z` |
| Standard workshop price | `?now=2026-12-11T15:00:00Z` |
| After the workshop | `?now=2027-02-05T15:00:00Z` |

## Publish

Select **Publish** at the bottom of the document. The change goes live on the site within about a minute. If a page still looks old, refresh it once.

## Roll back to an earlier version

1. Open the document.
2. Select the **History** (clock) icon at the top right of the editor.
3. Pick an earlier version to see it, then select **Restore**.
4. **Publish** to make the restored version live.

To undo unpublished edits instead, use the **...** menu next to Publish > **Discard changes**.

## Rules worth remembering

- No em dashes. Use a full stop, a comma or a colon.
- Never mention the assessment's bonus video.
- Content packages never show prices anywhere.
- Never use the word "trust" on the Careers page.
- Headlines stay in one typeface. Colour accent words with asterisks instead.

---

## For developers

**Environment.** Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SANITY_PROJECT_ID`, a **Viewer** token as `SANITY_API_READ_TOKEN` (draft mode and Live preview), an **Editor** token as `SANITY_API_WRITE_TOKEN` (seed and migration scripts only, never on Vercel), and a random `SANITY_REVALIDATE_SECRET`. Add the others in Vercel.

**CORS origins** (sanity.io/manage > project > API > CORS origins): add `http://localhost:3000`, the Vercel preview domain and the production domain, each with **Allow credentials** on. The Studio runs on the site's own domain.

**Publish webhook** (sanity.io/manage > project > API > Webhooks > Create):
- URL: `https://<domain>/api/revalidate`
- Dataset: `production`
- Trigger on: Create, Update, Delete
- Filter: leave empty (every document)
- Projection: `{_type}`
- HTTP method: POST, API version: the latest
- Secret: the value of `SANITY_REVALIDATE_SECRET`

The route verifies the signature and expires the cached content, so the next visit renders fresh. Pages also refresh on a 60-second timer, so changes go live within a minute even without the webhook.

**Redirects** load at build time from `next.config.ts`. Create a Vercel **Deploy Hook** (Project > Settings > Git > Deploy Hooks) and a second Sanity webhook that calls it with the filter `_type == "redirect"`, so a published redirect triggers a redeploy.

**Roles.** Jenna: Administrator. Invited teammates: Editor (publish content, no schema changes). Developers keep Developer access until handover.

**Schema and types.** Schemas live in `sanity/schemaTypes`. Field names match `lib/sanity/types.ts`. Arrays of inline objects use member types named `${fieldName}Item`. After a schema or query change, run `npm run typegen`.
