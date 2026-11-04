import type { Metadata } from 'next'
import { AssessmentStartForm } from '@/components/features/assessment/AssessmentStartForm'
import styles from '@/components/features/assessment/assessment.module.css'
import { ReportMock } from '@/components/features/ReportMock'
import { AccentText } from '@/components/ui/AccentText'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { ASSESSMENT_QUERY } from '@/lib/sanity/queries'
import type { Assessment } from '@/lib/sanity/types'
import { buildMetadata } from '@/lib/seo'
import { fillNumber, plainText } from '@/lib/text'

const getAssessment = () => sanityFetch<Assessment | null>({ query: ASSESSMENT_QUERY, tags: ['assessment'] })

export async function generateMetadata(): Promise<Metadata> {
  const [a, { settings }] = await Promise.all([getAssessment(), getLayoutData()])
  return buildMetadata({
    seo: a?.seo,
    title: plainText(a?.intro?.headline) || 'Marketing ROI Assessment',
    description: a?.intro?.subline,
    path: '/assessment',
    settings,
  })
}

/** The free Marketing ROI Assessment: intro, the details form, the five areas and the report. */
export default async function AssessmentPage() {
  const a = await getAssessment()
  const n = (t?: string) => fillNumber(t, a?.turnaroundDays)
  const intro = a?.intro
  const areas = (a?.areas ?? []).filter((x) => x?.name)
  const steps = a?.report?.steps ?? []

  return (
    <>
      <section className="ink">
        <div className={`wrap row g64 ${styles.hero}`}>
          <div className={`grow stack g24 ${styles.heroCopy}`}>
            {intro?.pillTag ? (
              <span className={`fade-up ${styles.pillTag}`}>
                <span className="dot pulse" aria-hidden="true" />
                {intro.pillTag}
              </span>
            ) : null}
            <AccentText as="h1" text={intro?.headline} className={`h1 fade-up ${styles.heroTitle}`} />
            {intro?.subline ? <p className={`fade-up ${styles.heroSub}`}>{n(intro.subline)}</p> : null}
            {intro?.body ? <p className={`fade-up muted ${styles.heroBody}`}>{n(intro.body)}</p> : null}
          </div>
          <AssessmentStartForm form={a?.form} />
        </div>
      </section>

      {areas.length ? (
        <section className="band" aria-labelledby="as-areas">
          <div className="wrap">
            <div className="sec-head">
              <AccentText as="h2" id="as-areas" text={a?.areasSection?.headline} className="h2 rv" />
              {a?.areasSection?.eyebrow ? <span className="eyebrow">{a.areasSection.eyebrow}</span> : null}
            </div>
            <div className="grid" style={{ ['--min' as string]: '210px', ['--gap' as string]: '16px' }}>
              {areas.map((area, i) => (
                <div key={area._key} className={`card lift rv ${styles.areaCard} ${i === areas.length - 1 ? styles.areaCardLast : ''}`}>
                  <span className={styles.areaNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <strong className={styles.areaName}>{area.name}</strong>
                  {area.description ? <span className={styles.areaText}>{n(area.description)}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {a?.report ? (
        <section className="band paper" aria-labelledby="as-report">
          <div className={`wrap row g64 ${styles.reportRow}`}>
            <div className={`side rv ${styles.reportArt}`}>
              <ReportMock labels={a.reportMock} areas={areas.map((x) => x.name as string)} />
            </div>
            <div className="grow stack g20 rv">
              {a.report.eyebrow ? <span className="eyebrow">{a.report.eyebrow}</span> : null}
              <AccentText as="h2" id="as-report" text={a.report.headline} className="h2" />
              {a.report.body ? <p className="lead">{n(a.report.body)}</p> : null}
              {steps.length ? (
                <ol className={`stack ${styles.reportSteps}`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {steps.map((s, i) => (
                    <li key={s._key} className={`row g16 ${styles.reportStep}`}>
                      <span className={styles.reportStepNum} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>
                        <strong>{n(s.title)}</strong> {n(s.text)}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
