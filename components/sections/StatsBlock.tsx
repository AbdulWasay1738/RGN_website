import type { CSSProperties, ReactNode } from 'react'
import { RBadge } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CountUp } from '@/components/ui/CountUp'
import type { Stat, StatsBlockSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './StatsBlock.module.css'

/** Splits a suffix like "M+" so the "+" can take the accent colour. */
function suffixParts(suffix: string | undefined, plusClass?: string): ReactNode {
  if (!suffix) return null
  return suffix.split(/(\+)/).map((part, i) => {
    if (!part) return null
    if (part === '+') return plusClass ? <span key={i} className={plusClass}>+</span> : <em key={i}>+</em>
    return part
  })
}

function StatNumber({ stat, plusClass }: { stat: Stat; plusClass?: string }) {
  return (
    <>
      {stat.prefix}
      {typeof stat.value === 'number' ? <CountUp to={stat.value} /> : null}
      {suffixParts(stat.suffix, plusClass)}
    </>
  )
}

/** Proof numbers: "Recent wins & milestones" on the home page, or the lavender strip on the founder page. */
export function StatsBlock({ section }: SectionProps<StatsBlockSection>) {
  const stats = (section.stats ?? []).filter((s) => s && (typeof s.value === 'number' || s.label))
  const variant = clean(section.variant) ?? 'rule'

  if (variant === 'strip') {
    return (
      <Band background={section.background ?? 'lavender'} watermark={section.watermark} anchorId={section.anchorId} padding="none">
        <div className={`wrap grid ${styles.strip}`} style={{ '--min': '220px', '--gap': '24px' } as CSSProperties}>
          {stats.map((s) => (
            <div key={s._id} className="stack rv">
              <span className={styles.stripNum}>
                <StatNumber stat={s} plusClass={styles.stripPlus} />
              </span>
              {s.label ? <span className={styles.stripLabel}>{s.label}</span> : null}
            </div>
          ))}
        </div>
      </Band>
    )
  }

  return (
    <Band
      background={section.background ?? 'white'}
      watermark={section.watermark ?? 'top-left'}
      anchorId={section.anchorId}
      className={styles.ruleBand}
    >
      <div className="wrap">
        {section.eyebrow || section.headline || section.showBadge ? (
          <div className={`row rv ${styles.head}`}>
            <div className="stack g16">
              {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
              <AccentText as="h2" className="h2" text={section.headline} />
            </div>
            {section.showBadge ? <RBadge style={{ width: 'clamp(64px, 7vw, 96px)', height: 'clamp(64px, 7vw, 96px)' }} /> : null}
          </div>
        ) : null}
        {stats.length ? (
          <div className="stats">
            {stats.map((s) => (
              <div key={s._id} className="rv">
                <span className="stat-n">
                  <StatNumber stat={s} />
                </span>
                {s.label ? <span className={styles.label}>{s.label}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
        {section.footnote ? <p className={`muted ${styles.footnote}`}>{section.footnote}</p> : null}
      </div>
    </Band>
  )
}
