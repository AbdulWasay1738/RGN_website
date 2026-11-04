/**
 * Sales calendar rules. Pure functions of `now` and the dates stored in the
 * Studio ("Sales calendar & seats"), so the same rules run on the server,
 * in the browser and (phase 6) when the checkout picks a Stripe price.
 */
import type { AnnouncementBanner, BannerVariant, Course, SalesCalendar, Workshop } from './sanity/types'

export const DEFAULT_CALENDAR: Required<SalesCalendar> = {
  introEndsAt: '2026-11-28T05:00:00Z',
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
}

function toDate(value: string | undefined, fallback: string) {
  const d = new Date(value || fallback)
  return Number.isNaN(d.getTime()) ? new Date(fallback) : d
}

export function calendarDates(cal: SalesCalendar | null | undefined): CalendarDates {
  return {
    introEndsAt: toDate(cal?.introEndsAt, DEFAULT_CALENDAR.introEndsAt),
    coursesOpenAt: toDate(cal?.coursesOpenAt, DEFAULT_CALENDAR.coursesOpenAt),
    earlyBirdEndsAt: toDate(cal?.earlyBirdEndsAt, DEFAULT_CALENDAR.earlyBirdEndsAt),
    workshopAt: toDate(cal?.workshopAt, DEFAULT_CALENDAR.workshopAt),
  }
}

/** Course intro prices apply until introEndsAt (end of Black Friday, ET). */
export const isIntro = (now: Date, d: CalendarDates) => now < d.introEndsAt
/** Workshop early-bird applies until earlyBirdEndsAt (end of Dec 10, ET). */
export const isEarlyBird = (now: Date, d: CalendarDates) => now < d.earlyBirdEndsAt
/** Lessons are on demand from coursesOpenAt. */
export const coursesOpen = (now: Date, d: CalendarDates) => now >= d.coursesOpenAt
/** After the workshop starts, it "has happened". */
export const workshopDone = (now: Date, d: CalendarDates) => now >= d.workshopAt

export function coursePrice(course: Pick<Course, 'introPrice' | 'regularPrice'>, now: Date, d: CalendarDates) {
  const regular = course.regularPrice ?? 0
  if (isIntro(now, d) && typeof course.introPrice === 'number') return course.introPrice
  return regular
}

/** Intro price, regular price and saving, or just the regular price after the intro period. */
export function coursePriceParts(course: Pick<Course, 'introPrice' | 'regularPrice'>, now: Date, d: CalendarDates) {
  const regular = course.regularPrice ?? 0
  const intro = course.introPrice
  if (isIntro(now, d) && typeof intro === 'number' && intro < regular) {
    return { now: intro, was: regular, save: regular - intro, intro: true as const }
  }
  return { now: regular, was: undefined, save: 0, intro: false as const }
}

export function workshopPrice(
  ws: Pick<Workshop, 'earlyBirdPrice' | 'standardPrice'> | null | undefined,
  now: Date,
  d: CalendarDates,
) {
  const standard = ws?.standardPrice ?? 199
  const early = ws?.earlyBirdPrice ?? 149
  return isEarlyBird(now, d) ? early : standard
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
 * The banner shows the first enabled variant whose window contains `now`.
 * It hides after the workshop and when no variant matches.
 */
export function activeBannerVariant(
  banner: AnnouncementBanner | null | undefined,
  now: Date,
  d: CalendarDates,
): BannerVariant | null {
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
