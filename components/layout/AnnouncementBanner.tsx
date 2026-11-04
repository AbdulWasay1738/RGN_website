'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { activeBannerVariant, countdownTarget, daysUntil } from '@/lib/sales-calendar'
import { isInternal } from './navLinks'
import styles from './AnnouncementBanner.module.css'

const STORAGE_KEY = 'rgn_banner'
const CHANGE_EVENT = 'rgn-banner-change'
// Fallback when session storage is blocked: hidden until the next full page load.
let dismissedInMemory = false

function readDismissed() {
  if (dismissedInMemory) return true
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '0'
  } catch {
    return false
  }
}
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/**
 * Date-driven announcement. Shows the first variant whose window contains
 * "now", with a live "N days left" pill. Dismissal lasts for the session.
 */
export function AnnouncementBanner() {
  const { banner } = useSite()
  const { now, dates } = useSalesCalendar()
  // The server always renders the banner; the stored dismissal applies after hydration.
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => false)

  const variant = activeBannerVariant(banner, now, dates)
  if (!variant || dismissed) return null

  const target = countdownTarget(variant, dates)
  const days = target ? daysUntil(target, now) : null
  const href = variant.ctaLink?.href

  const dismiss = () => {
    dismissedInMemory = true
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '0')
    } catch {
      /* storage blocked: the in-memory flag covers this page view */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
    track('banner_dismiss')
  }

  return (
    <div className={styles.banner} role="region" aria-label="Announcement">
      <div className={`wrap ${styles.inner}`}>
        {variant.label ? (
          <b className={styles.label}>
            <span className="dot pulse" aria-hidden="true" />
            {variant.label}
          </b>
        ) : null}
        {variant.message ? <span>{variant.message}</span> : null}
        {days !== null ? (
          <span className={styles.count}>
            {days} {days === 1 ? 'day' : 'days'} left
          </span>
        ) : null}
        {href && variant.ctaLabel ? (
          isInternal(href) ? (
            <Link href={href} className={styles.cta} data-track="banner_click" onClick={() => track('banner_click')}>
              {variant.ctaLabel}
            </Link>
          ) : (
            <a href={href} className={styles.cta} data-track="banner_click" onClick={() => track('banner_click')}>
              {variant.ctaLabel}
            </a>
          )
        ) : null}
        <button type="button" className={styles.x} onClick={dismiss} aria-label="Dismiss announcement">
          <Icon name="close" size={12} />
        </button>
      </div>
    </div>
  )
}
