import { describe, expect, it } from 'vitest'
import { validateForm, pickFields } from '@/lib/forms'
import { bookableDays, dayLabel, easternToday, lastMonthOffset, monthGrid, monthLabel, slotStart } from '@/lib/growth-call'

describe('growth call calendar (Eastern Time)', () => {
  it('today follows the Eastern date, not UTC', () => {
    // 02:00 UTC on Nov 11 is still Nov 10 in New York.
    expect(easternToday(new Date('2026-11-11T02:00:00Z')).toISOString().slice(0, 10)).toBe('2026-11-10')
  })
  it('offers Tue to Thu from tomorrow for 30 days', () => {
    const days = [...bookableDays(new Date('2026-11-09T15:00:00Z'))] // a Monday
    expect(days[0]).toBe('2026-11-10') // Tuesday
    expect(days).toContain('2026-11-12') // Thursday
    expect(days).not.toContain('2026-11-13') // Friday
    expect(days.at(-1)).toBe('2026-12-09') // the 30th day
    expect(days.length).toBe(14)
  })
  it('never offers today', () => {
    expect(bookableDays(new Date('2026-11-10T15:00:00Z')).has('2026-11-10')).toBe(false)
  })
  it('follows the weekdays and window set in the Studio', () => {
    const days = bookableDays(new Date('2026-11-09T15:00:00Z'), { weekdays: ['Mon'], windowDays: 7 })
    expect([...days]).toEqual(['2026-11-16'])
  })
  it('month grid and the next-month limit', () => {
    const { first, cells } = monthGrid(new Date('2026-11-09T15:00:00Z'), 0)
    expect(monthLabel(first)).toBe('November 2026')
    expect(cells.slice(0, 1)).toEqual([new Date('2026-11-01T00:00:00Z')]) // Nov 1, 2026 is a Sunday
    expect(cells.filter(Boolean).length).toBe(30)
    expect(lastMonthOffset(new Date('2026-11-09T15:00:00Z'), 30)).toBe(1)
    expect(lastMonthOffset(new Date('2026-11-01T15:00:00Z'), 20)).toBe(0)
  })
  it('turns an Eastern slot into the right moment, across daylight saving time', () => {
    expect(slotStart('2026-11-10', '10:00 AM')?.toISOString()).toBe('2026-11-10T15:00:00.000Z') // EST, UTC-5
    expect(slotStart('2026-10-20', '2:30 PM')?.toISOString()).toBe('2026-10-20T18:30:00.000Z') // EDT, UTC-4
    expect(slotStart('2026-11-10', 'noonish')).toBeNull()
  })
  it('labels a day in words', () => {
    expect(dayLabel('2026-11-10')).toBe('Tuesday, November 10')
  })
})

describe('growth call form', () => {
  const good = { phone: '(555) 010-2345', firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com' }
  it('needs a 10-digit US mobile, first and last name and a work email', () => {
    expect(validateForm('growth', good)).toEqual({})
    expect(Object.keys(validateForm('growth', {}))).toEqual(['phone', 'firstName', 'lastName', 'email'])
    expect(validateForm('growth', { ...good, phone: '010 2345' }).phone).toMatch(/10-digit/)
  })
  it('stores the number with the +1 prefix and keeps SMS consent optional', () => {
    expect(pickFields('growth', { ...good, phone: '1 555 010 2345', extra: 'x' })).toEqual({
      phone: '+15550102345',
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex@example.com',
    })
  })
})
