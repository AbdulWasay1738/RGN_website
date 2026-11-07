import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '@/components/features/bundle/bundle.module.css'
import { AccentText } from '@/components/ui/AccentText'
import { Accordion } from '@/components/ui/Accordion'
import { CtaLink } from '@/components/ui/Button'
import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { BundlePrice, BundlePriceText, BuyButton } from '@/components/ui/Commerce'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { sanityFetch } from '@/lib/sanity/fetch'
import { bundlePriceParts, calendarDates, isIntro } from '@/lib/sales-calendar'
import { getLayoutData } from '@/lib/sanity/layout'
import { BUNDLE_PAGE_QUERY } from '@/lib/sanity/queries'
import type { Bundle, Course } from '@/lib/sanity/types'
import { absoluteUrl, breadcrumbLd, buildMetadata, faqPageLd } from '@/lib/seo'
import { bundlePriceTokens, formatUsd, interpolate, plainText } from '@/lib/text'

type BundlePageData = { bundle: Bundle | null; courses: Course[] | null }

const PATH = '/courses/content-machine'

/** Colours of the three fanned course covers (prototype): background, number outline, word. */
const FAN_STYLE = [
  { bg: '#13233F', stroke: '#3A4B6A', word: '#C6A7ED', left: '6%', top: 70, rotate: -14, delay: '.3s' },
  { bg: '#1C3058', stroke: '#4A5B7A', word: '#C6A7ED', left: '24%', top: 30, rotate: -2, delay: '.45s' },
  { bg: '#F23300', stroke: '#091527', word: '#091527', left: '42%', top: 60, rotate: 10, delay: '.6s' },
]

const getData = () => sanityFetch<BundlePageData>({ query: BUNDLE_PAGE_QUERY, tags: ['bundle', 'course', 'faq'] })

export async function generateMetadata(): Promise<Metadata> {
  const [data, layout] = await Promise.all([getData(), getLayoutData()])
  const b = data?.bundle
  return buildMetadata({ seo: b?.seo, title: b?.title, description: b?.subline, path: PATH, settings: layout.settings })
}

export default async function BundlePage() {
  const [data, layout] = await Promise.all([getData(), getLayoutData()])
  const b = data?.bundle
  if (!b) notFound()

  const courses = data.courses ?? []
  const chips = b.chips ?? []
  const pathItems = (b.path?.items ?? []).filter((it) => it.course)
  const tableCourses = pathItems.length ? pathItems.map((it) => it.course!) : courses
  const separateTotal = tableCourses.reduce((sum, c) => sum + (c.regularPrice ?? 0), 0)
  const separateIntroTotal = tableCourses.reduce((sum, c) => sum + (c.introPrice ?? c.regularPrice ?? 0), 0)
  const prices = {
    ...b,
    compareAt: b.compareAt ?? (separateTotal || undefined),
    compareAtIntro: b.compareAtIntro ?? (separateIntroTotal || undefined),
  }
  const tokens = bundlePriceTokens(prices)
  const maths = b.maths ?? {}
  const pair = b.pairWithWorkshop ?? {}

  // Structured data follows the price on the server clock (the page regenerates every minute).
  const dates = calendarDates(layout.calendar)
  const serverNow = new Date()
  const offerPrice = bundlePriceParts(prices, serverNow, dates).now
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plainText(b.title),
    description: plainText(b.subline),
    url: absoluteUrl(PATH),
    brand: { '@type': 'Brand', name: 'Reel Good News' },
    ...(typeof b.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: offerPrice,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: absoluteUrl(PATH),
            ...(isIntro(serverNow, dates) && offerPrice !== b.price ? { priceValidUntil: dates.introEndsAt.toISOString().slice(0, 10) } : {}),
          },
        }
      : {}),
  }

  return (
    <>
      <JsonLd
        data={[
          productLd,
          faqPageLd(b.faqs),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: b.title ?? 'The Content Machine', path: PATH },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="navy">
        <div className={`wrap row g48 ${styles.heroRow}`}>
          <div className="grow stack g20">
            <nav className="crumb fade-up" aria-label="Breadcrumb">
              <Link href="/">Home</Link> / Courses /{' '}
              <span className="here" aria-current="page">
                {b.title}
              </span>
            </nav>
            {chips.length ? (
              <div className="row g8 fade-up">
                {chips.map((c, i) => (
                  <span key={c} className={`chip ${i === 0 ? 'chip-lv' : 'chip-line'}`}>
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <AccentText as="h1" className="h1 fade-up" style={{ ['--dl' as string]: '.1s' }} text={b.headline ?? b.title} />
            {b.subline ? (
              <p className={`fade-up ${styles.subline}`} style={{ ['--dl' as string]: '.2s' }}>
                {b.subline}
              </p>
            ) : null}
            <div className="row g24 center fade-up" style={{ ['--dl' as string]: '.3s' }}>
              <BuyButton offer={{ kind: 'bundle' }} trackId="buy_bundle">
                {b.ctaLabel}
              </BuyButton>
              {typeof b.price === 'number' ? (
                <span className="price">
                  <BundlePrice
                    bundle={prices}
                    introLabel={b.introLabel}
                    saveLabel={b.saveLabel}
                    nowClassName={styles.heroNow}
                    wasClassName={styles.heroWas}
                  />
                </span>
              ) : null}
            </div>
          </div>
          <div className={`side fade-up ${styles.fan}`} style={{ ['--dl' as string]: '.25s' }} aria-hidden="true">
            {courses.slice(0, 3).map((c, i) => {
              const s = FAN_STYLE[i]
              return (
                <div
                  key={c._id}
                  className={styles.fanCard}
                  style={{ left: s.left, top: s.top, background: s.bg, transform: `rotate(${s.rotate}deg)`, animationDelay: s.delay }}
                >
                  <span className={styles.fanWord} style={{ color: s.word }}>
                    {c.word}
                  </span>
                  <span className={styles.fanNum} style={{ WebkitTextStrokeColor: s.stroke }}>
                    {Number(c.stepNumber) || c.courseNumber}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* The path */}
      {pathItems.length ? (
        <section className="band paper">
          <div className="wrap narrow stack g20">
            {b.path?.eyebrow ? <span className="eyebrow">{b.path.eyebrow}</span> : null}
            <AccentText as="h2" className={`h2 ${styles.pathHead}`} text={b.path?.headline} />
            <ol className="stack g20" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {pathItems.map((it, i) => {
                const c = it.course!
                const last = i === pathItems.length - 1
                return (
                  <li key={it._key} className={i === 1 ? styles.offset1 : i >= 2 ? styles.offset2 : undefined}>
                    <Link href={c.slug ? `/courses/${c.slug}` : PATH} className={`card lift rv ${styles.pathCard}`}>
                      <span className={`${styles.pathNum} ${last ? styles.pathNumLast : ''}`} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className={`stack ${styles.pathCopy}`}>
                        <span className={styles.pathLine}>{it.line}</span>
                        <span className="muted">
                          {c.title}
                          {typeof c.regularPrice === 'number' ? ` · ${b.path?.regularPriceLabel ?? 'regular price'} $${c.regularPrice}` : ''}
                        </span>
                      </span>
                      <span className={styles.pathArrow}>
                        <Icon name="arrow" />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {/* The math */}
      <section className="band">
        <div className={`wrap row g48 ${styles.mathsRow}`}>
          <div className="side stack g16 rv">
            {maths.eyebrow ? <span className="eyebrow">{maths.eyebrow}</span> : null}
            <AccentText as="h2" className="h2" text={maths.headline} />
            {maths.body || maths.bodyIntro ? (
              <p className="lead">
                <DateSwitch
                  rule="intro"
                  whenTrue={interpolate(maths.bodyIntro || maths.body, tokens)}
                  whenFalse={interpolate(maths.body, tokens)}
                />
              </p>
            ) : null}
          </div>
          <div className={`grow panel rv ${styles.tablePanel}`}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">{maths.courseColumn}</th>
                  {/* The intro column shows only while intro prices apply. */}
                  <DateSwitch
                    rule="intro"
                    whenTrue={
                      <th scope="col" className={styles.priceHead}>
                        {maths.introColumn}
                      </th>
                    }
                  />
                  <th scope="col" className={styles.priceHead}>
                    {maths.priceColumn}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableCourses.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <DateSwitch rule="intro" whenTrue={<td className="r">{formatUsd(c.introPrice ?? c.regularPrice)}</td>} />
                    <td className="r">{formatUsd(c.regularPrice)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="muted">{maths.separateLabel}</td>
                  <DateSwitch rule="intro" whenTrue={<td className={`r muted ${styles.struck}`}>{formatUsd(separateIntroTotal)}</td>} />
                  <td className={`r muted ${styles.struck}`}>{formatUsd(separateTotal)}</td>
                </tr>
              </tbody>
            </table>
            {typeof b.price === 'number' ? (
              <div className={styles.total}>
                <span className="stack" style={{ lineHeight: 1.2 }}>
                  <strong className={styles.totalName}>{b.title}</strong>
                  <span className={styles.totalSave}>
                    <DateSwitch
                      rule="intro"
                      whenTrue={interpolate(maths.totalNoteIntro || b.saveLabel, tokens)}
                      whenFalse={interpolate(b.saveLabel, tokens)}
                    />
                  </span>
                </span>
                <span className={styles.totalPrice}>
                  <BundlePriceText bundle={prices} />
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Pair with the workshop */}
      {pair.headline ? (
        <section className="navy">
          <div className={`wrap row g48 ${styles.pairRow}`}>
            <div className="grow stack g16">
              {pair.eyebrow ? <span className="eyebrow">{pair.eyebrow}</span> : null}
              <AccentText as="h2" className={`h2 ${styles.pairHeadline}`} text={pair.headline} />
              {pair.body ? <p className="lead">{pair.body}</p> : null}
            </div>
            <CtaLink cta={pair.cta} fallbackStyle="primary" arrow />
          </div>
        </section>
      ) : null}

      {/* FAQs */}
      {b.faqs?.length ? (
        <section className="band">
          <div className="wrap narrow stack g20">
            <AccentText as="h2" className="h2" text={b.faqHeadline} />
            <Accordion items={b.faqs} openFirst />
          </div>
        </section>
      ) : null}
    </>
  )
}
