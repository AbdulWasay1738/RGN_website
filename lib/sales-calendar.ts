/**
 * Sales calendar rules. Pure functions of `now` and the dates stored in the
 * Studio ("Sales calendar & seats"), so the same rules run on the server,
 * in the browser and (phase 6) when the checkout picks a Stripe price.
 */
import type { AnnouncementBanner, BannerVariant, Bundle, Course, SalesCalendar, ScheduledSale, Workshop } from './sanity/types'

export const DEFAULT_CALENDAR: Required<SalesCalendar> = {
  introEndsAt: '2027-01-16T05:00:00Z',
  coursesOpenAt: '2026-12-01T05:00:00Z',
  earlyBirdEndsAt: '2026-12-11T05:00:00Z',
  workshopAt: '2027-02-04T17:00:00Z',
  inPersonSeatCap: 10,
  seatsSold: 0,
}

export type CalendarDates = {
  introEndsAt: Date
  coursesOpenAt: Date
  earlyBirdEndsAt: Date
  workshopAt: Date
  /** Scheduled sales (Studio > Sales): each one is a window with its own prices */
  sales: ScheduledSale[]
}

function toDate(value: string | undefined, fallback: string) {
  const d = new Date(value || fallback)
  return Number.isNaN(d.getTime()) ? new Date(fallback) : d
}

export function calendarDates(cal: SalesCalendar | null | undefined, sales: ScheduledSale[] | null | undefined = []): CalendarDates {
  return {
    introEndsAt: toDate(cal?.introEndsAt, DEFAULT_CALENDAR.introEndsAt),
    coursesOpenAt: toDate(cal?.coursesOpenAt, DEFAULT_CALENDAR.coursesOpenAt),
    earlyBirdEndsAt: toDate(cal?.earlyBirdEndsAt, DEFAULT_CALENDAR.earlyBirdEndsAt),
    workshopAt: toDate(cal?.workshopAt, DEFAULT_CALENDAR.workshopAt),
    sales: sales ?? [],
  }
}

/* ---------------- scheduled sales ---------------- */

/** True while `now` is inside the sale window (start included, end excluded). */
export function saleIsOn(sale: Pick<ScheduledSale, 'startsAt' | 'endsAt'>, now: Date) {
  const start = sale.startsAt ? new Date(sale.startsAt) : null
  const end = sale.endsAt ? new Date(sale.endsAt) : null
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return start <= now && now < end
}

export type SaleMatch = { sale: ScheduledSale; price: number; itemKey: string }

/** The scheduled sale price for an offer right now: a course _id, "workshop" or "bundle". The first sale that lists it wins. */
export function saleFor(offerId: string | undefined, now: Date, d: CalendarDates): SaleMatch | null {
  if (!offerId) return null
  const id = offerId.replace(/^drafts\./, '')
  for (const sale of d.sales ?? []) {
    if (!saleIsOn(sale, now)) continue
    const item = sale.items?.find((i) => i.offerId?.replace(/^drafts\./, '') === id && typeof i.salePrice === 'number')
    if (item && typeof item.salePrice === 'number') return { sale, price: item.salePrice, itemKey: item._key }
  }
  return null
}

/** A sale's own banner while it is on (it takes the place of the regular banner). */
export function saleBannerVariant(now: Date, d: CalendarDates): BannerVariant | null {
  for (const sale of d.sales ?? []) {
    if (!saleIsOn(sale, now) || !sale.banner?.show || !sale.banner.message) continue
    return {
      _key: `sale-${sale._id}`,
      label: sale.banner.label || sale.title,
      message: sale.banner.message,
      ctaLabel: sale.banner.ctaLabel,
      ctaLink: sale.banner.ctaLink,
      showFrom: sale.startsAt,
      showUntil: sale.endsAt,
      countdownTo: 'showUntil',
    }
  }
  return null
}

/** Course and bundle intro prices apply until introEndsAt (end of January 15, 2027, ET). A scheduled sale price beats both. */
export const isIntro = (now: Date, d: CalendarDates) => now < d.introEndsAt
/** Workshop early-bird applies until earlyBirdEndsAt (end of Dec 10, ET). */
export const isEarlyBird = (now: Date, d: CalendarDates) => now < d.earlyBirdEndsAt
/** Lessons are on demand from coursesOpenAt. */
export const coursesOpen = (now: Date, d: CalendarDates) => now >= d.coursesOpenAt
/** After the workshop starts, it "has happened". */
export const workshopDone = (now: Date, d: CalendarDates) => now >= d.workshopAt

type CoursePrices = Pick<Course, 'introPrice' | 'regularPrice'> & { _id?: string }

/**
 * What a price block shows: the price now, the struck price (if any), the
 * saving, whether it is the intro price, and the sale when one is on.
 */
export type PriceParts = { now: number; was: number | undefined; save: number; intro: boolean; sale: SaleMatch | null }

export function coursePrice(course: CoursePrices, now: Date, d: CalendarDates) {
  return coursePriceParts(course, now, d).now
}

/** Sale price against the regular price, or the intro price against it, or just the regular price. */
export function coursePriceParts(course: CoursePrices, now: Date, d: CalendarDates): PriceParts {
  const regular = course.regularPrice ?? 0
  const sale = saleFor(course._id, now, d)
  if (sale) return { now: sale.price, was: sale.price < regular ? regular : undefined, save: Math.max(0, regular - sale.price), intro: false, sale }
  const intro = course.introPrice
  if (isIntro(now, d) && typeof intro === 'number' && intro < regular) {
    return { now: intro, was: regular, save: regular - intro, intro: true, sale: null }
  }
  return { now: regular, was: undefined, save: 0, intro: false, sale: null }
}

/**
 * Bundle price by date. Intro period: the intro price against the regular
 * bundle price ($399, struck $597). Afterwards: the regular price against the
 * three courses bought separately ($597, struck $797, save $200).
 */
export function bundlePriceParts(
  bundle: Pick<Bundle, 'price' | 'introPrice' | 'compareAt'> | null | undefined,
  now: Date,
  d: CalendarDates,
): PriceParts {
  const regular = bundle?.price ?? 0
  const sale = bundle ? saleFor('bundle', now, d) : null
  if (sale) return { now: sale.price, was: sale.price < regular ? regular : undefined, save: Math.max(0, regular - sale.price), intro: false, sale }
  const intro = bundle?.introPrice
  if (isIntro(now, d) && typeof intro === 'number' && intro < regular) {
    return { now: intro, was: regular, save: regular - intro, intro: true, sale: null }
  }
  const was = typeof bundle?.compareAt === 'number' && bundle.compareAt > regular ? bundle.compareAt : undefined
  return { now: regular, was, save: was ? was - regular : 0, intro: false, sale: null }
}

export function workshopPrice(
  ws: Pick<Workshop, 'earlyBirdPrice' | 'standardPrice'> | null | undefined,
  now: Date,
  d: CalendarDates,
) {
  return workshopPriceParts(ws, now, d).now
}

/** Ticket price by date (early-bird, then standard), unless a scheduled sale is on; the sale price shows against the ticket price it replaces. */
export function workshopPriceParts(
  ws: Pick<Workshop, 'earlyBirdPrice' | 'standardPrice'> | null | undefined,
  now: Date,
  d: CalendarDates,
): PriceParts {
  const standard = ws?.standardPrice ?? 199
  const early = ws?.earlyBirdPrice ?? 149
  const ticket = isEarlyBird(now, d) ? early : standard
  const sale = saleFor('workshop', now, d)
  if (sale) return { now: sale.price, was: sale.price < ticket ? ticket : undefined, save: Math.max(0, ticket - sale.price), intro: false, sale }
  return { now: ticket, was: undefined, save: 0, intro: false, sale: null }
}

export function seatsLeft(cal: SalesCalendar | null | undefined) {
  const cap = cal?.inPersonSeatCap ?? DEFAULT_CALENDAR.inPersonSeatCap
  const sold = cal?.seatsSold ?? 0
  return Math.max(0, cap - sold)
}

export function seatCap(cal: SalesCalendar | null | undefined) {
  return cal?.inPersonSeatCap ?? DEFAULT_CALENDAR.inPersonSeatCap
}

/** Whole days until `target`, rounded up, never negative (the banner's "N days left"). */
export function daysUntil(target: Date, now: Date) {
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 864e5))
}

/** Countdown parts until `target`. */
export function countdownParts(target: Date, now: Date) {
  let ms = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(ms / 864e5)
  ms -= days * 864e5
  const hours = Math.floor(ms / 36e5)
  ms -= hours * 36e5
  const minutes = Math.floor(ms / 6e4)
  ms -= minutes * 6e4
  const seconds = Math.floor(ms / 1e3)
  return { days, hours, minutes, seconds, done: target.getTime() <= now.getTime() }
}

/**
 * A scheduled sale's own banner wins while the sale is on. Otherwise the
 * banner shows the first enabled variant whose window contains `now`, and
 * hides after the workshop and when no variant matches.
 */
export function activeBannerVariant(
  banner: AnnouncementBanner | null | undefined,
  now: Date,
  d: CalendarDates,
): BannerVariant | null {
  // A scheduled sale with its own banner shows even if the regular banner is off.
  const sale = saleBannerVariant(now, d)
  if (sale) return sale
  if (!banner?.enabled || workshopDone(now, d)) return null
  for (const v of banner.variants ?? []) {
    const from = v.showFrom ? new Date(v.showFrom) : null
    const until = v.showUntil ? new Date(v.showUntil) : null
    if (from && now < from) continue
    if (until && now >= until) continue
    return v
  }
  return null
}

export function countdownTarget(variant: BannerVariant, d: CalendarDates): Date | null {
  switch (variant.countdownTo) {
    case 'introEndsAt':
      return d.introEndsAt
    case 'coursesOpenAt':
      return d.coursesOpenAt
    case 'earlyBirdEndsAt':
      return d.earlyBirdEndsAt
    case 'workshopAt':
      return d.workshopAt
    case 'showUntil':
      return variant.showUntil ? new Date(variant.showUntil) : null
    default:
      return null
  }
}

/**
 * `?now=2026-11-29T15:00:00Z` simulates a date on previews and in draft mode
 * so the client can check each sales state. Never honoured in production.
 */
export function parseSimulatedNow(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
