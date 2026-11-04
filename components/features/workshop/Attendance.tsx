'use client'

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from 'react'
import { useSite } from '@/components/providers/SiteProvider'
import { BuyButton } from '@/components/ui/Commerce'
import { seatsLeft } from '@/lib/sales-calendar'

export type Attendance = 'in-person' | 'zoom'

const AttendanceContext = createContext<{ attendance: Attendance; setAttendance: (a: Attendance) => void }>({
  attendance: 'in-person',
  setAttendance: () => {},
})

/** Remembers "In person" or "On Zoom" on the workshop page so every Reserve button opens the checkout with it. */
export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { calendar } = useSite()
  const [attendance, setAttendance] = useState<Attendance>(() => (seatsLeft(calendar) === 0 ? 'zoom' : 'in-person'))
  return <AttendanceContext.Provider value={{ attendance, setAttendance }}>{children}</AttendanceContext.Provider>
}

export function useAttendance() {
  return useContext(AttendanceContext)
}

/** "Reserve my seat": opens the workshop checkout with the chosen attendance. */
export function ReserveButton({
  children,
  style = 'primary',
  block,
  arrow,
  trackId,
  css,
}: {
  children: ReactNode
  style?: 'primary' | 'dark'
  block?: boolean
  arrow?: boolean
  trackId?: string
  css?: CSSProperties
}) {
  const { attendance } = useAttendance()
  return (
    <BuyButton offer={{ kind: 'workshop', attendance }} style={style} block={block} arrow={arrow} trackId={trackId ?? 'buy_workshop'} css={css}>
      {children}
    </BuyButton>
  )
}
