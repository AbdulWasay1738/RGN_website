import type { CSSProperties } from 'react'
import { QuoteMark } from '@/components/brand'
import { EmailCard } from '@/components/features/forms/EmailCard'
import { SiteForm } from '@/components/features/forms/SiteForm'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import type { Background, FormKind, FormSection, FormSectionSide } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './FormBlock.module.css'

const delay = (s: number) => ({ ['--dl' as string]: `${s}s` }) as CSSProperties

const DEFAULT_TONE: Record<FormKind, NonNullable<FormSection['panelTone']>> = {
  contact: 'white',
  partner: 'paper',
  speaking: 'paper',
  guest: 'lavender-tint',
  talent: 'paper',
}
const PANEL_CLASS: Record<NonNullable<FormSection['panelTone']>, string> = {
  paper: 'panel',
  white: 'panel-w',
  'lavender-tint': 'panel-l',
}

/**
 * A form with its heading and side content: Contact (hero layout with the
 * email card), Partner (quote), Speaking, Podcast guest and Careers (open roles).
 */
export function FormBlock({ section }: SectionProps<FormSection>) {
  const kind: FormKind = clean(section.form) ?? 'contact'
  const hero = clean(section.layout) === 'hero'
  const background: Background = clean(section.background) ?? (hero ? 'paper' : 'white')
  const tone = clean(section.panelTone) ?? DEFAULT_TONE[kind]
  // A plain panel on a band of the same colour would disappear, so swap it for white.
  const panelTone = tone === 'paper' && background === 'paper' ? 'white' : tone
  const side: FormSectionSide = section.side ?? {}
  const sideKind = clean(side.kind) ?? 'none'
  const roles = sideKind === 'roles' ? ('roles' in side ? side.roles : undefined) ?? [] : []

  const formHeader =
    sideKind === 'roles' ? (
      <div className="stack g12">
        <AccentText as="h2" text={section.headline} className={`h3 ${styles.panelHeadline}`} />
        {section.intro ? <p className={`muted ${styles.noMargin}`}>{section.intro}</p> : null}
      </div>
    ) : undefined

  const form = (
    <SiteForm
      kind={kind}
      className={`grow ${PANEL_CLASS[panelTone]} ${hero ? 'fade-up' : ''}`}
      header={formHeader}
      submitLabel={section.submitLabel}
      submitStyle={panelTone === 'lavender-tint' ? 'dark' : 'primary'}
      footnote={section.footnote}
      consentText={section.consentText}
      subjectOptions={section.subjectOptions}
      selectOptions={section.selectOptions}
      successTitle={section.successTitle}
      successBody={section.successBody}
      successCtaLabel={section.successCtaLabel}
    />
  )

  if (hero) {
    const email = 'email' in side ? clean(side.email) : undefined
    return (
      <Band background={background} watermark={section.watermark} anchorId={section.anchorId} padding="none">
        <div className={`wrap row g64 ${styles.hero}`}>
          <div className="side stack g20">
            {section.eyebrow ? <span className="eyebrow fade-up">{section.eyebrow}</span> : null}
            <AccentText as="h1" text={section.headline} className={`h1 fade-up ${styles.xl}`} style={delay(0.08)} />
            {section.intro ? (
              <p className="lead fade-up" style={delay(0.16)}>
                {section.intro}
              </p>
            ) : null}
            {sideKind === 'emailCard' && email ? (
              <div className="stack g12 fade-up" style={delay(0.24)}>
                <EmailCard label={'emailLabel' in side ? side.emailLabel : undefined} email={email} copyLabel={'copyLabel' in side ? side.copyLabel : undefined} />
              </div>
            ) : null}
          </div>
          {form}
        </div>
      </Band>
    )
  }

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className={`wrap row ${sideKind === 'roles' ? 'g32' : 'g64'} ${styles.top}`}>
        <div className={`side stack ${sideKind === 'quote' ? 'g20' : sideKind === 'roles' ? 'g12' : 'g16'}`}>
          {sideKind === 'roles' ? (
            <>
              {'rolesEyebrow' in side && side.rolesEyebrow ? <span className="eyebrow">{side.rolesEyebrow}</span> : null}
              {roles.map((r, i) => (
                <div key={r._key ?? i} className={`stack g8 placeholder-card ${styles.role}`}>
                  <strong className={`display ${styles.roleTitle}`}>
                    {r.link?.href ? <a href={r.link.href}>{r.title}</a> : r.title}
                  </strong>
                  {r.meta ? <span className="muted">{r.meta}</span> : null}
                  {r.note ? <span className={`muted ${styles.roleNote}`}>{r.note}</span> : null}
                </div>
              ))}
            </>
          ) : (
            <>
              {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
              <AccentText as="h2" text={section.headline} className="h2" />
              {section.intro ? <p className={`muted ${styles.noMargin}`}>{section.intro}</p> : null}
              {sideKind === 'quote' && 'quote' in side && side.quote?.quote ? (
                <figure className={`stack g12 ${styles.quote}`}>
                  <QuoteMark width={44} color="#C6A7ED" />
                  <blockquote className={styles.quoteText}>{side.quote.quote}</blockquote>
                  <figcaption className={styles.quoteBy}>
                    <strong>{side.quote.name}</strong>
                    {side.quote.company ? ` · ${side.quote.company}` : ''}
                  </figcaption>
                </figure>
              ) : null}
            </>
          )}
        </div>
        {form}
      </div>
    </Band>
  )
}
