import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, studioUrl } from './env'

/**
 * Field names whose values drive layout or logic (enums, slugs, keys).
 * Stega encoding (the invisible click-to-edit markers in preview) must never
 * touch them, or comparisons like `style === 'primary'` would fail.
 */
const NO_STEGA_KEYS = new Set([
  'anchor', 'anchorId', 'art', 'background', 'badgeStyle', 'bodyStyle', 'countdownTo', 'email',
  'external', 'form', 'handLinePosition', 'headingSize', 'href', 'icon', 'imageSide', 'kind',
  'layout', 'panelTone', 'preorderUrl', 'slug', 'spotifyUrl', 'status', 'style', 'tags', 'tone',
  'topic', 'url', 'variant', 'watermark', 'youtubeUrl', 'linkedinUrl', 'contactEmail', 'area',
])

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: {
    studioUrl,
    filter: (props) => {
      const last = props.sourcePath.at(-1)
      if (typeof last === 'string' && NO_STEGA_KEYS.has(last)) return false
      return props.filterDefault(props)
    },
  },
})
