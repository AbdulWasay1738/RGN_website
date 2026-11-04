import type { CSSProperties } from 'react'
import { TestimonialCarousel } from '@/components/features/TestimonialCarousel'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { TestimonialsSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './Testimonials.module.css'

const LOGO_STYLE: Record<string, string | undefined> = {
  display: styles.display,
  caps: styles.caps,
  body: styles.body,
  plain: undefined,
}

/** Client quotes: the rotating carousel with a logo strip (home), or a grid of quote cards (founder page). */
export function Testimonials({ section }: SectionProps<TestimonialsSection>) {
  const items = (section.items ?? []).filter((t) => t?.quote)
  const variant = clean(section.variant) ?? 'carousel'

  if (variant === 'grid') {
    return (
      <Band background={section.background ?? 'white'} watermark={section.watermark} anchorId={section.anchorId}>
        <div className="wrap">
          {section.headline || section.eyebrow ? (
            <div className="sec-head">
              <AccentText as="h2" className="h2 rv" text={section.headline} />
              {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
            </div>
          ) : null}
          <div className="grid" style={{ '--min': '300px', '--gap': '20px' } as CSSProperties}>
            {items.map((t, i) => {
              const tone =
                i === 0 ? styles.toneLav : items.length >= 4 && i === items.length - 1 ? styles.toneNavy : styles.tonePaper
              return (
                <figure key={t._id} className={`card lift rv ${styles.card} ${tone}`}>
                  <blockquote className={styles.quote}>{t.quote}</blockquote>
                  <figcaption className={styles.cite}>
                    {t.name ? <strong>{t.name}</strong> : null}
                    {t.name && t.company ? ' · ' : null}
                    {t.company}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>
      </Band>
    )
  }

  const logos = (section.logos ?? []).filter((l) => l?.name)
  return (
    <Band
      background={section.background ?? 'white'}
      watermark={section.watermark}
      anchorId={section.anchorId}
      className={styles.carouselBand}
    >
      <div className="wrap">
        {section.eyebrow || section.headline ? (
          <div className="sec-head">
            <div className="stack">
              {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
              <AccentText as="h2" className="h2" text={section.headline} />
            </div>
          </div>
        ) : null}
        <TestimonialCarousel items={items} />
        {section.logoStripLabel || logos.length ? (
          <div className={styles.logos}>
            {section.logoStripLabel ? <span className={`eyebrow ${styles.logosLabel}`}>{section.logoStripLabel}</span> : null}
            {logos.map((l) => (
              <span key={l._key} className={LOGO_STYLE[clean(l.style) ?? 'plain']}>
                {l.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Band>
  )
}
