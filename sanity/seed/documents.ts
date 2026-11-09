/**
 * Seed content for the Reel Good News dataset.
 *
 * Builds every document the site needs, with copy taken verbatim from the
 * approved prototype (reference/prototype/index.html) and content-seed/.
 * IDs and _keys are deterministic, so re-running the import replaces the same
 * documents instead of creating duplicates.
 *
 * Used by:
 * - sanity/seed/import.ts (npm run seed): uploads images, writes to Sanity
 * - lib/sanity/fetch.ts offline mode (SANITY_OFFLINE=1): images are `local:<file>`
 *
 * Relative imports only: `sanity exec` does not resolve the "@/" alias.
 */
import assessmentSeed from '../../content-seed/assessment.json'
import coursesSeed from '../../content-seed/courses.json'
import faqsSeed from '../../content-seed/faqs.json'
import postsSeed from '../../content-seed/posts.json'
import singletons from '../../content-seed/singletons.json'
import testimonialsSeed from '../../content-seed/testimonials.json'

export type ImageRef = { _type: 'reference'; _ref: string }
export type BuildOptions = { mode: 'offline' } | { mode: 'import'; imageRef: (file: string) => ImageRef }
export type SeedDocument = { _id: string; _type: string; [key: string]: unknown }

type Obj = Record<string, unknown>

/** Every image file the seed references (all live in public/img). */
export const SEED_IMAGE_FILES = [
  'logo.png',
  'logo-invert.png',
  'logo-stack.png',
  'jenna-cutout.webp',
  'jenna-portrait.jpg',
  'jenna-square.jpg',
  'promo-hooked.webp',
  'promo-acceleration.webp',
] as const

/* ------------------------------------------------------------------ */
/* Path to document id (internal links)                               */
/* ------------------------------------------------------------------ */

const COURSE_IDS: Record<string, string> = {
  attract: 'course-attract',
  create: 'course-create',
  broadcast: 'course-broadcast',
}

const PATH_TO_ID: Record<string, string> = {
  '/': 'page-home',
  '/workshop': 'workshop',
  '/courses/content-machine': 'bundle',
  '/book': 'book',
  '/assessment': 'assessment',
  '/about': 'page-about',
  '/about/jenna-colombo': 'page-jenna',
  '/partner': 'page-partner',
  '/contact': 'page-contact',
  '/careers': 'page-careers',
  '/speaking': 'page-speaking',
  '/podcast': 'page-podcast',
  '/socials': 'page-socials',
  '/blog': 'blogSettings',
  '/legal/privacy': 'legal-privacy',
  '/legal/terms': 'legal-terms',
  '/legal/dmca': 'legal-dmca',
  '/legal/do-not-sell': 'legal-do-not-sell',
  '/growth-strategy': 'growthCall',
}
for (const c of coursesSeed) PATH_TO_ID[`/courses/${c.slug}`] = COURSE_IDS[c.id]
postsSeed.forEach((p) => {
  PATH_TO_ID[`/blog/${p.slug}`] = `post-${p.number}`
})

/* ------------------------------------------------------------------ */
/* Small builders                                                     */
/* ------------------------------------------------------------------ */

const ref = (id: string) => ({ _type: 'reference' as const, _ref: id })
const refItem = (id: string, key: string) => ({ _type: 'reference' as const, _ref: id, _key: key })
const refs = (ids: string[], prefix: string) => ids.map((id, i) => refItem(id, `${prefix}${i + 1}`))
const slug = (current: string) => ({ _type: 'slug' as const, current })

/** Internal link from a site path ("/workshop", "/partner#apply", "#talent"). External links start with http. */
function link(target: string): Obj {
  if (/^https?:\/\//.test(target)) return { _type: 'link', kind: 'external', external: target }
  const [path, anchor] = target.split('#')
  if (!path) return { _type: 'link', anchor }
  const id = PATH_TO_ID[path]
  if (!id) throw new Error(`Seed: no document for path "${path}"`)
  return { _type: 'link', kind: 'internal', internal: ref(id), ...(anchor ? { anchor } : {}) }
}

/** An external link with no URL yet (placeholder for the client to fill in). */
const emptyExternal = (): Obj => ({ _type: 'link', kind: 'external' })

const cta = (label: string, target: string, style: string): Obj => ({ _type: 'cta', label, link: link(target), style })
const ctaItem = (label: string, target: string, style: string, key: string): Obj => ({ ...cta(label, target, style), _key: key })
const simpleLink = (label: string, target: string, key?: string): Obj => ({
  _type: 'simpleLink',
  ...(key ? { _key: key } : {}),
  label,
  link: link(target),
})

/** Arrays of inline objects: `_type` is `<fieldName>Item`, keys are deterministic. */
function items<T extends Obj>(field: string, list: T[], prefix = field): Array<T & { _type: string; _key: string }> {
  return list.map((it, i) => ({ _type: `${field}Item`, _key: `${prefix}${i + 1}`, ...it }))
}

const seo = (metaDescription?: string, metaTitle?: string): Obj => ({
  _type: 'seo',
  ...(metaTitle ? { metaTitle } : {}),
  ...(metaDescription ? { metaDescription } : {}),
})

/* ---------------- portable text ---------------- */

function spans(text: string, key: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts
    .map((p, i) => ({ text: p, bold: i % 2 === 1 }))
    .filter((p) => p.text.length > 0)
    .map((p, i) => ({ _type: 'span', _key: `${key}s${i}`, text: p.text, marks: p.bold ? ['strong'] : [] }))
}

function block(text: string, key: string, style = 'normal', listItem?: 'bullet' | 'number'): Obj {
  return {
    _type: 'block',
    _key: key,
    style,
    markDefs: [],
    children: spans(text, key),
    ...(listItem ? { listItem, level: 1 } : {}),
  }
}

/** Plain paragraphs to portable text. */
const paragraphs = (texts: string[], prefix: string) => texts.map((t, i) => block(t, `${prefix}${i + 1}`))

type PostBodyItem = string | { ol?: string[]; ul?: string[]; h?: string; pull?: string; rule?: string }

function postBody(body: PostBodyItem[], prefix: string): Obj[] {
  const out: Obj[] = []
  body.forEach((b, i) => {
    const k = `${prefix}b${i + 1}`
    if (typeof b === 'string') out.push(block(b, k))
    else if (b.ol) b.ol.forEach((li, j) => out.push(block(li, `${k}n${j + 1}`, 'normal', 'number')))
    else if (b.ul) b.ul.forEach((li, j) => out.push(block(li, `${k}u${j + 1}`, 'normal', 'bullet')))
    else if (b.h) out.push(block(b.h, k, 'h2'))
    else if (b.pull) out.push({ _type: 'pullQuote', _key: k, text: b.pull })
    else if (b.rule) out.push({ _type: 'decisionRule', _key: k, text: b.rule })
  })
  return out
}

/* ------------------------------------------------------------------ */
/* Library content                                                    */
/* ------------------------------------------------------------------ */

const FAQ_IDS = [
  'faq-who-is-it-for',
  'faq-register-workshop',
  'faq-courses-separately',
  'faq-courses-live',
  'faq-guarantee',
  'faq-content-for-clients',
  'faq-video-experience',
  'faq-no-marketing-team',
  'faq-zoom',
  'faq-refund-policy',
]
const faqId = (question: string) => FAQ_IDS[faqsSeed.findIndex((f) => f.question === question)]

const HOME_FAQS = FAQ_IDS.slice(0, 6)
const WORKSHOP_FAQS = FAQ_IDS.slice(6, 10)
/** Course pages and the bundle reuse home questions in the prototype's order. */
const COURSE_FAQS = [faqId('Are the courses live?'), faqId('Can I take the courses separately?'), faqId('Do you guarantee results?')]
const BUNDLE_FAQS = [faqId('Can I take the courses separately?'), faqId('Are the courses live?'), faqId('Do you guarantee results?')]

const personId = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')
const HOME_TESTIMONIAL_IDS = testimonialsSeed.map((t) => `testimonial-${personId(t.name)}`)

const FOUNDER_TESTIMONIALS = [
  {
    id: 'testimonial-buddy-harris-founder-page',
    quote: 'Jenna helped us raise $2.5M, hired our executive team, found investors across the country, and saved us from layoffs.',
    name: 'Buddy Harris',
    company: 'Helicon Technologies',
  },
  {
    id: 'testimonial-wendy-romeu-founder-page',
    quote: 'Everyone she introduced us to was the right person to get us closer to product market fit.',
    name: 'Wendy Romeu',
    company: 'Alluvionic Technologies',
  },
  {
    id: 'testimonial-john-vecchio-founder-page',
    quote: 'No one else could have built the state’s largest tech incubator and mentor program starting from zero with no initial funding.',
    name: 'John Vecchio',
    company: 'Mosley Ventures',
  },
  {
    id: 'testimonial-jacie-stivers-founder-page',
    quote: 'We hired Jenna to attract a Fortune 500 CEO to visit and consider our property. She delivered in less than 48 hours.',
    name: 'Jacie Stivers',
    company: 'Commercial Investment Real Estate',
  },
]

const STATS = [
  { id: 'stat-founders-coached', value: 250, label: 'high-tech founders coached' },
  { id: 'stat-founders-funded', value: 50, suffix: '+', label: 'founders supported in securing early-stage funding' },
  { id: 'stat-groundswell-exits', value: 165, prefix: '$', suffix: 'M+', label: 'in exits from Groundswell member companies' },
  { id: 'stat-entrepreneur-network', value: 50, suffix: '+', label: 'accomplished entrepreneurs in our network' },
  { id: 'stat-member-raised', value: 65, prefix: '$', suffix: 'M+', label: 'raised by member companies' },
  { id: 'stat-combined-exits', value: 165, prefix: '$', suffix: 'M+', label: 'in combined exits' },
  { id: 'stat-coached', value: 250, label: 'founders coached' },
  { id: 'stat-stakeholders', value: 20, suffix: 'K+', label: 'stakeholders engaged' },
]
const HOME_STATS = STATS.slice(0, 4).map((s) => s.id)
const FOUNDER_STATS = STATS.slice(4).map((s) => s.id)

const TIMELINE_IDS = ['timeline-marcom', 'timeline-groundswell', 'timeline-helicon']

const AREA_DESCRIPTIONS = [
  'Find duplicated production work and underused assets.',
  'Spot gaps in customer stories, case studies and proof of value.',
  'Find ways to turn company knowledge into reusable content.',
  'See how well your marketing answers buyer questions and sales objections.',
  'Set priorities and metrics for judging marketing performance.',
]

const POST_SOURCES =
  'Sources: Gallup, State of the Global Workplace 2026 (April 2026). McKinsey, The State of AI in 2026 (Aug. 25, 2026). McKinsey, 2026 Global B2B Pulse (June 2026).'

const JENNA_CUTOUT_ALT = 'Jenna Colombo, founder of Reel Good News.'

/* ------------------------------------------------------------------ */
/* Build                                                              */
/* ------------------------------------------------------------------ */

export function buildDocuments(opts: BuildOptions): SeedDocument[] {
  const imageRef = (file: string): ImageRef =>
    opts.mode === 'offline' ? { _type: 'reference', _ref: `local:${file}` } : opts.imageRef(file)
  const img = (file: string, alt: string, extra: Obj = {}): Obj => ({ _type: 'imageWithAlt', asset: imageRef(file), alt, ...extra })
  /** Gallery array members are images too, but their `_type` comes from the array (`itemsItem`). */
  const galleryImage = (file: string, alt: string, title: string, caption: string): Obj => ({
    asset: imageRef(file),
    alt,
    title,
    caption,
  })

  const docs: SeedDocument[] = []
  const add = (d: SeedDocument) => docs.push(d)

  /* ---------------- singletons: site ---------------- */

  const sc = singletons.salesCalendar
  add({
    _id: 'salesCalendar',
    _type: 'salesCalendar',
    introEndsAt: sc.introEndsAt,
    coursesOpenAt: sc.coursesOpenAt,
    earlyBirdEndsAt: sc.earlyBirdEndsAt,
    workshopAt: sc.workshopAt,
    inPersonSeatCap: sc.inPersonSeatCap,
    seatsSold: sc.seatsSold,
  })

  add({
    _id: 'announcementBanner',
    _type: 'announcementBanner',
    enabled: singletons.announcementBanner.enabled,
    variants: items(
      'variants',
      singletons.announcementBanner.variants.map((v) => ({
        label: v.label,
        message: v.message,
        ctaLabel: v.ctaLabel,
        ctaLink: link(v.ctaLink),
        showFrom: v.showFrom,
        showUntil: v.showUntil,
        countdownTo: v.countdownTo,
      })),
      'variant',
    ),
  })

  const ss = singletons.siteSettings
  const footer = ss.footer
  add({
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'Reel Good News',
    logo: img('logo.png', 'Reel Good News'),
    logoInverted: img('logo-invert.png', 'Reel Good News'),
    logoStacked: img('logo-stack.png', 'Reel Good News'),
    headerNav: items(
      'headerNav',
      [
        { label: 'Workshop', link: link('/workshop') },
        {
          label: 'Education',
          dropdown: {
            style: 'mega',
            eyebrow: 'Online courses · open Dec 1',
            showFeature: true,
            items: items(
              'items',
              [
                {
                  label: 'Attract the Right Audience',
                  link: link('/courses/attract-the-right-audience'),
                  badge: '1',
                  badgeStyle: 'number',
                  priceFromCourse: ref('course-attract'),
                },
                {
                  label: 'Build a Year of Content',
                  link: link('/courses/build-a-year-of-content'),
                  badge: '3',
                  badgeStyle: 'number',
                  priceFromCourse: ref('course-create'),
                },
                {
                  label: 'Reach the Right Audience',
                  link: link('/courses/reach-the-right-audience'),
                  badge: '4',
                  badgeStyle: 'number',
                  priceFromCourse: ref('course-broadcast'),
                },
                {
                  label: 'The Content Machine',
                  link: link('/courses/content-machine'),
                  description: 'All three courses · {bundlePrice}',
                  badgeStyle: 'bundleIcon',
                },
                {
                  label: 'Attract More Raving Fans',
                  link: link('/book'),
                  eyebrow: 'Books · pre-order',
                  badge: 'Attract',
                  badgeStyle: 'script',
                  separated: true,
                },
              ],
              'edu',
            ),
          },
        },
        {
          label: 'Media',
          dropdown: {
            style: 'list',
            showFeature: false,
            items: items(
              'items',
              [
                { label: 'Podcast', link: link('/podcast'), description: 'Founders and experts in conversation' },
                { label: 'Blog', link: link('/blog'), description: 'Practical ideas for B2B teams' },
                { label: 'Socials', link: link('/socials'), description: 'Follow us on LinkedIn' },
                { label: 'Book a speaking engagement', link: link('/speaking'), description: 'Book our founder for an event' },
              ],
              'media',
            ),
          },
        },
        { label: 'Partner With Us', link: link('/partner') },
        { label: 'About the Team', link: link('/about') },
        { label: 'Careers', link: link('/careers') },
      ],
      'nav',
    ),
    headerCta: cta(ss.headerCta.label, ss.headerCta.link, 'primary'),
    megaMenuFeature: {
      eyebrow: ss.megaMenuFeature.eyebrow,
      headline: ss.megaMenuFeature.headline,
      dateBadge: ss.megaMenuFeature.dateBadge,
      dateLine: ss.megaMenuFeature.dateLine,
      subLine: ss.megaMenuFeature.subLine,
      cta: cta(ss.megaMenuFeature.ctaLabel, ss.megaMenuFeature.ctaLink, 'textLink'),
    },
    mobileMenuGroups: items(
      'mobileMenuGroups',
      ss.mobileMenuGroups.map((g, gi) => ({
        title: g.title,
        style: g.style === 'big' ? 'big' : 'pills',
        links: g.links.map(([label, target], li) => simpleLink(label, target, `mm${gi + 1}l${li + 1}`)),
      })),
      'mm',
    ),
    mobileMenuBottom: {
      cta: cta(ss.mobileMenuBottom.ctaLabel, ss.mobileMenuBottom.ctaLink, 'primary'),
      note: ss.mobileMenuBottom.note,
    },
    footer: {
      newsletterEyebrow: footer.newsletterEyebrow,
      newsletterHeadline: footer.newsletterHeadline,
      newsletterBody: footer.newsletterBody,
      newsletterLabel: 'Work email',
      newsletterPlaceholder: 'you@company.com',
      newsletterButton: 'Subscribe',
      newsletterSuccess: 'Subscribed. Welcome to the good news.',
      tagline: footer.tagline,
      handwrittenLine: footer.handwrittenLine,
      socialButton: cta('LinkedIn', '/socials', 'outlineLight'),
      columns: items(
        'columns',
        footer.columns.map((c, ci) => ({
          title: c.title,
          links: c.links.map(([label, target], li) => simpleLink(label, target, `col${ci + 1}l${li + 1}`)),
        })),
        'col',
      ),
      legalLinks: footer.legalLinks.map(([label, target], i) => simpleLink(label, target, `legal${i + 1}`)),
      disclaimer: footer.disclaimer,
      copyright: footer.copyright,
    },
    cookieNotice: {
      ...ss.cookieNotice,
      acceptedToast: 'Analytics on. Thanks.',
      declinedToast: 'Analytics stay off.',
    },
    checkout: {
      eyebrow: 'Secure checkout',
      attendanceLegend: 'How will you attend?',
      inPersonLabel: 'In person',
      zoomLabel: 'On Zoom',
      soldOutLabel: 'sold out',
      seatsLeftLabel: '{n} left',
      nameLabel: 'Full name',
      emailLabel: 'Email',
      phoneLabel: 'Mobile number',
      phoneHelp: 'For the order confirmation text.',
      consentText:
        'Optional. Text me event reminders and course updates from Reel Good News. Message and data rates may apply. Reply STOP to opt out. [Counsel to review.]',
      totalLabel: 'Total',
      submitLabel: 'Continue to payment',
      secureNote: 'Payments by Stripe.',
      placeholderChip: 'Stripe Checkout opens here',
      placeholderBody: '[Stripe’s secure payment page handles the card once payments are connected.]',
      placeholderButton: '[Preview the confirmation page]',
      cancelLabel: 'Cancel',
      workshopSubline: '{ticket} ticket · Thursday, Feb 4, 2027 · Noon ET',
      courseSubline: 'Online course · {priceType} · lessons open Dec 1, 2026',
      bundleSubline: 'All three online courses · {priceType} · lessons open Dec 1, 2026',
      bundleIntroPriceLabel: 'introductory price through January 15',
      earlyBirdTicket: 'Early-bird',
      standardTicket: 'Standard',
      introPriceLabel: 'introductory price',
      regularPriceLabel: 'regular price',
    },
    sceneTransition: {
      topLabel: 'RGN · 35MM',
      bottomLabel: 'HOOK. LINE. HEART.',
      productionName: 'Reel Good News',
    },
    contactEmail: ss.contactEmail,
    defaultSeo: {
      metaTitle: 'Reel Good News',
      metaDescription:
        'Our team at Reel Good News turns expertise, customer results and reputation into a year of strategic content, all from one planned production day.',
      titleTemplate: '%s · Reel Good News',
    },
    organization: {
      name: 'Reel Good News',
      url: 'https://reelgoodnews.com',
      logo: img('logo.png', 'Reel Good News'),
    },
  })

  /* ---------------- library ---------------- */

  faqsSeed.forEach((f, i) => {
    add({ _id: FAQ_IDS[i], _type: 'faq', question: f.question, answer: f.answer, tags: f.tags })
  })

  testimonialsSeed.forEach((t, i) => {
    add({
      _id: HOME_TESTIMONIAL_IDS[i],
      _type: 'testimonial',
      quote: t.quote,
      name: t.name,
      company: t.company,
      permissionConfirmed: false,
    })
  })
  FOUNDER_TESTIMONIALS.forEach((t) => {
    add({ _id: t.id, _type: 'testimonial', quote: t.quote, name: t.name, company: t.company, permissionConfirmed: false })
  })

  STATS.forEach((s) => {
    add({
      _id: s.id,
      _type: 'stat',
      value: s.value,
      ...(s.prefix ? { prefix: s.prefix } : {}),
      ...(s.suffix ? { suffix: s.suffix } : {}),
      label: s.label,
    })
  })

  add({
    _id: 'team-jenna',
    _type: 'teamMember',
    name: 'Jenna Colombo',
    title: 'Founder',
    photo: img('jenna-square.jpg', 'Jenna Colombo'),
    cutout: img('jenna-cutout.webp', JENNA_CUTOUT_ALT),
    bio: 'Jenna Colombo is the founder of Reel Good News and a growth executive with more than a decade of work that connects founders, investors and industry leaders.',
    link: link('/about/jenna-colombo'),
    linkLabel: 'About Jenna',
    order: 1,
  })
  add({ _id: 'team-placeholder', _type: 'teamMember', name: '[Team member]', title: '[Title]', order: 2 })

  add({
    _id: 'timeline-marcom',
    _type: 'timelineEntry',
    years: '2013 to present',
    year: '2013',
    homeLabel: '2013 →',
    organisation: 'MarCom Florida',
    description: 'Strategic growth advisory for founders, CEOs and investors.',
    shortDescription: 'Strategic growth advisory for founders, CEOs and investors.',
    homeSummary: 'Growth advisory for founders and CEOs',
    highlight: false,
    order: 1,
  })
  add({
    _id: 'timeline-groundswell',
    _type: 'timelineEntry',
    years: '2015 to present',
    year: '2015',
    homeLabel: '2015 →',
    organisation: 'Groundswell Startups',
    description: 'Co-founded and led the Southeast’s largest privately funded technology incubator. Former CEO, still a co-founder.',
    shortDescription: 'Co-founded and led the Southeast’s largest privately funded technology incubator.',
    homeSummary: 'Co-founder and former CEO',
    highlight: false,
    order: 2,
  })
  add({
    _id: 'timeline-helicon',
    _type: 'timelineEntry',
    years: '2019 to 2023',
    year: '2019',
    homeLabel: '2019 to 2023',
    organisation: 'Helicon Technologies',
    description: 'Communications executive and co-owner. Raised $2.5M, generated 150+ investor meetings.',
    shortDescription: 'Communications executive and co-owner. Raised $2.5M, generated 150+ investor meetings.',
    homeSummary: 'Raised $2.5M in under nine months',
    highlight: true,
    order: 3,
  })

  /* ---------------- offers ---------------- */

  const ws = singletons.workshop
  add({
    _id: 'workshop',
    _type: 'workshop',
    title: ws.title,
    slug: slug('workshop'),
    handLine: 'Reel Good News: Attract More Raving Fans',
    headline: ws.headline,
    lead: 'Plan a focused production day that captures customer stories, shows real value and fills a content library for the full year.',
    heroChips: ['Live workshop', 'In person + Zoom'],
    dateLabel: ws.dateLabel,
    timeLabel: ws.timeLabel,
    venue: ws.venue,
    zoomAvailable: true,
    earlyBirdPrice: ws.earlyBirdPrice,
    standardPrice: ws.standardPrice,
    reserveLabel: 'Reserve my seat',
    priceNotes: {
      earlyBird: 'early-bird through December 10',
      earlyBirdShort: 'early-bird through Dec 10, then $199',
      standard: 'standard ticket',
      perSeat: 'per seat',
    },
    stub: {
      eyebrow: 'Admit one',
      day: 'Thursday',
      date: 'Feb 4',
      line: '2027 · Noon ET',
      doneLabel: 'This workshop has happened',
    },
    includes: ws.includes,
    seatsLine: '{left} of {cap} in-person seats left · then Zoom',
    soldOutLine: 'In-person seats sold out. Zoom seats remain.',
    zoomChip: '+ Zoom',
    stepLabel: 'Step 02 · Capture',
    card: {
      summary:
        'Turn one production day into a year of credibility. Leave with a production plan, a planning workbook and a repeatable process.',
      chips: ['Live workshop', 'In person + Zoom'],
    },
    whatThisIs: {
      eyebrow: 'What this is',
      statement: 'Most businesses make content a little at a time. *This workshop shows a better way.*',
      body: paragraphs(
        [
          'One planned day captures the credible stories buyers want to hear.',
          'Our team walks through each step: find the right people to speak about the business, invite and prepare them, write interview questions that draw out real stories, and organize the day so nothing goes to waste. The session also covers a clear introduction and outro, what to ask a videographer before a booking, and how to capture stories that show real results.',
        ],
        'what',
      ),
      closingLine: 'Leave with a production day plan and a repeatable process for the year ahead.',
    },
    outcomesHeadline: 'Leave with a *practical plan* to:',
    outcomes: ws.outcomes,
    agenda: {
      eyebrow: 'The agenda · times to confirm',
      headline: 'How the session runs.',
      items: items(
        'items',
        ws.agenda.map((a) => ({ time: a.time, title: a.title, description: a.text })),
        'agenda',
      ),
    },
    whoItIsFor: {
      eyebrow: 'Who it is for',
      text: 'Founders, business owners and marketing teams who want to build credibility and show customer results without frequent video shoots.',
    },
    noNeedFor: { eyebrow: 'No need for', items: ws.noNeedFor },
    tickets: {
      eyebrow: 'Tickets',
      headline: 'Same price in person or on *Zoom.*',
      inPersonToggle: 'In person',
      zoomToggle: 'On Zoom',
      zoomToast: 'Zoom selected. Same price.',
      earlyBirdLabel: 'Early-bird',
      standardLabel: 'Standard',
      onSaleLabel: 'On sale now',
      earlyBirdWindow: 'Through December 10, 2026',
      standardWindow: 'From December 11, 2026',
      earlyBirdEndedChip: 'Ended Dec 10',
      standardUpcomingChip: 'From Dec 11',
      earlyBirdEndedLabel: 'EARLY-BIRD ENDED',
      standardUpcomingLabel: 'OPENS DECEMBER 11',
      reassurances: items(
        'reassurances',
        [
          { icon: 'lock', title: 'Secure checkout with Stripe.', text: 'Card details never touch this site.' },
          { icon: 'phone', title: 'Instant confirmation text.', text: 'Plus reminders before the day.' },
          { icon: 'people', title: "Can't make it?", text: 'Transfer the ticket to a colleague or a future workshop.' },
        ],
        'reassure',
      ),
    },
    hostSection: {
      eyebrow: 'Your hosts',
      headline: 'Led by our team *and our founder*',
      body: 'Founder Jenna Colombo leads the session with our team at Reel Good News. She co-founded Groundswell Startups and has worked with founders and early-stage companies since 2012. The workshop teaches the same planning method our team uses with clients.',
      image: img('jenna-cutout.webp', JENNA_CUTOUT_ALT),
      chips: ['250 founders coached', 'Groundswell Startups co-founder', 'Since 2012'],
      linkLabel: 'Meet our founder',
      link: link('/about/jenna-colombo'),
    },
    archive: {
      eyebrow: 'From the archive',
      headline: 'Past *workshops.*',
      lead: 'Past sessions in the Marketing and Sales Acceleration series at Groundswell Startups, Melbourne, Florida.',
      images: [
        {
          ...img(
            'promo-hooked.webp',
            'Promotional graphic for the Hooked in 30 Seconds workshop, September 4, 2025, at Groundswell Startups.',
          ),
          _key: 'archive1',
          caption: 'Hooked in 30 Seconds · September 2025',
        },
        {
          ...img('promo-acceleration.webp', 'Promotional graphic for the September Marketing and Sales Acceleration workshop series.'),
          _key: 'archive2',
          caption: 'Workshop Series · every Thursday at Groundswell',
        },
      ],
    },
    faqs: refs(WORKSHOP_FAQS, 'faq'),
    faqHeadline: 'Workshop questions.',
    faqLinkLabel: 'Ask us something else',
    faqLink: link('/contact'),
    closingBand: { headline: '10 seats in the room. Unlimited on Zoom.', ctaLabel: 'Reserve my seat' },
    seo: seo(
      'Live workshop, Thursday, February 4, 2027, noon ET, in person and on Zoom. Plan a focused production day that captures customer stories and fills a content library for the full year.',
      'Workshop: Attract More Raving Fans',
    ),
  })

  coursesSeed.forEach((c) => {
    add({
      _id: COURSE_IDS[c.id],
      _type: 'course',
      order: c.n,
      orderRank: `0|a0000${c.n}:`,
      stepNumber: c.step,
      courseNumber: c.n,
      word: c.word,
      title: c.title,
      fullTitle: c.full,
      slug: slug(c.slug),
      headline: c.headline,
      summary: c.summary,
      shortLine: c.short,
      regularPrice: c.regular,
      introPrice: c.intro,
      inBundle: true,
      problemLabel: c.blockLabel,
      problem: c.block,
      problemHighlight: c.blockHighlight,
      learn: c.learn,
      outcome: c.leave,
      outcomeNote: c.leave2,
      bestFor: c.bestfor,
      format: 'On-demand online lessons',
      opensLabel: 'December 1, 2026',
      hostedOn: '[Zoom or Circle]',
      faqs: refs(COURSE_FAQS, 'faq'),
      seo: seo(c.summary, c.title),
    })
  })

  add({
    _id: 'courseTemplate',
    _type: 'courseTemplate',
    cardChipPrefix: 'Online course',
    opensSoonLabel: 'opens Dec 1',
    onDemandLabel: 'on demand now',
    heroChip: 'Online course',
    heroOpensLabel: 'Opens December 1, 2026',
    heroOnDemandLabel: 'On demand now',
    stepOfLabel: 'Step {step} of 04',
    coverLabel: 'REEL GOOD NEWS · COURSE {n} · STEP {step}',
    enrollLabel: 'Enroll now',
    detailsLabel: 'Details',
    regularPriceLabel: 'Regular price',
    saveLabel: 'Save $',
    introEndsLabel: 'Intro price ends January 15',
    bundleLinkIntroLabel: 'Or get all three courses for {introPrice} (intro price)',
    bundleLinkLabel: 'Or get all three courses for {price}',
    features: items(
      'features',
      [
        { icon: 'clock', text: 'On-demand lessons, opening December 1' },
        { icon: 'lock', text: 'Secure checkout with Stripe' },
        { icon: 'phone', text: 'Confirmation text right after purchase' },
      ],
      'feature',
    ),
    pathWorkshop: { step: '02', word: 'Capture', label: 'The live workshop' },
    pathCourseLabel: 'Course {n}',
    hereLabel: 'You are here',
    coversHeadline: 'What the course *covers.*',
    coversCountLabel: '{count} lesson themes · on demand',
    outcomeEyebrow: 'The outcome',
    detailLabels: { format: 'FORMAT', opens: 'OPENS', hostedOn: 'HOSTED ON', bestFor: 'BEST FOR' },
    bundleUpsell: {
      chip: 'Best value',
      headline: 'Take all three courses as the Content Machine.',
      bodyIntro: 'One path from strategy to distribution. All three for {introPrice} through January 15, then {price}.',
      body: 'One path from strategy to distribution. All three for {price}, a {save} saving.',
      ctaLabel: 'See the bundle',
    },
    faqHeadline: 'Course questions.',
    teacherCard: {
      image: img('jenna-square.jpg', 'Jenna Colombo'),
      title: 'Taught by our team',
      text: 'Led by founder Jenna Colombo, with founders since 2012.',
    },
  })

  add({
    _id: 'bundle',
    _type: 'bundle',
    title: singletons.bundle.title,
    slug: slug('content-machine'),
    headline: 'The Reel Good News *Content Machine*',
    subline: 'One path from strategy to distribution.',
    chips: ['Best value', 'All three courses · opens Dec 1'],
    price: singletons.bundle.price,
    introPrice: singletons.bundle.introPrice,
    compareAt: singletons.bundle.compareAt,
    compareAtIntro: singletons.bundle.compareAtIntro,
    introLabel: 'Intro price through Jan 15',
    saveLabel: 'Save {save}',
    ctaLabel: 'Get the bundle',
    path: {
      eyebrow: 'Three courses, in order',
      headline: 'The path',
      regularPriceLabel: 'regular price',
      items: items(
        'items',
        [
          { course: ref('course-attract'), line: 'Define the audience and go-to-market strategy.' },
          { course: ref('course-create'), line: 'Plan a production day that captures credible customer stories.' },
          { course: ref('course-broadcast'), line: 'Turn the content library into a structured distribution plan.' },
        ],
        'path',
      ),
    },
    maths: {
      eyebrow: 'The math',
      headline: 'Three courses. One price.',
      bodyIntro: 'Through January 15, the three courses total {compareAtIntro} at introductory prices. The bundle costs {introPrice}.',
      body: 'Bought separately, the three courses total {compareAt}. The bundle saves {save}.',
      courseColumn: 'Course',
      introColumn: 'Intro, through Jan 15',
      priceColumn: 'Regular',
      separateLabel: 'Bought separately',
      totalNoteIntro: 'Intro price through January 15, then {price}',
    },
    pairWithWorkshop: {
      eyebrow: 'Step 02 happens in the room',
      headline: 'Pair the bundle with the live workshop on February 4.',
      body: 'See the full method in one room. In person (10 seats) or on Zoom.',
      cta: cta('See the workshop', '/workshop', 'primary'),
    },
    faqHeadline: 'Bundle questions.',
    faqs: refs(BUNDLE_FAQS, 'faq'),
    card: {
      chip: 'Best value · all three courses',
      body: 'One path from strategy to distribution: define the strategy, plan the production day, distribute the content.',
      ctaLabel: 'See the bundle',
      fanWord: 'Machine',
    },
    seo: seo(
      'All three Reel Good News courses in one path from strategy to distribution, for less than buying them separately.',
      'The Content Machine bundle',
    ),
  })

  const gc = singletons.growthCall
  add({
    _id: 'growthCall',
    _type: 'growthCall',
    eyebrow: gc.eyebrow,
    headline: gc.headline,
    intro: gc.intro,
    steps: items(
      'steps',
      gc.steps.map(([icon, title, text]) => ({ icon, title, text })),
      'step',
    ),
    callLengthNote: gc.callLengthNote,
    formStepLabel: 'Fill out the form',
    bookStepLabel: 'Book your call',
    consentText: gc.consentText,
    termsLine: gc.termsLine,
    continueLabel: gc.continueLabel,
    leadSavedMessage: 'Details saved. Our team has them now.',
    editLabel: 'Edit',
    lockedMessage: gc.lockedMessage,
    timezoneLabel: gc.timezoneLabel,
    confirmLabel: gc.confirmLabel,
    availableWeekdays: gc.availableWeekdays,
    bookingWindowDays: gc.bookingWindowDays,
    slotLabels: gc.slotLabels,
    callMinutes: 30,
    successTitle: gc.successTitle,
    successBody: gc.successBody,
    bookedMessage: 'Booked. Confirmation text on the way.',
    addToCalendarLabel: 'Add to calendar',
    successCta: cta('See the workshop', '/workshop', 'dark'),
    workshopLine: gc.workshopLine,
    workshopLinkLabel: gc.workshopLinkLabel,
    seo: seo(gc.intro, 'Claim your 2027 growth strategy'),
  })

  add({
    _id: 'book',
    _type: 'book',
    hidden: false,
    title: 'Attract More Raving Fans',
    chip: 'Pre-order now',
    coverAccentWord: 'Attract',
    coverRest: 'More Raving Fans',
    coverTagline: 'A practical system that turns expertise, customer results and reputation into growth.',
    author: 'Jenna Colombo',
    spineText: 'ATTRACT MORE RAVING FANS · COLOMBO',
    subtitle: 'A practical system that turns expertise, customer results and reputation into growth.',
    publicationLine: 'Publishes [PUBLICATION DATE]. Pre-order today.',
    price: '[PRICE]',
    ctaLabel: 'Pre-order the book',
    byline: 'By Jenna Colombo, founder of Reel Good News',
    statement: 'Most businesses do not have a shortage of expertise. The gap is in how they *communicate its value.*',
    body: [
      block(
        'They have satisfied customers, years of industry knowledge and a product that solves real problems. Yet the marketing misses what makes them different, skips the questions buyers ask and leaves sales teams without proof.',
        'bookbody1',
      ),
      {
        _type: 'block',
        _key: 'bookbody2',
        style: 'normal',
        markDefs: [],
        children: [
          { _type: 'span', _key: 'bookbody2s0', text: 'Attract More Raving Fans', marks: ['em'] },
          {
            _type: 'span',
            _key: 'bookbody2s1',
            text: ' closes that gap. It draws on business strategy, customer stories and strategic content production to show business owners and marketing teams how to find the right audience, clarify the value proposition and turn customer experiences into evidence of impact.',
            marks: [],
          },
        ],
      },
    ],
    inside: {
      headline: "What's inside.",
      eyebrow: 'Table of contents · [to come]',
      items: items(
        'items',
        [
          { word: 'Capture', line: 'Capture the knowledge that lives in a founder’s head.' },
          { word: 'Interview', line: 'Structure customer interviews that reveal measurable results.' },
          { word: 'Produce', line: 'Plan a focused production day that generates a library of useful marketing assets.' },
          { word: 'Distribute', line: 'Distribute that content across channels and align it with the buyer’s journey.' },
          { word: 'Evaluate', line: 'Evaluate how content contributes to business goals.' },
        ],
        'inside',
      ),
    },
    quote: {
      eyebrow: 'The point',
      text: 'The goal is not more content for visibility’s sake. The goal is better use of the expertise, relationships and resources a business already has.',
    },
    preorderBonus: {
      show: true,
      eyebrow: 'Pre-order bonus',
      text: '[Optional bonus, for example the Marketing ROI Assessment or a workshop discount]',
    },
    noLinkMessage: {
      eyebrow: 'Pre-order',
      body: '[Pre-order link to come: a retailer such as Amazon, or our own checkout.]',
      buttonLabel: 'Got it',
    },
    card: {
      chip: 'Pre-order · the book',
      body: 'A roadmap that turns business value into a repeatable marketing system.',
      ctaLabel: 'Pre-order',
    },
    seo: seo('A practical system that turns expertise, customer results and reputation into growth. By Jenna Colombo, founder of Reel Good News.'),
  })

  /* ---------------- assessment, order, blog ---------------- */

  add({
    _id: 'assessment',
    _type: 'assessment',
    intro: {
      pillTag: 'FREE ASSESSMENT · 5 MINUTES',
      headline: 'Your company has the expertise. Does the marketing *put it to work?*',
      subline: 'The Marketing ROI Assessment. Find more value in the marketing budget already in place.',
      body: 'Companies invest in marketing to generate demand, support sales and win customers. Yet expertise, customer results and production resources often sit unused. Our team at Reel Good News turns those assets into strategic content that supports real buying decisions.',
    },
    form: {
      title: 'Start here',
      stepLabel: 'STEP 0 OF 5',
      firstNameLabel: 'First name',
      lastNameLabel: 'Last name',
      emailLabel: 'Work email',
      phoneLabel: 'Mobile number',
      companyLabel: 'Company',
      roleLabel: 'Your role',
      sizeLabel: 'Company size',
      sizePlaceholder: 'Select company size',
      companySizes: ['1 to 9', '10 to 50', '51 to 300', '300+'],
      consentText:
        'Optional. Text me about my assessment and related offers from Reel Good News. Message and data rates may apply. Reply STOP to opt out at any time. [Counsel to review.]',
      submitLabel: 'Start the free assessment',
    },
    areasSection: { headline: 'Five areas. *Five minutes.*', eyebrow: '5 areas' },
    areas: items(
      'areas',
      assessmentSeed.areas.map((name, i) => ({ name, description: AREA_DESCRIPTIONS[i] })),
      'area',
    ),
    questions: items(
      'questions',
      assessmentSeed.questions.map((q) => ({ area: q.area, question: q.question, options: q.options, status: q.status })),
      'question',
    ),
    flow: {
      areasEyebrow: 'Five areas',
      areaLabel: 'AREA {n} · {area}',
      draftChip: 'Draft question',
      helper: 'Choose the answer that fits best. There are no wrong answers.',
      errorText: 'Choose an answer to continue.',
      backLabel: 'Back',
      nextLabel: 'Next question',
      submitLabel: 'Submit my answers',
      sendingLabel: 'Sending your answers to our team…',
      minutesLeft: 'About {n} minutes left',
      minuteLeft: 'About {n} minute left',
    },
    report: {
      eyebrow: 'The report',
      headline: 'A CEO-ready Marketing *Efficiency Report.*',
      body: 'Three priority opportunities, recommended next steps and suggested performance metrics. A stronger business case for the next marketing investment.',
      steps: items(
        'steps',
        [
          { title: 'Answer for five minutes.', text: 'A short set of questions for each area.' },
          { title: 'Our team reviews it.', text: 'A real person reads every assessment.' },
          { title: 'The report arrives by email', text: 'within [number] business days.' },
        ],
        'reportstep',
      ),
    },
    reportMock: {
      sampleLabel: 'SAMPLE LAYOUT',
      title: 'Marketing Efficiency Report',
      preparedFor: 'Prepared for [Your company]',
      prioritiesLabel: 'YOUR THREE HIGHEST-PRIORITY OPPORTUNITIES',
    },
    thankYou: {
      eyebrow: 'Assessment received',
      headline: 'Thank you. Our team *has your answers.*',
      body: 'A real person on our team reads every assessment. The Marketing Efficiency Report arrives by email within [number] business days. Meanwhile, see how the Reel Good News method works.',
      cta: cta('See how it works', '/', 'dark'),
      tracker: items(
        'tracker',
        [
          { title: 'Submitted', text: 'Your answers are in.' },
          { title: 'In review', text: 'A real person on our team reviews them.' },
          { title: 'Report sent', text: 'Within [number] business days.' },
        ],
        'tracker',
      ),
      meanwhileHeadline: 'Meanwhile.',
      cards: items(
        'cards',
        [
          {
            kind: 'link',
            tone: 'navy',
            eyebrow: 'The method',
            title: 'Attract, Capture, Create, Broadcast.',
            text: 'Four steps from hidden expertise to visible proof.',
            link: link('/'),
          },
          {
            kind: 'link',
            tone: 'paper',
            eyebrow: 'Read · 3 min',
            title: "Count What Counts: a simple scoreboard for content that's supposed to sell.",
            link: link(`/blog/${postsSeed[9].slug}`),
          },
          {
            kind: 'workshop',
            tone: 'orange',
            eyebrow: 'Live workshop · Feb 4',
            title: 'Turn one production day into a year of credibility.',
            link: link('/workshop'),
          },
        ],
        'meanwhile',
      ),
    },
    seo: seo(
      'The Marketing ROI Assessment. Five areas, five minutes. Receive a CEO-ready Marketing Efficiency Report with three priority opportunities, next steps and suggested metrics.',
      'Free Marketing ROI Assessment',
    ),
  })

  add({
    _id: 'orderConfirmation',
    _type: 'orderConfirmation',
    eyebrow: 'Payment received',
    sampleSuffix: ' · sample order',
    headline: "You're *in.*",
    workshopLead: 'Seat reserved. A confirmation text is on the way now, with reminders before the day.',
    courseLead:
      'Enrollment confirmed. A confirmation text is on the way, and access details arrive by email and text when lessons open on December 1, 2026.',
    workshopStub: { label: 'ADMIT ONE', date: 'Feb 4', line1: '2027', line2: 'Noon ET' },
    courseStub: { label: 'ENROLLED', date: 'Dec 1', line1: '2026', line2: 'Lessons open' },
    rows: { ticket: 'Ticket', price: 'Price', attending: 'Attending', access: 'Access', name: 'Name', order: 'Order' },
    zoomLabel: 'On Zoom',
    inPersonLabel: 'In person · [Location TBA]',
    accessValue: '[Zoom or Circle]',
    buyerPlaceholder: '[Buyer name]',
    nextHeadline: 'What happens next.',
    steps: items(
      'steps',
      [
        {
          title: 'Check for the text',
          text: 'The confirmation text arrives within two minutes. Save the number so reminders get through.',
          showCalendarButtons: false,
        },
        { title: 'Add the date to a calendar', courseTitle: 'Mark December 1', showCalendarButtons: true },
        {
          title: 'Show up with one question',
          text: 'Bring the most common buyer question. It becomes the first story to plan.',
          showCalendarButtons: false,
        },
      ],
      'next',
    ),
    calendarButtons: { google: 'Google', apple: 'Apple', outlook: 'Outlook' },
    upsells: items(
      'upsells',
      [
        {
          kind: 'course',
          eyebrow: 'Before the workshop',
          title: 'Start with Course 1: Attract the Right Audience',
          link: link('/courses/attract-the-right-audience'),
          course: ref('course-attract'),
          introNote: 'introductory price through January 15.',
          regularNote: 'regular price.',
        },
        {
          kind: 'link',
          eyebrow: 'Free',
          title: 'Take the Marketing ROI Assessment',
          text: 'Five minutes. Our team reviews every answer.',
          link: link('/assessment'),
        },
      ],
      'upsell',
    ),
    seo: { _type: 'seo', metaTitle: 'Order confirmed', noIndex: true },
  })

  add({
    _id: 'blogSettings',
    _type: 'blogSettings',
    eyebrow: 'The blog',
    headline: 'Ideas that make expertise *visible.*',
    allLabel: 'All',
    topicLabels: {
      OFFERS: 'Offers',
      CONTENT: 'Content',
      POSITIONING: 'Positioning',
      GROWTH: 'Growth',
      MEASUREMENT: 'Measurement',
    },
    featuredLabel: 'Featured',
    emptyText: 'No posts in this topic yet.',
    readTimeLabel: '{n} min read',
    shareLabel: 'Share',
    decisionRuleLabel: 'The decision rule',
    keepReadingHeadline: 'Keep reading.',
    assessmentCta: {
      text: 'Does the marketing put the expertise to work? Find out in five minutes.',
      cta: cta('Start the free assessment', '/assessment', 'dark'),
    },
    seo: seo('Practical ideas on credibility, authority and expertise for founders and B2B teams.', 'Blog'),
  })

  postsSeed.forEach((p) => {
    const firstPara = p.body.find((b) => typeof b === 'string') as string | undefined
    add({
      _id: `post-${p.number}`,
      _type: 'post',
      title: p.title,
      slug: slug(p.slug),
      number: p.number,
      coverLine: p.coverLine,
      topic: p.tag,
      featured: !!p.featured,
      author: ref('team-jenna'),
      body: postBody(p.body as unknown as PostBodyItem[], `p${p.number}`),
      sources: POST_SOURCES,
      seo: seo(firstPara && firstPara.length <= 160 ? firstPara : undefined),
    })
  })

  /* ---------------- legal ---------------- */

  const legalPages: Array<{ id: string; slug: string; title: string; order: number; sections: Array<[string, string]> }> = [
    {
      id: 'legal-privacy',
      slug: 'privacy',
      title: 'Privacy Policy',
      order: 1,
      sections: [
        ['Information we collect', 'Covers the form fields collected on this site: names, work email, mobile number, company, role and company size.'],
        ['How we use it', 'Covers registration, course access, assessment reports, reminders and follow-up.'],
        ['Text messages', 'Covers consent, message frequency, rates and how to reply STOP.'],
        ['Cookies and analytics', 'Analytics run only after consent through the cookie banner.'],
        ['Who we share it with', 'Names the processors: payments (Stripe), CRM and messaging (GoHighLevel), lesson hosting (Zoom or Circle).'],
        ['Your choices', 'Access, correction, deletion and the do-not-sell request.'],
      ],
    },
    {
      id: 'legal-terms',
      slug: 'terms',
      title: 'Terms of Service',
      order: 2,
      sections: [
        ['Using this site', ''],
        ['Purchases and payments', 'Course, workshop and book terms.'],
        ['Workshop transfers', 'Matches the refund policy on the workshop page.'],
        ['Results disclaimer', 'Mirrors the footer disclaimer.'],
      ],
    },
    {
      id: 'legal-dmca',
      slug: 'dmca',
      title: 'DMCA Policy',
      order: 3,
      sections: [
        ['Reporting infringement', ''],
        ['Counter-notices', ''],
      ],
    },
    {
      id: 'legal-do-not-sell',
      slug: 'do-not-sell',
      title: 'Do Not Sell or Share My Information',
      order: 4,
      sections: [
        ['Your right to opt out', ''],
        ['Make a request', 'A short form that goes to the CRM.'],
      ],
    },
  ]
  legalPages.forEach((lp) => {
    const body: Obj[] = []
    lp.sections.forEach(([heading, note], i) => {
      body.push(block(heading, `${lp.slug}h${i + 1}`, 'h2'))
      body.push(block(`[Counsel-reviewed text.${note ? ` ${note}` : ''}]`, `${lp.slug}p${i + 1}`))
    })
    body.push(block('Contact us', `${lp.slug}hc`, 'h2'))
    body.push({
      _type: 'block',
      _key: `${lp.slug}pc`,
      style: 'normal',
      markDefs: [{ _type: 'inlineLink', _key: `${lp.slug}pcl`, href: '/contact' }],
      children: [
        { _type: 'span', _key: `${lp.slug}pcs0`, text: 'Questions about this page? ', marks: [] },
        { _type: 'span', _key: `${lp.slug}pcs1`, text: 'Contact us', marks: [`${lp.slug}pcl`] },
        { _type: 'span', _key: `${lp.slug}pcs2`, text: '.', marks: [] },
      ],
    })
    add({
      _id: lp.id,
      _type: 'legalPage',
      title: lp.title,
      navLabel: lp.title,
      slug: slug(lp.slug),
      order: lp.order,
      lastUpdated: '[date]',
      body,
      templateBanner: true,
      templateBannerText:
        'Template. Every legal page uses this layout. The text is drafted for Reel Good News and reviewed by counsel before launch.',
      seo: seo(undefined, lp.title),
    })
  })

  /* ---------------- pages ---------------- */

  const page = (id: string, title: string, slugValue: string, sections: Obj[], description?: string, extra: Obj = {}) =>
    add({
      _id: id,
      _type: 'page',
      title,
      slug: slug(slugValue),
      hidden: false,
      seo: seo(description),
      sections,
      ...extra,
    })

  const hero = singletons.homeHero
  const homeDescription = 'Reel Good News turns your expertise, customer stories, and industry knowledge into a year of strategic content.'

  page(
    'page-home',
    'Home',
    'home',
    [
      {
        _type: 'heroFounder',
        _key: 'hero',
        background: 'navy',
        eyebrow: hero.eyebrow,
        headline: hero.headline,
        lead: hero.lead,
        primaryCta: cta(hero.primaryCta.label, hero.primaryCta.link, 'primary'),
        secondaryCta: cta(hero.secondaryCta.label, hero.secondaryCta.link, 'outlineLight'),
        supportLine: hero.supportLine,
        portrait: img('jenna-cutout.webp', JENNA_CUTOUT_ALT),
        lowerThird: { tag: hero.lowerThird.tag, name: hero.lowerThird.name, title: hero.lowerThird.line },
      },
      {
        _type: 'ticker',
        _key: 'ticker',
        phrases: ['Hook. Line. Heart.', 'One production day', '365 days of authority', 'Live workshop · Feb 4, 2027', 'Courses open Dec 1', 'Build credibility'],
      },
      {
        _type: 'methodCalendar',
        _key: 'method',
        background: 'paper',
        watermark: 'top-right',
        eyebrow: 'The method',
        headline: 'One day of your time. *365 days* of authority.',
        body: 'Most businesses make content a little at a time, whenever they find a spare hour. Our approach starts with one planned production day that captures the stories buyers want to hear. We shape that footage into a content library for the full year.',
        calendar: {
          title: 'YOUR CONTENT YEAR',
          replayLabel: 'REPLAY ↻',
          caption: 'Each square is a day of published content. All of it comes from the single orange day.',
          typicalLabel: 'TYPICAL APPROACH',
          typicalNote: '365 days of production effort',
          approachLabel: 'THE REEL GOOD NEWS APPROACH',
          approachNote: '1 production day, 364 days of content',
          calloutTag: 'DAY 1 · YOUR PRODUCTION DAY',
          legendProduction: 'Production day',
          legendContent: 'Published content from that day',
          ariaLabel:
            'A year calendar. Typical approach: production effort on all 365 days. Reel Good News approach: one production day on January 1, then published content on the other 364 days.',
        },
      },
      {
        _type: 'howItWorks',
        _key: 'how',
        background: 'white',
        watermark: 'none',
        eyebrow: 'How it works',
        headline: 'Four steps from hidden expertise to visible proof.',
        note: 'Each step has its own course or event. Take one, or follow the whole path.',
        steps: items(
          'steps',
          [
            {
              number: '01',
              name: 'Attract',
              icon: 'target',
              text: 'Define the audience, the value and the messages that earn attention.',
              linkLabel: 'Attract the Right Audience',
              link: link('/courses/attract-the-right-audience'),
            },
            {
              number: '02',
              name: 'Capture',
              icon: 'camera',
              text: 'Plan one focused production day. Bring in customers, partners and experts, and record the stories that prove the value.',
              linkLabel: 'The live workshop',
              link: link('/workshop'),
            },
            {
              number: '03',
              name: 'Create',
              icon: 'film',
              text: 'Turn one day into a year of short videos, customer stories and answers to common buyer questions.',
              linkLabel: 'Build a Year of Content',
              link: link('/courses/build-a-year-of-content'),
            },
            {
              number: '04',
              name: 'Broadcast',
              icon: 'broadcast',
              text: 'Match each piece to a buyer question, a channel and a publish date.',
              linkLabel: 'Reach the Right Audience',
              link: link('/courses/reach-the-right-audience'),
            },
          ],
          'step',
        ),
      },
      {
        _type: 'offerGrid',
        _key: 'offers',
        anchorId: 'offers',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'Courses, workshop and book',
        headline: 'Choose a *starting point.*',
        note: 'Take one course, follow all three in order, or see the full method in one room at the live workshop.',
        items: refs(['workshop', 'course-attract', 'course-create', 'course-broadcast', 'bundle', 'book'], 'offer'),
      },
      {
        _type: 'assessmentCta',
        _key: 'assessment',
        background: 'ink',
        watermark: 'none',
        tornTopEdge: true,
        eyebrow: 'Free · five minutes · reviewed by our team',
        headline: 'Your company has the expertise. Does the marketing *put it to work?*',
        body: 'Five areas. Five minutes. Receive a CEO-ready Marketing Efficiency Report with three priority opportunities, next steps and suggested metrics.',
        cta: cta('Start the free assessment', '/assessment', 'primary'),
        showAreas: true,
        showReportMock: true,
      },
      {
        _type: 'statsBlock',
        _key: 'stats',
        background: 'white',
        watermark: 'none',
        variant: 'rule',
        eyebrow: 'Track record',
        headline: 'Recent wins & *milestones*',
        showBadge: false,
        stats: refs(HOME_STATS, 'stat'),
        footnote: singletons.statsFootnote,
      },
      {
        _type: 'testimonials',
        _key: 'testimonials',
        background: 'white',
        watermark: 'none',
        variant: 'carousel',
        items: refs(HOME_TESTIMONIAL_IDS, 'quote'),
        logoStripLabel: 'Clients and partners',
        logos: items(
          'logos',
          [
            { name: 'Smart Response', style: 'display' },
            { name: 'SWIFTPAWS', style: 'caps' },
            { name: 'Mosley Ventures', style: 'body' },
            { name: 'Alluvionic', style: 'plain' },
            { name: 'Magnolia Hill', style: 'display' },
            { name: 'HELICON', style: 'caps' },
          ],
          'logo',
        ),
      },
      {
        _type: 'founderStory',
        _key: 'founder',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'The team',
        headline: 'Built by operators, *for founders.*',
        handLine: 'founder to founder',
        body: 'Our team at Reel Good News brings more than a decade of work with founders, investors and early-stage companies. Founder Jenna Colombo co-founded Groundswell Startups, one of the largest networks of serial entrepreneurs and investors in the Southeast. Since 2012 our approach has helped companies bring products to market, land first customers and prepare to raise capital.',
        photo: img('jenna-portrait.jpg', JENNA_CUTOUT_ALT),
        signature: 'Jenna',
        timeline: refs(TIMELINE_IDS, 'tl'),
        cta: cta('Meet our founder', '/about/jenna-colombo', 'outline'),
      },
      {
        _type: 'faqBlock',
        _key: 'faq',
        background: 'white',
        watermark: 'none',
        eyebrow: 'Questions',
        headline: 'Good questions. *Straight answers.*',
        note: 'Another question? Send a note. Our team replies within [number] business days.',
        cta: cta('Contact us', '/contact', 'textLink'),
        openFirst: true,
        faqs: refs(HOME_FAQS, 'faq'),
      },
      {
        _type: 'finalCta',
        _key: 'final',
        background: 'orange',
        watermark: 'none',
        eyebrow: 'Live workshop · Thursday, February 4, 2027 · Noon ET',
        headline: 'Turn one production day into a year of credibility.',
        cta: cta('Reserve my seat', '/workshop', 'dark'),
        showCountdown: true,
      },
    ],
    homeDescription,
  )

  page(
    'page-about',
    'About the Team',
    'about',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'paper',
        watermark: 'none',
        art: 'quoteMark',
        eyebrow: 'About Reel Good News',
        headline: 'Your expertise should do the *selling* for you.',
        headingSize: 'large',
        lead: 'Our team at Reel Good News helps businesses build credibility and shorten the sales cycle. We help companies communicate why their work matters, so buyers understand the value before the first conversation.',
        ctas: [
          ctaItem('Reserve my seat at the workshop', '/workshop', 'primary', 'cta1'),
          ctaItem('Take the free Marketing ROI Assessment', '/assessment', 'outline', 'cta2'),
        ],
      },
      {
        _type: 'statement',
        _key: 'believe',
        background: 'navy',
        watermark: 'none',
        eyebrow: 'What we believe',
        statement: 'The industry needs your voice. *We can help.*',
        body: paragraphs(
          [
            'Most founders know their field inside out and struggle to show it. We believe clear, honest communication of real expertise earns customer confidence. Louder marketing does not.',
            'We are a strategic communications partner, not a video production shop. Video is one tool. The real work: decide what buyers need to hear, then say it with clarity and authority.',
          ],
          'believe',
        ),
        bodyStyle: 'plain',
        closingLine:
          'Who we work with: founders and leadership teams of high-tech companies who already have deep expertise and real customers, and who want that proof visible online.',
      },
      {
        _type: 'valuesGrid',
        _key: 'values',
        background: 'white',
        watermark: 'none',
        headline: 'How we work.',
        style: 'cards',
        items: items(
          'items',
          [
            { title: 'Honest', text: 'We do not promise outcomes we cannot control.' },
            { title: 'Strategic', text: 'Every piece of content has a job in the sales process.' },
            { title: 'Efficient', text: 'One production day feeds months of content.' },
          ],
          'value',
        ),
      },
      {
        _type: 'teamGrid',
        _key: 'team',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'Leadership',
        headline: 'Meet the team.',
        members: refs(['team-jenna', 'team-placeholder'], 'member'),
        showHiringCard: true,
        hiringCard: {
          eyebrow: 'We are hiring, always',
          headline: 'Great storyteller? This could be your card.',
          linkLabel: 'SEE CAREERS',
          link: link('/careers'),
        },
      },
      {
        _type: 'timeline',
        _key: 'story',
        background: 'white',
        watermark: 'none',
        headline: 'The story so far.',
        style: 'steps',
        entries: refs(TIMELINE_IDS, 'tl'),
      },
      {
        _type: 'ctaPanels',
        _key: 'panels',
        background: 'white',
        watermark: 'none',
        panels: items(
          'panels',
          [
            { headline: 'Want us to help you get seen?', cta: cta('Learn more', '/partner', 'dark'), tone: 'lavender' },
            { headline: 'Become a *client.*', cta: cta('Apply to work with us', '/partner', 'primary'), tone: 'navy' },
          ],
          'panel',
        ),
      },
    ],
    'Our team at Reel Good News helps businesses build credibility and shorten the sales cycle, so buyers understand the value before the first conversation.',
  )

  page(
    'page-jenna',
    'Jenna Colombo',
    'about/jenna-colombo',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'navy',
        watermark: 'none',
        art: 'reelPortrait',
        image: img('jenna-cutout.webp', JENNA_CUTOUT_ALT),
        crumbParent: simpleLink('About the Team', '/about'),
        crumbCurrent: 'Jenna Colombo',
        handLine: 'Founder to founder',
        handLinePosition: 'above',
        headline: 'Jenna Colombo helps experts build *credibility and authority.*',
        headingSize: 'default',
        lead: 'Founder, Reel Good News · Co-founder and former CEO, Groundswell Startups',
        ctas: [
          ctaItem('Invite Jenna to speak', '/speaking', 'primary', 'cta1'),
          ctaItem('LinkedIn', '/socials', 'outlineLight', 'cta2'),
        ],
      },
      {
        _type: 'statsBlock',
        _key: 'stats',
        background: 'lavender',
        watermark: 'none',
        variant: 'strip',
        showBadge: false,
        stats: refs(FOUNDER_STATS, 'stat'),
      },
      {
        _type: 'profileBio',
        _key: 'bio',
        background: 'white',
        watermark: 'none',
        intro:
          'Jenna Colombo is the founder of Reel Good News and a growth executive with more than a decade of work that connects founders, investors and industry leaders.',
        body: paragraphs(
          [
            "She is a co-founder and former CEO of Groundswell Startups, the Southeast's largest privately funded technology incubator, where she led partnerships, fundraising and ecosystem development. Member companies raised more than $65M and generated more than $165M in exits. She has coached 250 high-tech founders.",
            'As a strategic growth advisor through MarCom Florida since 2013, she has advised founders and CEOs across technology, aerospace, professional services and manufacturing. As communications executive and co-owner of Helicon Technologies from 2019 to 2023, she raised $2.5M in under nine months and generated 150+ investor meetings. She has also helped client companies earn coverage in Forbes and appearances on Shark Tank.',
            "Today she coaches growth-stage founders as a business coach at the Women's Business Center at Florida Tech. Reel Good News brings that experience to a simple question: how do experts make their value visible to the people who need it?",
          ],
          'bio',
        ),
        quote: 'More content is not the goal. Clear proof of value is.',
        signature: 'Jenna',
        asideEyebrow: 'Now',
        asideText: "Business coach, Women's Business Center at Florida Tech",
      },
      {
        _type: 'timeline',
        _key: 'record',
        background: 'paper',
        watermark: 'none',
        headline: 'The record.',
        style: 'cards',
        entries: refs(TIMELINE_IDS, 'tl'),
      },
      {
        _type: 'testimonials',
        _key: 'words',
        background: 'white',
        watermark: 'none',
        variant: 'grid',
        eyebrow: 'Each with written permission',
        headline: 'Client words.',
        items: refs(
          FOUNDER_TESTIMONIALS.map((t) => t.id),
          'quote',
        ),
      },
      {
        _type: 'mediaBand',
        _key: 'media',
        background: 'ink',
        watermark: 'none',
        eyebrow: 'Media and press',
        text: 'Led growth initiatives that helped SwiftPaws, Kalogon and Helicon Chemical earn Shark Tank and Forbes coverage and major partnership opportunities.',
        links: items('links', [{ label: '[Link to Forbes article]' }, { label: '[Link to Shark Tank episode]' }], 'press'),
        cta: cta('Invite Jenna to speak', '/speaking', 'primary'),
      },
    ],
    'Jenna Colombo, founder of Reel Good News, helps experts build credibility and authority. Co-founder and former CEO of Groundswell Startups.',
  )

  page(
    'page-partner',
    'Partner With Us',
    'partner',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'navy',
        watermark: 'none',
        art: 'steps',
        eyebrow: 'Partner with us · done for you',
        headline: 'We help great experts get *seen.*',
        lead: 'Our team works with a small number of companies at a time. We plan, produce and publish the content that proves expertise. Tell us about the company and we will confirm the fit.',
        ctas: [ctaItem('Apply to work with us', '#apply', 'primary', 'cta1')],
        artSteps: items(
          'artSteps',
          [
            { number: '01', title: 'Record', text: 'One planned day of your time.' },
            { number: '02', title: 'Produce', text: 'Sessions become episodes, reels and posts.' },
            { number: '03', title: 'Publish', text: 'We deliver week by week, all year.' },
          ],
          'artstep',
        ),
      },
      {
        _type: 'statement',
        _key: 'doneforyou',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'Want it done for you?',
        statement: 'We start with a conversation, *not a price list.*',
        body: paragraphs(
          [
            'Some founders prefer a partner who plans, produces and publishes the content for them. Our content packages do that. We build every package around the company’s goals, buyers and sales process.',
            'We are a strategic communications partner, not a video production shop. Strategy comes first, then content at scale.',
          ],
          'partner',
        ),
        bodyStyle: 'lead',
        sideEyebrow: 'What happens next',
        sideList: ['Book a short call.', 'We find where expertise hides today.', 'Receive a tailored recommendation and 10 quick wins.'],
      },
      {
        _type: 'formSection',
        _key: 'apply',
        anchorId: 'apply',
        background: 'white',
        watermark: 'none',
        form: 'partner',
        layout: 'standard',
        headline: 'Apply to work with us.',
        intro: 'Tell us about the company. Our team replies to every application.',
        side: { kind: 'quote', quote: ref('testimonial-marley-hughes') },
        panelTone: 'paper',
        submitLabel: 'Apply to work with us',
        footnote: 'Pricing is shared after the conversation.',
        consentText: 'Optional. [Text-message and email consent paragraph, for counsel to review.]',
        selectOptions: ['1 to 9', '10 to 50', '51 to 300', '300+'],
        successTitle: 'Application received.',
        successBody: 'We read every application and reply within [number] business days.',
        successCtaLabel: 'Back to home',
      },
    ],
    'Our team works with a small number of companies at a time. We plan, produce and publish the content that proves expertise.',
  )

  page(
    'page-contact',
    'Contact',
    'contact',
    [
      {
        _type: 'formSection',
        _key: 'contact',
        background: 'paper',
        watermark: 'none',
        form: 'contact',
        layout: 'hero',
        eyebrow: 'Contact',
        headline: "Let's *talk.*",
        intro: 'Questions about the workshop, the courses or a partnership? Send a note. Our team replies within [number] business days.',
        side: { kind: 'emailCard', emailLabel: 'Email', email: ss.contactEmail, copyLabel: 'Copy' },
        panelTone: 'white',
        submitLabel: 'Send message',
        footnote: 'Protected from spam. Your details go only to our CRM.',
        subjectOptions: ['Workshop', 'Courses', 'Work with us', 'Other'],
        successTitle: 'Message sent.',
        successBody: 'We will reply within [number] business days.',
        successCtaLabel: 'Back to home',
      },
      {
        _type: 'linkCards',
        _key: 'quicklinks',
        background: 'white',
        watermark: 'none',
        items: items(
          'items',
          [
            { eyebrow: 'Quick link', title: 'Reserve a workshop seat', link: link('/workshop') },
            { eyebrow: 'Quick link', title: 'Apply to work with us', link: link('/partner') },
            { eyebrow: 'Quick link', title: 'Book a speaker', link: link('/speaking') },
            { eyebrow: 'Quick link', title: 'Join the talent community', link: link('/careers') },
          ],
          'quick',
        ),
      },
    ],
    'Questions about the workshop, the courses or a partnership? Send a note to our team at Reel Good News.',
  )

  page(
    'page-careers',
    'Careers',
    'careers',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'navy',
        watermark: 'none',
        art: 'reel',
        eyebrow: 'Careers · always open',
        headline: 'Careers at Reel Good News.',
        sublead: 'We look for people who tell clear, honest stories.',
        handLine: 'always open',
        handLinePosition: 'below',
        ctas: [
          ctaItem('View job openings', '#talent', 'primary', 'cta1'),
          ctaItem('Join our talent community', '#talent', 'outlineLight', 'cta2'),
        ],
      },
      {
        _type: 'valuesGrid',
        _key: 'values',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'Six values · draft',
        headline: 'How we work together.',
        style: 'numbered',
        items: items(
          'items',
          [
            { title: 'Tell the truth well.' },
            { title: 'Hold a high standard.' },
            { title: 'Put people over hype.' },
            { title: 'Turn experts into clear stories.' },
            { title: 'Grow through feedback.' },
            { title: 'Win together.' },
          ],
          'value',
        ),
      },
      {
        _type: 'formSection',
        _key: 'talent',
        anchorId: 'talent',
        background: 'white',
        watermark: 'none',
        form: 'talent',
        layout: 'standard',
        headline: 'Join our talent community.',
        intro: 'No open role that fits? Share your details and our team will reach out when one opens.',
        side: {
          kind: 'roles',
          rolesEyebrow: 'Open roles',
          roles: items(
            'roles',
            [
              {
                title: '[Role title]',
                meta: '[Remote or location] · [Type]',
                note: 'Listed roles link to the job board. Where the job board lives is still to decide.',
              },
            ],
            'role',
          ),
        },
        panelTone: 'paper',
        submitLabel: 'Join the community',
        successTitle: 'You are in the talent community.',
        successBody: 'Your details are saved with a Talent tag for future roles.',
        successCtaLabel: 'Back to home',
      },
    ],
    'Careers at Reel Good News. We look for people who tell clear, honest stories.',
  )

  page(
    'page-speaking',
    'Speaking',
    'speaking',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'paper',
        watermark: 'none',
        art: 'portraitCard',
        image: img('jenna-cutout.webp', 'Jenna Colombo, speaker.'),
        artCard: { chip: 'On stage' },
        eyebrow: 'Media · speaking',
        headline: 'Invite Jenna to *speak.*',
        lead: 'Our founder, Jenna Colombo, speaks to founder communities, accelerators and industry groups about how to build credibility and authority online, without hype.',
        chips: ['Founder communities', 'Accelerators', 'Industry groups'],
        ctas: [ctaItem('Send a request', '#request', 'primary', 'cta1')],
      },
      {
        _type: 'gallery',
        _key: 'sessions',
        background: 'navy',
        watermark: 'none',
        style: 'cards',
        eyebrow: 'Groundswell Startups · Melbourne, FL',
        headline: 'Recent sessions.',
        items: items(
          'items',
          [
            galleryImage(
              'promo-hooked.webp',
              'Hooked in 30 Seconds workshop promotion.',
              'Hooked in 30 Seconds',
              'Marketing and Sales Acceleration · September 2025',
            ),
            galleryImage(
              'promo-acceleration.webp',
              'Marketing and Sales Acceleration workshop series promotion.',
              'Workshop Series',
              'Every Thursday in September · with Matt Mayer',
            ),
          ],
          'session',
        ),
        linkCard: {
          eyebrow: 'Next',
          title: 'Reel Good News: Attract More Raving Fans',
          text: 'February 4, 2027 · Noon ET · In person and on Zoom',
          ctaLabel: 'See the workshop',
          link: link('/workshop'),
        },
      },
      {
        _type: 'formSection',
        _key: 'request',
        anchorId: 'request',
        background: 'white',
        watermark: 'none',
        form: 'speaking',
        layout: 'standard',
        headline: 'Tell us about your event.',
        intro: 'Share the basics and we will come back to you about availability and fit.',
        side: { kind: 'none' },
        panelTone: 'paper',
        submitLabel: 'Send the request',
        selectOptions: ['Under 50', '50 to 200', '200+'],
        successTitle: 'Request sent.',
        successBody: 'We will come back to you about availability and fit.',
        successCtaLabel: 'Back to home',
      },
    ],
    'Our founder, Jenna Colombo, speaks to founder communities, accelerators and industry groups about how to build credibility and authority online, without hype.',
  )

  page(
    'page-podcast',
    'Podcast',
    'podcast',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'navy',
        watermark: 'none',
        art: 'podcastCover',
        artCard: { title: 'The\nPodcast', text: 'Hook. Line. Heart.' },
        eyebrow: 'Media · podcast · [show name to confirm]',
        headline: 'The Reel Good News Podcast',
        lead: 'Conversations with founders and experts about credibility, expertise and reputations that sell. New episodes on Spotify and YouTube.',
        ctas: [
          { _type: 'cta', _key: 'cta1', label: 'Listen on Spotify', link: emptyExternal(), style: 'primary' },
          { _type: 'cta', _key: 'cta2', label: 'Watch on YouTube', link: emptyExternal(), style: 'outlineLight' },
        ],
      },
      {
        _type: 'episodes',
        _key: 'episodes',
        background: 'paper',
        watermark: 'none',
        eyebrow: 'First episode · [date]',
        headline: 'Latest episodes.',
        items: items(
          'items',
          ['03', '02', '01'].map((number) => ({
            number,
            guest: '[guest name]',
            title: '[Episode title]',
            summary: '[One-line summary of the conversation.]',
          })),
          'episode',
        ),
      },
      {
        _type: 'formSection',
        _key: 'guest',
        background: 'white',
        watermark: 'none',
        form: 'guest',
        layout: 'standard',
        eyebrow: 'Be a guest',
        headline: 'Want to be on the show?',
        intro: 'Share a name, a company and a topic.',
        side: { kind: 'none' },
        panelTone: 'lavender-tint',
        submitLabel: 'Pitch me as a guest',
        successTitle: 'Pitch received.',
        successBody: 'Thanks. We will be in touch if it is a fit for the show.',
        successCtaLabel: 'Back to home',
      },
    ],
    'Conversations with founders and experts about credibility, expertise and reputations that sell.',
  )

  page(
    'page-socials',
    'Socials',
    'socials',
    [
      {
        _type: 'pageHero',
        _key: 'hero',
        background: 'paper',
        watermark: 'none',
        art: 'linkedinCard',
        eyebrow: 'Media · socials',
        headline: 'Follow *along.*',
        headingSize: 'xl',
        lead: 'Practical ideas on credibility, authority and expertise, shared where founders spend their time.',
        artCard: {
          title: 'Follow on LinkedIn',
          text: 'The primary channel. Other channels appear here when they exist.',
          link: emptyExternal(),
        },
      },
      {
        _type: 'socialFeed',
        _key: 'feed',
        background: 'white',
        watermark: 'none',
        eyebrow: 'Sample posts · live feed when connected',
        headline: 'From the feed.',
        cards: items(
          'cards',
          [
            { style: 'logoLine', text: 'Hook. Line. *Heart.*', caption: 'A simple structure for content people finish' },
            { style: 'quote', text: "Guarantee the work you control. Be honest about the outcomes you don't." },
            { style: 'rule', eyebrow: 'Decision rule', text: 'No baseline, no budget.', caption: 'Count What Counts' },
            { style: 'big', eyebrow: '1 → 365', text: 'One day of your time. 365 days of authority.' },
          ],
          'card',
        ),
      },
    ],
    'Practical ideas on credibility, authority and expertise, shared where founders spend their time.',
  )

  return docs
}
