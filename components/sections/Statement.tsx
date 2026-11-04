import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { RichText } from '@/components/ui/RichText'
import type { Background, StatementSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './Statement.module.css'

const DARK = new Set<Background>(['navy', 'ink', 'orange'])

/**
 * A big Anton statement with supporting copy. With a side list it becomes the
 * Partner "what happens next" layout; without one, the About "What we
 * believe" layout with body copy in the second column.
 */
export function Statement({ section }: SectionProps<StatementSection>) {
  const background: Background = clean(section.background) ?? 'paper'
  const dark = DARK.has(background)
  const lead = clean(section.bodyStyle) === 'lead'
  const sideList = (section.sideList ?? []).filter(Boolean)
  const hasSideList = sideList.length > 0

  const body = section.body?.length ? (
    <RichText value={section.body} className={`${lead ? styles.bodyLead : styles.bodyPlain} ${dark ? styles.dark : ''}`} />
  ) : null
  const closing = section.closingLine ? <p className={`${styles.closing} ${dark ? styles.closingDark : ''}`}>{section.closingLine}</p> : null

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap row g64">
        <div className="side stack g16 rv">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" text={section.statement} className="statement" />
          {hasSideList ? (
            <>
              {body}
              {closing}
            </>
          ) : null}
        </div>
        {hasSideList ? (
          <div className="side stack g12">
            {section.sideEyebrow ? <span className="eyebrow">{section.sideEyebrow}</span> : null}
            <ol className={`stack g12 ${styles.list}`}>
              {sideList.map((item, i) => (
                <li key={`${i}-${item}`} className={`row g16 nowrap center rv lift ${styles.item}`}>
                  <span className={`display ${styles.num} ${i === sideList.length - 1 ? styles.numLast : ''}`} aria-hidden="true">
                    {i + 1}
                  </span>
                  <strong className={styles.itemText}>{item}</strong>
                </li>
              ))}
            </ol>
          </div>
        ) : body || closing ? (
          <div className={`side stack g16 rv ${styles.bodyCol} ${dark ? styles.dark : ''}`}>
            {body}
            {closing}
          </div>
        ) : null}
      </div>
    </Band>
  )
}
