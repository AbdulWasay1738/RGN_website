import type { Metadata } from 'next'
import { siteUrl } from './sanity/env'
import { imageUrlFor } from './sanity/image'
import type { Faq, Seo, SiteSettings } from './sanity/types'
import { plainText } from './text'

const DEFAULT_TEMPLATE = '%s · Reel Good News'
const DEFAULT_OG = '/og-default.jpg'

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Page metadata with fallbacks: page SEO fields, then the page's own title and
 * description, then the site defaults from Site settings.
 */
export function buildMetadata({
  seo,
  title,
  description,
  path,
  settings,
  isHome = false,
  type = 'website',
  publishedTime,
}: {
  seo?: Seo | null
  title?: string | null
  description?: string | null
  path: string
  settings?: SiteSettings | null
  isHome?: boolean
  type?: 'website' | 'article'
  publishedTime?: string
}): Metadata {
  const defaults = settings?.defaultSeo
  const template = plainText(defaults?.titleTemplate) || DEFAULT_TEMPLATE
  const siteName = plainText(settings?.title) || 'Reel Good News'
  const rawTitle = plainText(seo?.metaTitle) || plainText(title) || plainText(defaults?.metaTitle) || siteName
  const fullTitle = isHome && !seo?.metaTitle ? rawTitle : template.includes('%s') ? template.replace('%s', rawTitle) : rawTitle
  const desc = plainText(seo?.metaDescription) || plainText(description) || plainText(defaults?.metaDescription) || undefined
  const og = imageUrlFor(seo?.ogImage, 1200, 630) || imageUrlFor(defaults?.ogImage, 1200, 630) || DEFAULT_OG
  const url = absoluteUrl(path)
  const noIndex = !!seo?.noIndex
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      title: fullTitle,
      description: desc,
      siteName,
      images: [{ url: absoluteUrl(og), width: 1200, height: 630 }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [absoluteUrl(og)],
    },
  }
}

/* ---------------- JSON-LD ---------------- */

export type JsonLdObject = Record<string, unknown>

export function organizationLd(settings?: SiteSettings | null): JsonLdObject {
  const org = settings?.organization
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: plainText(org?.name) || 'Reel Good News',
    url: org?.url || siteUrl,
    logo: absoluteUrl(imageUrlFor(org?.logo ?? settings?.logo, 600) || '/img/logo.png'),
    sameAs: (org?.sameAs ?? []).filter((s) => /^https?:\/\//.test(s)),
    ...(settings?.contactEmail ? { email: settings.contactEmail } : {}),
  }
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: plainText(it.name),
      item: absoluteUrl(it.path),
    })),
  }
}

export function faqPageLd(faqs?: Faq[] | null): JsonLdObject | null {
  const list = (faqs ?? []).filter((f) => f.question && f.answer)
  if (!list.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: plainText(f.question),
      acceptedAnswer: { '@type': 'Answer', text: plainText(f.answer) },
    })),
  }
}

export function courseLd(opts: { name: string; description?: string; path: string; price?: number }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: plainText(opts.name),
    description: plainText(opts.description),
    url: absoluteUrl(opts.path),
    provider: { '@type': 'Organization', name: 'Reel Good News', sameAs: siteUrl },
    ...(typeof opts.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: absoluteUrl(opts.path),
            category: 'Paid',
          },
        }
      : {}),
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT2H' },
  }
}

export function eventLd(opts: {
  name: string
  description?: string
  startDate: string
  venue?: string
  path: string
  price?: number
  soldOutInPerson?: boolean
  image?: string
}): JsonLdObject {
  const venueKnown = opts.venue && !/^\[.*\]$/.test(plainText(opts.venue))
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: plainText(opts.name),
    description: plainText(opts.description),
    startDate: opts.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: [
      { '@type': 'VirtualLocation', url: absoluteUrl(opts.path) },
      ...(venueKnown ? [{ '@type': 'Place', name: plainText(opts.venue) }] : []),
    ],
    organizer: { '@type': 'Organization', name: 'Reel Good News', url: siteUrl },
    url: absoluteUrl(opts.path),
    ...(opts.image ? { image: [absoluteUrl(opts.image)] } : {}),
    ...(typeof opts.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: absoluteUrl(opts.path),
          },
        }
      : {}),
  }
}

export function bookLd(opts: { name: string; author?: string; description?: string; path: string }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: plainText(opts.name),
    author: opts.author ? { '@type': 'Person', name: plainText(opts.author) } : undefined,
    description: plainText(opts.description),
    url: absoluteUrl(opts.path),
    publisher: { '@type': 'Organization', name: 'Reel Good News' },
  }
}

export function blogPostingLd(opts: {
  title: string
  description?: string
  path: string
  publishedAt?: string
  author?: string
  image?: string
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: plainText(opts.title),
    description: plainText(opts.description),
    url: absoluteUrl(opts.path),
    mainEntityOfPage: absoluteUrl(opts.path),
    ...(opts.publishedAt ? { datePublished: opts.publishedAt } : {}),
    author: { '@type': 'Person', name: plainText(opts.author) || 'Jenna Colombo' },
    publisher: { '@type': 'Organization', name: 'Reel Good News', logo: { '@type': 'ImageObject', url: absoluteUrl('/img/logo.png') } },
    ...(opts.image ? { image: [absoluteUrl(opts.image)] } : {}),
  }
}
