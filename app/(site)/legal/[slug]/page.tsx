import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '@/components/features/legal/legal.module.css'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { LEGAL_NAV_QUERY, LEGAL_QUERY } from '@/lib/sanity/queries'
import type { LegalPage } from '@/lib/sanity/types'
import { breadcrumbLd, buildMetadata } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }
type LegalNavItem = Pick<LegalPage, '_id' | 'title' | 'navLabel' | 'slug'>

const getLegal = (slug: string) => sanityFetch<LegalPage | null>({ query: LEGAL_QUERY, params: { slug }, tags: ['legalPage'] })
const getNav = () => sanityFetch<LegalNavItem[] | null>({ query: LEGAL_NAV_QUERY, tags: ['legalPage'] })

export async function generateStaticParams() {
  try {
    const nav = await getNav()
    return (nav ?? []).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [page, { settings }] = await Promise.all([getLegal(slug), getLayoutData()])
  if (!page) return {}
  return buildMetadata({ seo: page.seo, title: page.title, path: `/legal/${slug}`, settings })
}

function formatUpdated(value?: string) {
  if (!value) return '[date]'
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d)
}

/** "Template." in bold, then the rest of the banner text. */
function TemplateBanner({ text }: { text?: string }) {
  if (!text) return null
  const [first, ...rest] = text.split(' ')
  const bold = first.endsWith('.')
  return (
    <p className={styles.banner} role="note">
      {bold ? (
        <>
          <strong>{first}</strong> {rest.join(' ')}
        </>
      ) : (
        text
      )}
    </p>
  )
}

/** One template for all four legal pages, with a side nav between them. */
export default async function LegalPageRoute({ params }: Params) {
  const { slug } = await params
  const [page, nav] = await Promise.all([getLegal(slug), getNav()])
  if (!page) notFound()

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: page.title ?? 'Legal', path: `/legal/${slug}` }])} />
      <section className="paper">
        <div className={`wrap stack g12 ${styles.header}`}>
          <span className="eyebrow">Legal</span>
          <h1 className={`h1 ${styles.title}`}>{page.title}</h1>
          <span className="muted">Last updated {formatUpdated(page.lastUpdated)}</span>
        </div>
      </section>
      <section className={`band ${styles.band}`}>
        <div className={`wrap row g64 ${styles.layout}`}>
          {nav?.length ? (
            <nav className={`side stack g8 ${styles.nav}`} aria-label="Legal pages">
              {nav
                .filter((item) => item.slug)
                .map((item) => (
                  <Link
                    key={item._id}
                    href={`/legal/${item.slug}`}
                    className={styles.navLink}
                    aria-current={item.slug === slug ? 'page' : undefined}
                  >
                    {item.navLabel ?? item.title}
                  </Link>
                ))}
            </nav>
          ) : null}
          <article className={`grow article ${styles.article}`} key={slug}>
            {page.templateBanner ? <TemplateBanner text={page.templateBannerText} /> : null}
            <RichText value={page.body} />
          </article>
        </div>
      </section>
    </>
  )
}
