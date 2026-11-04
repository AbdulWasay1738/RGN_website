import { YearCalendar } from '@/components/features/YearCalendar'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { MethodCalendarSection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'
import styles from './MethodCalendar.module.css'

/** "The method": one production day against a year of content (the client's change #1). */
export function MethodCalendar({ section }: SectionProps<MethodCalendarSection>) {
  return (
    <Band
      background={section.background ?? 'paper'}
      watermark={section.watermark ?? 'top-right'}
      anchorId={section.anchorId}
    >
      <div className={`wrap row g64 ${styles.row}`}>
        <div className={`side stack g24 rv ${styles.copy}`}>
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" className="h2" text={section.headline} />
          {section.body ? <p className="lead">{section.body}</p> : null}
        </div>
        <div className={`grow ${styles.card}`}>
          <YearCalendar labels={section.calendar} />
        </div>
      </div>
    </Band>
  )
}
