'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useSite } from '@/components/providers/SiteProvider'
import type { SimpleLink } from '@/lib/sanity/types'
import { buttonClass } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SanityImage } from '@/components/ui/SanityImage'
import { clean } from '@/lib/text'
import { visibleHref, withAllCourses } from './navLinks'
import styles from './MobileMenu.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Full-screen navy menu under 1080px. Traps focus, closes on Escape, locks page scroll. */
export function MobileMenu({ onClose }: { onClose: (restoreFocus: boolean) => void }) {
  const { settings, hiddenHrefs, courses } = useSite()
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const root = rootRef.current
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose(true)
        return
      }
      if (e.key !== 'Tab' || !root) return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const groups = settings?.mobileMenuGroups ?? []
  const bottom = settings?.mobileMenuBottom
  const bottomHref = visibleHref(bottom?.cta?.link?.href, hiddenHrefs)
  const navigate = () => onClose(false)

  return (
    <div ref={rootRef} id="mobile-menu" className={styles.menu} role="dialog" aria-modal="true" aria-label="Menu">
      <div className={styles.top}>
        <SanityImage
          image={settings?.logoInverted}
          fallback={{ file: 'logo-invert.png', alt: 'Reel Good News' }}
          alt="Reel Good News"
          sizes="140px"
          className={styles.logo}
        />
        <button ref={closeRef} type="button" className="round-x" aria-label="Close menu" onClick={() => onClose(true)}>
          <Icon name="close" />
        </button>
      </div>
      <div className={styles.body}>
        {groups.map((g) => {
          // A new course joins the "Courses" list by itself.
          const all = withAllCourses(
            g.links ?? [],
            courses,
            (l) => l.link?.href,
            (course, written): SimpleLink => ({ _key: written?._key ?? `course-${course._id}`, label: written?.label ?? course.title, link: { _type: 'link', href: `/courses/${course.slug}` } }),
          )
          const links = all
            .map((l) => ({ ...l, href: visibleHref(l.link?.href, hiddenHrefs) }))
            .filter((l) => l.href && l.label)
          if (!links.length) return null
          const big = clean(g.style) === 'big'
          return (
            <div key={g._key} className="stack g8">
              {g.title ? <span className="eyebrow">{g.title}</span> : null}
              {big ? (
                links.map((l) => (
                  <Link key={l._key ?? l.href} href={l.href as string} className={styles.big} onClick={navigate}>
                    {l.label}
                  </Link>
                ))
              ) : (
                <div className={styles.pillnav}>
                  {links.map((l) => (
                    <Link key={l._key ?? l.href} href={l.href as string} onClick={navigate}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {bottomHref || bottom?.note ? (
        <div className={styles.bottom}>
          {bottomHref && bottom?.cta?.label ? (
            <Link href={bottomHref} className={buttonClass('primary', { block: true })} onClick={navigate}>
              {bottom.cta.label}
            </Link>
          ) : null}
          {bottom?.note ? <span className={styles.note}>{bottom.note}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
