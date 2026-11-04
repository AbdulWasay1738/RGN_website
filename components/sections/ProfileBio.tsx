import { QuoteMark } from '@/components/brand'
import { Band } from '@/components/ui/Band'
import { RichText } from '@/components/ui/RichText'
import type { Background, ProfileBioSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './ProfileBio.module.css'

/** Founder page biography with a pull quote card and a "Now" card beside it. */
export function ProfileBio({ section }: SectionProps<ProfileBioSection>) {
  const background: Background = clean(section.background) ?? 'white'
  const hasAside = section.quote || section.asideText
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap row g64">
        <div className={`grow stack g20 rv ${styles.bio}`}>
          {section.intro ? <p className={styles.intro}>{section.intro}</p> : null}
          <RichText value={section.body} className={styles.body} />
        </div>
        {hasAside ? (
          <aside className="side stack g20">
            {section.quote ? (
              <figure className={`stack g16 rv ${styles.quoteCard}`}>
                <QuoteMark width={56} color="#C6A7ED" />
                <blockquote className={styles.quote}>{section.quote}</blockquote>
                {section.signature ? (
                  <figcaption className={`script ${styles.sig}`}>{section.signature}</figcaption>
                ) : null}
              </figure>
            ) : null}
            {section.asideText ? (
              <div className={`rv stack g8 ${styles.now}`}>
                {section.asideEyebrow ? <span className="eyebrow">{section.asideEyebrow}</span> : null}
                <strong>{section.asideText}</strong>
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </Band>
  )
}
