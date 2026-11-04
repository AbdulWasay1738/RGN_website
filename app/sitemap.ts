import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'
import { SITEMAP_QUERY } from '@/lib/sanity/queries'
import { absoluteUrl } from '@/lib/seo'

type Entry = { slug?: string; _updatedAt?: string } | null

type SitemapData = {
  pages?: Entry[]
  courses?: Entry[]
  posts?: Entry[]
  legal?: Entry[]
  workshop?: Entry
  bundle?: Entry
  book?: Entry
  assessment?: Entry
  blog?: Entry
}

export const revalidate = 3600

/** Every visible page. Hidden pages (book, podcast) and pages marked noIndex drop out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let data: SitemapData | null = null
  try {
    data = await sanityFetch<SitemapData | null>({
      query: SITEMAP_QUERY,
      tags: ['page', 'course', 'post', 'legalPage', 'workshop', 'bundle', 'book', 'assessment', 'blogSettings'],
    })
  } catch {
    data = null
  }

  const out: MetadataRoute.Sitemap = []
  const add = (path: string, updated?: string, priority = 0.6) =>
    out.push({ url: absoluteUrl(path), lastModified: updated ? new Date(updated) : undefined, priority })

  for (const p of data?.pages ?? []) {
    if (!p?.slug) continue
    if (p.slug === 'home') add('/', p._updatedAt, 1)
    else add(`/${p.slug.replace(/^\/+/, '')}`, p._updatedAt)
  }
  if (data?.workshop) add('/workshop', data.workshop._updatedAt, 0.9)
  for (const c of data?.courses ?? []) if (c?.slug) add(`/courses/${c.slug}`, c._updatedAt, 0.9)
  if (data?.bundle) add('/courses/content-machine', data.bundle._updatedAt, 0.8)
  if (data?.book) add('/book', data.book._updatedAt)
  if (data?.assessment) add('/assessment', data.assessment._updatedAt, 0.8)
  if (data?.blog) add('/blog', data.blog._updatedAt, 0.7)
  for (const p of data?.posts ?? []) if (p?.slug) add(`/blog/${p.slug}`, p._updatedAt, 0.6)
  for (const l of data?.legal ?? []) if (l?.slug) add(`/legal/${l.slug}`, l._updatedAt, 0.2)

  // De-duplicate in case a page-builder page shares a fixed route's path.
  const seen = new Set<string>()
  return out.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)))
}
