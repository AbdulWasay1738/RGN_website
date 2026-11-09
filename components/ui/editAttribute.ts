'use client'

import { createDataAttribute } from 'next-sanity'
import { useSite } from '@/components/providers/SiteProvider'
import { dataset, projectId, studioUrl } from '@/lib/sanity/env'

/** A document field to open in the Studio: `{ id: 'bundle', type: 'bundle', path: 'price' }`. */
export type EditTarget = { id?: string; type: string; path: string }

/**
 * Click-to-edit for values Live preview cannot find by itself. Text from the
 * Studio carries invisible edit markers, but prices are numbers worked out
 * by date, so they get an explicit `data-sanity` attribute instead. Outside
 * Live preview it adds nothing.
 */
export function useEditAttribute() {
  const { draft } = useSite()
  return (target: EditTarget): Record<string, string> => {
    if (!draft || !target.id) return {}
    const id = target.id.replace(/^drafts\./, '')
    return { 'data-sanity': createDataAttribute({ projectId, dataset, baseUrl: studioUrl, id, type: target.type, path: target.path }).toString() }
  }
}
