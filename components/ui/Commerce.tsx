'use client'

/**
 * Time-aware price displays and buy buttons. They read the sales calendar on
 * the client so cached pages flip prices at each cutoff without a rebuild.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useCheckout, type CheckoutOffer } from '@/components/providers/CheckoutProvider'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { coursePriceParts, workshopPrice } from '@/lib/sales-calendar'
import type { Course, Workshop } from '@/lib/sanity/types'
import { buttonClass } from './Button'
import { Icon } from './Icon'
import { track } from '@/lib/analytics'

/** Opens the checkout modal for an offer. */
export function BuyButton({
  offer,
  children,
  style = 'primary',
  small,
  block,
  arrow,
  className,
  css,
  trackId,
}: {
  offer: CheckoutOffer
  children: ReactNode
  style?: 'primary' | 'dark' | 'outline' | 'outlineLight' | 'white'
  small?: boolean
  block?: boolean
  arrow?: boolean
  className?: string
  css?: CSSProperties
  trackId?: string
}) {
  const { open } = useCheckout()
  return (
    <button
      type="button"
      className={buttonClass(style, { small, block, className })}
      style={css}
      onClick={() => {
        track(trackId ?? `buy_${offer.kind === 'course' ? offer.slug : offer.kind}`)
        open(offer)
      }}
    >
      {children}
      {arrow ? <Icon name="arrow" /> : null}
    </button>
  )
}

/**
 * Course price block: "$99  $199  SAVE $100" during the intro period, then
 * "$199 Regular price". `size="hero"` is the big price on the course page card.
 */
export function CoursePrice({
  course,
  regularLabel = 'Regular price',
  saveLabel = 'Save $',
  size = 'card',
  wasStyle,
}: {
  course: Pick<Course, 'introPrice' | 'regularPrice'>
  regularLabel?: string
  saveLabel?: string
  size?: 'card' | 'hero'
  wasStyle?: CSSProperties
}) {
  const { now, dates } = useSalesCalendar()
  const p = coursePriceParts(course, now, dates)
  const nowStyle: CSSProperties | undefined = size === 'hero' ? { fontSize: 64 } : undefined
  if (p.intro) {
    return (
      <>
        <span className="now" style={nowStyle}>
          ${p.now}
        </span>
        <span className="was" style={wasStyle}>
          <span className="sr-only">Regular price </span>${p.was}
        </span>
        <span className="save">
          {saveLabel}
          {p.save}
        </span>
      </>
    )
  }
  return (
    <>
      <span className="now" style={nowStyle}>
        ${p.now}
      </span>
      <span className="muted" style={{ fontSize: 13 }}>
        {regularLabel}
      </span>
    </>
  )
}

/** Just the current course price as text, for example "$99". */
export function CoursePriceText({ course }: { course: Pick<Course, 'introPrice' | 'regularPrice'> }) {
  const { now, dates } = useSalesCalendar()
  return <>${coursePriceParts(course, now, dates).now}</>
}

/** The current workshop ticket price as text ("$149" before the early-bird cutoff, then "$199"). */
export function WorkshopPriceText({ workshop }: { workshop?: Pick<Workshop, 'earlyBirdPrice' | 'standardPrice'> | null }) {
  const { now, dates } = useSalesCalendar()
  return <>${workshopPrice(workshop, now, dates)}</>
}
