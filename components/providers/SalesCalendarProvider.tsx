'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  calendarDates,
  coursesOpen,
  isEarlyBird,
  isIntro,
  parseSimulatedNow,
  workshopDone,
  type CalendarDates,
} from '@/lib/sales-calendar'
import type { SalesCalendar } from '@/lib/sanity/types'

type Ctx = {
  /** Current time: request time on the server, then the visitor's clock (plus any ?now= simulation). */
  now: Date
  /** Milliseconds added to Date.now() by the ?now= simulation. */
  offsetMs: number
  /** True once mounted in the browser. Before that `now` is the server render time. */
  live: boolean
  dates: CalendarDates
  calendar: SalesCalendar | null
}

const SalesCalendarContext = createContext<Ctx | null>(null)

/**
 * Server components render with the request time (`serverNow`). Once mounted,
 * client components recompute from the visitor's clock every minute, so a
 * cached page never shows a stale price after a cutoff, and hydration matches.
 */
export function SalesCalendarProvider({
  serverNow,
  calendar,
  allowSimulation,
  children,
}: {
  serverNow: string
  calendar: SalesCalendar | null
  /** Previews and draft mode only. Never true in production for normal visitors. */
  allowSimulation: boolean
  children: ReactNode
}) {
  const dates = useMemo(() => calendarDates(calendar), [calendar])
  const [state, setState] = useState(() => ({ now: new Date(serverNow), offsetMs: 0, live: false }))

  useEffect(() => {
    let offsetMs = 0
    if (allowSimulation) {
      const sim = parseSimulatedNow(new URLSearchParams(window.location.search).get('now'))
      if (sim) offsetMs = sim.getTime() - Date.now()
    }
    const tick = () => setState({ now: new Date(Date.now() + offsetMs), offsetMs, live: true })
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [allowSimulation])

  const value = useMemo(() => ({ ...state, dates, calendar }), [state, dates, calendar])
  return <SalesCalendarContext.Provider value={value}>{children}</SalesCalendarContext.Provider>
}

export function useSalesCalendar(): Ctx {
  const ctx = useContext(SalesCalendarContext)
  if (!ctx) {
    return { now: new Date(), offsetMs: 0, live: false, dates: calendarDates(null), calendar: null }
  }
  return ctx
}

export type DateRule = 'intro' | 'earlyBird' | 'coursesOpen' | 'workshopDone'

export function useDateRule(rule: DateRule) {
  const { now, dates } = useSalesCalendar()
  switch (rule) {
    case 'intro':
      return isIntro(now, dates)
    case 'earlyBird':
      return isEarlyBird(now, dates)
    case 'coursesOpen':
      return coursesOpen(now, dates)
    case 'workshopDone':
      return workshopDone(now, dates)
  }
}

/**
 * Lets a server component pass both versions of time-dependent content and
 * have the browser pick:
 * <DateSwitch rule="coursesOpen" whenTrue="On demand now" whenFalse="Opens Dec 1" />
 */
export function DateSwitch({
  rule,
  whenTrue,
  whenFalse,
}: {
  rule: DateRule
  whenTrue?: ReactNode
  whenFalse?: ReactNode
}) {
  return <>{useDateRule(rule) ? whenTrue : whenFalse}</>
}

/** Re-renders every `intervalMs` with the (simulated) current time. For countdowns. */
export function useTicker(intervalMs = 1000) {
  const { now, offsetMs, live } = useSalesCalendar()
  const [tick, setTick] = useState<Date>(now)
  useEffect(() => {
    if (!live) return
    const update = () => setTick(new Date(Date.now() + offsetMs))
    update()
    const id = window.setInterval(update, intervalMs)
    return () => window.clearInterval(id)
  }, [live, offsetMs, intervalMs])
  return live ? tick : now
}
