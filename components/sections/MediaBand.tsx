import { Band } from '@/components/ui/Band'
import { buttonClass, CtaLink } from '@/components/ui/Button'
import type { Background, MediaBandSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './MediaBand.module.css'

/** Founder page "Media and press": a statement, press links and a call to action. */
export function MediaBand({ section }: SectionProps<MediaBandSection>) {
  const background: Background = clean(section.background) ?? 'ink'
  const links = (section.links ?? []).filter((l) => l?.label)
  const light = background === 'navy' || background === 'ink' || background === 'orange'
  const btn = buttonClass(light ? 'outlineLight' : 'outline', { small: true })
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId} padding="none">
      <div className={`wrap row g48 center ${styles.inner}`}>
        <div className="grow stack g16">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          {section.text ? <p className={styles.text}>{section.text}</p> : null}
          {links.length ? (
            <div className="row g8">
              {links.map((l, i) => {
                const url = clean(l.url)
                return url && /^https?:\/\//.test(url) ? (
                  <a key={l._key ?? i} href={url} className={btn} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ) : (
                  <span key={l._key ?? i} className={btn} aria-disabled="true">
                    {l.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
        <CtaLink cta={section.cta} arrow />
      </div>
    </Band>
  )
}
