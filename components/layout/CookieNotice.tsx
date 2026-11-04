'use client'

import { useEffect, useState } from 'react'
import { useSite } from '@/components/providers/SiteProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { CONSENT_KEY } from '@/lib/analytics'
import styles from './CookieNotice.module.css'

/**
 * Cookie notice, shown once about 1.6s after the first visit. The choice is
 * stored so lib/analytics.ts can load tracking only after "Accept".
 */
export function CookieNotice() {
  const { settings } = useSite()
  const toast = useToast()
  const [visible, setVisible] = useState(false)
  const c = settings?.cookieNotice

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(CONSENT_KEY)
    } catch {
      stored = null
    }
    if (stored) return
    const t = window.setTimeout(() => setVisible(true), 1600)
    return () => window.clearTimeout(t)
  }, [])

  if (!visible || !c) return null

  const choose = (value: 'yes' | 'no') => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value)
    } catch {
      /* storage blocked: the choice lasts for this page view */
    }
    setVisible(false)
    const msg = value === 'yes' ? c.acceptedToast : c.declinedToast
    if (msg) toast(msg)
  }

  return (
    <div className={styles.cookie} role="dialog" aria-label="Cookie preferences" aria-modal="false">
      {c.title ? <strong className={styles.title}>{c.title}</strong> : null}
      {c.body ? <span className={styles.body}>{c.body}</span> : null}
      <div className="row g8">
        <button type="button" className="btn btn-d btn-sm" onClick={() => choose('yes')}>
          {c.acceptLabel || 'Accept analytics'}
        </button>
        <button type="button" className="btn btn-o btn-sm" onClick={() => choose('no')}>
          {c.declineLabel || 'Decline'}
        </button>
      </div>
    </div>
  )
}
