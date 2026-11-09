import 'server-only'

import { cache } from 'react'
import { sanityFetch } from './fetch'
import { LAYOUT_QUERY } from './queries'
import type { LayoutData } from './types'

/** Site-wide data (settings, banner, calendar, scheduled sales, offer prices). Cached per request. */
export const getLayoutData = cache(async (): Promise<LayoutData> => {
  const data = await sanityFetch<LayoutData | null>({
    query: LAYOUT_QUERY,
    tags: ['siteSettings', 'announcementBanner', 'salesCalendar', 'sale', 'course', 'workshop', 'bundle', 'book', 'page'],
  })
  return {
    settings: data?.settings ?? null,
    banner: data?.banner ?? null,
    calendar: data?.calendar ?? null,
    courses: data?.courses ?? [],
    workshop: data?.workshop ?? null,
    bundle: data?.bundle ?? null,
    book: data?.book ?? null,
    hiddenHrefs: (data?.hiddenHrefs ?? []).filter(Boolean),
    sales: data?.sales ?? [],
  }
})
