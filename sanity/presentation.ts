/**
 * Presentation tool: which page shows a document (locations), and which
 * document a page is mainly about (mainDocuments), so the Studio can open the
 * right editor beside the live preview.
 */
import { defineDocuments, defineLocations, type DocumentLocationResolvers } from 'sanity/presentation'

const pageHref = (slug?: string) => (!slug || slug === 'home' ? '/' : `/${slug}`)

const everywhere = {
  locations: [{ title: 'Home page', href: '/' }],
  message: 'Used on every page.',
  tone: 'positive' as const,
}

const libraryMessage = (what: string) => ({
  message: `${what} show on the pages whose sections pick them.`,
  tone: 'positive' as const,
})

export const locations: DocumentLocationResolvers = {
  page: defineLocations({
    select: { title: 'title', slug: 'slug.current', hidden: 'hidden' },
    resolve: (doc) => ({
      locations: [{ title: doc?.title || 'Untitled page', href: pageHref(doc?.slug) }],
      ...(doc?.hidden ? { message: 'This page is hidden and shows "page not found" to visitors.', tone: 'caution' as const } : {}),
    }),
  }),
  course: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || 'Course', href: `/courses/${doc?.slug ?? ''}` },
        { title: 'Home page', href: '/' },
        { title: 'Content Machine bundle', href: '/courses/content-machine' },
      ],
    }),
  }),
  courseTemplate: defineLocations({
    locations: [
      { title: 'Attract the Right Audience', href: '/courses/attract-the-right-audience' },
      { title: 'Build a Year of Content', href: '/courses/build-a-year-of-content' },
      { title: 'Reach the Right Audience', href: '/courses/reach-the-right-audience' },
    ],
  }),
  workshop: defineLocations({
    locations: [
      { title: 'Workshop', href: '/workshop' },
      { title: 'Home page', href: '/' },
    ],
  }),
  growthCall: defineLocations({
    locations: [
      { title: 'Growth strategy call', href: '/growth-strategy' },
      { title: 'Workshop', href: '/workshop' },
    ],
  }),
  bundle: defineLocations({
    locations: [
      { title: 'Content Machine bundle', href: '/courses/content-machine' },
      { title: 'Home page', href: '/' },
    ],
  }),
  book: defineLocations({
    select: { hidden: 'hidden' },
    resolve: (doc) => ({
      locations: [{ title: 'Book', href: '/book' }],
      ...(doc?.hidden ? { message: 'The book page is hidden from visitors.', tone: 'caution' as const } : {}),
    }),
  }),
  assessment: defineLocations({
    locations: [
      { title: 'Assessment', href: '/assessment' },
      { title: 'Thank-you page', href: '/assessment/thank-you' },
    ],
  }),
  orderConfirmation: defineLocations({
    locations: [
      { title: 'Workshop order (sample)', href: '/order/confirmed?demo=1' },
      { title: 'Course order (sample)', href: '/order/confirmed?demo=1&offer=attract-the-right-audience' },
    ],
  }),
  blogSettings: defineLocations({ locations: [{ title: 'Blog', href: '/blog' }] }),
  post: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({
      locations: [
        { title: doc?.title || 'Post', href: `/blog/${doc?.slug ?? ''}` },
        { title: 'Blog', href: '/blog' },
      ],
    }),
  }),
  legalPage: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({ locations: [{ title: doc?.title || 'Legal page', href: `/legal/${doc?.slug ?? ''}` }] }),
  }),
  siteSettings: defineLocations(everywhere),
  announcementBanner: defineLocations(everywhere),
  salesCalendar: defineLocations({
    locations: [
      { title: 'Home page', href: '/' },
      { title: 'Workshop', href: '/workshop' },
      { title: 'Attract the Right Audience', href: '/courses/attract-the-right-audience' },
    ],
    message: 'Dates and seats change prices, labels and countdowns across the site.',
    tone: 'positive',
  }),
  faq: defineLocations(libraryMessage('Questions')),
  testimonial: defineLocations(libraryMessage('Testimonials')),
  stat: defineLocations(libraryMessage('Proof numbers')),
  teamMember: defineLocations(libraryMessage('Team members')),
  timelineEntry: defineLocations(libraryMessage('Timeline entries')),
}

/** First match wins, so specific routes come before the page-builder catch-all. */
export const mainDocuments = defineDocuments([
  { route: '/', filter: `_type == "page" && slug.current == "home"` },
  { route: '/workshop', type: 'workshop' },
  { route: '/courses/content-machine', type: 'bundle' },
  { route: '/courses/:slug', filter: `_type == "course" && slug.current == $slug` },
  { route: '/book', type: 'book' },
  { route: ['/assessment', '/assessment/questions', '/assessment/thank-you'], type: 'assessment' },
  { route: '/order/confirmed', type: 'orderConfirmation' },
  { route: '/growth-strategy', type: 'growthCall' },
  { route: '/blog', type: 'blogSettings' },
  { route: '/blog/:slug', filter: `_type == "post" && slug.current == $slug` },
  { route: '/legal/:slug', filter: `_type == "legalPage" && slug.current == $slug` },
  {
    route: ['/:a', '/:a/:b', '/:a/:b/:c'],
    filter: `_type == "page" && slug.current == $slug`,
    params: ({ path }) => ({ slug: path.replace(/^\/+|\/+$/g, '') }),
  },
])
