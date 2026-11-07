'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { submitForm } from '@/app/actions/forms'
import type { CheckoutOffer } from '@/components/providers/CheckoutProvider'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { buttonClass } from '@/components/ui/Button'
import { Consent, Field, SpamTraps } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { validateForm, VALIDATION_MESSAGES, type FieldErrors } from '@/lib/forms'
import { bundlePriceParts, coursePrice, isEarlyBird, isIntro, seatsLeft, workshopPrice } from '@/lib/sales-calendar'
import type { CheckoutLabels } from '@/lib/sanity/types'
import { interpolate } from '@/lib/text'
import styles from './CheckoutModal.module.css'

/** Defaults mirror the seeded copy so the modal still works if a label is cleared in the Studio. */
const DEFAULTS: Required<CheckoutLabels> = {
  eyebrow: 'Secure checkout',
  attendanceLegend: 'How will you attend?',
  inPersonLabel: 'In person',
  zoomLabel: 'On Zoom',
  soldOutLabel: 'sold out',
  seatsLeftLabel: '{n} left',
  nameLabel: 'Full name',
  emailLabel: 'Email',
  phoneLabel: 'Mobile number',
  phoneHelp: 'For the order confirmation text.',
  consentText: '',
  totalLabel: 'Total',
  submitLabel: 'Continue to payment',
  secureNote: 'Payments by Stripe.',
  placeholderChip: 'Stripe Checkout opens here',
  placeholderBody: '',
  placeholderButton: 'Continue',
  cancelLabel: 'Cancel',
  workshopSubline: '{ticket} ticket · {date} · {time}',
  courseSubline: 'Online course · {priceType}',
  bundleSubline: '',
  bundleIntroPriceLabel: 'introductory price',
  earlyBirdTicket: 'Early-bird',
  standardTicket: 'Standard',
  introPriceLabel: 'introductory price',
  regularPriceLabel: 'regular price',
}

type Product = {
  /** Value for the order page's `offer` parameter: workshop, bundle or a course slug */
  id: string
  kind: 'workshop' | 'course' | 'bundle'
  name: string
  sub: string
  price: number
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The checkout dialog opened by "Reserve my seat", "Enroll now", "Get the
 * bundle" and "Pre-order". First build: validates, records the request and
 * shows a placeholder payment step. Phase 6: the payment step becomes a
 * redirect to Stripe Checkout (see the "Phase 6" comment below).
 */
export function CheckoutModal({ offer, onClose }: { offer: CheckoutOffer; onClose: () => void }) {
  const site = useSite()
  const { now, dates } = useSalesCalendar()
  const labels = useMemo(() => {
    const fromCms = site.settings?.checkout ?? {}
    const merged = { ...DEFAULTS }
    for (const key of Object.keys(fromCms) as Array<keyof CheckoutLabels>) {
      const v = fromCms[key]
      if (typeof v === 'string' && v.trim()) merged[key] = v
    }
    return merged
  }, [site.settings?.checkout])

  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<'details' | 'payment'>('details')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)
  const [order, setOrder] = useState<{ att: string; name: string; ref: string } | null>(null)

  const left = seatsLeft(site.calendar)
  const soldOut = left === 0

  const product: Product | null = useMemo(() => {
    if (offer.kind === 'workshop') {
      const ws = site.workshop
      const early = isEarlyBird(now, dates)
      return {
        id: 'workshop',
        kind: 'workshop',
        name: ws?.title ?? 'Workshop',
        sub: interpolate(labels.workshopSubline, {
          ticket: early ? labels.earlyBirdTicket : labels.standardTicket,
          date: ws?.dateLabel ?? '',
          time: ws?.timeLabel ?? '',
        }),
        price: workshopPrice(ws, now, dates),
      }
    }
    if (offer.kind === 'bundle') {
      const p = bundlePriceParts(site.bundle, now, dates)
      const priceType = p.intro ? labels.bundleIntroPriceLabel : labels.regularPriceLabel
      return {
        id: 'bundle',
        kind: 'bundle',
        name: site.bundle?.title ?? 'The Content Machine',
        sub: interpolate(labels.bundleSubline, { priceType, priceLabel: priceType }),
        price: p.now,
      }
    }
    if (offer.kind === 'course') {
      const c = site.courses.find((x) => x.slug === offer.slug)
      if (!c) return null
      return {
        id: c.slug ?? offer.slug,
        kind: 'course',
        name: c.title ?? '',
        sub: (() => {
          const priceType = isIntro(now, dates) && typeof c.introPrice === 'number' ? labels.introPriceLabel : labels.regularPriceLabel
          return interpolate(labels.courseSubline, { priceType, priceLabel: priceType })
        })(),
        price: coursePrice(c, now, dates),
      }
    }
    return null
  }, [offer, site, now, dates, labels])

  const book = site.book
  const bookRedirect = offer.kind === 'book' && !!book?.preorderUrl

  /* Pre-order with a link: go straight to the retailer or checkout page. */
  useEffect(() => {
    if (bookRedirect && book?.preorderUrl) {
      track('checkout_start_book')
      window.location.assign(book.preorderUrl)
      onClose()
    }
  }, [bookRedirect, book?.preorderUrl, onClose])

  useEffect(() => {
    if (product) track(`checkout_start_${product.id}`)
    else if (offer.kind === 'book') track('checkout_start_book')
    // Track once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Body scroll lock, Escape to close, focus trap, initial focus. */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>('form input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])')
    ;(first ?? dialog?.querySelector<HTMLElement>(FOCUSABLE))?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  useEffect(() => {
    if (step === 'payment') dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [step])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      )
      if (!nodes.length) return
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    },
    [onClose],
  )

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product || pending) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const values: Record<string, string> = {}
    fd.forEach((v, k) => {
      if (typeof v === 'string') values[k] = v
    })
    const clientErrors = validateForm('checkout', values)
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors)
      setFormError('')
      focusFirstError(form, clientErrors)
      return
    }
    setPending(true)
    setErrors({})
    setFormError('')
    try {
      const res = await submitForm('checkout', fd)
      if (!res.ok) {
        setErrors(res.errors)
        setFormError(res.message ?? VALIDATION_MESSAGES.failed)
        focusFirstError(form, res.errors)
        return
      }
      track('form_checkout', { offer: product.id })
      setOrder({
        att: values.attendance === 'zoom' ? 'zoom' : 'in-person',
        name: values.name ?? '',
        ref: String(Math.floor(1000 + Math.random() * 9000)),
      })
      setStep('payment')
    } catch {
      setFormError(VALIDATION_MESSAGES.failed)
    } finally {
      setPending(false)
    }
  }

  if (bookRedirect) return null

  const closeButton = (
    <button type="button" className="round-x" onClick={onClose} aria-label="Close checkout">
      <Icon name="close" />
    </button>
  )

  /* Pre-order with no link yet: a short message from the Book settings. */
  if (offer.kind === 'book') {
    const msg = book?.noLinkMessage
    return (
      <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
          <div className={styles.head}>
            <span className="stack g8">
              {msg?.eyebrow ? <span className="eyebrow">{msg.eyebrow}</span> : null}
              <h2 id={titleId} className={styles.title}>
                {book?.title}
              </h2>
            </span>
            {closeButton}
          </div>
          <div className={styles.body}>
            {msg?.body ? <p className={styles.message}>{msg.body}</p> : null}
            <button type="button" className={buttonClass('dark')} onClick={onClose}>
              {msg?.buttonLabel || 'OK'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null
  const isWorkshop = product.kind === 'workshop'
  const preferZoom = offer.kind === 'workshop' && offer.attendance === 'zoom'

  const orderHref = order
    ? `/order/confirmed?${new URLSearchParams({
        demo: '1',
        offer: product.id,
        ...(isWorkshop ? { att: order.att } : {}),
        name: order.name,
        ref: order.ref,
      }).toString()}`
    : '/order/confirmed?demo=1'

  return (
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <div className={styles.head}>
          <span className="stack g8">
            <span className="eyebrow">{labels.eyebrow}</span>
            <h2 id={titleId} className={styles.title}>
              {product.name}
            </h2>
            {product.sub ? <span className={styles.sub}>{product.sub}</span> : null}
          </span>
          {closeButton}
        </div>

        {step === 'details' ? (
          <form className={`${styles.body} form`} onSubmit={onSubmit} noValidate>
            <SpamTraps />
            <input type="hidden" name="offer" value={product.id} />
            {isWorkshop ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{labels.attendanceLegend}</legend>
                <div className="radio-pills">
                  <label htmlFor="co-in">
                    <input
                      id="co-in"
                      type="radio"
                      name="attendance"
                      value="in-person"
                      disabled={soldOut}
                      defaultChecked={!soldOut && !preferZoom}
                    />
                    {labels.inPersonLabel} · {soldOut ? labels.soldOutLabel : interpolate(labels.seatsLeftLabel, { n: left })}
                  </label>
                  <label htmlFor="co-zm">
                    <input id="co-zm" type="radio" name="attendance" value="zoom" defaultChecked={soldOut || preferZoom} />
                    {labels.zoomLabel}
                  </label>
                </div>
              </fieldset>
            ) : null}
            <div className="fgrid">
              <Field id="co-n" name="name" label={labels.nameLabel} required autoComplete="name" error={errors.name} />
              <Field id="co-e" name="email" type="email" label={labels.emailLabel} required autoComplete="email" error={errors.email} />
            </div>
            <Field
              id="co-p"
              name="phone"
              type="tel"
              label={labels.phoneLabel}
              required
              autoComplete="tel"
              help={labels.phoneHelp}
              error={errors.phone}
            />
            {labels.consentText ? (
              <Consent id="co-ok" name="smsConsent">
                {labels.consentText}
              </Consent>
            ) : null}
            <div className={styles.total}>
              <span className={styles.totalLabel}>{labels.totalLabel}</span>
              <span className={styles.totalValue}>${product.price}</span>
            </div>
            {formError ? (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            ) : null}
            <button type="submit" className={buttonClass('primary', { block: true })} disabled={pending} aria-busy={pending}>
              {labels.submitLabel} <Icon name="arrow" />
            </button>
            <span className={styles.secure}>
              <Icon name="lock" /> {labels.secureNote}
            </span>
          </form>
        ) : (
          /*
           * Phase 6: replace this placeholder step with a POST to /api/checkout,
           * which creates a Stripe Checkout Session (price chosen on the server by
           * lib/sales-calendar.ts, never trusted from the browser) and redirects to
           * it. Stripe's success URL is /order/confirmed?session_id={CHECKOUT_SESSION_ID}.
           */
          <div className={styles.payment}>
            <span className="chip chip-l">{labels.placeholderChip}</span>
            {labels.placeholderBody ? <p>{labels.placeholderBody}</p> : null}
            <Link href={orderHref} className={buttonClass('primary')} onClick={onClose} data-autofocus data-track={`purchase_${product.id}`}>
              {labels.placeholderButton} <Icon name="arrow" />
            </Link>
            <button type="button" className={`tlink ${styles.cancel}`} onClick={onClose}>
              {labels.cancelLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function focusFirstError(form: HTMLFormElement, errs: FieldErrors) {
  const name = Object.keys(errs)[0]
  if (!name) return
  window.setTimeout(() => form.querySelector<HTMLElement>(`[name="${name}"]`)?.focus(), 0)
}
