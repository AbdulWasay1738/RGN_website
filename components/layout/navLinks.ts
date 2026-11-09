/** Helpers shared by the header, mobile menu and footer. */
import type { Course } from '@/lib/sanity/types'

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

/**
 * Course links mark where the courses go in a menu. Every published course is
 * listed there, in the order of the Courses list in the Studio, so a new
 * course appears by itself. A link the editor wrote for a course keeps its
 * label (and anything else `make` copies from it).
 */
export function withAllCourses<T>(
  items: T[],
  courses: Array<Pick<Course, '_id' | 'slug'>>,
  hrefOf: (item: T) => string | undefined,
  make: <C extends Course>(course: C, written: T | undefined) => T,
): T[] {
  const hrefs = new Map(courses.filter((c) => c.slug).map((c) => [`/courses/${c.slug}`, c]))
  const isCourse = (item: T) => {
    const href = hrefOf(item)
    return !!href && hrefs.has(href.split('#')[0])
  }
  const first = items.findIndex(isCourse)
  if (first === -1 || !courses.length) return items
  const written = new Map(items.filter(isCourse).map((item) => [hrefOf(item)!.split('#')[0], item]))
  const listed = courses.filter((c) => c.slug).map((c) => make(c as Course, written.get(`/courses/${c.slug}`)))
  const rest = items.filter((item) => !isCourse(item))
  const before = items.slice(0, first).filter((item) => !isCourse(item))
  return [...before, ...listed, ...rest.slice(before.length)]
}
