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
| Handwritten accents | **Benedict** | Licensed file pending from the client. Until then load `assets/fonts/comforter.woff2` as the stand-in family "RGN Hand" (size-adjust about 118%). Font stack: `'Benedict','RGN Hand',cursive`. When the client sends Benedict, add it with `next/font/local` and remove the stand-in. |

Rules from the client's feedback:
- **Never mix two typefaces inside one headline.** An accent word inside a headline stays in Anton and changes colour only (`.acc` orange or coral, `.acc-l` lavender).
- Benedict appears only in select subheadlines and editorial accents: the "Hook. Line. Heart." line above the home hero, "founder to founder", course name labels above course titles, the workshop name line, the signature on the founder photo, card cover words, and the footer line. Never as a primary headline.
- Long statements and quotes use Nunito Sans 700 or 800, not Anton.

## Brand components (the client's visual identity, change #10)

The client asked for the character of her social templates and original site to be built into the design, not added only through the logo and colours. The prototype implements this with the components below, and all of them should exist as reusable React components:

| Component | Prototype source | Description |
|---|---|---|
| `Watermark` | `wm()` helper, `.wm` | The script "R" from the logo (`r-emblem.png`) used as a CSS mask, so its colour is set by `color`. Large and low-contrast in the corners of homepage sections, the footer and the final CTA. |
| `RBadge` | `.rbadge` | Orange circle with a white R (`r-badge.png`). Used beside "Recent wins & milestones". |
| `Brush` | `brush()` + SVG filter `#rgnBrush` | Coral dry-brush stroke behind the hero portrait. It's an SVG path with turbulence displacement and a streak mask. Keep the filter defs once in the root layout. |
| `Felt` | `felt()` + filter `#rgnTorn` | Torn red felt block behind photos (founder section). |
| `Shard` | `.shard` | Lavender folded-paper triangles framing photos (clip-path polygons). |
| `Tear` | `tear()` | Torn-paper edge used as a section transition (paper into ink above the assessment band). Generate the jagged path deterministically. |
| Street texture | `--tex` | Applied to `.navy` and `.ink` bands, ticket cards, course covers, the footer and the transition strip. |
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
- **CourseCard / OfferCard**: textured cover with a big outline step number and a Benedict course word, intro price with struck regular price and a "Save $X" pill until `introEndsAt`, then the regular price.
- **TestimonialCarousel**: large quote, dots, prev/next, auto-advance every 8s, pause on hover, three mini quotes on the side.
- **ReportMock**: the sample Marketing Efficiency Report card, with bars that animate on scroll.
- **SceneTransition**: see 02-architecture.

## Buttons

Anton, uppercase, 17px (15px small), letter-spacing .06em, radius 6px. Variants: primary (`--btn`, hover `--btn-h` with shadow), dark (navy), outline (navy inset 2px), outline-light (on dark), white. The arrow icon nudges right on hover. Minimum touch target 44px.

## Motion

Subtle hover and scroll effects only (the client's requirement), plus the hero word-stagger, the swoosh underline draw, the calendar ripple, count-ups and the scene transition. Everything must respect `prefers-reduced-motion: reduce`, which turns animations off and shows the final state.

## Images

Use `next/image`. Assets in `assets/images/`: logo (full colour, inverted, stacked), Jenna cutout and portrait, past workshop promos, `r-emblem.png`, `r-badge.png`, `texture-street.jpg`, `quote-mark.svg`. All images that the client might change come from Sanity, with hotspot cropping and required alt text.
