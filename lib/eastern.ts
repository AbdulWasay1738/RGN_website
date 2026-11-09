/**
 * Eastern Time conversions for date inputs (the Studio's Prices & sales
 * screen): the client thinks in Eastern Time whatever computer she uses.
 */

const ET = 'America/New_York'

function easternWall(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

/** ISO moment to a `datetime-local` value in Eastern Time: "2027-01-16T00:00". */
export function toEasternInput(iso: string | undefined | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const w = easternWall(d)
  return `${w.year}-${w.month}-${w.day}T${w.hour}:${w.minute}`
}

/** A `datetime-local` value read as Eastern Time, to an ISO moment ("2027-01-16T05:00:00.000Z"). Null when unreadable. */
export function fromEasternInput(value: string | undefined | null) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? '')
  if (!m) return null
  const [y, mo, d, h, mi] = m.slice(1).map(Number)
  // Treat the wall time as UTC, then shift by the Eastern offset on that date (handles daylight saving time).
  const guess = Date.UTC(y, mo - 1, d, h, mi)
  const w = easternWall(new Date(guess))
  const wallAsUtc = Date.UTC(Number(w.year), Number(w.month) - 1, Number(w.day), Number(w.hour), Number(w.minute))
  return new Date(guess + (guess - wallAsUtc)).toISOString()
}

/** "Fri, Jan 15, 2027, 11:59 PM ET" */
export function easternLabel(iso: string | undefined | null) {
  if (!iso) return ''
  return `${new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: ET })} ET`
}
