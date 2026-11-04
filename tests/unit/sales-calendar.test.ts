import { describe, expect, it } from 'vitest'
import {
  activeBannerVariant,
  calendarDates,
  countdownParts,
  coursePrice,
  coursePriceParts,
  coursesOpen,
  daysUntil,
  isEarlyBird,
  isIntro,
  seatsLeft,
  workshopDone,
  workshopPrice,
} from '@/lib/sales-calendar'
import type { AnnouncementBanner } from '@/lib/sanity/types'

const d = calendarDates({
  introEndsAt: '2026-11-28T05:00:00Z',
  coursesOpenAt: '2026-12-01T05:00:00Z',
  earlyBirdEndsAt: '2026-12-11T05:00:00Z',
  workshopAt: '2027-02-04T17:00:00Z',
})
const at = (iso: string) => new Date(iso)
const course = { introPrice: 99, regularPrice: 199 }
const ws = { earlyBirdPrice: 149, standardPrice: 199 }

const banner: AnnouncementBanner = {
  enabled: true,
  variants: [
    { _key: 'a', label: 'NEW', showFrom: '2026-10-01T00:00:00Z', showUntil: '2026-11-28T05:00:00Z', countdownTo: 'introEndsAt' },
    { _key: 'b', label: 'EARLY-BIRD', showFrom: '2026-11-28T05:00:00Z', showUntil: '2026-12-11T05:00:00Z', countdownTo: 'earlyBirdEndsAt' },
    { _key: 'c', label: 'LIVE WORKSHOP', showFrom: '2026-12-11T05:00:00Z', showUntil: '2027-02-04T17:00:00Z', countdownTo: 'workshopAt' },
  ],
}

describe('the four sales states', () => {
  it('before Nov 28: intro prices, early-bird, courses not open, banner 1', () => {
    const now = at('2026-11-04T12:00:00Z')
    expect(isIntro(now, d)).toBe(true)
    expect(isEarlyBird(now, d)).toBe(true)
    expect(coursesOpen(now, d)).toBe(false)
    expect(coursePrice(course, now, d)).toBe(99)
    expect(coursePriceParts(course, now, d)).toMatchObject({ now: 99, was: 199, save: 100, intro: true })
    expect(workshopPrice(ws, now, d)).toBe(149)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('NEW')
  })
  it('Nov 28 to Dec 10: regular course prices, still early-bird, banner 2', () => {
    const now = at('2026-11-29T15:00:00Z')
    expect(isIntro(now, d)).toBe(false)
    expect(coursePrice(course, now, d)).toBe(199)
    expect(coursePriceParts(course, now, d).intro).toBe(false)
    expect(workshopPrice(ws, now, d)).toBe(149)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('EARLY-BIRD')
  })
  it('courses open on Dec 1', () => {
    expect(coursesOpen(at('2026-12-01T04:59:59Z'), d)).toBe(false)
    expect(coursesOpen(at('2026-12-01T05:00:00Z'), d)).toBe(true)
  })
  it('Dec 11 to Feb 4: standard ticket, banner 3', () => {
    const now = at('2026-12-11T15:00:00Z')
    expect(isEarlyBird(now, d)).toBe(false)
    expect(workshopPrice(ws, now, d)).toBe(199)
    expect(activeBannerVariant(banner, now, d)?.label).toBe('LIVE WORKSHOP')
    expect(workshopDone(now, d)).toBe(false)
  })
  it('after Feb 4 noon ET: workshop done, banner hidden', () => {
    const now = at('2027-02-05T15:00:00Z')
    expect(workshopDone(now, d)).toBe(true)
    expect(activeBannerVariant(banner, now, d)).toBeNull()
  })
  it('cutoffs are exact', () => {
    expect(isIntro(at('2026-11-28T04:59:59Z'), d)).toBe(true)
    expect(isIntro(at('2026-11-28T05:00:00Z'), d)).toBe(false)
    expect(isEarlyBird(at('2026-12-11T04:59:59Z'), d)).toBe(true)
    expect(isEarlyBird(at('2026-12-11T05:00:00Z'), d)).toBe(false)
  })
})

describe('helpers', () => {
  it('a disabled banner never shows', () => {
    expect(activeBannerVariant({ ...banner, enabled: false }, at('2026-11-04T12:00:00Z'), d)).toBeNull()
  })
  it('seats left never goes negative', () => {
    expect(seatsLeft({ inPersonSeatCap: 10, seatsSold: 3 })).toBe(7)
    expect(seatsLeft({ inPersonSeatCap: 10, seatsSold: 12 })).toBe(0)
    expect(seatsLeft(null)).toBe(10)
  })
  it('days left rounds up', () => {
    expect(daysUntil(at('2026-11-28T05:00:00Z'), at('2026-11-27T05:00:01Z'))).toBe(1)
    expect(daysUntil(at('2026-11-28T05:00:00Z'), at('2026-11-30T00:00:00Z'))).toBe(0)
  })
  it('countdown parts', () => {
    expect(countdownParts(at('2026-11-02T01:01:01Z'), at('2026-11-01T00:00:00Z'))).toMatchObject({ days: 1, hours: 1, minutes: 1, seconds: 1, done: false })
    expect(countdownParts(at('2026-11-01T00:00:00Z'), at('2026-11-02T00:00:00Z')).done).toBe(true)
  })
  it('missing dates fall back to the defaults', () => {
    expect(calendarDates(null).workshopAt.toISOString()).toBe('2027-02-04T17:00:00.000Z')
  })
})
