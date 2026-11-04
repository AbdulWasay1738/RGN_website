import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Brush, Watermark } from '@/components/brand'
import { Swoosh } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import type { HeroFounderSection } from '@/lib/sanity/types'
import { parseAccentText } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './HeroFounder.module.css'

type Token = { kind: 'space' } | { kind: 'word'; node: ReactNode }

/** Splits the headline into words for the stagger animation, keeping accent and swoosh markup. */
function headlineTokens(text?: string): Token[] {
  const tokens: Token[] = []
  for (const seg of parseAccentText(text)) {
    if (seg.kind === 'swoosh') {
      tokens.push({ kind: 'word', node: <Swoosh text={seg.text} /> })
      continue
    }
    for (const part of seg.text.split(/(\s+)/)) {
      if (!part) continue
      if (/^\s+$/.test(part)) tokens.push({ kind: 'space' })
      else tokens.push({ kind: 'word', node: seg.kind === 'accent' ? <span className="acc">{part}</span> : part })
    }
  }
  return tokens
}

/** Home hero: handwritten line, staggered headline with the swoosh word, founder cutout and floating cards. */
export function HeroFounder({ section, index }: SectionProps<HeroFounderSection>) {
  const tokens = headlineTokens(section.headline)
  let wordIndex = 0
  const card = section.workshopCard
  const stat = section.statCard
  const lower = section.lowerThird

  const cardInner = (
    <>
      <span className={styles.calIcon}>
        <Icon name="calendar" />
      </span>
      <span className={styles.f1Text}>
        {card?.title ? <strong className={styles.f1Title}>{card.title}</strong> : null}
        {card?.line ? <span className={styles.f1Line}>{card.line}</span> : null}
      </span>
    </>
  )

  return (
    <Band
      background={section.background ?? 'navy'}
      watermark={section.watermark}
      anchorId={section.anchorId}
      padding="none"
      className={styles.hero}
    >
      <div className={`wrap ${styles.heroIn}`}>
        <div className={styles.copy}>
          {section.handLine ? <span className={`hand fade-up ${styles.handLine}`}>{section.handLine}</span> : null}
          {tokens.length ? (
            <h1 className="h1">
              {tokens.map((t, i) => {
                if (t.kind === 'space') return ' '
                const d = wordIndex++
                return (
                  <span key={i} className={styles.w} style={{ '--d': d } as CSSProperties}>
                    {t.node}
                  </span>
                )
              })}
            </h1>
          ) : null}
          {section.lead ? <p className={`lead fade-up ${styles.lead}`}>{section.lead}</p> : null}
          {section.primaryCta?.label || section.secondaryCta?.label ? (
            <div className={`row g12 fade-up ${styles.ctas}`}>
              <CtaLink cta={section.primaryCta} fallbackStyle="primary" arrow track="hero_reserve" />
              <CtaLink cta={section.secondaryCta} fallbackStyle="outlineLight" arrow={false} track="hero_assessment" />
            </div>
          ) : null}
        </div>

        <div className={styles.art}>
          <Watermark className={styles.wm} />
          <Brush style={{ left: '-8%', top: 150, width: '118%', height: 330, transform: 'rotate(-26deg)', zIndex: 0, opacity: 0.92 }} />
          <SanityImage
            image={section.portrait}
            fallback={{ file: 'jenna-cutout.webp', alt: 'Jenna Colombo, founder of Reel Good News.' }}
            alt={section.portrait?.alt || 'Jenna Colombo, founder of Reel Good News.'}
            className={styles.cutout}
            sizes="(max-width: 760px) 210px, 290px"
            priority={index <= 1}
          />
          {card?.title || card?.line ? (
            card.link?.href ? (
              <Link href={card.link.href} className={`${styles.float} ${styles.f1}`}>
                {cardInner}
              </Link>
            ) : (
              <div className={`${styles.float} ${styles.f1}`}>{cardInner}</div>
            )
          ) : null}
          {typeof stat?.value === 'number' || stat?.label ? (
            <div className={`${styles.float} ${styles.f2}`}>
              {typeof stat?.value === 'number' ? <CountUp to={stat.value} className={styles.f2Value} /> : null}
              {stat?.label ? <span className={styles.f2Label}>{stat.label}</span> : null}
            </div>
          ) : null}
          {lower?.name ? (
            <div className={styles.lower3}>
              {lower.tag ? <span className={styles.tag}>{lower.tag}</span> : null}
              <span className={styles.nm}>
                <strong className={styles.nmName}>{lower.name}</strong>
                {lower.title ? <span className={styles.nmTitle}>{lower.title}</span> : null}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  )
}
