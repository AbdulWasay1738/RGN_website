import type { CSSProperties } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { HowItWorksSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './HowItWorks.module.css'

/** "How it works": the four-step path (Attract, Capture, Create, Broadcast). */
export function HowItWorks({ section }: SectionProps<HowItWorksSection>) {
  const steps = section.steps ?? []
  return (
    <Band
      background={section.background ?? 'white'}
      watermark={section.watermark}
      anchorId={section.anchorId}
    >
      <div className="wrap">
        <div className="sec-head">
          <div className="stack rv">
            {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
            <AccentText as="h2" className="h2" text={section.headline} />
          </div>
          {section.note ? <p className={`muted rv ${styles.note}`}>{section.note}</p> : null}
        </div>
        {steps.length ? (
          <div className="steps">
            <div className="grid" style={{ '--min': '230px', '--gap': '32px' } as CSSProperties}>
              {steps.map((s, i) => (
                <div
                  key={s._key}
                  className="step rv"
                  style={{ animationRange: `entry ${i * 8}% entry ${55 + i * 8}%` } as CSSProperties}
                >
                  <span className={styles.ic}>{s.icon ? <Icon name={clean(s.icon)} /> : null}</span>
                  {s.number ? <span className="outline">{s.number}</span> : null}
                  {s.name ? <h3 className="h3">{s.name}</h3> : null}
                  {s.text ? <p className={styles.text}>{s.text}</p> : null}
                  {s.linkLabel ? (
                    <ButtonLink href={s.link?.href} style="textLink" arrow className={styles.link}>
                      {s.linkLabel}
                    </ButtonLink>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Band>
  )
}
