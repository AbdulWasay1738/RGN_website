'use client'

/**
 * Time-aware price displays and buy buttons. They read the sales calendar on
 * the client so cached pages flip prices at each cutoff without a rebuild.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useCheckout, type CheckoutOffer } from '@/components/providers/CheckoutProvider'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { bundlePriceParts, coursePriceParts, isEarlyBird, workshopPriceParts, type PriceParts } from '@/lib/sales-calendar'
import type { Bundle, Course, Workshop } from '@/lib/sanity/types'
import { bundlePriceTokens, formatUsd, interpolate } from '@/lib/text'
import { buttonClass } from './Button'
import { Countdown } from './Countdown'
import { useEditAttribute, type EditTarget } from './editAttribute'
import { Icon } from './Icon'
import { track } from '@/lib/analytics'

/** Where a price is edited in the Studio: the sale item while a sale is on, otherwise the offer's own price field. */
function priceTarget(p: PriceParts, offer: EditTarget): EditTarget {
  if (p.sale) return { id: p.sale.sale._id, type: 'sale', path: `items[_key=="${p.sale.itemKey}"].salePrice` }
  return offer
}

/** "Black Friday sale ends November 27": the last day of the sale, in Eastern Time. */
export function saleEndsText(title: string | undefined, endsAt: string | undefined) {
  if (!endsAt) return title ?? ''
  const lastDay = new Date(new Date(endsAt).getTime() - 60_000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' })
  return `${title ?? 'Sale'} ends ${lastDay}`
}

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
type CoursePrices = Pick<Course, 'introPrice' | 'regularPrice'> & { _id?: string }

/**
 * Course price block: "$99  $199  SAVE $100" during the intro period, the
 * sale price against the regular price during a scheduled sale (with the
 * sale's label), then "$199 Regular price". `size="hero"` is the big price on
 * the course page card.
 */
export function CoursePrice({
  course,
  regularLabel = 'Regular price',
  saveLabel = 'Save $',
  size = 'card',
  wasStyle,
}: {
  course: CoursePrices
  regularLabel?: string
  saveLabel?: string
  size?: 'card' | 'hero'
  wasStyle?: CSSProperties
}) {
  const { now, dates } = useSalesCalendar()
  const edit = useEditAttribute()
  const p = coursePriceParts(course, now, dates)
  const nowStyle: CSSProperties | undefined = size === 'hero' ? { fontSize: 64 } : undefined
  const nowEl = (
    <span className="now" style={nowStyle} {...edit(priceTarget(p, { id: course._id, type: 'course', path: p.intro ? 'introPrice' : 'regularPrice' }))}>
      ${p.now}
    </span>
  )
  if (p.was) {
    return (
      <>
        {nowEl}
        <span className="was" style={wasStyle} {...edit({ id: course._id, type: 'course', path: 'regularPrice' })}>
          <span className="sr-only">Regular price </span>${p.was}
        </span>
        <span className="save">{p.sale?.sale.priceLabel || `${saveLabel}${p.save}`}</span>
      </>
    )
  }
  return (
    <>
      {nowEl}
      <span className="muted" style={{ fontSize: 13 }}>
        {regularLabel}
      </span>
    </>
  )
}

/** Just the current course price as text, for example "$99". */
export function CoursePriceText({ course }: { course: CoursePrices }) {
  const { now, dates } = useSalesCalendar()
  const edit = useEditAttribute()
  const p = coursePriceParts(course, now, dates)
  return <span {...edit(priceTarget(p, { id: course._id, type: 'course', path: p.intro ? 'introPrice' : 'regularPrice' }))}>${p.now}</span>
}

/** The current workshop ticket price as text ("$149" before the early-bird cutoff, then "$199", or a sale price). */
export function WorkshopPriceText({ workshop }: { workshop?: Pick<Workshop, 'earlyBirdPrice' | 'standardPrice'> | null }) {
  const { now, dates } = useSalesCalendar()
  const edit = useEditAttribute()
  const p = workshopPriceParts(workshop, now, dates)
  const field = isEarlyBird(now, dates) ? 'earlyBirdPrice' : 'standardPrice'
  return <span {...edit(priceTarget(p, { id: 'workshop', type: 'workshop', path: field }))}>${p.now}</span>
}

/**
 * On the course page price card: during a scheduled sale, "<sale> ends <date>"
 * with a countdown to its end; during the intro period, the intro heading and
 * a countdown to the intro end; otherwise nothing.
 */
export function PriceDeadline({ course, introLabel, className }: { course: CoursePrices; introLabel?: string; className?: string }) {
  const { now, dates } = useSalesCalendar()
  const p = coursePriceParts(course, now, dates)
  if (p.sale?.sale.endsAt) {
    const text = saleEndsText(p.sale.sale.title, p.sale.sale.endsAt)
    return (
      <div className={className}>
        <strong>{text}</strong>
        <Countdown at={new Date(p.sale.sale.endsAt)} label={text} />
      </div>
    )
  }
  if (!p.intro) return null
  return (
    <div className={className}>
      {introLabel ? <strong>{introLabel}</strong> : null}
      <Countdown to="introEndsAt" label={introLabel} />
    </div>
  )
}

type BundlePrices = Pick<Bundle, 'price' | 'introPrice' | 'compareAt' | 'compareAtIntro'>

/**
 * Bundle price block by date: "$399  $597  Intro price through Jan 15" during
 * the intro period, then "$597  $797  Save $200". The chip shows only when a
 * label is passed.
 */
export function BundlePrice({
  bundle,
  introLabel,
  saveLabel,
  nowClassName,
  wasClassName,
}: {
  bundle: BundlePrices
  introLabel?: string
  saveLabel?: string
  nowClassName?: string
  wasClassName?: string
}) {
  const { now, dates } = useSalesCalendar()
  const edit = useEditAttribute()
  const p = bundlePriceParts(bundle, now, dates)
  const chip = p.sale
    ? p.sale.sale.priceLabel || (p.save ? `Save ${formatUsd(p.save)}` : '')
    : interpolate(p.intro ? introLabel : saveLabel, bundlePriceTokens(bundle))
  return (
    <>
      <span
        className={['now', nowClassName].filter(Boolean).join(' ')}
        {...edit(priceTarget(p, { id: 'bundle', type: 'bundle', path: p.intro ? 'introPrice' : 'price' }))}
      >
        {formatUsd(p.now)}
      </span>
      {p.was ? (
        <span className={['was', wasClassName].filter(Boolean).join(' ')}>
          <span className="sr-only">{p.intro || p.sale ? 'Regular price ' : 'Bought separately '}</span>
          {formatUsd(p.was)}
        </span>
      ) : null}
      {chip ? <span className="chip chip-o">{chip}</span> : null}
    </>
  )
}

/** Just the current bundle price as text, for example "$399". */
export function BundlePriceText({ bundle }: { bundle: BundlePrices }) {
  const { now, dates } = useSalesCalendar()
  const edit = useEditAttribute()
  const p = bundlePriceParts(bundle, now, dates)
  return <span {...edit(priceTarget(p, { id: 'bundle', type: 'bundle', path: p.intro ? 'introPrice' : 'price' }))}>{formatUsd(p.now)}</span>
}

/**
 * A bundle text with price tokens, by date: the intro version during the
 * intro period, otherwise the regular one. During a scheduled bundle sale the
 * regular text shows with {price} and {save} set to the sale numbers.
 */
export function BundleOfferText({ bundle, intro, regular }: { bundle: BundlePrices; intro?: string; regular?: string }) {
  const { now, dates } = useSalesCalendar()
  const p = bundlePriceParts(bundle, now, dates)
  const tokens = bundlePriceTokens(bundle)
  if (p.sale) {
    const save = typeof bundle.compareAt === 'number' ? Math.max(0, bundle.compareAt - p.now) : 0
    return <>{interpolate(regular || intro, { ...tokens, price: formatUsd(p.now), save: formatUsd(save) })}</>
  }
  return <>{interpolate(p.intro ? intro || regular : regular || intro, tokens)}</>
}
