import type { CSSProperties } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { Background, ValuesGridSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './ValuesGrid.module.css'

const grid = (min: number, gap: number) => ({ ['--min' as string]: `${min}px`, ['--gap' as string]: `${gap}px` }) as CSSProperties

/** Values as cards (About "How we work.") or numbered rows (Careers "How we work together."). */
export function ValuesGrid({ section }: SectionProps<ValuesGridSection>) {
  const numbered = clean(section.style) === 'numbered'
  const background: Background = clean(section.background) ?? (numbered ? 'paper' : 'white')
  const items = (section.items ?? []).filter((v) => v?.title)
  const cardBg = background === 'paper' ? styles.onPaper : styles.onWhite

  const heading = <AccentText as="h2" text={section.headline} className="h2 rv" />

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap">
        {section.eyebrow ? (
          <div className="sec-head">
            {heading}
            <span className="eyebrow">{section.eyebrow}</span>
          </div>
        ) : (
          <div className={styles.head}>{heading}</div>
        )}
        {numbered ? (
          <div className="grid" style={grid(290, 16)}>
            {items.map((v, i) => (
              <div key={v._key ?? i} className={`card lift rv ${styles.numbered} ${i === items.length - 1 ? styles.last : ''}`}>
                <span className={`outline ${styles.num}`} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <strong className={`display ${styles.numTitle}`}>{v.title}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid" style={grid(260, 20)}>
            {items.map((v, i) => (
              <div key={v._key ?? i} className={`card lift rv ${styles.card} ${cardBg}`}>
                <h3 className={`display ${styles.title}`}>{v.title}</h3>
                {v.text ? <p className={styles.text}>{v.text}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Band>
  )
}
