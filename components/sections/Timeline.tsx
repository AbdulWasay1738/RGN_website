import type { CSSProperties } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { Background, TimelineSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './Timeline.module.css'

const grid = (min: number, gap: number) => ({ ['--min' as string]: `${min}px`, ['--gap' as string]: `${gap}px` }) as CSSProperties

/** Career timeline: dotted steps (About "The story so far.") or record cards (founder page "The record."). */
export function Timeline({ section }: SectionProps<TimelineSection>) {
  const cards = clean(section.style) === 'cards'
  const background: Background = clean(section.background) ?? (cards ? 'paper' : 'white')
  const entries = (section.entries ?? []).filter((e) => e?.organisation)

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap">
        <AccentText as="h2" text={section.headline} className={`h2 rv ${cards ? styles.headCards : styles.headSteps}`} />
        {cards ? (
          <div className="grid" style={grid(280, 20)}>
            {entries.map((e) => (
              <div key={e._id} className={`card lift rv ${styles.card}`}>
                {e.years ? <span className="eyebrow">{e.years}</span> : null}
                <h3 className={`display ${styles.org}`}>{e.organisation}</h3>
                {e.description ? <span className={styles.desc}>{e.description}</span> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="steps">
            <ol className={`grid ${styles.steps}`} style={grid(240, 32)}>
              {entries.map((e) => (
                <li key={e._id} className="step rv">
                  <span className={`${styles.dot} ${e.highlight ? styles.dotHi : ''}`} aria-hidden="true" />
                  <span className={`display ${styles.year}`}>{e.year ?? e.years}</span>
                  <h3 className={styles.stepOrg}>{e.organisation}</h3>
                  <span className={styles.desc}>{e.shortDescription ?? e.description}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Band>
  )
}
