import type { CSSProperties } from 'react'
import { Tear } from '@/components/brand'
import { ReportMock } from '@/components/features/ReportMock'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import type { AssessmentCtaSection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'
import styles from './AssessmentCta.module.css'

/** The free Marketing ROI Assessment band: torn paper edge, five areas and the sample report. */
export function AssessmentCta({ section }: SectionProps<AssessmentCtaSection>) {
  const areas = (section.areas ?? []).filter((a) => a?.name)
  return (
    <Band
      background={section.background ?? 'ink'}
      watermark={section.watermark ?? 'top-right'}
      anchorId={section.anchorId}
      className={styles.band}
    >
      {section.tornTopEdge ? <Tear fill="#FAF7F2" position="top" /> : null}
      <div className={`wrap row g64 ${styles.row}`}>
        <div className="grow stack g24 rv">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" className="h2" text={section.headline} />
          {section.body ? <p className="lead">{section.body}</p> : null}
          {section.showAreas && areas.length ? (
            <div className="grid" style={{ '--min': '200px', '--gap': '10px 24px' } as CSSProperties}>
              {areas.map((a, i) => (
                <span key={a._key ?? i} className={`row g12 ${styles.area}`}>
                  <span className={styles.areaNum}>{String(i + 1).padStart(2, '0')}</span>
                  {a.name}
                </span>
              ))}
            </div>
          ) : null}
          {section.cta?.label ? (
            <div>
              <CtaLink cta={section.cta} fallbackStyle="primary" arrow track="home_assessment" />
            </div>
          ) : null}
        </div>
        {section.showReportMock ? (
          <div className={`side rv ${styles.mock}`}>
            <ReportMock labels={section.reportMock} areas={areas.map((a) => a.name as string)} />
          </div>
        ) : null}
      </div>
    </Band>
  )
}
