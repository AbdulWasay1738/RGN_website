/**
 * Analytics seam. `track()` is a no-op until the visitor accepts analytics in
 * the cookie notice AND phase 6 loads Google Tag Manager (NEXT_PUBLIC_GTM_ID).
 * Event names follow the prototype's data-track attributes (hero_reserve,
 * banner_click, form_contact, purchase_workshop, ...).
 */
export const CONSENT_KEY = 'rgn_cookie'

type DataLayerWindow = Window & { dataLayer?: Array<Record<string, unknown>> }

/** True once the visitor has accepted analytics cookies. */
export function consentGranted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'yes'
  } catch {
    return false
  }
}

export function track(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !consentGranted()) return
  const w = window as DataLayerWindow
  if (!w.dataLayer) return // GTM not loaded yet (phase 6)
  w.dataLayer.push({ event, ...props })
}
