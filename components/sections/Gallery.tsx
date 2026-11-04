import Link from 'next/link'
import type { CSSProperties } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { buttonClass } from '@/components/ui/Button'
import { SanityImage } from '@/components/ui/SanityImage'
import type { Background, GallerySection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './Gallery.module.css'

const grid = (min: number, gap: number) => ({ ['--min' as string]: `${min}px`, ['--gap' as string]: `${gap}px` }) as CSSProperties

/** Photo gallery: captioned cards with an optional link card (Speaking), or tilted photos beside a heading (archive). */
export function Gallery({ section }: SectionProps<GallerySection>) {
  const tilted = clean(section.style) === 'tilted'
  const background: Background = clean(section.background) ?? (tilted ? 'ink' : 'navy')
  const items = (section.items ?? []).filter((it) => it?.asset)
  const card = section.linkCard

  if (tilted) {
    return (
      <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
        <div className="wrap row g48 center">
          <div className="side stack g16 rv">
            {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
            <AccentText as="h2" text={section.headline} className="h2" />
            {section.lead ? <p className="lead">{section.lead}</p> : null}
          </div>
          <div className="grow grid" style={grid(220, 20)}>
            {items.map((it, i) => (
              <figure key={it._key ?? i} className={`rv stack g8 ${styles.tiltFig}`}>
                <SanityImage
                  image={it}
                  className={`${styles.tiltImg} ${i % 2 ? styles.tiltRight : styles.tiltLeft}`}
                  sizes="(max-width: 760px) 100vw, 400px"
                />
                {it.caption ? <figcaption className={styles.tiltCaption}>{it.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </div>
      </Band>
    )
  }

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap">
        <div className="sec-head">
          <AccentText as="h2" text={section.headline} className="h2 rv" />
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        </div>
        <div className="grid" style={grid(280, 24)}>
          {items.map((it, i) => (
            <figure key={it._key ?? i} className={`card lift rv ${styles.cardFig}`}>
              <SanityImage image={it} className={styles.cardImg} sizes="(max-width: 760px) 100vw, 400px" />
              {it.title || it.caption ? (
                <figcaption className={`stack ${styles.cardCaption}`}>
                  {it.title ? <strong className={`display ${styles.cardTitle}`}>{it.title}</strong> : null}
                  {it.caption ? <span className={styles.cardText}>{it.caption}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
          {card?.title ? <LinkCard card={card} /> : null}
        </div>
      </div>
    </Band>
  )
}

function LinkCard({ card }: { card: NonNullable<GallerySection['linkCard']> }) {
  const inner = (
    <>
      {card.eyebrow ? <span className={`eyebrow ${styles.linkEyebrow}`}>{card.eyebrow}</span> : null}
      <span className={`display ${styles.linkTitle}`}>{card.title}</span>
      {card.text ? <span className={styles.linkText}>{card.text}</span> : null}
      {card.ctaLabel ? (
        <span className={buttonClass('dark', { small: true })} style={{ alignSelf: 'flex-start' }}>
          {card.ctaLabel}
        </span>
      ) : null}
    </>
  )
  const cls = `card lift rv ${styles.linkCard}`
  return card.link?.href ? (
    <Link href={card.link.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
