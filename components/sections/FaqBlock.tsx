import { Accordion } from '@/components/ui/Accordion'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import type { FaqBlockSection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'
import styles from './FaqBlock.module.css'

/** "Good questions. Straight answers.": a heading column beside the FAQ accordion. */
export function FaqBlock({ section }: SectionProps<FaqBlockSection>) {
  return (
    <Band
      background={section.background ?? 'white'}
      watermark={section.watermark ?? 'bottom-right'}
      anchorId={section.anchorId}
    >
      <div className="wrap row g64">
        <div className="side stack g16">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" className="h2" text={section.headline} />
          {section.note ? <p className={`muted ${styles.note}`}>{section.note}</p> : null}
          {section.cta?.label ? (
            <CtaLink cta={{ ...section.cta, style: section.cta.style ?? 'textLink' }} arrow className={styles.link} />
          ) : null}
        </div>
        <div className="grow">
          <Accordion items={section.faqs} openFirst={section.openFirst ?? true} />
        </div>
      </div>
    </Band>
  )
}
