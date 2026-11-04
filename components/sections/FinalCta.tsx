import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'
import type { FinalCtaSection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'
import styles from './FinalCta.module.css'

/** The orange closing band with the R watermark, the workshop call to action and a live countdown. */
export function FinalCta({ section }: SectionProps<FinalCtaSection>) {
  return (
    <Band
      background={section.background ?? 'orange'}
      watermark={section.watermark ?? 'center-right'}
      anchorId={section.anchorId}
      padding="none"
    >
      <div className={`wrap stack g24 ${styles.inner}`}>
        {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        <AccentText as="h2" className={`rv ${styles.headline}`} text={section.headline} />
        <div className={`row g16 ${styles.actions}`}>
          <CtaLink cta={section.cta} fallbackStyle="dark" arrow track="final_cta" />
          {section.showCountdown ? <Countdown to="workshopAt" tone="light" label="Time until the workshop" /> : null}
        </div>
      </div>
    </Band>
  )
}
