/** Helpers shared by the header, mobile menu and footer. */

/** The href when it should show, or undefined when it is missing or points at a hidden page. */
export function visibleHref(href: string | undefined | null, hiddenHrefs: string[]): string | undefined {
  if (!href) return undefined
  const path = href.split('#')[0].split('?')[0]
  if (path && hiddenHrefs.includes(path)) return undefined
  return href
}

/** True when `href` is the current page or a parent of it ("/" only matches itself). */
export function isActiveHref(pathname: string | null, href: string | undefined) {
  if (!pathname || !href || !href.startsWith('/')) return false
  const base = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'
  if (base === '/') return pathname === '/'
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}
