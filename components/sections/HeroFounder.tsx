import type { CSSProperties, ReactNode } from 'react'
import { Swoosh } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { CtaLink } from '@/components/ui/Button'
import { SanityImage } from '@/components/ui/SanityImage'
import type { HeroFounderSection } from '@/lib/sanity/types'
import { parseAccentText } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './HeroFounder.module.css'

type Token = { kind: 'space' } | { kind: 'break' } | { kind: 'word'; node: ReactNode }

/** Splits the headline into words for the stagger animation, keeping accent, swoosh and line-break markup. */
function headlineTokens(text?: string): Token[] {
  const tokens: Token[] = []
  for (const seg of parseAccentText(text)) {
    if (seg.kind === 'break') {
      tokens.push({ kind: 'break' })
      continue
    }
    if (seg.kind === 'swoosh') {
      tokens.push({ kind: 'word', node: <Swoosh text={seg.text} className={seg.accent ? 'acc' : undefined} /> })
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

/**
 * Home hero (client feedback round two): eyebrow, staggered two-line headline
 * with the swoosh word, lead, buttons and support line, beside the founder
 * cutout on a faint lavender glow. No emblem, brush or floating cards, and
 * never an R watermark behind her photo.
 */
export function HeroFounder({ section, index }: SectionProps<HeroFounderSection>) {
  const tokens = headlineTokens(section.headline)
  let wordIndex = 0
  const lower = section.lowerThird

  return (
    <Band background={section.background ?? 'navy'} anchorId={section.anchorId} padding="none" className={styles.hero}>
      <div className={`wrap ${styles.heroIn}`}>
        <div className={styles.copy}>
          {section.eyebrow ? <span className={`eyebrow fade-up ${styles.eyebrow}`}>{section.eyebrow}</span> : null}
          {tokens.length ? (
            <h1 className={`h1 ${styles.headline}`}>
              {tokens.map((t, i) => {
                if (t.kind === 'space') return ' '
                if (t.kind === 'break') return <br key={i} />
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
              <CtaLink cta={section.primaryCta} fallbackStyle="primary" arrow track="hero_growth" />
              <CtaLink cta={section.secondaryCta} fallbackStyle="outlineLight" arrow={false} track="hero_assessment" />
            </div>
          ) : null}
          {section.supportLine ? <p className={`fade-up ${styles.note}`}>{section.supportLine}</p> : null}
        </div>

        <div className={styles.art}>
          <span className={styles.glow} aria-hidden="true" />
          <SanityImage
            image={section.portrait}
            fallback={{ file: 'jenna-cutout.webp', alt: 'Jenna Colombo, founder of Reel Good News.' }}
            alt={section.portrait?.alt || 'Jenna Colombo, founder of Reel Good News.'}
            className={styles.cutout}
            sizes="(max-width: 760px) 210px, 290px"
            priority={index <= 1}
          />
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
