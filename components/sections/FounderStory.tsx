import type { CSSProperties } from 'react'
import { Felt, Shard } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import { SanityImage } from '@/components/ui/SanityImage'
import type { FounderStorySection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'
import styles from './FounderStory.module.css'

/** "Built by operators, for founders": the founder photo on torn felt with lavender shards, plus a short timeline. */
export function FounderStory({ section }: SectionProps<FounderStorySection>) {
  const timeline = (section.timeline ?? []).filter((t) => t?.organisation)
  return (
    <Band background={section.background ?? 'paper'} watermark={section.watermark} anchorId={section.anchorId}>
      <div className={`wrap row g64 ${styles.row}`}>
        <div className={`side rv ${styles.frame}`}>
          <Felt style={{ left: -6, top: 40, width: '46%', height: '78%', zIndex: 0 }} />
          <SanityImage
            image={section.photo}
            fallback={{ file: 'jenna-portrait.jpg', alt: 'Jenna Colombo, founder of Reel Good News.' }}
            className={styles.photo}
            sizes="(max-width: 760px) 92vw, 404px"
          />
          <Shard style={{ right: 6, top: 10, width: '58%', height: '34%', clipPath: 'polygon(0 0,100% 0,100% 100%)' }} />
          <Shard style={{ right: 2, bottom: 6, width: '30%', height: '62%', clipPath: 'polygon(100% 0,100% 100%,0 100%)' }} />
          {section.signature ? (
            <span className={styles.sig} aria-hidden="true">
              {section.signature}
            </span>
          ) : null}
        </div>
        <div className="grow stack g24 rv">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" className="h2" text={section.headline} />
          {section.handLine ? <span className="hand">{section.handLine}</span> : null}
          {section.body ? <p className="lead">{section.body}</p> : null}
          {timeline.length ? (
            <div className="grid" style={{ '--min': '170px', '--gap': '16px' } as CSSProperties}>
              {timeline.map((t) => (
                <div key={t._id} className={styles.tl}>
                  {t.homeLabel || t.year ? <span className={`eyebrow ${styles.tlLabel}`}>{t.homeLabel || t.year}</span> : null}
                  <strong>{t.organisation}</strong>
                  {t.homeSummary || t.shortDescription ? (
                    <span className={styles.tlText}>{t.homeSummary || t.shortDescription}</span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {section.cta?.label ? (
            <div>
              <CtaLink cta={section.cta} fallbackStyle="outline" arrow />
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  )
}
