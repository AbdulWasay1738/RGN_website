'use client'

import Link from 'next/link'
import { useRef, type KeyboardEvent } from 'react'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { Icon } from '@/components/ui/Icon'
import { coursePriceParts } from '@/lib/sales-calendar'
import type { NavChild, NavItem, SiteSettings } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import { visibleHref } from './navLinks'
import styles from './Header.module.css'

type Props = {
  item: NavItem
  open: boolean
  hiddenHrefs: string[]
  feature?: SiteSettings['megaMenuFeature']
  onOpen: () => void
  onClose: (focusTrigger?: boolean) => void
  onToggle: () => void
  onHoverEnter: () => void
  onHoverLeave: () => void
}

/** A header dropdown: the Education mega menu (style "mega") or the Media list (style "list"). */
export function NavDropdown({ item, open, hiddenHrefs, feature, onClose, onToggle, onHoverEnter, onHoverLeave }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const dropdown = item.dropdown
  const isMega = clean(dropdown?.style) === 'mega'
  const panelId = `ddp-${item._key}`

  const children = (dropdown?.items ?? [])
    .map((c) => ({ ...c, href: visibleHref(c.link?.href, hiddenHrefs) }))
    .filter((c) => c.href && c.label)
  const featureHref = visibleHref(feature?.cta?.link?.href, hiddenHrefs)
  const showFeature = isMega && dropdown?.showFeature && feature && featureHref

  if (!children.length && !showFeature) return null

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      onClose(false)
      triggerRef.current?.focus()
    }
  }

  const mainItems = children.filter((c) => !c.separated)
  const separatedItems = children.filter((c) => c.separated)

  return (
    <div
      ref={rootRef}
      className={`${styles.dd} ${isMega ? styles.ddEdu : styles.ddMedia} ${open ? styles.open : ''}`}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (open && rootRef.current && !rootRef.current.contains(e.relatedTarget as Node | null)) onClose(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.navA}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {item.label}
        <Icon name="chevron" className={`i ${styles.chev}`} />
      </button>
      <div className={styles.ddPanel} id={panelId}>
        {isMega ? (
          <>
            <div className="stack g8">
              {dropdown?.eyebrow ? (
                <span className={`eyebrow ${styles.megaEyebrow}`}>{dropdown.eyebrow}</span>
              ) : null}
              <div className="grid" style={{ ['--min' as string]: '250px', ['--gap' as string]: '4px' }}>
                {mainItems.map((c) => (
                  <MenuItem key={c._key} child={c} href={c.href as string} onNavigate={() => onClose(false)} />
                ))}
              </div>
              {separatedItems.length ? (
                <div className={styles.separated}>
                  {separatedItems.map((c) => (
                    <MenuItem key={c._key} child={c} href={c.href as string} onNavigate={() => onClose(false)} />
                  ))}
                </div>
              ) : null}
            </div>
            {showFeature ? (
              <Link href={featureHref as string} className={styles.mfeat} onClick={() => onClose(false)}>
                {feature?.eyebrow ? <span className={`eyebrow ${styles.featEyebrow}`}>{feature.eyebrow}</span> : null}
                {feature?.headline ? <span className={styles.featHeadline}>{feature.headline}</span> : null}
                <span className="row g12 center">
                  {feature?.dateBadge ? <span className={styles.featDate}>{feature.dateBadge}</span> : null}
                  <span className={styles.featLine}>
                    {feature?.dateLine}
                    {feature?.dateLine && feature?.subLine ? <br /> : null}
                    {feature?.subLine}
                  </span>
                </span>
                {feature?.cta?.label ? (
                  <span className={`tlink ${styles.featCta}`}>
                    {feature.cta.label}
                    <Icon name="arrow" />
                  </span>
                ) : null}
              </Link>
            ) : null}
          </>
        ) : (
          children.map((c) => <MenuItem key={c._key} child={c} href={c.href as string} onNavigate={() => onClose(false)} />)
        )}
      </div>
    </div>
  )
}

function MenuItem({ child, href, onNavigate }: { child: NavChild; href: string; onNavigate: () => void }) {
  const badgeStyle = clean(child.badgeStyle)
  const hasBadge = !!child.badge || badgeStyle === 'bundleIcon'
  return (
    <Link href={href} className={styles.mi} onClick={onNavigate}>
      {hasBadge ? (
        <span
          className={`${styles.n} ${badgeStyle === 'bundleIcon' ? styles.nBundle : ''} ${badgeStyle === 'script' ? styles.nScript : ''}`}
          aria-hidden="true"
        >
          {badgeStyle === 'bundleIcon' ? <Icon name="bundle" /> : child.badge}
        </span>
      ) : null}
      <span>
        {child.eyebrow ? <span className={`eyebrow ${styles.miEyebrow}`}>{child.eyebrow}</span> : null}
        <strong>{child.label}</strong>
        <MenuDescription child={child} />
      </span>
    </Link>
  )
}

function MenuDescription({ child }: { child: NavChild }) {
  const { now, dates } = useSalesCalendar()
  const course = child.priceFromCourse
  if (course && (typeof course.regularPrice === 'number' || typeof course.introPrice === 'number')) {
    const p = coursePriceParts(course, now, dates)
    const parts = [course.shortLine, `$${p.now}${p.intro ? ' intro' : ''}`].filter(Boolean)
    return <span className={styles.s}>{parts.join(' · ')}</span>
  }
  if (!child.description) return null
  return <span className={styles.s}>{child.description}</span>
}
