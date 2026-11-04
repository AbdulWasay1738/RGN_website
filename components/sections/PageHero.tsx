import Link from 'next/link'
import type { CSSProperties } from 'react'
import { QuoteMark, SpinningReel } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { buttonClass, CtaLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import { BACKGROUND_CLASS } from '@/components/ui/Band'
import type { Background, Cta, PageHeroArt, PageHeroSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './PageHero.module.css'

const delay = (s: number) => ({ ['--dl' as string]: `${s}s` }) as CSSProperties

/**
 * A CMS call to action. When the editor has written a label but the link is
 * not set yet (for example "View job openings"), it shows as an inert button
 * so the layout matches the prototype without a dead link.
 */
export function CtaOrPlaceholder({ cta, fallbackStyle = 'primary', small, arrow }: { cta?: Cta | null; fallbackStyle?: Cta['style']; small?: boolean; arrow?: boolean }) {
  if (!cta?.label) return null
  if (cta.link?.href) return <CtaLink cta={cta} fallbackStyle={fallbackStyle} small={small} arrow={arrow} />
  const style = clean(cta.style) ?? fallbackStyle ?? 'primary'
  return (
    <span className={buttonClass(style, { small })} aria-disabled="true">
      {cta.label}
    </span>
  )
}

const DARK = new Set<Background>(['navy', 'ink'])

const isInternal = (href?: string) => !!href && (href.startsWith('/') || href.startsWith('#'))

/** Inner-page hero: eyebrow, optional breadcrumb, h1, lead, chips, calls to action and an art variant. */
export function PageHero({ section, index, pageTitle }: SectionProps<PageHeroSection>) {
  const art: PageHeroArt = clean(section.art) ?? 'none'
  const background: Background = clean(section.background) ?? 'paper'
  const dark = DARK.has(background)
  const size = clean(section.headingSize) ?? 'default'
  const handBelow = clean(section.handLinePosition) === 'below'
  const priority = index === 0

  const headingClass = [
    'h1',
    'fade-up',
    size === 'large' ? styles.large : size === 'xl' ? styles.xl : art === 'reelPortrait' ? styles.profile : '',
  ]
    .filter(Boolean)
    .join(' ')

  const crumb =
    section.crumbParent?.label || section.crumbCurrent ? (
      <nav className="crumb fade-up" aria-label="Breadcrumb">
        {section.crumbParent?.link?.href ? <Link href={section.crumbParent.link.href}>{section.crumbParent.label}</Link> : section.crumbParent?.label}
        {section.crumbParent?.label ? ' / ' : null}
        <span className="here" aria-current="page">
          {section.crumbCurrent ?? pageTitle}
        </span>
      </nav>
    ) : null

  const hand = section.handLine ? (
    <span className={`hand fade-up ${art === 'reelPortrait' ? styles.handLarge : ''}`} style={delay(handBelow ? 0.2 : 0.04)}>
      {section.handLine}
    </span>
  ) : null

  const ctas = (section.ctas ?? []).filter((c) => c?.label)
  const copy = (
    <>
      {crumb}
      {section.eyebrow ? <span className="eyebrow fade-up">{section.eyebrow}</span> : null}
      {!handBelow ? hand : null}
      <AccentText as="h1" text={section.headline} className={headingClass} style={delay(0.08)} />
      {section.sublead ? (
        <p className={`fade-up ${styles.sublead}`} style={delay(0.16)}>
          {section.sublead}
        </p>
      ) : null}
      {section.lead ? (
        <p className={`lead fade-up ${art === 'quoteMark' ? styles.leadWide : ''}`} style={delay(0.16)}>
          {section.lead}
        </p>
      ) : null}
      {handBelow ? hand : null}
      {section.chips?.length ? (
        <div className="row g8 fade-up" style={delay(0.22)}>
          {section.chips.map((c) => (
            <span key={c} className={`pill ${styles.pill}`}>
              {c}
            </span>
          ))}
        </div>
      ) : null}
      {ctas.length ? (
        <div className="row g12 fade-up" style={delay(0.24)}>
          {ctas.map((cta, i) => (
            <CtaOrPlaceholder key={cta._key ?? i} cta={cta} fallbackStyle={i === 0 ? 'primary' : dark ? 'outlineLight' : 'outline'} arrow={i === 0 && isInternal(cta.link?.href)} />
          ))}
        </div>
      ) : null}
    </>
  )

  const bandClass = [BACKGROUND_CLASS[background] ?? 'paper', styles.hero].join(' ')
  const anchorId = clean(section.anchorId) || undefined

  /* Founder-page layout: copy beside a spinning reel and the cutout portrait. */
  if (art === 'reelPortrait' || art === 'portraitCutout') {
    return (
      <section className={bandClass} id={anchorId}>
        <div className={`wrap ${styles.heroIn}`}>
          <div className={styles.heroCopy}>{copy}</div>
          <div className={styles.heroArt}>
            {art === 'reelPortrait' ? (
              <SpinningReel disc="#13233F" hole="#091527" ring="#C6A7ED" seconds={80} className={styles.reel} />
            ) : null}
            <SanityImage
              image={section.image}
              fallback={{ file: 'jenna-cutout.webp', alt: 'Jenna Colombo, founder of Reel Good News.' }}
              className={styles.cutout}
              priority={priority}
              sizes="(max-width: 760px) 220px, 300px"
            />
          </div>
        </div>
      </section>
    )
  }

  /* Single column: no art, a quote mark or a reel in the corner. */
  if (art === 'none' || art === 'quoteMark' || art === 'reel') {
    return (
      <section className={bandClass} id={anchorId}>
        {art === 'quoteMark' ? (
          <div className={styles.quoteArt} aria-hidden="true">
            <QuoteMark width={520} color="#C6A7ED" />
          </div>
        ) : null}
        {art === 'reel' ? <SpinningReel disc={dark ? '#13233F' : '#EFE8DC'} hole={dark ? '#091527' : '#FAF7F2'} seconds={100} className={styles.cornerReel} /> : null}
        <div className={`wrap stack g24 ${styles.single} ${art === 'reel' ? styles.singleTall : ''}`}>{copy}</div>
      </section>
    )
  }

  /* Two columns: copy plus a side art piece. */
  const rowClass = ['wrap row g64', styles.split, art === 'podcastCover' ? styles.reverse : '', art === 'linkedinCard' ? styles.bottom : ''].join(' ')
  const sideArt = <HeroSideArt section={section} art={art} priority={priority} />
  return (
    <section className={bandClass} id={anchorId}>
      <div className={rowClass}>
        {art === 'podcastCover' ? sideArt : null}
        <div className={`grow stack ${art === 'linkedinCard' ? 'g20' : 'g24'}`}>{copy}</div>
        {art !== 'podcastCover' ? sideArt : null}
      </div>
    </section>
  )
}

function HeroSideArt({ section, art, priority }: { section: PageHeroSection; art: PageHeroArt; priority: boolean }) {
  const card = section.artCard
  if (art === 'steps') {
    const steps = section.artSteps ?? []
    return (
      <div className="side stack g12">
        {steps.map((s, i) => {
          const last = i === steps.length - 1
          return (
            <div
              key={s._key ?? i}
              className={`row g20 nowrap center fade-up ${styles.stepRow} ${last ? styles.stepLast : ''}`}
              style={{ ...delay(0.2 + i * 0.15), marginLeft: `${Math.min(i, 2) * 28}px` }}
            >
              <span className={`outline ${styles.stepNum}`} aria-hidden="true">
                {s.number}
              </span>
              <span className="stack">
                <strong className={`display ${styles.stepTitle}`}>{s.title}</strong>
                <span className={styles.stepText}>{s.text}</span>
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (art === 'portraitCard') {
    return (
      <div className={`side fade-up ${styles.portraitWrap}`} style={delay(0.2)}>
        <div className={styles.portraitBack} aria-hidden="true" />
        <div className={styles.portraitCard}>
          <SpinningReel disc="#FFFFFF" hole="#F23300" seconds={80} className={styles.portraitReel} />
          <SanityImage
            image={section.image}
            fallback={{ file: 'jenna-cutout.webp', alt: 'Jenna Colombo, speaker.' }}
            className={styles.portraitImg}
            priority={priority}
            sizes="260px"
          />
          {card?.chip ? (
            <span className={`chip chip-n ${styles.onStage}`}>
              <span className="dot pulse" />
              {card.chip}
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  if (art === 'linkedinCard') {
    const inner = (
      <>
        <span className={`row between ${styles.liTop}`}>
          <Icon name="linkedin" size={44} />
          <span className={styles.liArrow}>
            <Icon name="arrow" />
          </span>
        </span>
        <span className={`display ${styles.liTitle}`}>{card?.title}</span>
        {card?.text ? <span className={styles.liText}>{card.text}</span> : null}
      </>
    )
    const cls = `side card lift fade-up ${styles.liCard}`
    if (card?.link?.href) {
      const external = !card.link.href.startsWith('/')
      return (
        <a href={card.link.href} className={cls} style={delay(0.2)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {inner}
        </a>
      )
    }
    return (
      <div className={cls} style={delay(0.2)}>
        {inner}
      </div>
    )
  }

  if (art === 'podcastCover') {
    const lines = (card?.title ?? '').split(/\n/)
    return (
      <div className={`side fade-up ${styles.podWrap}`} style={delay(0.2)} aria-hidden="true">
        <div className={styles.podCover}>
          <SpinningReel disc="#091527" hole="#F23300" seconds={30} className={styles.podReel} />
          <div className={`stack g8 ${styles.podText}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo-invert.png" alt="" className={styles.podLogo} width={1200} height={296} />
            <span className={`display ${styles.podTitle}`}>
              {lines.map((l, i) => (
                <span key={i}>
                  {l}
                  {i < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </span>
            {card?.text ? <span className={styles.podHand}>{card.text}</span> : null}
          </div>
        </div>
      </div>
    )
  }

  return null
}
