/**
 * Growth call calendar rules. Pure functions of `now`, so the server and the
 * browser draw the same month. Days and times are Eastern Time whatever the
 * visitor's own time zone. Phase 6 replaces the weekday and slot rules with
 * the free slots from the GoHighLevel calendar; the UI stays the same.
 */

const ET = 'America/New_York'
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const DAY_MS = 864e5

/** Wall-clock parts of `date` in Eastern Time. */
function easternParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month') - 1, day: get('day'), hour: get('hour'), minute: get('minute') }
}

/** "2026-11-10" for a UTC-midnight calendar day. */
export function dayKey(utcDay: Date) {
  return utcDay.toISOString().slice(0, 10)
}

/** Today's Eastern calendar date, as UTC midnight. */
export function easternToday(now: Date) {
  const p = easternParts(now)
  return new Date(Date.UTC(p.year, p.month, p.day))
}

export type BookingRules = {
  /** "Tue", "Wed", "Thu" */
  weekdays?: string[]
  /** Bookable days from tomorrow (Eastern) */
  windowDays?: number
}

/** The bookable days: from tomorrow for `windowDays` days, on the chosen weekdays. */
export function bookableDays(now: Date, { weekdays = ['Tue', 'Wed', 'Thu'], windowDays = 30 }: BookingRules = {}) {
  const allowed = new Set(weekdays.map((w) => WEEKDAY_INDEX[w]).filter((n) => n !== undefined))
  const today = easternToday(now)
  const days = new Set<string>()
  for (let i = 1; i <= windowDays; i++) {
    const d = new Date(today.getTime() + i * DAY_MS)
    if (allowed.has(d.getUTCDay())) days.add(dayKey(d))
  }
  return days
}

/** How many months after this one the booking window reaches (the "next month" button's limit). */
export function lastMonthOffset(now: Date, windowDays = 30) {
  const today = easternToday(now)
  const end = new Date(today.getTime() + windowDays * DAY_MS)
  return (end.getUTCFullYear() - today.getUTCFullYear()) * 12 + end.getUTCMonth() - today.getUTCMonth()
}

/** A month view: its first day and the cells (null for the blanks before the 1st). */
export function monthGrid(now: Date, offset: number) {
  const today = easternToday(now)
  const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offset, 1))
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  const cells: Array<Date | null> = Array.from({ length: first.getUTCDay() }, () => null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), d)))
  return { first, cells }
}

/** "November 2026" */
export function monthLabel(first: Date) {
  return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** "Tuesday, November 10" for "2026-11-10" */
export function dayLabel(key: string) {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

/** The moment an Eastern slot ("10:00 AM" on "2026-11-10") starts, or null when the label cannot be read. */
export function slotStart(key: string, label: string): Date | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(label.trim())
  const [y, mo, d] = key.split('-').map(Number)
  if (!m || !y || !mo || !d) return null
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  const minute = Number(m[2] ?? 0)
  // Treat the wall time as UTC, then shift by the Eastern offset on that date (handles daylight saving time).
  const guess = Date.UTC(y, mo - 1, d, hour, minute)
  const p = easternParts(new Date(guess))
  const wallAsUtc = Date.UTC(p.year, p.month, p.day, p.hour, p.minute)
  return new Date(guess + (guess - wallAsUtc))
}
