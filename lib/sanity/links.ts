import type { Link, LinkTargetType } from './types'

export type LinkTarget = { _id: string; _type: LinkTargetType; slug?: string; hidden?: boolean }

/** GROQ for every document a link can point to. */
export const LINK_TARGETS_QUERY = `*[_type in ["page","course","workshop","bundle","book","assessment","post","legalPage","blogSettings","growthCall"]]{_id, _type, "slug": slug.current, hidden}`

/** The public URL of a document, or undefined when it is hidden or has no URL. */
export function hrefForDocument(doc: Pick<LinkTarget, '_type' | 'slug' | 'hidden'>): string | undefined {
  if (doc.hidden) return undefined
  switch (doc._type) {
    case 'page':
      if (!doc.slug) return undefined
      return doc.slug === 'home' ? '/' : `/${doc.slug.replace(/^\/+/, '')}`
    case 'course':
      return doc.slug ? `/courses/${doc.slug}` : undefined
    case 'workshop':
      return '/workshop'
    case 'bundle':
      return '/courses/content-machine'
    case 'book':
      return '/book'
    case 'assessment':
      return '/assessment'
    case 'post':
      return doc.slug ? `/blog/${doc.slug}` : undefined
    case 'legalPage':
      return doc.slug ? `/legal/${doc.slug}` : undefined
    case 'blogSettings':
      return '/blog'
    case 'growthCall':
      return '/growth-strategy'
    default:
      return undefined
  }
}

function stripDraftPrefix(id: string) {
  return id.replace(/^drafts\./, '').replace(/^versions\.[^.]+\./, '')
}

export function buildLinkMap(targets: LinkTarget[]): Map<string, string | undefined> {
  const map = new Map<string, string | undefined>()
  for (const t of targets) map.set(stripDraftPrefix(t._id), hrefForDocument(t))
  return map
}

export function hrefForLink(link: Link, map: Map<string, string | undefined>): string | undefined {
  const anchor = link.anchor ? `#${link.anchor.replace(/^#/, '')}` : ''
  if (link.kind === 'external') {
    return link.external ? link.external + anchor : anchor || undefined
  }
  if (link.internal?._ref) {
    const base = map.get(stripDraftPrefix(link.internal._ref))
    if (base === undefined) return undefined
    return base + anchor
  }
  return anchor || undefined
}

/** Adds `href` to every `link` object in a fetched tree. */
export function resolveLinks<T>(data: T, map: Map<string, string | undefined>): T {
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      // `link` objects from the schema (not portable-text link annotations, which carry their own href).
      const isLinkObject =
        obj._type === 'link' &&
        (obj.kind !== undefined || obj.internal !== undefined || obj.external !== undefined || obj.anchor !== undefined)
      if (isLinkObject) {
        obj.href = hrefForLink(obj as unknown as Link, map)
      }
      for (const key of Object.keys(obj)) {
        if (key !== 'href') walk(obj[key])
      }
    }
  }
  walk(data)
  return data
}

/** True when a link points somewhere on this site. */
export function isInternalHref(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}
