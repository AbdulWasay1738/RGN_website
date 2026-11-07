'use client'

import Link from 'next/link'
import { Watermark } from '@/components/brand'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { AccentText } from '@/components/ui/AccentText'
import { CtaLink } from '@/components/ui/Button'
import { SanityImage } from '@/components/ui/SanityImage'
import type { SimpleLink } from '@/lib/sanity/types'
import { isInternal, visibleHref } from './navLinks'
import { NewsletterForm } from './NewsletterForm'
import styles from './Footer.module.css'

/** Site footer: newsletter, brand block, link columns, legal links, disclaimer and copyright. */
export function Footer() {
  const { settings, hiddenHrefs } = useSite()
  const { now } = useSalesCalendar()
  const f = settings?.footer
  const year = String(now.getFullYear())

  const links = (list?: SimpleLink[]) =>
    (list ?? [])
      .map((l) => ({ key: l._key ?? l.label, label: l.label, href: visibleHref(l.link?.href, hiddenHrefs), newTab: l.link?.newTab }))
      .filter((l): l is { key: string; label: string; href: string; newTab: boolean | undefined } => !!l.href && !!l.label)

  return (
    <footer className={styles.footer}>
      <Watermark style={{ right: -140, bottom: -160, width: 480, color: '#1A2B45', opacity: 0.55 }} />
      <div className={styles.newsBand}>
        <div className={`wrap row g24 ${styles.newsIn}`}>
          <div className={`stack g8 ${styles.newsCopy}`}>
            {f?.newsletterEyebrow ? <span className={`eyebrow ${styles.eyebrow}`}>{f.newsletterEyebrow}</span> : null}
            <AccentText as="h2" text={f?.newsletterHeadline} className={styles.newsHeadline} />
            {f?.newsletterBody ? <span className={styles.newsBody}>{f.newsletterBody}</span> : null}
          </div>
          <NewsletterForm
            label={f?.newsletterLabel}
            placeholder={f?.newsletterPlaceholder}
            button={f?.newsletterButton}
            success={f?.newsletterSuccess}
          />
        </div>
      </div>
      <div className={`wrap stack g48 ${styles.main}`}>
        <div className="row g48 between">
          <div className={`stack g16 ${styles.brand}`}>
            <SanityImage
              image={settings?.logoInverted}
              fallback={{ file: 'logo-invert.png', alt: 'Reel Good News' }}
              alt="Reel Good News"
              sizes="210px"
              className={styles.logo}
            />
            {f?.tagline ? <p className={styles.tagline}>{f.tagline}</p> : null}
            {f?.handwrittenLine ? <span className={`hand ${styles.hand}`}>{f.handwrittenLine}</span> : null}
            <CtaLink cta={f?.socialButton} fallbackStyle="outlineLight" small className={styles.social} />
          </div>
          {f?.columns?.length ? (
            <div className="row g48">
              {f.columns.map((col) => {
                const items = links(col.links)
                if (!items.length) return null
                return (
                  <nav key={col._key} className={styles.fcol} aria-label={col.title || undefined}>
                    {col.title ? <span className={`eyebrow ${styles.eyebrow}`}>{col.title}</span> : null}
                    {items.map((l) => (
                      <FooterLink key={l.key} href={l.href} newTab={l.newTab} className={styles.fl}>
                        {l.label}
                      </FooterLink>
                    ))}
                  </nav>
                )
              })}
            </div>
          ) : null}
        </div>
        <div className={`stack g12 ${styles.legalBlock}`}>
          {f?.legalLinks?.length ? (
            <nav className="row g24" aria-label="Legal">
              {links(f.legalLinks).map((l) => (
                <FooterLink key={l.key} href={l.href} newTab={l.newTab} className={styles.legalLink}>
                  {l.label}
                </FooterLink>
              ))}
            </nav>
          ) : null}
          {f?.disclaimer ? <p className={styles.disclaimer}>{f.disclaimer}</p> : null}
          {f?.copyright ? (
            <div className="row g16 between">
              <span>{f.copyright.replace(/\{year\}/g, year)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, newTab, className, children }: { href: string; newTab?: boolean; className?: string; children: React.ReactNode }) {
  if (isInternal(href) && !newTab) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}
