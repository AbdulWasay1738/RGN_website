import type { CSSProperties } from 'react'
import { QuoteMark } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { Background, SocialFeedSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './SocialFeed.module.css'

const grid = { ['--min' as string]: '250px', ['--gap' as string]: '16px' } as CSSProperties

type Card = NonNullable<SocialFeedSection['cards']>[number]

/** Socials "From the feed.": square sample posts in four brand styles. */
export function SocialFeed({ section }: SectionProps<SocialFeedSection>) {
  const background: Background = clean(section.background) ?? 'white'
  const cards = (section.cards ?? []).filter((c) => c?.text || c?.eyebrow)
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap">
        <div className="sec-head">
          <AccentText as="h2" text={section.headline} className={`h2 ${styles.headline}`} />
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        </div>
        <ul className={`grid ${styles.list}`} style={grid}>
          {cards.map((c, i) => (
            <li key={c._key ?? i} className={`card lift rv ${styles.card} ${styles[clean(c.style) ?? 'logoLine'] ?? ''}`}>
              <FeedCard card={c} />
            </li>
          ))}
        </ul>
      </div>
    </Band>
  )
}

function FeedCard({ card }: { card: Card }) {
  switch (clean(card.style)) {
    case 'quote':
      return (
        <>
          <QuoteMark width={44} color="#091527" />
          <AccentText text={card.text} className={`display ${styles.quoteText}`} />
        </>
      )
    case 'rule':
      return (
        <>
          {card.eyebrow ? <span className={`eyebrow ${styles.ruleEyebrow}`}>{card.eyebrow}</span> : <span />}
          <AccentText text={card.text} className={`display ${styles.ruleText}`} />
          {card.caption ? <span className={styles.caption}>{card.caption}</span> : <span />}
        </>
      )
    case 'big':
      return (
        <>
          <span className={`display ${styles.bigTop}`}>{card.eyebrow}</span>
          <AccentText text={card.text} className={`display ${styles.bigText}`} />
        </>
      )
    default:
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-invert.png" alt="" className={styles.logo} width={1200} height={296} />
          <AccentText text={card.text} className={`display ${styles.logoText}`} tone="acc-l" />
          {card.caption ? <span className={styles.logoCaption}>{card.caption}</span> : <span />}
        </>
      )
  }
}
