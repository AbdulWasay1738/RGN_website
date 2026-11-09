import { describe, expect, it } from 'vitest'
import {
  activeBannerVariant,
  bundlePriceParts,
  calendarDates,
  countdownParts,
  coursePrice,
  coursePriceParts,
  coursesOpen,
  daysUntil,
  isEarlyBird,
  isIntro,
  saleFor,
  saleIsOn,
  seatsLeft,
  workshopDone,
  workshopPrice,
  workshopPriceParts,
} from '@/lib/sales-calendar'
import type { AnnouncementBanner } from '@/lib/sanity/types'

// Round two: intro prices end with January 15, 2027 (ET).
const d = calendarDates({
  introEndsAt: '2027-01-16T05:00:00Z',
  coursesOpenAt: '2026-12-01T05:00:00Z',
  earlyBirdEndsAt: '2026-12-11T05:00:00Z',
  workshopAt: '2027-02-04T17:00:00Z',
})
const at = (iso: string) => new Date(iso)
const course = { introPrice: 99, regularPrice: 199 }
const ws = { earlyBirdPrice: 149, standardPrice: 199 }
const bundle = { price: 597, introPrice: 399, compareAt: 797, compareAtIntro: 447 }

// The four banner windows from content-seed/singletons.json.
const banner: AnnouncementBanner = {
  enabled: true,
  variants: [
    { _key: 'a', label: 'NEW', showFrom: '2026-10-01T00:00:00Z', showUntil: '2026-12-01T05:00:00Z', countdownTo: 'introEndsAt' },
    { _key: 'b', label: 'EARLY-BIRD', showFrom: '2026-12-01T05:00:00Z', showUntil: '2026-12-11T05:00:00Z', countdownTo: 'earlyBirdEndsAt' },
    { _key: 'c', label: 'INTRO PRICING', showFrom: '2026-12-11T05:00:00Z', showUntil: '2027-01-16T05:00:00Z', countdownTo: 'introEndsAt' },
    { _key: 'd', label: 'LIVE WORKSHOP', showFrom: '2027-01-16T05:00:00Z', showUntil: '2027-02-04T17:00:00Z', countdownTo: 'workshopAt' },
  ],
}

describe('the sales states', () => {
  it('Nov 20: intro prices, early-bird, courses not open, banner 1', () => {
    const now = at('2026-11-20T15:00:00Z')
    expect(isIntro(now, d)).toBe(true)
    expect(isEarlyBird(now, d)).toBe(true)
    expect(coursesOpen(now, d)).toBe(false)
    expect(coursePrice(course, now, d)).toBe(99)
    expect(coursePriceParts(course, now, d)).toMatchObject({ now: 99, was: 199, save: 100, intro: true })
    expect(workshopPrice(ws, now, d)).toBe(149)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('NEW')
  })
  it('Dec 5: courses open, still intro prices and early-bird, banner 2', () => {
    const now = at('2026-12-05T15:00:00Z')
    expect(coursesOpen(now, d)).toBe(true)
    expect(isIntro(now, d)).toBe(true)
    expect(coursePrice(course, now, d)).toBe(99)
    expect(workshopPrice(ws, now, d)).toBe(149)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('EARLY-BIRD')
  })
  it('Dec 20: standard ticket, intro course prices, banner 3', () => {
    const now = at('2026-12-20T15:00:00Z')
    expect(isEarlyBird(now, d)).toBe(false)
    expect(workshopPrice(ws, now, d)).toBe(199)
    expect(coursePrice(course, now, d)).toBe(99)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('INTRO PRICING')
    expect(workshopDone(now, d)).toBe(false)
  })
  it('Jan 20: regular prices, banner 4', () => {
    const now = at('2027-01-20T15:00:00Z')
    expect(isIntro(now, d)).toBe(false)
    expect(coursePrice(course, now, d)).toBe(199)
    expect(coursePriceParts(course, now, d).intro).toBe(false)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('LIVE WORKSHOP')
  })
  it('after Feb 4 noon ET: workshop done, banner hidden', () => {
    const now = at('2027-02-05T15:00:00Z')
    expect(workshopDone(now, d)).toBe(true)
    expect(activeBannerVariant(banner, now, d)).toBeNull()
  })
  it('cutoffs are exact', () => {
    expect(isIntro(at('2027-01-16T04:59:59Z'), d)).toBe(true)
    expect(isIntro(at('2027-01-16T05:00:00Z'), d)).toBe(false)
    expect(isEarlyBird(at('2026-12-11T04:59:59Z'), d)).toBe(true)
    expect(isEarlyBird(at('2026-12-11T05:00:00Z'), d)).toBe(false)
    expect(coursesOpen(at('2026-12-01T04:59:59Z'), d)).toBe(false)
    expect(coursesOpen(at('2026-12-01T05:00:00Z'), d)).toBe(true)
  })
})

describe('bundle price', () => {
  it('Jan 15 (ET afternoon): $399 against $597', () => {
    expect(bundlePriceParts(bundle, at('2027-01-15T20:00:00Z'), d)).toEqual({ now: 399, was: 597, save: 198, intro: true, sale: null })
  })
  it('Jan 16: $597 against $797, save $200', () => {
    expect(bundlePriceParts(bundle, at('2027-01-16T15:00:00Z'), d)).toEqual({ now: 597, was: 797, save: 200, intro: false, sale: null })
  })
  it('no intro price: always the regular price', () => {
    expect(bundlePriceParts({ price: 597, compareAt: 797 }, at('2026-11-20T15:00:00Z'), d)).toMatchObject({ now: 597, was: 797, intro: false })
  })
  it('no bundle data: zero, nothing struck', () => {
    expect(bundlePriceParts(null, at('2026-11-20T15:00:00Z'), d)).toMatchObject({ now: 0, was: undefined, intro: false })
  })
})

describe('helpers', () => {
  it('a disabled banner never shows', () => {
    expect(activeBannerVariant({ ...banner, enabled: false }, at('2026-11-20T12:00:00Z'), d)).toBeNull()
  })
  it('seats left never goes negative', () => {
    expect(seatsLeft({ inPersonSeatCap: 10, seatsSold: 3 })).toBe(7)
    expect(seatsLeft({ inPersonSeatCap: 10, seatsSold: 12 })).toBe(0)
    expect(seatsLeft(null)).toBe(10)
  })
  it('days left rounds up', () => {
    expect(daysUntil(at('2027-01-16T05:00:00Z'), at('2027-01-15T05:00:01Z'))).toBe(1)
    expect(daysUntil(at('2027-01-16T05:00:00Z'), at('2027-01-17T00:00:00Z'))).toBe(0)
  })
  it('countdown parts', () => {
    expect(countdownParts(at('2026-11-02T01:01:01Z'), at('2026-11-01T00:00:00Z'))).toMatchObject({ days: 1, hours: 1, minutes: 1, seconds: 1, done: false })
    expect(countdownParts(at('2026-11-01T00:00:00Z'), at('2026-11-02T00:00:00Z')).done).toBe(true)
  })
  it('missing dates fall back to the defaults', () => {
    expect(calendarDates(null).introEndsAt.toISOString()).toBe('2027-01-16T05:00:00.000Z')
    expect(calendarDates(null).workshopAt.toISOString()).toBe('2027-02-04T17:00:00.000Z')
  })
})

describe('scheduled sales (for example Black Friday)', () => {
  const blackFriday = {
    _id: 'sale-bf',
    title: 'Black Friday sale',
    startsAt: '2026-11-27T05:00:00Z',
    endsAt: '2026-12-01T05:00:00Z',
    priceLabel: 'Black Friday price',
    banner: { show: true, label: 'BLACK FRIDAY', message: 'Every course is on sale until Monday.' },
    items: [
      { _key: 'a', offerId: 'course-attract', salePrice: 79 },
      { _key: 'w', offerId: 'workshop', salePrice: 119 },
      { _key: 'b', offerId: 'bundle', salePrice: 349 },
    ],
  }
  const withSale = calendarDates(
    { introEndsAt: '2027-01-16T05:00:00Z', coursesOpenAt: '2026-12-01T05:00:00Z', earlyBirdEndsAt: '2026-12-11T05:00:00Z', workshopAt: '2027-02-04T17:00:00Z' },
    [blackFriday],
  )
  const attract = { _id: 'course-attract', introPrice: 99, regularPrice: 199 }
  const create = { _id: 'course-create', introPrice: 249, regularPrice: 399 }
  const during = at('2026-11-28T15:00:00Z')

  it('sale prices beat intro and early-bird prices, struck against the regular price', () => {
    expect(coursePriceParts(attract, during, withSale)).toMatchObject({ now: 79, was: 199, save: 120, intro: false })
    expect(coursePriceParts(attract, during, withSale).sale?.sale.title).toBe('Black Friday sale')
    expect(workshopPriceParts(ws, during, withSale)).toMatchObject({ now: 119, was: 149 })
    expect(bundlePriceParts(bundle, during, withSale)).toMatchObject({ now: 349, was: 597, save: 248 })
  })
  it('offers not in the sale keep their usual price', () => {
    expect(coursePriceParts(create, during, withSale)).toMatchObject({ now: 249, intro: true, sale: null })
  })
  it('starts and stops by itself, to the minute', () => {
    expect(coursePrice(attract, at('2026-11-27T04:59:59Z'), withSale)).toBe(99)
    expect(coursePrice(attract, at('2026-11-27T05:00:00Z'), withSale)).toBe(79)
    expect(coursePrice(attract, at('2026-12-01T04:59:59Z'), withSale)).toBe(79)
    expect(coursePrice(attract, at('2026-12-01T05:00:00Z'), withSale)).toBe(99)
    expect(saleFor('course-attract', at('2026-12-02T00:00:00Z'), withSale)).toBeNull()
  })
  it('its banner replaces the regular one while it runs, with a countdown to its end', () => {
    const v = activeBannerVariant(banner, during, withSale)
    expect(v).toMatchObject({ label: 'BLACK FRIDAY', message: 'Every course is on sale until Monday.', countdownTo: 'showUntil', showUntil: '2026-12-01T05:00:00Z' })
    expect(activeBannerVariant(banner, at('2026-12-05T15:00:00Z'), withSale)?.label).toBe('EARLY-BIRD')
  })
  it('a sale without a banner leaves the regular banner alone', () => {
    const quiet = calendarDates(null, [{ ...blackFriday, banner: { show: false } }])
    expect(activeBannerVariant(banner, during, quiet)?.label).toBe('NEW')
  })
  it('a sale with missing dates never runs', () => {
    expect(saleIsOn({ startsAt: undefined, endsAt: '2026-12-01T05:00:00Z' }, during)).toBe(false)
  })
})
