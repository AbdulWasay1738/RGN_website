'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { LayoutData } from '@/lib/sanity/types'

const SiteContext = createContext<LayoutData | null>(null)

const EMPTY: LayoutData = {
  settings: null,
  banner: null,
  calendar: null,
  courses: [],
  workshop: null,
  bundle: null,
  book: null,
  hiddenHrefs: [],
}

/** Site-wide content (settings, offers, calendar) for client components. */
export function SiteProvider({ value, children }: { value: LayoutData; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite(): LayoutData {
  return useContext(SiteContext) ?? EMPTY
}
