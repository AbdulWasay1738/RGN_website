/**
 * Content contract.
 *
 * These types describe the data the site renders, i.e. what the GROQ queries in
 * lib/sanity/queries.ts return after lib/sanity/fetch.ts has post-processed it
 * (every `link` object gets a resolved `href`).
 *
 * The Sanity schemas (sanity/schemaTypes) and the seed (sanity/seed) must store
 * documents whose field names match these types exactly. Where a field is
 * stored as a reference and expanded by the query, the comment says
 * "ref -> X (expanded)".
 *
 * Almost every field is optional: editors can clear any field in the Studio,
 * and components must render without crashing when a field is missing.
 *
 * Text conventions:
 * - AccentText: `*word*` marks an accent colour span (same font). In the home
 *   hero headline `_word_` marks the swoosh-underlined word.
 * - `**bold**` inside plain strings (blog lists) renders as <strong>.
 * - Strings may contain `[placeholders in brackets]`: render them as-is.
 */

/* ------------------------------------------------------------------ */
/* Shared objects                                                     */
/* ------------------------------------------------------------------ */

export type AccentText = string

export type Background =
  | 'white'
  | 'paper'
  | 'navy'
  | 'ink'
  | 'lavender'
  | 'lavender-tint'
  | 'orange'

export type WatermarkPosition =
  | 'none'
  | 'top-right'
  | 'top-left'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-right'

/** Stored `image` (type `imageWithAlt`). `asset._ref` looks like `image-<hash>-<w>x<h>-<ext>`, or `local:<file>` in offline mode. */
export type SanityImageData = {
  _type?: 'imageWithAlt' | 'image'
  _key?: string
  asset?: { _ref: string; _type?: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
  caption?: string
}

export type LinkTargetType =
  | 'page'
  | 'course'
  | 'workshop'
  | 'bundle'
  | 'book'
  | 'assessment'
  | 'post'
  | 'legalPage'
  | 'blogSettings'

/**
 * Stored `link` object: `{_type:'link', kind, internal: {_ref}, external, anchor, newTab}`.
 * `href` is added by sanityFetch (resolveLinks). Use `link.href`, never build URLs by hand.
 */
export type Link = {
  _type: 'link'
  kind?: 'internal' | 'external'
  internal?: { _ref: string; _type?: 'reference' }
  external?: string
  /** Optional in-page anchor without the #, for example "apply". With no internal/external target it scrolls on the same page. */
  anchor?: string
  newTab?: boolean
  /** Added at fetch time. Undefined when the target is missing or hidden. */
  href?: string
}

export type CtaStyle = 'primary' | 'dark' | 'outline' | 'outlineLight' | 'white' | 'textLink'

/** Stored `cta` object. */
export type Cta = {
  _key?: string
  _type?: 'cta'
  label?: string
  link?: Link
  style?: CtaStyle
}

/** Stored `seo` object. */
export type Seo = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImageData
  noIndex?: boolean
}

/** Portable text, stored as standard block content plus custom blocks. */
export type PortableTextBlock = {
  _type: string
  _key: string
  [key: string]: unknown
}
export type PortableTextValue = PortableTextBlock[]

/** Fields spread into every page-builder section. */
export type SectionBase = {
  _key: string
  _type: string
  anchorId?: string
  background?: Background
  watermark?: WatermarkPosition
  hidden?: boolean
}

export type SimpleLink = { _key?: string; label?: string; link?: Link }

export type IconName =
  | 'arrow'
  | 'calendar'
  | 'clock'
  | 'pin'
  | 'lock'
  | 'phone'
  | 'people'
  | 'target'
  | 'camera'
  | 'film'
  | 'broadcast'
  | 'linkedin'
  | 'check'
  | 'mail'

/* ------------------------------------------------------------------ */
/* Library documents                                                  */
/* ------------------------------------------------------------------ */

export type Faq = {
  _id: string
  _type: 'faq'
  question?: string
  answer?: string
  tags?: Array<'home' | 'workshop' | 'course' | 'bundle'>
}

export type Testimonial = {
  _id: string
  _type: 'testimonial'
  quote?: string
  name?: string
  company?: string
  permissionConfirmed?: boolean
}

export type Stat = {
  _id: string
  _type: 'stat'
  value?: number
  prefix?: string
  /** "+", "M+", "K+". A "+" renders in the accent colour. */
  suffix?: string
  label?: string
  footnote?: string
}

export type TeamMember = {
  _id: string
  _type: 'teamMember'
  name?: string
  title?: string
  photo?: SanityImageData
  cutout?: SanityImageData
  bio?: string
  link?: Link
  /** Button label on the team card, for example "About Jenna". */
  linkLabel?: string
  order?: number
}

export type TimelineEntry = {
  _id: string
  _type: 'timelineEntry'
  /** "2013 to present" (the record cards on the founder page) */
  years?: string
  /** "2013" (the About page timeline) */
  year?: string
  /** "2013 →" (the home founder story) */
  homeLabel?: string
  organisation?: string
  /** Full description (founder page) */
  description?: string
  /** About page description; falls back to description */
  shortDescription?: string
  /** One-line summary for the home founder story */
  homeSummary?: string
  highlight?: boolean
  order?: number
}

/* ------------------------------------------------------------------ */
/* Singletons                                                         */
/* ------------------------------------------------------------------ */

export type SalesCalendar = {
  introEndsAt?: string
  coursesOpenAt?: string
  earlyBirdEndsAt?: string
  workshopAt?: string
  inPersonSeatCap?: number
  seatsSold?: number
}

export type CountdownTarget = 'none' | 'introEndsAt' | 'coursesOpenAt' | 'earlyBirdEndsAt' | 'workshopAt' | 'showUntil'

export type BannerVariant = {
  _key: string
  label?: string
  message?: string
  ctaLabel?: string
  ctaLink?: Link
  showFrom?: string
  showUntil?: string
  /** Which date the "N days left" pill counts down to. */
  countdownTo?: CountdownTarget
}

export type AnnouncementBanner = {
  enabled?: boolean
  variants?: BannerVariant[]
}

export type NavChild = {
  _key: string
  label?: string
  link?: Link
  description?: string
  /** Small eyebrow above the label (the book item: "Books · pre-order") */
  eyebrow?: string
  /** Square badge: "1", "3", "4" for courses, or a word for the script style */
  badge?: string
  badgeStyle?: 'number' | 'bundleIcon' | 'script'
  /** ref -> course (expanded): the description becomes "<shortLine> · $<price>[ intro]" */
  priceFromCourse?: Pick<Course, 'shortLine' | 'regularPrice' | 'introPrice'>
  /** Items with this flag sit below a divider in the Education menu */
  separated?: boolean
}

export type NavItem = {
  _key: string
  label?: string
  /** Plain link when there is no dropdown */
  link?: Link
  dropdown?: {
    style?: 'mega' | 'list'
    eyebrow?: string
    items?: NavChild[]
    /** Show the workshop feature card (megaMenuFeature) */
    showFeature?: boolean
  }
}

export type SiteSettings = {
  title?: string
  logo?: SanityImageData
  logoInverted?: SanityImageData
  logoStacked?: SanityImageData
  headerNav?: NavItem[]
  headerCta?: Cta
  megaMenuFeature?: {
    eyebrow?: string
    headline?: string
    dateBadge?: string
    dateLine?: string
    subLine?: string
    cta?: Cta
  }
  mobileMenuGroups?: Array<{
    _key: string
    title?: string
    style?: 'big' | 'pills'
    links?: SimpleLink[]
  }>
  mobileMenuBottom?: { cta?: Cta; note?: string }
  footer?: {
    newsletterEyebrow?: string
    newsletterHeadline?: AccentText
    newsletterBody?: string
    newsletterLabel?: string
    newsletterPlaceholder?: string
    newsletterButton?: string
    newsletterSuccess?: string
    tagline?: string
    handwrittenLine?: string
    socialButton?: Cta
    columns?: Array<{ _key: string; title?: string; links?: SimpleLink[] }>
    legalLinks?: SimpleLink[]
    disclaimer?: string
    /** "{year}" is replaced with the current year */
    copyright?: string
  }
  cookieNotice?: {
    title?: string
    body?: string
    acceptLabel?: string
    declineLabel?: string
    acceptedToast?: string
    declinedToast?: string
  }
  checkout?: CheckoutLabels
  sceneTransition?: {
    topLabel?: string
    bottomLabel?: string
    productionName?: string
  }
  contactEmail?: string
  linkedinUrl?: string
  defaultSeo?: Seo & { titleTemplate?: string }
  organization?: {
    name?: string
    url?: string
    logo?: SanityImageData
    sameAs?: string[]
  }
}

export type CheckoutLabels = {
  eyebrow?: string
  attendanceLegend?: string
  inPersonLabel?: string
  zoomLabel?: string
  soldOutLabel?: string
  /** "{n} left" */
  seatsLeftLabel?: string
  nameLabel?: string
  emailLabel?: string
  phoneLabel?: string
  phoneHelp?: string
  consentText?: string
  totalLabel?: string
  submitLabel?: string
  secureNote?: string
  /** Placeholder payment step (until Stripe is connected) */
  placeholderChip?: string
  placeholderBody?: string
  placeholderButton?: string
  cancelLabel?: string
  /** Sub-lines in the modal header */
  workshopSubline?: string
  courseSubline?: string
  bundleSubline?: string
  earlyBirdTicket?: string
  standardTicket?: string
  introPriceLabel?: string
  regularPriceLabel?: string
}

/* ------------------------------------------------------------------ */
/* Offers                                                             */
/* ------------------------------------------------------------------ */

export type Workshop = {
  _id: string
  _type: 'workshop'
  title?: string
  slug?: string
  handLine?: string
  headline?: AccentText
  lead?: string
  heroChips?: string[]
  dateLabel?: string
  timeLabel?: string
  venue?: string
  zoomAvailable?: boolean
  earlyBirdPrice?: number
  standardPrice?: number
  reserveLabel?: string
  priceNotes?: {
    /** Hero: "early-bird through December 10" */
    earlyBird?: string
    /** Home card: "early-bird through Dec 10, then $199" */
    earlyBirdShort?: string
    standard?: string
    perSeat?: string
  }
  stub?: {
    eyebrow?: string
    day?: string
    date?: string
    line?: string
    doneLabel?: string
  }
  includes?: string[]
  /** "{left} of {cap} in-person seats left · then Zoom" */
  seatsLine?: string
  soldOutLine?: string
  zoomChip?: string
  stepLabel?: string
  card?: { summary?: string; chips?: string[] }
  whatThisIs?: {
    eyebrow?: string
    statement?: AccentText
    body?: PortableTextValue
    closingLine?: string
  }
  outcomesHeadline?: AccentText
  outcomes?: string[]
  agenda?: {
    eyebrow?: string
    headline?: AccentText
    items?: Array<{ _key: string; time?: string; title?: string; description?: string }>
  }
  whoItIsFor?: { eyebrow?: string; text?: string }
  noNeedFor?: { eyebrow?: string; items?: string[] }
  tickets?: {
    eyebrow?: string
    headline?: AccentText
    inPersonToggle?: string
    zoomToggle?: string
    zoomToast?: string
    earlyBirdLabel?: string
    standardLabel?: string
    onSaleLabel?: string
    earlyBirdWindow?: string
    standardWindow?: string
    earlyBirdEndedChip?: string
    standardUpcomingChip?: string
    earlyBirdEndedLabel?: string
    standardUpcomingLabel?: string
    reassurances?: Array<{ _key: string; icon?: IconName; title?: string; text?: string }>
  }
  hostSection?: {
    eyebrow?: string
    headline?: AccentText
    body?: string
    image?: SanityImageData
    chips?: string[]
    linkLabel?: string
    link?: Link
  }
  archive?: {
    eyebrow?: string
    headline?: AccentText
    lead?: string
    images?: SanityImageData[]
  }
  /** ref[] -> faq (expanded) */
  faqs?: Faq[]
  faqHeadline?: AccentText
  faqLinkLabel?: string
  faqLink?: Link
  closingBand?: { headline?: AccentText; ctaLabel?: string }
  seo?: Seo
}

export type Course = {
  _id: string
  _type: 'course'
  order?: number
  /** "01", "03", "04" (position on the four-step path) */
  stepNumber?: string
  /** 1, 2, 3 (course number) */
  courseNumber?: number
  /** Benedict label: Attract, Create, Broadcast */
  word?: string
  title?: string
  fullTitle?: string
  slug?: string
  headline?: string
  summary?: string
  shortLine?: string
  regularPrice?: number
  introPrice?: number
  problemLabel?: string
  problem?: string
  /** Phrase inside `problem` to highlight */
  problemHighlight?: string
  learn?: string[]
  outcome?: string
  outcomeNote?: string
  bestFor?: string
  format?: string
  opensLabel?: string
  hostedOn?: string
  /** ref[] -> faq (expanded) */
  faqs?: Faq[]
  seo?: Seo
}

/** Shared labels for the three course pages and the course cards (singleton `courseTemplate`). */
export type CourseTemplate = {
  cardChipPrefix?: string
  opensSoonLabel?: string
  onDemandLabel?: string
  heroChip?: string
  heroOpensLabel?: string
  heroOnDemandLabel?: string
  /** "Step {step} of 04" */
  stepOfLabel?: string
  /** "REEL GOOD NEWS · COURSE {n} · STEP {step}" */
  coverLabel?: string
  enrollLabel?: string
  detailsLabel?: string
  regularPriceLabel?: string
  /** "Save $" prefix on the pill. The amount is computed. */
  saveLabel?: string
  introEndsLabel?: string
  bundleLinkLabel?: string
  features?: Array<{ _key: string; icon?: IconName; text?: string }>
  pathWorkshop?: { step?: string; word?: string; label?: string }
  /** "Course {n}" */
  pathCourseLabel?: string
  hereLabel?: string
  coversHeadline?: AccentText
  /** "{count} lesson themes · on demand" */
  coversCountLabel?: string
  outcomeEyebrow?: string
  detailLabels?: { format?: string; opens?: string; hostedOn?: string; bestFor?: string }
  bundleUpsell?: { chip?: string; headline?: string; body?: string; ctaLabel?: string }
  faqHeadline?: AccentText
  teacherCard?: { image?: SanityImageData; title?: string; text?: string }
}

export type Bundle = {
  _id: string
  _type: 'bundle'
  title?: string
  slug?: string
  headline?: AccentText
  subline?: string
  chips?: string[]
  price?: number
  compareAt?: number
  saveLabel?: string
  ctaLabel?: string
  path?: {
    eyebrow?: string
    headline?: AccentText
    /** "regular price" in "Attract the Right Audience · regular price $199" */
    regularPriceLabel?: string
    items?: Array<{
      _key: string
      /** ref -> course (expanded) */
      course?: Pick<Course, '_id' | 'title' | 'fullTitle' | 'slug' | 'regularPrice' | 'word' | 'stepNumber'>
      line?: string
    }>
  }
  maths?: {
    eyebrow?: string
    headline?: AccentText
    body?: string
    courseColumn?: string
    priceColumn?: string
    separateLabel?: string
  }
  pairWithWorkshop?: { eyebrow?: string; headline?: AccentText; body?: string; cta?: Cta }
  faqHeadline?: AccentText
  /** ref[] -> faq (expanded) */
  faqs?: Faq[]
  card?: { chip?: string; body?: string; ctaLabel?: string; fanWord?: string }
  seo?: Seo
}

export type Book = {
  _id: string
  _type: 'book'
  hidden?: boolean
  title?: string
  chip?: string
  coverAccentWord?: string
  coverRest?: string
  coverTagline?: string
  author?: string
  spineText?: string
  subtitle?: string
  publicationLine?: string
  /** Free text so "[PRICE]" can stay until the client confirms */
  price?: string
  preorderUrl?: string
  ctaLabel?: string
  byline?: string
  statement?: AccentText
  body?: PortableTextValue
  inside?: { headline?: AccentText; eyebrow?: string; items?: Array<{ _key: string; word?: string; line?: string }> }
  quote?: { eyebrow?: string; text?: string }
  preorderBonus?: { show?: boolean; eyebrow?: string; text?: string }
  /** Shown in a dialog when the pre-order button has no link yet */
  noLinkMessage?: { eyebrow?: string; body?: string; buttonLabel?: string }
  card?: { chip?: string; body?: string; ctaLabel?: string }
  seo?: Seo
}

/** Union used by the home offer grid (ref[] -> workshop | course | bundle | book, expanded). */
export type OfferItem = Workshop | Course | Bundle | Book

/* ------------------------------------------------------------------ */
/* Assessment, order, blog, legal                                      */
/* ------------------------------------------------------------------ */

export type Assessment = {
  _id: string
  _type: 'assessment'
  intro?: { pillTag?: string; headline?: AccentText; subline?: string; body?: string }
  form?: {
    title?: string
    stepLabel?: string
    firstNameLabel?: string
    lastNameLabel?: string
    emailLabel?: string
    phoneLabel?: string
    companyLabel?: string
    roleLabel?: string
    sizeLabel?: string
    sizePlaceholder?: string
    companySizes?: string[]
    consentText?: string
    submitLabel?: string
  }
  areasSection?: { headline?: AccentText; eyebrow?: string }
  areas?: Array<{ _key: string; name?: string; description?: string }>
  questions?: Array<{
    _key: string
    area?: string
    question?: string
    options?: string[]
    status?: 'draft' | 'final'
  }>
  flow?: {
    areasEyebrow?: string
    /** "AREA {n} · {area}" */
    areaLabel?: string
    draftChip?: string
    helper?: string
    errorText?: string
    backLabel?: string
    nextLabel?: string
    submitLabel?: string
    sendingLabel?: string
    /** "About {n} minutes left" / "About {n} minute left" */
    minutesLeft?: string
    minuteLeft?: string
  }
  report?: {
    eyebrow?: string
    headline?: AccentText
    body?: string
    steps?: Array<{ _key: string; title?: string; text?: string }>
  }
  reportMock?: {
    sampleLabel?: string
    title?: string
    preparedFor?: string
    prioritiesLabel?: string
  }
  thankYou?: {
    eyebrow?: string
    headline?: AccentText
    body?: string
    cta?: Cta
    tracker?: Array<{ _key: string; title?: string; text?: string }>
    meanwhileHeadline?: AccentText
    cards?: Array<{
      _key: string
      kind?: 'link' | 'workshop'
      tone?: 'navy' | 'paper' | 'orange'
      eyebrow?: string
      title?: string
      text?: string
      link?: Link
    }>
  }
  /** Replaces "[number]" in assessment copy when set */
  turnaroundDays?: number
  seo?: Seo
}

export type OrderConfirmation = {
  eyebrow?: string
  sampleSuffix?: string
  headline?: AccentText
  workshopLead?: string
  courseLead?: string
  workshopStub?: { label?: string; date?: string; line1?: string; line2?: string }
  courseStub?: { label?: string; date?: string; line1?: string; line2?: string }
  rows?: {
    ticket?: string
    price?: string
    attending?: string
    access?: string
    name?: string
    order?: string
  }
  zoomLabel?: string
  inPersonLabel?: string
  accessValue?: string
  buyerPlaceholder?: string
  nextHeadline?: AccentText
  steps?: Array<{ _key: string; title?: string; courseTitle?: string; text?: string; showCalendarButtons?: boolean }>
  calendarButtons?: { google?: string; apple?: string; outlook?: string }
  /** Upsell cards. kind "course" shows the live price of the referenced course. */
  upsells?: Array<{
    _key: string
    kind?: 'link' | 'course'
    eyebrow?: string
    title?: string
    text?: string
    link?: Link
    /** ref -> course (expanded), for kind "course" */
    course?: Pick<Course, 'regularPrice' | 'introPrice'>
    introNote?: string
    regularNote?: string
  }>
  seo?: Seo
}

export type PostTopic = 'OFFERS' | 'CONTENT' | 'POSITIONING' | 'GROWTH' | 'MEASUREMENT'

export type PostSummary = {
  _id: string
  title?: string
  slug?: string
  number?: string
  coverLine?: string
  topic?: PostTopic
  featured?: boolean
  publishedAt?: string
  excerpt?: string
  /** Minutes, computed in GROQ */
  readingTime?: number
  /** ref -> teamMember (expanded) */
  author?: Pick<TeamMember, 'name' | 'title' | 'photo'>
}

export type Post = PostSummary & {
  _type: 'post'
  /**
   * Portable text. Custom blocks: `pullQuote` {text}, `decisionRule` {text}.
   * Standard blocks: normal, h2, bullet/number lists, strong/em marks.
   */
  body?: PortableTextValue
  sources?: string
  seo?: Seo
}

export type BlogSettings = {
  eyebrow?: string
  headline?: AccentText
  allLabel?: string
  topicLabels?: Partial<Record<PostTopic, string>>
  featuredLabel?: string
  emptyText?: string
  /** "{n} min read" */
  readTimeLabel?: string
  shareLabel?: string
  decisionRuleLabel?: string
  keepReadingHeadline?: AccentText
  assessmentCta?: { text?: string; cta?: Cta }
  seo?: Seo
}

export type LegalPage = {
  _id: string
  _type: 'legalPage'
  title?: string
  navLabel?: string
  slug?: string
  order?: number
  lastUpdated?: string
  body?: PortableTextValue
  templateBanner?: boolean
  templateBannerText?: string
  seo?: Seo
}

export type Redirect = { from?: string; to?: string; permanent?: boolean }

/* ------------------------------------------------------------------ */
/* Page builder sections                                              */
/* ------------------------------------------------------------------ */

export type HeroFounderSection = SectionBase & {
  _type: 'heroFounder'
  handLine?: string
  /** `_selling_` marks the swoosh word */
  headline?: AccentText
  lead?: string
  primaryCta?: Cta
  secondaryCta?: Cta
  portrait?: SanityImageData
  workshopCard?: { title?: string; line?: string; link?: Link }
  statCard?: { value?: number; label?: string }
  lowerThird?: { tag?: string; name?: string; title?: string }
}

export type TickerSection = SectionBase & { _type: 'ticker'; phrases?: string[] }

export type MethodCalendarSection = SectionBase & {
  _type: 'methodCalendar'
  eyebrow?: string
  headline?: AccentText
  body?: string
  calendar?: {
    title?: string
    replayLabel?: string
    caption?: string
    typicalLabel?: string
    typicalNote?: string
    approachLabel?: string
    approachNote?: string
    calloutTag?: string
    legendProduction?: string
    legendContent?: string
    ariaLabel?: string
  }
}

export type HowItWorksSection = SectionBase & {
  _type: 'howItWorks'
  eyebrow?: string
  headline?: AccentText
  note?: string
  steps?: Array<{
    _key: string
    number?: string
    name?: string
    icon?: IconName
    text?: string
    linkLabel?: string
    link?: Link
  }>
}

export type OfferGridSection = SectionBase & {
  _type: 'offerGrid'
  eyebrow?: string
  headline?: AccentText
  note?: string
  /** ref[] -> workshop | course | bundle | book (expanded) */
  items?: OfferItem[]
}

export type AssessmentCtaSection = SectionBase & {
  _type: 'assessmentCta'
  eyebrow?: string
  headline?: AccentText
  body?: string
  cta?: Cta
  showAreas?: boolean
  showReportMock?: boolean
  tornTopEdge?: boolean
  /** Added by the query from the assessment singleton */
  areas?: Array<{ _key: string; name?: string }>
  reportMock?: Assessment['reportMock']
}

export type StatsBlockSection = SectionBase & {
  _type: 'statsBlock'
  eyebrow?: string
  headline?: AccentText
  showBadge?: boolean
  /** "rule": the home layout with a top rule. "strip": the lavender founder-page strip. */
  variant?: 'rule' | 'strip'
  /** ref[] -> stat (expanded) */
  stats?: Stat[]
  footnote?: string
}

export type TestimonialsSection = SectionBase & {
  _type: 'testimonials'
  /** "carousel" (home) or "grid" (founder page "Client words.") */
  variant?: 'carousel' | 'grid'
  eyebrow?: string
  headline?: AccentText
  /** ref[] -> testimonial (expanded) */
  items?: Testimonial[]
  logoStripLabel?: string
  logos?: Array<{ _key: string; name?: string; style?: 'display' | 'caps' | 'body' | 'plain' }>
}

export type FounderStorySection = SectionBase & {
  _type: 'founderStory'
  eyebrow?: string
  headline?: AccentText
  handLine?: string
  body?: string
  photo?: SanityImageData
  signature?: string
  /** ref[] -> timelineEntry (expanded) */
  timeline?: TimelineEntry[]
  cta?: Cta
}

export type FaqBlockSection = SectionBase & {
  _type: 'faqBlock'
  eyebrow?: string
  headline?: AccentText
  note?: string
  cta?: Cta
  openFirst?: boolean
  /** ref[] -> faq (expanded) */
  faqs?: Faq[]
}

export type FinalCtaSection = SectionBase & {
  _type: 'finalCta'
  eyebrow?: string
  headline?: AccentText
  cta?: Cta
  showCountdown?: boolean
}

export type PageHeroArt =
  | 'none'
  | 'portraitCutout'
  | 'reelPortrait'
  | 'quoteMark'
  | 'reel'
  | 'steps'
  | 'linkedinCard'
  | 'portraitCard'
  | 'podcastCover'

export type PageHeroSection = SectionBase & {
  _type: 'pageHero'
  eyebrow?: string
  /** Breadcrumb parent, for example About the Team. The current page title follows it. */
  crumbParent?: SimpleLink
  crumbCurrent?: string
  handLine?: string
  handLinePosition?: 'above' | 'below'
  headline?: AccentText
  headingSize?: 'default' | 'large' | 'xl'
  lead?: string
  /** Larger Nunito subheadline under the headline */
  sublead?: string
  chips?: string[]
  ctas?: Cta[]
  art?: PageHeroArt
  image?: SanityImageData
  artSteps?: Array<{ _key: string; number?: string; title?: string; text?: string }>
  artCard?: { eyebrow?: string; title?: string; text?: string; chip?: string; link?: Link }
}

export type StatementSection = SectionBase & {
  _type: 'statement'
  eyebrow?: string
  statement?: AccentText
  body?: PortableTextValue
  /** "lead" uses the larger lead paragraph style */
  bodyStyle?: 'plain' | 'lead'
  closingLine?: string
  sideEyebrow?: string
  sideList?: string[]
}

export type ValuesGridSection = SectionBase & {
  _type: 'valuesGrid'
  eyebrow?: string
  headline?: AccentText
  style?: 'cards' | 'numbered'
  items?: Array<{ _key: string; title?: string; text?: string }>
}

export type TimelineSection = SectionBase & {
  _type: 'timeline'
  headline?: AccentText
  style?: 'steps' | 'cards'
  /** ref[] -> timelineEntry (expanded) */
  entries?: TimelineEntry[]
}

export type TeamGridSection = SectionBase & {
  _type: 'teamGrid'
  eyebrow?: string
  headline?: AccentText
  /** ref[] -> teamMember (expanded) */
  members?: TeamMember[]
  showHiringCard?: boolean
  hiringCard?: { eyebrow?: string; headline?: string; linkLabel?: string; link?: Link }
}

export type CtaPanelsSection = SectionBase & {
  _type: 'ctaPanels'
  panels?: Array<{ _key: string; headline?: AccentText; cta?: Cta; tone?: 'lavender' | 'navy' }>
}

export type GallerySection = SectionBase & {
  _type: 'gallery'
  eyebrow?: string
  headline?: AccentText
  lead?: string
  /** "cards": image cards with a caption panel. "tilted": tilted photos beside the heading. */
  style?: 'cards' | 'tilted'
  items?: Array<SanityImageData & { title?: string }>
  linkCard?: { eyebrow?: string; title?: string; text?: string; ctaLabel?: string; link?: Link }
}

export type FormKind = 'contact' | 'partner' | 'speaking' | 'guest' | 'talent'

export type FormSectionSide =
  | { kind?: 'none' }
  | {
      kind?: 'quote' | 'emailCard' | 'roles'
      /** ref -> testimonial (expanded), for kind "quote" */
      quote?: Testimonial
      emailLabel?: string
      email?: string
      copyLabel?: string
      rolesEyebrow?: string
      roles?: Array<{ _key: string; title?: string; meta?: string; note?: string; link?: Link }>
    }

export type FormSection = SectionBase & {
  _type: 'formSection'
  form?: FormKind
  /** "hero" puts an h1 beside the form (Contact page) */
  layout?: 'standard' | 'hero'
  eyebrow?: string
  headline?: AccentText
  intro?: string
  side?: FormSectionSide
  panelTone?: 'paper' | 'white' | 'lavender-tint'
  submitLabel?: string
  footnote?: string
  consentText?: string
  /** Contact: the subject pills */
  subjectOptions?: string[]
  /** Partner: company sizes. Speaking: audience sizes. */
  selectOptions?: string[]
  successTitle?: string
  successBody?: string
  successCtaLabel?: string
}

export type EpisodesSection = SectionBase & {
  _type: 'episodes'
  eyebrow?: string
  headline?: AccentText
  items?: Array<{
    _key: string
    number?: string
    guest?: string
    title?: string
    summary?: string
    spotifyUrl?: string
    youtubeUrl?: string
  }>
}

export type SocialFeedSection = SectionBase & {
  _type: 'socialFeed'
  eyebrow?: string
  headline?: AccentText
  cards?: Array<{
    _key: string
    style?: 'logoLine' | 'quote' | 'rule' | 'big'
    eyebrow?: string
    text?: AccentText
    caption?: string
  }>
}

export type RichTextSection = SectionBase & {
  _type: 'richText'
  eyebrow?: string
  headline?: AccentText
  body?: PortableTextValue
}

export type ImageTextSection = SectionBase & {
  _type: 'imageText'
  image?: SanityImageData
  eyebrow?: string
  headline?: AccentText
  body?: PortableTextValue
  cta?: Cta
  imageSide?: 'left' | 'right'
}

export type LinkCardsSection = SectionBase & {
  _type: 'linkCards'
  items?: Array<{ _key: string; eyebrow?: string; title?: string; link?: Link }>
}

export type ProfileBioSection = SectionBase & {
  _type: 'profileBio'
  intro?: string
  body?: PortableTextValue
  quote?: string
  signature?: string
  asideEyebrow?: string
  asideText?: string
}

export type MediaBandSection = SectionBase & {
  _type: 'mediaBand'
  eyebrow?: string
  text?: string
  links?: Array<{ _key: string; label?: string; url?: string }>
  cta?: Cta
}

export type Section =
  | HeroFounderSection
  | TickerSection
  | MethodCalendarSection
  | HowItWorksSection
  | OfferGridSection
  | AssessmentCtaSection
  | StatsBlockSection
  | TestimonialsSection
  | FounderStorySection
  | FaqBlockSection
  | FinalCtaSection
  | PageHeroSection
  | StatementSection
  | ValuesGridSection
  | TimelineSection
  | TeamGridSection
  | CtaPanelsSection
  | GallerySection
  | FormSection
  | EpisodesSection
  | SocialFeedSection
  | RichTextSection
  | ImageTextSection
  | LinkCardsSection
  | ProfileBioSection
  | MediaBandSection

export type Page = {
  _id: string
  _type: 'page'
  title?: string
  /** "home" for the home page; may contain "/" (for example "about/jenna-colombo") */
  slug?: string
  hidden?: boolean
  seo?: Seo
  sections?: Section[]
}

/** Everything the site layout needs, fetched once per request in app/(site)/layout.tsx. */
export type LayoutData = {
  settings: SiteSettings | null
  banner: AnnouncementBanner | null
  calendar: SalesCalendar | null
  /** For "Education" price lines and the checkout modal */
  courses: Course[]
  workshop: Pick<Workshop, 'title' | 'earlyBirdPrice' | 'standardPrice' | 'dateLabel' | 'timeLabel' | 'venue'> | null
  bundle: Pick<Bundle, 'title' | 'price'> | null
  book: Pick<Book, 'hidden' | 'title' | 'preorderUrl' | 'noLinkMessage'> | null
  /** Slugs of hidden pages (and "book" when the book is hidden), so nav links to them drop out */
  hiddenHrefs: string[]
}
