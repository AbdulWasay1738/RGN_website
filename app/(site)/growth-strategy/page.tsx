import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { GrowthBooking } from '@/components/features/growth/GrowthBooking'
import styles from '@/components/features/growth/growth.module.css'
import { AccentText } from '@/components/ui/AccentText'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { GROWTH_CALL_QUERY } from '@/lib/sanity/queries'
import type { GrowthCall } from '@/lib/sanity/types'
import { breadcrumbLd, buildMetadata } from '@/lib/seo'
import { clean, plainText } from '@/lib/text'

const PATH = '/growth-strategy'
const getData = () => sanityFetch<GrowthCall | null>({ query: GROWTH_CALL_QUERY, tags: ['growthCall'] })

export async function generateMetadata(): Promise<Metadata> {
  const [g, layout] = await Promise.all([getData(), getLayoutData()])
  if (!g) return {}
  return buildMetadata({ seo: g.seo, title: plainText(g.headline), description: g.intro, path: PATH, settings: layout.settings })
}

const delay = (s: string) => ({ '--dl': s }) as CSSProperties

/**
 * The 2027 growth strategy call (client feedback round two), the home page's
 * main call to action: share details (the lead is captured right away), then
 * pick a day and time.
 */
export default async function GrowthStrategyPage() {
  const g = await getData()
  if (!g) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: plainText(g.headline) || 'Growth strategy call', path: PATH },
        ])}
      />
      <section className="ink">
        <div className={`wrap row g64 ${styles.layout}`}>
          <div className={`grow stack g24 ${styles.copy}`}>
            {g.eyebrow ? <span className={`eyebrow fade-up ${styles.eyebrow}`}>{g.eyebrow}</span> : null}
            <AccentText as="h1" className={`h1 fade-up ${styles.headline}`} style={delay('.08s')} text={g.headline} />
            {g.intro ? (
              <p className={`fade-up ${styles.intro}`} style={delay('.16s')}>
                {g.intro}
              </p>
            ) : null}
            {g.steps?.length ? (
              <ol className={`stack g12 fade-up ${styles.stepsList}`} style={delay('.24s')}>
                {g.steps.map((s) => (
                  <li key={s._key} className={styles.stepRow}>
                    <span className={styles.stepIcon}>{s.icon ? <Icon name={clean(s.icon)} /> : null}</span>
                    <span>
                      <strong>{s.title}</strong>
                      <br />
                      <span className={styles.stepText}>{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {g.callLengthNote ? (
              <p className={`fade-up ${styles.note}`} style={delay('.3s')}>
                {g.callLengthNote}
              </p>
            ) : null}
          </div>
          <div className={`panel-w stack fade-up ${styles.card}`} style={delay('.2s')}>
            <GrowthBooking content={g} />
          </div>
        </div>
      </section>
    </>
  )
}
