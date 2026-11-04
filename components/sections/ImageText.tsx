import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import { RichText } from '@/components/ui/RichText'
import { SanityImage } from '@/components/ui/SanityImage'
import type { Background, ImageTextSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './ImageText.module.css'

/** An image beside a headline, body copy and a call to action. */
export function ImageText({ section, index }: SectionProps<ImageTextSection>) {
  const background: Background = clean(section.background) ?? 'white'
  const right = clean(section.imageSide) === 'right'
  const dark = background === 'navy' || background === 'ink'
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className={`wrap row g64 center ${right ? styles.reverse : ''}`}>
        {section.image?.asset ? (
          <div className={`side rv ${styles.media}`}>
            <SanityImage image={section.image} className={styles.img} priority={index === 0} sizes="(max-width: 760px) 100vw, 480px" />
          </div>
        ) : null}
        <div className="grow stack g20 rv">
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
          <AccentText as="h2" text={section.headline} className="h2" />
          <RichText value={section.body} className={`${styles.body} ${dark ? styles.dark : ''}`} />
          {section.cta?.label ? (
            <div>
              <CtaLink cta={section.cta} arrow />
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  )
}
