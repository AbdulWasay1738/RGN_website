# 03. Design system

The prototype's `<style>` block is the design system. **Port it, do not redesign it.** Split it into `styles/tokens.css` (custom properties), `styles/base.css` (resets, typography, layout utilities such as `.wrap`, `.band`, `.grid`, `.stack`, `.row`, gaps, `.rv` reveals) and CSS Modules per component. Inline styles in the prototype's templates should become CSS Module classes or component props.

## Tokens (from the prototype `:root`)

```css
--navy:#091527; --ink:#050C17; --navy2:#13233F; --navy3:#1C3058; --line-d:#22324F; --line-d2:#2A3A57;
--paper:#FAF7F2; --white:#FFFFFF; --lav:#C6A7ED; --lav-t:#F1EAFB; --lav-i:#5B3E8C; --lav-d:#3E2A66;
--orange:#F23300; --coral:#FF4739; --btn:#D92E00; --btn-h:#B52500;
--text:#36415A; --muted:#5B6478; --soft:#CFD6E2; --soft2:#9AA6BA;
--rule:#E8E4DC; --rule2:#D5D9E0; --peach:#FFF1EC; --peach-i:#5A1A08; --peach-n:#B32600;
--ease:cubic-bezier(.2,.7,.2,1);
--tex:url(/img/texture-street.jpg);   /* street texture on navy and ink bands */
--grain: SVG turbulence noise data URI (copy from the prototype)
```

Colour roles: navy for text and dark bands; orange and coral for accents and primary buttons (`--btn` for button fills, which passes contrast with white); lavender for secondary accents, cards and the handwritten lines; paper as the warm off-white band. Check contrast on every new pairing (AA).

Breakpoints used: 1080px (desktop nav collapses to the menu button), 760px (main mobile layout), 520px (small phones). Content column max width 1280px, with side gutters of 16px on mobile and 40px from 760px up.

## Typography (client rule, non-negotiable)

Only three typefaces:

| Role | Font | Notes |
|---|---|---|
| Headings, titles, buttons, big numbers | **Anton** | Always uppercase, weight 400 (single weight; declare `font-weight: 100 900` on the face so no faux-bold). Letter-spacing about .005em to .02em. |
| Body copy, labels, eyebrows, form text | **Nunito Sans** | Weights 400, 600, 700, 800, 900. Eyebrows: 800, 12px, uppercase, letter-spacing .2em. |
| Handwritten accents | **Benedict** by Joanne Marie (2016), the script the current reelgoodnews.com uses. Fallback: **Licorice** (family name "RGN Hand") | The client's choice. Temporary remote setup until her web licence is bought. See "Handwritten font setup" below. |

### Handwritten font setup (Benedict, temporary)

The client chose Benedict, the handwritten script on her current site. Her web licence is being sorted, so for now:

- Load Benedict with a plain `@font-face` in the global CSS, from the same font host her current site uses. Don't download the file into the repo or commit a copy until the licence is bought.
- Keep Licorice self-hosted with `next/font/local` (`assets/fonts/licorice.woff2`, size-adjust about 112%, CSS variable `--font-licorice`) as the fallback, so nothing breaks if the remote file is slow or fails.
- Expose one variable for components. Components use `var(--font-hand)` and never name a font.

```css
@font-face {
  font-family: 'Benedict';
  src: url('https://db.onlinewebfonts.com/t/d85bfa7b5e2eb872c592f58f015ecdb4.woff2') format('woff2'),
       url('https://db.onlinewebfonts.com/t/d85bfa7b5e2eb872c592f58f015ecdb4.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  size-adjust: 100%; /* tune, see below */
}
:root { --font-hand: 'Benedict', var(--font-licorice), cursive; }
```

- Benedict has different proportions from Licorice (taller ascenders). Check every accent at 1280px and 390px ("founder to founder", course words, the workshop line, the signature on the founder photo, card cover words, the footer line) and tune `size-adjust` on the Benedict face until they match the prototype's visual size with no clipping. Run these checks with network access so Benedict actually loads.
- If you add a Content Security Policy, allow `https://db.onlinewebfonts.com` in `font-src` for now.
- Don't use Benedict's alternate letters or ligatures. They sit in the Private Use Area, so they break copy and paste, search and screen readers.
- **Before launch (blocker):** the client buys the licence. Save the licensed web file as `assets/fonts/benedict.woff2`, load it with `next/font/local` like the other fonts (keep the family name and `--font-hand`), then delete the remote `@font-face` and any CSP exception. Tracked in `10-open-items.md`.
- The "Benedict Family" font on 1001freefonts (a sans serif by Storytype) is a different font. Don't use it.

Rules from the client's feedback:
- **Never mix two typefaces inside one headline.** An accent word inside a headline stays in Anton and changes colour only (`.acc` orange or coral, `.acc-l` lavender).
- The handwritten font appears only in select subheadlines and editorial accents: "founder to founder", course name labels above course titles, the workshop name line, the signature on the founder photo, card cover words, and the footer line. Never as a primary headline.
- Long statements and quotes use Nunito Sans 700 or 800, not Anton.
- **The handwritten font is always lowercase** (round three). Every style that uses `--font-hand` sets `text-transform: lowercase`, so text typed with capitals in the Studio still shows lowercase.

## Brand components (the client's visual identity, change #10)

The client asked for the character of her social templates and original site to be built into the design, not added only through the logo and colours. The prototype implements this with the components below, and all of them should exist as reusable React components:

| Component | Prototype source | Description |
|---|---|---|
| `Watermark` | `wm()` helper, `.wm` | The script "R" from the logo (`r-emblem.png`) used as a CSS mask, so its colour is set by `color`. **Client rule (round two): only two on the homepage, never stacked and never behind her photo.** One subtle mark near the top or middle of the page (the method section) and one at the bottom (the footer). No R anywhere else on the homepage. |
| `RBadge` | `.rbadge` | Orange circle with a white R (`r-badge.png`). Keep the component (favicon, Studio icon) but do not place it on the homepage (round two). |
| `Brush` | `brush()` + SVG filter `#rgnBrush` | Coral dry-brush stroke (SVG path with turbulence displacement and a streak mask). **Removed from behind the hero portrait in round two.** Keep the component for sparing use elsewhere; never behind a photo of the client. |
| `Felt` | `felt()` + filter `#rgnTorn` | Torn red felt block behind photos (founder section). |
| `Shard` | `.shard` | Lavender folded-paper triangles framing photos (clip-path polygons). |
| `Tear` | `tear()` | Torn-paper edge used as a section transition (paper into ink above the assessment band). Generate the jagged path deterministically. |
| Street texture | `--tex` | `texture-street.jpg`, taken from the client's own template (round two). Applied with `background-size: cover` (not tiled) to `.navy` and `.ink` bands, ticket cards, course covers, the footer and the transition strip. |
| Gradient ticker | `.ticker` | Pink, purple and orange radial-gradient band with grain, Anton uppercase phrases alternating white and lavender, coral star separators, infinite marquee that pauses on hover. |
| `Reel` | `reel()` | Film-reel SVG, slowly spinning. A secondary motif on inner pages and in the transition. |
| `QuoteMark` | `QUOTE` | Lavender quotation mark from `quote-mark.svg`. |
| `Grain` | `.grain`, `.orangeb::after` | Subtle noise overlay on orange bands. |

## Feature components with specific behaviour

- **YearCalendar** (home, "One day of your time"). This is the client's change #1, so match it exactly:
  - a caption under the title: "Each square is a day of published content. All of it comes from the single orange day."
  - a "Typical approach" strip of 365 small orange squares labelled "365 days of production effort"
  - a main 12-month grid where Day 1 (Jan 1) is a larger orange circle with a glow and a callout tag "DAY 1 · YOUR PRODUCTION DAY" with a leader line
  - all other days one lavender colour
  - on scroll into view, and on Replay, Day 1 lights first, then the other squares fill in a ripple by distance from Day 1
  - month labels and headers in dark text for contrast
  - squares 13px with a 4px gap on desktop, 7px with a 2px gap on mobile, with no horizontal scroll at 390px
  - an accessible `role="img"` label describing the comparison
- **WorkshopTicket**: perforated stub, live countdown, 10-seat visual (sold seats dim), "+ Zoom" chip, early-bird or standard price by date.
- **CourseCard / OfferCard**: textured cover with a big outline step number and a handwritten course word, intro price with struck regular price and a "Save $X" pill until `introEndsAt`, then the regular price.
- **TestimonialCarousel**: large quote, dots, prev/next, auto-advance every 8s, pause on hover, three mini quotes on the side.
- **ReportMock**: the sample Marketing Efficiency Report card, with bars that animate on scroll.
- **SceneTransition**: see 02-architecture.

## Homepage hero (round two)

The client found the first hero too busy. The new hero is calm on purpose:
- left: eyebrow, headline in two lines ("Attract more best fit customers." then "Win more business." in coral with the lavender swoosh under "business."), lead paragraph, two buttons (primary "Claim your 2027 growth strategy" to the growth call page, outline "Take the free assessment"), then the support line with a coral left rule
- right: the portrait cutout on the textured navy with only a very faint lavender radial glow behind it, and the "Founder / Jenna Colombo" lower-third
- no R emblem, no brush stroke, no floating cards, no handwritten line in the hero

## Buttons

Anton, uppercase, 17px (15px small), letter-spacing .06em, radius 6px. Variants: primary (`--btn`, hover `--btn-h` with shadow), dark (navy), outline (navy inset 2px), outline-light (on dark), white. The arrow icon nudges right on hover. Minimum touch target 44px.

## Motion

Subtle hover and scroll effects only (the client's requirement), plus the hero word-stagger, the swoosh underline draw, the calendar ripple, count-ups and the scene transition. Everything must respect `prefers-reduced-motion: reduce`, which turns animations off and shows the final state.

## Images

Use `next/image`. Assets in `assets/images/`: logo (full colour, inverted, stacked), Jenna cutout and portrait, past workshop promos, `r-emblem.png`, `r-badge.png`, `texture-street.jpg`, `quote-mark.svg`. All images that the client might change come from Sanity, with hotspot cropping and required alt text.
