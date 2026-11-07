import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '@/components/features/course/course.module.css'
import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { AccentText } from '@/components/ui/AccentText'
import { Accordion } from '@/components/ui/Accordion'
import { ButtonLink } from '@/components/ui/Button'
import { BuyButton, CoursePrice } from '@/components/ui/Commerce'
import { Countdown } from '@/components/ui/Countdown'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { SanityImage } from '@/components/ui/SanityImage'
import { calendarDates, coursePrice } from '@/lib/sales-calendar'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { COURSE_PAGE_QUERY, COURSE_SLUGS_QUERY } from '@/lib/sanity/queries'
import type { Bundle, Course, CourseTemplate } from '@/lib/sanity/types'
import { breadcrumbLd, buildMetadata, courseLd, faqPageLd } from '@/lib/seo'
import { bundlePriceTokens, clean, interpolate } from '@/lib/text'

type CoursePageData = {
  course: Course | null
  courses: Course[] | null
  template: CourseTemplate | null
  bundle: Pick<Bundle, 'price' | 'introPrice' | 'compareAt' | 'compareAtIntro'> | null
}

type Props = { params: Promise<{ slug: string }> }

const getData = (slug: string) =>
  sanityFetch<CoursePageData>({
    query: COURSE_PAGE_QUERY,
    params: { slug },
    tags: ['course', 'courseTemplate', 'bundle', 'faq'],
  })

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[] | null>({ query: COURSE_SLUGS_QUERY, tags: ['course'] })
  return (slugs ?? []).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [data, layout] = await Promise.all([getData(slug), getLayoutData()])
  const c = data?.course
  return buildMetadata({
    seo: c?.seo,
    title: c?.fullTitle ?? c?.title,
    description: c?.summary,
    path: `/courses/${slug}`,
    settings: layout.settings,
  })
}

/** "...or <span class=hl>which messages will resonate.</span>" */
function Problem({ text, highlight }: { text?: string; highlight?: string }) {
  if (!text) return null
  const h = highlight?.trim()
  const i = h ? text.indexOf(h) : -1
  if (!h || i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <span className="hl">{h}</span>
      {text.slice(i + h.length)}
    </>
  )
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const [data, layout] = await Promise.all([getData(slug), getLayoutData()])
  const c = data?.course
  if (!c) notFound()

  const t = data.template ?? {}
  const bundleTokens = bundlePriceTokens(data.bundle)
  const courses = data.courses ?? []
  const step = c.stepNumber ?? ''
  const stepNum = Number(step) || c.courseNumber || ''
  const path = `/courses/${slug}`
  const dates = calendarDates(layout.calendar)
  const learn = c.learn ?? []

  const pathItems = [
    ...courses.map((x) => ({
      key: x._id,
      step: x.stepNumber ?? '',
      word: x.word,
      label: interpolate(t.pathCourseLabel || 'Course {n}', { n: x.courseNumber ?? '' }),
      href: x.slug ? `/courses/${x.slug}` : undefined,
      here: x.slug === slug,
    })),
    ...(t.pathWorkshop
      ? [{ key: 'workshop', step: t.pathWorkshop.step ?? '', word: t.pathWorkshop.word, label: t.pathWorkshop.label, href: '/workshop', here: false }]
      : []),
  ].sort((a, b) => a.step.localeCompare(b.step))

  const details = [
    { label: t.detailLabels?.format, value: c.format },
    { label: t.detailLabels?.opens, value: c.opensLabel },
    { label: t.detailLabels?.hostedOn, value: c.hostedOn },
    { label: t.detailLabels?.bestFor, value: c.bestFor },
  ].filter((d) => d.value)

  const fanNumbers = courses.map((x) => String(Number(x.stepNumber) || x.courseNumber || '')).slice(0, 3)

  return (
    <>
      <JsonLd
        data={[
          courseLd({ name: c.fullTitle ?? c.title ?? '', description: c.summary, path, price: coursePrice(c, new Date(), dates) }),
          faqPageLd(c.faqs),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: c.title ?? 'Course', path },
          ]),
        ]}
      />

      {/* Hero + price card */}
      <section className="paper">
        <div className={`wrap row g48 ${styles.heroRow}`}>
          <div className={`grow stack g20 ${styles.heroCopy}`}>
            <nav className="crumb fade-up" aria-label="Breadcrumb">
              <Link href="/">Home</Link> / Courses /{' '}
              <span className="here" aria-current="page">
                {c.title}
              </span>
            </nav>
            <div className="row g8 fade-up">
              {t.heroChip ? <span className="chip chip-n">{t.heroChip}</span> : null}
              <span className="chip chip-l">
                <DateSwitch rule="coursesOpen" whenTrue={t.heroOnDemandLabel} whenFalse={t.heroOpensLabel} />
              </span>
              {step && t.stepOfLabel ? <span className="chip chip-line-l">{interpolate(t.stepOfLabel, { step })}</span> : null}
            </div>
            {c.word ? (
              <span className={`script fade-up ${styles.word}`} style={{ ['--dl' as string]: '.08s' }}>
                {c.word}
              </span>
            ) : null}
            <h1 className={`h1 fade-up ${styles.title}`} style={{ ['--dl' as string]: '.14s' }}>
              {c.fullTitle ?? c.title}
            </h1>
            {c.headline ? (
              <p className="subhead fade-up" style={{ ['--dl' as string]: '.22s' }}>
                {c.headline}
              </p>
            ) : null}
          </div>

          <aside className={`side fade-up ${styles.priceCard}`} style={{ ['--dl' as string]: '.2s' }} aria-label="Price and enrolment">
            <div className={`cover ${styles.cardCover}`}>
              <span className="big" aria-hidden="true">
                {stepNum}
              </span>
              {t.coverLabel ? (
                <span className={styles.coverLabel}>{interpolate(t.coverLabel, { n: c.courseNumber ?? '', step })}</span>
              ) : (
                <span />
              )}
              {c.word ? <span className={`word ${styles.coverWord}`}>{c.word}</span> : null}
            </div>
            <div className={`stack g16 ${styles.cardBody}`}>
              <div className="price">
                <CoursePrice course={c} size="hero" regularLabel={t.regularPriceLabel} saveLabel={t.saveLabel} />
              </div>
              <DateSwitch
                rule="intro"
                whenTrue={
                  <div className={`stack g8 ${styles.introBox}`}>
                    {t.introEndsLabel ? <strong>{t.introEndsLabel}</strong> : null}
                    <Countdown to="introEndsAt" label={t.introEndsLabel} />
                  </div>
                }
              />
              <BuyButton offer={{ kind: 'course', slug }} block trackId={`buy_${slug}`}>
                {t.enrollLabel}
              </BuyButton>
              {t.bundleLinkLabel || t.bundleLinkIntroLabel ? (
                <Link href="/courses/content-machine" className={`tlink ${styles.bundleLink}`}>
                  <DateSwitch
                    rule="intro"
                    whenTrue={interpolate(t.bundleLinkIntroLabel || t.bundleLinkLabel, bundleTokens)}
                    whenFalse={interpolate(t.bundleLinkLabel, bundleTokens)}
                  />
                </Link>
              ) : null}
              {t.features?.length ? (
                <ul className={`stack g8 ${styles.features}`}>
                  {t.features.map((f) => (
                    <li key={f._key} className={styles.feature}>
                      <span className={styles.featureIcon}>{f.icon ? <Icon name={clean(f.icon)} /> : null}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      {/* The four-step path */}
      {pathItems.length > 1 ? (
        <section className={styles.pathSection} aria-label="The four-step path">
          <ol className={`wrap grid ${styles.pathbar}`} style={{ ['--min' as string]: '200px', ['--gap' as string]: '12px' }}>
            {pathItems.map((p) => {
              const inner = (
                <>
                  <span className={styles.pathNum} aria-hidden="true">
                    {p.step}
                  </span>
                  <span className={`stack ${styles.pathText}`}>
                    <strong>{p.word}</strong>
                    <span className={styles.pathSub}>{p.here ? t.hereLabel : p.label}</span>
                  </span>
                </>
              )
              return (
                <li key={p.key}>
                  {p.here || !p.href ? (
                    <span className={`${styles.pathItem} ${p.here ? styles.pathHere : ''}`} aria-current={p.here ? 'step' : undefined}>
                      {inner}
                    </span>
                  ) : (
                    <Link href={p.href} className={styles.pathItem}>
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}

      {/* Problem / who it is for */}
      {c.problem ? (
        <section className="band">
          <div className={`wrap row g48 ${styles.problemRow}`}>
            {c.problemLabel ? <span className={`eyebrow ${styles.problemLabel}`}>{c.problemLabel}</span> : null}
            <p className={`rv ${styles.problem}`}>
              <Problem text={c.problem} highlight={c.problemHighlight} />
            </p>
          </div>
        </section>
      ) : null}

      {/* What the course covers */}
      {learn.length ? (
        <section className="band navy">
          <div className="wrap">
            <div className="sec-head">
              <AccentText as="h2" className="h2 rv" text={t.coversHeadline} tone="acc-l" />
              {t.coversCountLabel ? <span className="eyebrow">{interpolate(t.coversCountLabel, { count: learn.length })}</span> : null}
            </div>
            <ol className="grid" style={{ ['--min' as string]: '250px', ['--gap' as string]: '16px', listStyle: 'none', margin: 0, padding: 0 }}>
              {learn.map((item, i) => (
                <li key={`${i}-${item}`} className={`tile lift rv${i === learn.length - 1 ? ' lv' : ''}`}>
                  <span className={styles.tileNum} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className={styles.tileText}>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Outcome + details */}
      <section className="band paper">
        <div className="wrap row g32">
          <div className="grow panel-w stack g16 rv">
            {t.outcomeEyebrow ? <span className="eyebrow">{t.outcomeEyebrow}</span> : null}
            {c.outcome ? <p className={styles.outcomeStatement}>{c.outcome}</p> : null}
            {c.outcomeNote ? <p className={styles.outcomeNote}>{c.outcomeNote}</p> : null}
          </div>
          {details.length ? (
            <dl className="side grid" style={{ ['--min' as string]: '150px', ['--gap' as string]: '12px', margin: 0 }}>
              {details.map((d) => (
                <div key={d.label ?? d.value} className="detail rv">
                  <dt>
                    <span>{d.label}</span>
                  </dt>
                  <dd style={{ margin: 0 }}>
                    <strong className={styles.detailValue}>{d.value}</strong>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {/* Bundle upsell */}
      {t.bundleUpsell?.headline ? (
        <section className={`band ${styles.upsellSection}`}>
          <div className="wrap">
            <div className={`card lift rv ${styles.upsell}`}>
              <div className="fan" aria-hidden="true">
                {fanNumbers.map((n, i) => (
                  <span key={i}>{n}</span>
                ))}
              </div>
              <div className={`grow stack g12 ${styles.upsellCopy}`}>
                {t.bundleUpsell.chip ? (
                  <span className="chip chip-n" style={{ alignSelf: 'flex-start' }}>
                    {t.bundleUpsell.chip}
                  </span>
                ) : null}
                <h2 className={`h3 ${styles.upsellHeadline}`}>{t.bundleUpsell.headline}</h2>
                {t.bundleUpsell.body || t.bundleUpsell.bodyIntro ? (
                  <p className={styles.upsellBody}>
                    <DateSwitch
                      rule="intro"
                      whenTrue={interpolate(t.bundleUpsell.bodyIntro || t.bundleUpsell.body, bundleTokens)}
                      whenFalse={interpolate(t.bundleUpsell.body, bundleTokens)}
                    />
                  </p>
                ) : null}
              </div>
              <ButtonLink href="/courses/content-machine" style="dark" arrow>
                {t.bundleUpsell.ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQs + teacher */}
      <section className="band">
        <div className="wrap row g64">
          <div className="side stack g20">
            <AccentText as="h2" className="h2" text={t.faqHeadline} />
            {t.teacherCard?.title ? (
              <div className={styles.teacher}>
                <SanityImage
                  image={t.teacherCard.image}
                  fallback={{ file: 'jenna-square.jpg', alt: 'Jenna Colombo' }}
                  className={styles.teacherImg}
                  sizes="64px"
                />
                <span className={styles.teacherText}>
                  <strong>{t.teacherCard.title}</strong>
                  <br />
                  <span className={styles.teacherNote}>{t.teacherCard.text}</span>
                </span>
              </div>
            ) : null}
          </div>
          <div className="grow">
            <Accordion items={c.faqs} openFirst />
          </div>
        </div>
      </section>
    </>
  )
}
