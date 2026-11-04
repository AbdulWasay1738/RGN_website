import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { JsonLd } from '@/components/ui/JsonLd'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { PAGE_QUERY, PAGE_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { Faq, Page } from '@/lib/sanity/types'
import { breadcrumbLd, buildMetadata, faqPageLd } from '@/lib/seo'
import { clean, plainText } from '@/lib/text'

/**
 * Page-builder pages: About, Partner, Contact, Careers, Speaking, Podcast,
 * Socials, the founder page (slug "about/jenna-colombo") and any page the
 * client builds from sections. Hidden pages return 404.
 */
export const revalidate = 60

const PAGE_TAGS = ['page', 'faq', 'testimonial', 'stat', 'timelineEntry', 'teamMember', 'course', 'workshop', 'bundle', 'book', 'assessment']

const PARENT_TITLE_QUERY = `*[_type == "page" && slug.current == $slug && hidden != true][0]{ title }`

type Params = { slug: string[] }

function slugFrom(parts: string[] | undefined) {
  return (parts ?? []).map((p) => decodeURIComponent(p)).join('/')
}

async function getPage(slug: string) {
  return sanityFetch<Page | null>({ query: PAGE_QUERY, params: { slug }, tags: PAGE_TAGS })
}

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await sanityFetch<string[] | null>({ query: PAGE_SLUGS_QUERY, tags: ['page'] })
  return (slugs ?? [])
    .map((s) => clean(s))
    .filter((s): s is string => !!s && s !== 'home')
    .map((s) => ({ slug: s.split('/').filter(Boolean) }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const slug = slugFrom((await params).slug)
  if (!slug || slug === 'home') return {}
  const [page, layout] = await Promise.all([getPage(slug), getLayoutData()])
  if (!page || page.hidden) return {}
  const hero = page.sections?.find((s) => s._type === 'pageHero' || s._type === 'formSection')
  const description = hero && 'lead' in hero && hero.lead ? hero.lead : hero && 'intro' in hero ? hero.intro : undefined
  return buildMetadata({ seo: page.seo, title: page.title, description, path: `/${slug}`, settings: layout.settings })
}

export default async function BuilderPage({ params }: { params: Promise<Params> }) {
  const slug = slugFrom((await params).slug)
  if (slug === 'home') redirect('/')
  if (!slug) notFound()

  const page = await getPage(slug)
  if (!page || page.hidden) notFound()

  const parts = slug.split('/')
  const crumbs: Array<{ name: string; path: string }> = [{ name: 'Home', path: '/' }]
  if (parts.length > 1) {
    const parentSlug = parts.slice(0, -1).join('/')
    const parent = await sanityFetch<{ title?: string } | null>({ query: PARENT_TITLE_QUERY, params: { slug: parentSlug }, tags: ['page'] })
    if (parent?.title) crumbs.push({ name: plainText(parent.title), path: `/${parentSlug}` })
  }
  crumbs.push({ name: plainText(page.title) || slug, path: `/${slug}` })

  const faqs: Faq[] = (page.sections ?? []).flatMap((s) => (s._type === 'faqBlock' ? (s.faqs ?? []) : []))

  return (
    <>
      <SectionRenderer sections={page.sections} pageTitle={page.title} />
      <JsonLd data={[breadcrumbLd(crumbs), faqPageLd(faqs)]} />
    </>
  )
}
