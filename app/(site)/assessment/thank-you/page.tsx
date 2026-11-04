import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '@/components/features/assessment/assessment.module.css'
import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { AccentText } from '@/components/ui/AccentText'
import { CtaLink } from '@/components/ui/Button'
import { WorkshopPriceText } from '@/components/ui/Commerce'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { ASSESSMENT_QUERY } from '@/lib/sanity/queries'
import type { Assessment, Workshop } from '@/lib/sanity/types'
import { buildMetadata } from '@/lib/seo'
import { clean, fillNumber } from '@/lib/text'

const WORKSHOP_PRICE_QUERY = `*[_id == "workshop"][0]{ earlyBirdPrice, standardPrice, priceNotes }`

type WorkshopPrice = Pick<Workshop, 'earlyBirdPrice' | 'standardPrice' | 'priceNotes'>

const getAssessment = () => sanityFetch<Assessment | null>({ query: ASSESSMENT_QUERY, tags: ['assessment'] })

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLayoutData()
  return buildMetadata({ seo: { noIndex: true }, title: 'Assessment received', path: '/assessment/thank-you', settings })
}

const TONE_CLASS: Record<string, string> = {
  navy: styles.mwNavy,
  paper: styles.mwPaper,
  orange: styles.mwOrange,
}

/** After the assessment: what happens next, plus three "Meanwhile" cards. */
export default async function AssessmentThanksPage() {
  const [a, workshop, { settings }] = await Promise.all([
    getAssessment(),
    sanityFetch<WorkshopPrice | null>({ query: WORKSHOP_PRICE_QUERY, tags: ['workshop'] }),
    getLayoutData(),
  ])
  const t = a?.thankYou
  const n = (text?: string) => fillNumber(text, a?.turnaroundDays)
  const tracker = t?.tracker ?? []
  const cards = t?.cards ?? []

  return (
    <>
      <section className="lavt">
        <div className={`wrap row g64 ${styles.thanksWrap}`}>
          <div className="grow stack g20">
            {t?.eyebrow ? <span className="eyebrow fade-up">{t.eyebrow}</span> : null}
            <AccentText as="h1" text={t?.headline} className={`h1 fade-up ${styles.thanksTitle}`} />
            {t?.body ? <p className={`lead fade-up ${styles.thanksLead}`}>{n(t.body)}</p> : null}
            {t?.cta ? (
              <div className={`fade-up ${styles.thanksCta}`}>
                <CtaLink cta={t.cta} fallbackStyle="dark" arrow />
              </div>
            ) : null}
          </div>
          {tracker.length ? (
            <div className={`side panel-w stack g8 fade-up ${styles.tracker}`}>
              <SanityImage image={settings?.logoStacked} fallback={{ file: 'logo-stack.png', alt: '' }} alt="" className={styles.trackerLogo} sizes="160px" />
              <ol className="stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {tracker.map((row, i) => (
                  <li key={row._key} className={`row g16 ${styles.trackerRow}`}>
                    {i === 0 ? (
                      <span className={styles.trackDone} aria-hidden="true">
                        <Icon name="check" />
                      </span>
                    ) : i === 1 ? (
                      <span className={`pulse ${styles.trackNow}`} aria-hidden="true" />
                    ) : (
                      <span className={styles.trackNext} aria-hidden="true" />
                    )}
                    <span>
                      <strong className={i > 1 ? 'muted' : undefined}>{n(row.title)}</strong>
                      <br />
                      <span className={`muted ${styles.trackText}`}>{n(row.text)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </section>

      {cards.length ? (
        <section className="band" aria-labelledby="mw-title">
          <div className="wrap">
            <AccentText as="h2" id="mw-title" text={t?.meanwhileHeadline} className={`h2 ${styles.meanwhileTitle}`} />
            <div className="grid" style={{ ['--min' as string]: '280px', ['--gap' as string]: '20px' }}>
              {cards.map((c) => {
                const tone = TONE_CLASS[clean(c.tone) ?? 'paper'] ?? styles.mwPaper
                const isWorkshop = clean(c.kind) === 'workshop'
                const body = (
                  <>
                    {c.eyebrow ? <span className="eyebrow">{c.eyebrow}</span> : null}
                    {c.title ? <strong className={styles.mwTitle}>{c.title}</strong> : null}
                    {isWorkshop ? (
                      <span className={styles.mwPrice}>
                        <WorkshopPriceText workshop={workshop} />{' '}
                        <DateSwitch rule="earlyBird" whenTrue={workshop?.priceNotes?.earlyBird} whenFalse={workshop?.priceNotes?.perSeat} />
                      </span>
                    ) : c.text ? (
                      <span className={styles.mwText}>{n(c.text)}</span>
                    ) : null}
                  </>
                )
                const cls = `card lift ${styles.mwCard} ${tone}`
                return c.link?.href ? (
                  <Link key={c._key} href={c.link.href} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <div key={c._key} className={cls}>
                    {body}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
