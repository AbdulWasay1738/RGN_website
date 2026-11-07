/**
 * GROQ queries. The result shapes are described in ./types.ts.
 * Use with sanityFetch({query, params, tags}) from ./fetch.ts.
 */
import { defineQuery } from 'next-sanity'

/* ---------------- fragments ---------------- */

const FAQ = `_id, _type, question, answer, tags`
const TESTIMONIAL = `_id, _type, quote, name, company, permissionConfirmed`
const STAT = `_id, _type, value, prefix, suffix, label, footnote`
const TIMELINE = `_id, _type, years, year, homeLabel, organisation, description, shortDescription, homeSummary, highlight, order`
const TEAM = `_id, _type, name, title, photo, cutout, bio, link, linkLabel, order`
const COURSE_CARD = `title, "slug": slug.current, word, stepNumber, courseNumber, summary, shortLine, regularPrice, introPrice`

/** Fields the home offer grid needs for each offer type. */
const OFFER_CARD = `
  _id, _type,
  _type == "workshop" => {
    title, card, stepLabel, heroChips, earlyBirdPrice, standardPrice, reserveLabel, priceNotes,
    stub, seatsLine, soldOutLine, zoomChip
  },
  _type == "course" => { ${COURSE_CARD} },
  _type == "bundle" => { title, price, introPrice, compareAt, compareAtIntro, card },
  _type == "book" => { title, hidden, card, coverAccentWord, coverRest, author }
`

/** Expands references inside page-builder sections. Images and links stay as stored. */
export const SECTION_PROJECTION = `
  ...,
  _type == "offerGrid" => { items[]->{ ${OFFER_CARD} } },
  _type == "assessmentCta" => {
    "areas": *[_id == "assessment"][0].areas[]{ _key, name },
    "reportMock": *[_id == "assessment"][0].reportMock
  },
  _type == "statsBlock" => { stats[]->{ ${STAT} } },
  _type == "testimonials" => { items[]->{ ${TESTIMONIAL} } },
  _type == "founderStory" => { timeline[]->{ ${TIMELINE} } },
  _type == "faqBlock" => { faqs[]->{ ${FAQ} } },
  _type == "timeline" => { entries[]->{ ${TIMELINE} } },
  _type == "teamGrid" => { members[]->{ ${TEAM} } },
  _type == "formSection" => { side{ ..., quote->{ ${TESTIMONIAL} } } }
`

/* ---------------- layout ---------------- */

export const LAYOUT_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    ...,
    headerNav[]{ ..., dropdown{ ..., items[]{ ..., priceFromCourse->{ shortLine, regularPrice, introPrice } } } }
  },
  "banner": *[_id == "announcementBanner"][0],
  "calendar": *[_id == "salesCalendar"][0],
  "courses": *[_type == "course"] | order(orderRank asc, order asc){ _id, _type, ${COURSE_CARD} },
  "workshop": *[_id == "workshop"][0]{ title, earlyBirdPrice, standardPrice, dateLabel, timeLabel, venue },
  "bundle": *[_id == "bundle"][0]{ title, price, introPrice, compareAt, compareAtIntro },
  "book": *[_id == "book"][0]{ hidden, title, preorderUrl, noLinkMessage },
  "hiddenHrefs": [
    ...*[_type == "page" && hidden == true && defined(slug.current)]{ "href": "/" + slug.current }.href,
    ...*[_id == "book" && hidden == true]{ "href": "/book" }.href
  ]
}`)

/* ---------------- page builder ---------------- */

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id, _type, title, "slug": slug.current, hidden, seo,
  sections[hidden != true]{ ${SECTION_PROJECTION} }
}`)

export const PAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current) && slug.current != "home" && hidden != true].slug.current`,
)

/* ---------------- offers ---------------- */

export const WORKSHOP_QUERY = defineQuery(`*[_id == "workshop"][0]{
  ..., "slug": slug.current, faqs[]->{ ${FAQ} },
  "growthCallLink": *[_id == "growthCall"][0]{ workshopLine, workshopLinkLabel }
}`)

export const COURSE_PAGE_QUERY = defineQuery(`{
  "course": *[_type == "course" && slug.current == $slug][0]{ ..., "slug": slug.current, faqs[]->{ ${FAQ} } },
  "courses": *[_type == "course"] | order(orderRank asc, order asc){ _id, ${COURSE_CARD} },
  "template": *[_id == "courseTemplate"][0],
  "bundle": *[_id == "bundle"][0]{ price, introPrice, compareAt, compareAtIntro }
}`)

export const COURSE_SLUGS_QUERY = defineQuery(`*[_type == "course" && defined(slug.current)].slug.current`)

export const BUNDLE_PAGE_QUERY = defineQuery(`{
  "bundle": *[_id == "bundle"][0]{
    ..., "slug": slug.current,
    path{ ..., items[]{ ..., course->{ _id, title, fullTitle, "slug": slug.current, regularPrice, introPrice, word, stepNumber } } },
    faqs[]->{ ${FAQ} }
  },
  "courses": *[_type == "course"] | order(orderRank asc, order asc){ _id, ${COURSE_CARD} }
}`)

export const GROWTH_CALL_QUERY = defineQuery(`*[_id == "growthCall"][0]`)

export const BOOK_QUERY = defineQuery(`*[_id == "book"][0]`)

/* ---------------- assessment and order ---------------- */

export const ASSESSMENT_QUERY = defineQuery(`*[_id == "assessment"][0]`)

export const ORDER_QUERY = defineQuery(`*[_id == "orderConfirmation"][0]{
  ..., upsells[]{ ..., course->{ regularPrice, introPrice } }
}`)

/* ---------------- blog ---------------- */

const POST_SUMMARY = `
  _id, title, "slug": slug.current, number, coverLine, topic, featured, publishedAt,
  "excerpt": coalesce(excerpt, pt::text(body[_type == "block" && style == "normal"][0])),
  "readingTime": round(length(pt::text(body)) / 1100),
  author->{ name, title, photo }
`

export const BLOG_SETTINGS_QUERY = defineQuery(`*[_id == "blogSettings"][0]`)

export const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(number asc){ ${POST_SUMMARY} }`,
)

export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _type, ${POST_SUMMARY}, body, sources, seo
}`)

export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)].slug.current`)

/* ---------------- legal ---------------- */

export const LEGAL_QUERY = defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{
  ..., "slug": slug.current
}`)

export const LEGAL_NAV_QUERY = defineQuery(
  `*[_type == "legalPage" && defined(slug.current)] | order(orderRank asc, order asc){ _id, title, navLabel, "slug": slug.current }`,
)

/* ---------------- sitemap ---------------- */

export const SITEMAP_QUERY = defineQuery(`{
  "pages": *[_type == "page" && hidden != true && seo.noIndex != true && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "courses": *[_type == "course" && seo.noIndex != true && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "posts": *[_type == "post" && seo.noIndex != true && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "legal": *[_type == "legalPage" && seo.noIndex != true && defined(slug.current)]{ "slug": slug.current, _updatedAt },
  "workshop": *[_id == "workshop" && seo.noIndex != true][0]{ _updatedAt },
  "bundle": *[_id == "bundle" && seo.noIndex != true][0]{ _updatedAt },
  "book": *[_id == "book" && hidden != true && seo.noIndex != true][0]{ _updatedAt },
  "assessment": *[_id == "assessment" && seo.noIndex != true][0]{ _updatedAt },
  "growthCall": *[_id == "growthCall" && seo.noIndex != true][0]{ _updatedAt },
  "blog": *[_id == "blogSettings"][0]{ _updatedAt }
}`)
