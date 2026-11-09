'use client'

import { countdownParts } from '@/lib/sales-calendar'
import { useSalesCalendar, useTicker } from '@/components/providers/SalesCalendarProvider'

export type CountdownKey = 'introEndsAt' | 'coursesOpenAt' | 'earlyBirdEndsAt' | 'workshopAt'

/**
 * Live days / hours / minutes / seconds to a sales-calendar date (`to`) or
 * any moment (`at`, for example a sale's end).
 * Renders `doneContent` (or nothing) once the date has passed.
 */
export function Countdown({
  to,
  at,
  tone = 'default',
  doneContent = null,
  label,
}: {
  to?: CountdownKey
  at?: Date
  /** default: navy units. light: white units (on orange). lav: lavender unit labels (on navy). */
  tone?: 'default' | 'light' | 'lav'
  doneContent?: React.ReactNode
  /** Accessible name, for example "Time until the workshop" */
  label?: string
}) {
  const { dates } = useSalesCalendar()
  const now = useTicker(1000)
  const target = at ?? dates[to ?? 'workshopAt']
  const p = countdownParts(target, now)
  if (p.done) return <>{doneContent}</>
  const pad = (n: number) => String(n).padStart(2, '0')
  const cls = ['cd', tone === 'light' ? 'light' : '', tone === 'lav' ? 'lav' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} role="timer" aria-label={label} aria-live="off">
      <span className="u">
        <b>{p.days}</b>
        <small>DAYS</small>
      </span>
      <span className="u">
        <b>{pad(p.hours)}</b>
        <small>HRS</small>
      </span>
      <span className="u">
        <b>{pad(p.minutes)}</b>
        <small>MIN</small>
      </span>
      <span className="u">
        <b suppressHydrationWarning>{pad(p.seconds)}</b>
        <small>SEC</small>
      </span>
    </div>
  )
}
