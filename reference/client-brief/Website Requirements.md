# Website Requirements Document

This document specifies a marketing website whose structure, navigation and page flow follow the layout of acquisition.com as observed on Oct 16, 2026, for Reel Good News as an extension of reelgoodnews.com, built on WordPress with the company\'s own brand, copy and imagery.

## Purpose and scope

The goal is a conversion-focused site for selling online courses and a live workshop that mirrors acquisition.com\'s information architecture and page flow: one persuasive homepage, a small mega-menu, course landing pages, and a workshop registration path.

In scope: site map, navigation, homepage section order, global components, page templates, forms, and baseline technical requirements.

Out of scope: the original site\'s logo, photography, copy, course content, books and trademarks. All of these must be replaced with our own original assets. Layout and structure are used as a reference only; no text or imagery is to be copied.

## Business and offerings

Reel Good News helps businesses turn their expertise, customer results and reputation into a year of content. It sells three online courses, which can be taken individually or as a progression and are also sold as a bundle, plus one live workshop.

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  \#             Offer                                                               Format                                                                                                              Price                                                      What the customer gets
  -------------- ------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1              Attract the Right Audience: Nail Your Go-to-Market Strategy First   Online course, available December 1, 2026                                                                           \$199; introductory price \$99 until Black Friday          A practical go-to-market direction covering audience, value and messages

  2              Build a Year of Content From One Production Day                     Online course for business owners, founders and marketing teams, available December 1, 2026                         \$399; introductory price \$249 until Black Friday         A repeatable system for planning a shoot and turning interviews into a year of content

  3              Reach the Right Audience at the Right Time                          Online course, available December 1, 2026                                                                           \$199; introductory price \$99 until Black Friday          A distribution plan that matches content to audience questions, channels and timing

  4              The Reel Good News Content Machine                                  Bundle of all three online courses, available December 1, 2026                                                      \$597 (individual value \$797, saving \$200)               The full path: define your audience and strategy, plan a production day that captures credible customer stories, and turn the content library into a distribution plan

  5              Reel Good News: Attract More Raving Fans                            Live workshop, in person (location TBD, limited to 10 attendees) and on Zoom, Thursday, February 4, 2027, noon ET   Early-bird \$149 until December 10, 2026; standard \$199   A practical plan for their own production day, a production planning workbook and a repeatable process
  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The site should present these as a four-step journey: Attract (define audience and strategy), Capture (plan a day of social proof), Create (turn it into a year of content) and Broadcast (share the right content at the right time). The free lead magnet is the Marketing ROI Assessment, which replaces the current free guide download. The courses and bundle go on sale now, with introductory prices ending on Black Friday, November 27, 2026, and lessons available from December 1, 2026.

## Site map and navigation

The reference site has six navigation items; Reel Good News needs five, with one dropdown. Items marked Proposed are my suggestions for you to confirm.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Menu item                      Type           Children                                                                                                                                                               Page                                                                                    Status
  ------------------------------ -------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------- --------------
  Workshop                       Link           None                                                                                                                                                                   Live workshop landing page and registration: Reel Good News: Attract More Raving Fans   Confirmed

  Courses                        Dropdown       Attract the Right Audience; Build a Year of Content From One Production Day; Reach the Right Audience at the Right Time; The Reel Good News Content Machine (bundle)   Three online course landing pages and one bundle page                                   Confirmed

  How It Works                   Link           None                                                                                                                                                                   The four-step journey: Attract, Capture, Create, Broadcast                              Proposed

  About                          Link           None                                                                                                                                                                   Who Reel Good News is and the results it delivers                                       Proposed

  Register or contact (button)   Primary CTA    None                                                                                                                                                                   Registration or inquiry form                                                            Proposed
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Legal pages (privacy, terms and conditions, DMCA policy, do not sell my info) are linked from the footer. Left out from the reference site: books, media and speaking requests, partner applications, careers and sub-brand sites. Any of these can be added back.

## Homepage layout

The homepage is a single long scroll of eight blocks, ordered from broad promise to proof to offers to FAQ. This layout models the reelgoodnews.com homepage on the acquisition.com homepage.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  \#                Section            Contents                                                                                                                                                                                                                                                                                            Requirement
  ----------------- ------------------ --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1                 Announcement bar   One-line \"New\" banner announcing the Thursday, February 4, 2027 live workshop                                                                                                                                                                                                                     Dismissible; links to the workshop page

  2                 Header             Logo, Workshop, Courses dropdown, How It Works, About and the primary button                                                                                                                                                                                                                        Sticky on scroll; collapses to a menu on mobile

  3                 Hero               Headline about turning expertise and customer results into a year of content, one-line value proposition, one primary button, image                                                                                                                                                                 Single CTA; image must be our own

  4                 How it works       Four steps: Attract, Capture, Create, Broadcast                                                                                                                                                                                                                                                     Steps in order; each links to the matching offer

  5                 Offer cards        Five cards: the three online courses, the Content Machine bundle and the live workshop, each with a format badge, price, title, one-line summary and button                                                                                                                                         Card order and badges editable

  6                 Lead magnet        The Marketing ROI Assessment: a free five-minute assessment of five areas (marketing efficiency, sales enablement, expertise capture, content strategy, measurement) that returns a CEO-ready Marketing Efficiency Report                                                                           Button opens the assessment form; each submission creates a GoHighLevel contact and alerts the team to review the answers

  7                 Proof              Four headline numbers (200+ high-tech founders coached; 50+ founders supported in securing early-stage funding; \$165M+ in early-stage investment raised by a venture the founder co-founded; access to 50+ accomplished entrepreneurs), plus the client testimonials already on reelgoodnews.com   Numbers exactly as you supplied them, with the \$165M figure noting it was raised by a co-founded venture; all testimonials already on reelgoodnews.com may be reused

  8                 FAQ and about      Expandable questions (who each course is for, how to register, what you leave with) followed by a short Reel Good News story                                                                                                                                                                        Accordion; answers drafted by you
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The footer follows the final section on every page.

## Global components

These appear on every page and extend the existing reelgoodnews.com header and footer, which currently list only Contact and Terms and Support.

Skip link. A \"Skip to main content\" link is the first focusable element.

Announcement bar. Full-width strip above the header with a short label, bold lead-in and link; editable without a deploy.

Header and mega-menu.

-   Logo on the left links to the homepage.

-   Desktop: top-level items with a keyboard-accessible dropdown for Courses.

-   Mobile: a menu button opens a full-screen panel listing the same items.

-   The primary registration button is visually distinct from the text links.

Footer.

-   The same links as the header, plus the legal links.

-   A row of legal links: privacy statement, terms and conditions, DMCA policy, do not sell my info.

-   A long results disclaimer and copyright line beneath the links.

-   The disclaimer text must be written for our own business and reviewed by counsel.

## Functional requirements

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ID                      Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                             Priority
  ----------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------
  F1                      Every page offers one primary call to action, repeated in the header and hero.                                                                                                                                                                                                                                                                                                                                                                                                          Must

  F2                      The workshop page shows the date and time (Thursday, February 4, 2027, noon ET), the in-person venue (location TBD), the Zoom option, agenda and speakers, and sells tickets through Stripe at two prices: early-bird \$149 until December 10, 2026 and standard \$199 after that, each including workshop instruction and a production planning workbook. The same prices apply in person and on Zoom, and in-person seats are capped at 10, after which only Zoom tickets are sold.   Must

  F3                      Each of the three courses has a landing page with who it is for, what you learn and an enroll button; courses can be bought alone, as a progression, or as the \$597 Content Machine bundle; introductory prices are shown beside regular prices until Black Friday (November 27, 2026), after which the regular price applies.                                                                                                                                                         Must

  F4                      Payments are taken through Stripe. The workshop runs in person and live on Zoom, and the online courses are on-demand lessons released December 1, 2026, hosted on Zoom or, if the pending decision goes that way, in Circle; buyers receive an automated thank-you text from GoHighLevel after purchase.                                                                                                                                                                               Must

  F5                      A how-it-works section presents the four steps and links each to its offer.                                                                                                                                                                                                                                                                                                                                                                                                             Must

  F6                      A contact or inquiry form collects name, email, business and message, and notifies the team.                                                                                                                                                                                                                                                                                                                                                                                            Should

  F7                      FAQ accordions open and close without a page reload.                                                                                                                                                                                                                                                                                                                                                                                                                                    Must

  F8                      A consent banner controls analytics tags; privacy and do-not-sell pages are linked in the footer.                                                                                                                                                                                                                                                                                                                                                                                       Must

  F9                      Analytics are installed with events for each button click and form submission.                                                                                                                                                                                                                                                                                                                                                                                                          Must

  F10                     Announcement bar, offer cards, FAQ answers and the proof block are editable in WordPress by non-developers.                                                                                                                                                                                                                                                                                                                                                                             Should

  F11                     Forms and Stripe purchases sync to GoHighLevel, which runs registration reminders, lead nurturing, follow-up campaigns and the CRM.                                                                                                                                                                                                                                                                                                                                                     Must

  F12                     A free Marketing ROI Assessment form (five minutes, five areas) creates a contact in GoHighLevel and alerts the team; the team reviews the answers, and the prospect then receives the CEO-ready Marketing Efficiency Report, followed by a video overview of their results as an unannounced bonus; the page does not mention the video.                                                                                                                                               Should
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Assumption: all new pages live on the existing reelgoodnews.com WordPress site, with no separate sub-brand sites.

## Platform and integrations

Four tools split the work: WordPress holds the site, Stripe takes payments, GoHighLevel automates follow-up and Zoom delivers the workshop and course lessons, with Circle possibly replacing Zoom for lessons (decision pending).

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Tool                    Role                                                     Requirements
  ----------------------- -------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  WordPress               Website, sales pages, blog, SEO and course information   Pages and sections editable by non-developers; this extends the existing reelgoodnews.com site, which runs on WordPress with Elementor, so new pages are built to match

  Stripe                  Payments                                                 A payment link, or a WordPress-compatible checkout, for the workshop ticket at two prices (early-bird \$149, standard \$199); no separate storefront

  GoHighLevel             CRM and sales automation                                 Registration reminders, lead nurturing, follow-up campaigns, and a CRM that turns workshop attendees into higher-value clients; forms and purchases create or update contacts

  Zoom                    Workshop delivery and course lesson hosting              Remote attendees join the February 4, 2027 workshop live; on-demand course lessons are hosted from December 1, 2026
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Launch priorities

You want to go live as soon as possible, and the workshop is on Thursday, February 4, 2027, so ticket sales come first, and the courses go on sale now through Black Friday. Design work starts when your creative director delivers the brand assets, expected Monday, October 19, 2026. This phasing is my proposal; adjust it as needed.

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Phase                   Scope                                                                                                                                                                         Why
  ----------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------------------------------
  1                       Workshop page, three course pages and the bundle page, Stripe checkout for tickets and courses, GoHighLevel thank-you texts and reminders, announcement bar, updated header   Courses go on sale now until Black Friday, November 27, 2026, and the workshop has a fixed date and an early-bird price that ends December 10, 2026

  2                       How-it-works section, Marketing ROI Assessment lead magnet, proof block, FAQ                                                                                                  Builds trust and captures leads alongside sales

  3                       About page, contact form updates, analytics refinements                                                                                                                       Lower urgency
  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Design and UX requirements

The site uses the existing Reel Good News brand from reelgoodnews.com, not the reference site\'s look. That brand\'s tagline is \"Hook. Line. Heart.\" and its voice is direct and punchy. The logo is a vivid orange-red script \"Reel\" beside navy bold serif capitals \"GOOD NEWS\". Exact color codes, font names and logo files are pending from your creative director and expected Monday, October 19, 2026.

-   Layout: one centered content column per section, full-width bands that alternate in background, generous vertical spacing between sections.

-   Typography: one display typeface for headlines and one text typeface for body copy; headlines in uppercase for offer cards and short question-style headlines in the hero. Fonts are pending from your creative director; the logo pairs a script with a bold serif.

-   Color: a restrained palette taken from the logo: white backgrounds, deep navy for text and dark bands, and a vivid orange-red accent reserved for buttons. Exact color codes are pending from your creative director.

-   Buttons: primary buttons in the accent color with uppercase labels; secondary buttons with an outline.

-   Imagery: large hero image, visuals on offer cards and a graphic for the four-step journey. All images are original or licensed.

-   Responsive behavior: breakpoints for mobile, tablet and desktop; offer cards and testimonials stack in one column on mobile, the menu collapses to a panel, and the hero image scales below the headline.

-   Motion: subtle hover and scroll effects only; respect reduced-motion settings.

## Non-functional requirements

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Area                                Requirement
  ----------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Performance                         Largest contentful paint under 2.5 seconds on a mid-range phone over 4G; images served in modern formats at responsive sizes.

  SEO                                 Unique title and meta description per page, a canonical URL, Open Graph and Twitter card tags with a share image, and an index and follow robots setting.

  Accessibility                       WCAG 2.2 AA: keyboard-operable menus and accordions, visible focus, alt text on every image, sufficient color contrast.

  Browser support                     Current and previous major versions of Chrome, Safari, Firefox and Edge, plus iOS Safari and Android Chrome.

  Security                            HTTPS everywhere, form spam protection, and no personal data stored outside the CRM.

  Privacy and legal                   Privacy statement, terms, DMCA policy and do-not-sell page; a results disclaimer and copyright notice in the footer, all drafted for our business and reviewed by counsel.

  Analytics                           Consent-gated tag manager; conversion events defined for each call to action.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Open questions

-   Decide whether course lessons and buyer access live in Circle or stay on Zoom. The GoHighLevel thank-you text will need to point to wherever the lessons end up.

-   Receive logo files, color codes and font names from your creative director (expected Monday, October 19, 2026).
