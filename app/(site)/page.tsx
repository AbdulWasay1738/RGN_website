import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { JsonLd } from '@/components/ui/JsonLd'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { PAGE_QUERY } from '@/lib/sanity/queries'
import type { FaqBlockSection, Page } from '@/lib/sanity/types'
import { buildMetadata, faqPageLd } from '@/lib/seo'
import { clean } from '@/lib/text'

export const revalidate = 60

const getHome = cache(() =>
  sanityFetch<Page | null>({
    query: PAGE_QUERY,
    params: { slug: 'home' },
    tags: [
      'page',
      'course',
      'workshop',
      'bundle',
      'book',
      'faq',
      'stat',
      'testimonial',
      'timelineEntry',
      'assessment',
      'courseTemplate',
    ],
  }),
)

export async function generateMetadata(): Promise<Metadata> {
  const [page, layout] = await Promise.all([getHome(), getLayoutData()])
  // The home page title comes from its SEO fields or the site defaults, never the internal page name.
  return buildMetadata({ seo: page?.seo, path: '/', settings: layout.settings, isHome: true })
}

export default async function HomePage() {
  const page = await getHome()
  if (!page) notFound()
  const faqSection = page.sections?.find((s) => clean(s._type) === 'faqBlock') as FaqBlockSection | undefined
  return (
    <>
      <SectionRenderer sections={page.sections} pageTitle={page.title} />
      <JsonLd data={faqPageLd(faqSection?.faqs)} />
    </>
  )
}
