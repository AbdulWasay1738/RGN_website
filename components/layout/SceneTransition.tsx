'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Reel } from '@/components/brand'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import type { Bundle, Course } from '@/lib/sanity/types'
import styles from './SceneTransition.module.css'

type Phase = 'idle' | 'in' | 'out'
type Slate = { title: string; scene: string; take: number; date: string; frame: string }

const COVER_MS = 360
const MIN_REVEAL_MS = 780
const DONE_AFTER_REVEAL_MS = 400
const MAX_WAIT_MS = 3000

/** Scene numbers follow the site's route order (the prototype's route list). */
function sceneNumber(pathname: string, courseSlugs: string[]) {
  const fixed: Array<[RegExp, number]> = [
    [/^\/$/, 1],
    [/^\/workshop\/?$/, 2],
    [/^\/courses\/content-machine\/?$/, 6],
    [/^\/book\/?$/, 7],
    [/^\/assessment\/questions\/?$/, 9],
    [/^\/assessment\/thank-you\/?$/, 10],
    [/^\/assessment\/?$/, 8],
    [/^\/order\//, 11],
    [/^\/partner\/?$/, 12],
    [/^\/contact\/?$/, 13],
    [/^\/about\/jenna-colombo\/?$/, 15],
    [/^\/about\/?$/, 14],
    [/^\/speaking\/?$/, 16],
    [/^\/podcast\/?$/, 17],
    [/^\/socials\/?$/, 18],
    [/^\/careers\/?$/, 19],
    [/^\/blog\/.+/, 21],
    [/^\/blog\/?$/, 20],
    [/^\/legal\//, 22],
  ]
  for (const [re, n] of fixed) if (re.test(pathname)) return n
  const course = /^\/courses\/([^/]+)/.exec(pathname)
  if (course) {
    const i = courseSlugs.indexOf(course[1])
    return 3 + (i >= 0 ? Math.min(i, 2) : 0)
  }
  return 23
}

function trimTitle(text: string) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > 60 ? `${t.slice(0, 59).trimEnd()}…` : t
}

function titleFor(path: string, anchor: HTMLAnchorElement, courses: Course[], bundle: Pick<Bundle, 'title'> | null) {
  if (path === '/') return 'The front page'
  if (path.startsWith('/legal/')) return 'The fine print'
  if (/^\/blog\/.+/.test(path)) return 'From the blog'
  const course = /^\/courses\/([^/]+)\/?$/.exec(path)
  if (course) {
    if (course[1] === 'content-machine' && bundle?.title) return trimTitle(bundle.title)
    const c = courses.find((x) => x.slug === course[1])
    if (c?.title) return trimTitle(c.title)
  }
  const label = anchor.getAttribute('aria-label') || anchor.textContent || ''
  return trimTitle(label) || 'Reel Good News'
}

function scrollTop() {
  const de = document.documentElement
  const prev = de.style.scrollBehavior
  de.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  de.style.scrollBehavior = prev
}

/**
 * The film-strip and clapperboard cover between routes. Internal link clicks
 * are intercepted (capture phase), the cover slides in, the route changes and
 * the page scrolls to the top while covered, then the cover slides out once
 * the new page has rendered. Rapid clicks queue the latest one. Skipped for
 * reduced motion and for same-page changes.
 */
export function SceneTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const { settings, courses, bundle } = useSite()
  const { offsetMs } = useSalesCalendar()
  const [phase, setPhase] = useState<Phase>('idle')
  const [slate, setSlate] = useState<Slate>({ title: '', scene: '01', take: 0, date: '', frame: '' })

  // Latest render values for the long-lived click handler.
  const latest = useRef({ router, courses, bundle, offsetMs })
  useEffect(() => {
    latest.current = { router, courses, bundle, offsetMs }
  })

  // Called by the pathname effect when a route change lands.
  const onArrive = useRef<((path: string) => void) | null>(null)
  useEffect(() => {
    onArrive.current?.(pathname)
  }, [pathname])

  useEffect(() => {
    let busy = false
    let take = 0
    let queued: { href: string; title: string } | null = null
    let pending: { target: string; startedAt: number; arrived: boolean; revealed: boolean } | null = null
    let timers: number[] = []

    const clearTimers = () => {
      timers.forEach((t) => window.clearTimeout(t))
      timers = []
    }

    const finish = () => {
      pending = null
      busy = false
      setPhase('idle')
      document.getElementById('main')?.focus({ preventScroll: true })
      const next = queued
      queued = null
      if (next) go(next.href, next.title)
    }

    const reveal = () => {
      if (!pending || pending.revealed) return
      pending.revealed = true
      scrollTop()
      setPhase('out')
      timers.push(window.setTimeout(finish, DONE_AFTER_REVEAL_MS))
    }

    const go = (href: string, title: string) => {
      if (busy) {
        queued = { href, title }
        return
      }
      busy = true
      take += 1
      const { router: r, courses: cs, offsetMs: off } = latest.current
      const now = new Date(Date.now() + off)
      const date = [now.getMonth() + 1, now.getDate(), now.getFullYear() % 100]
        .map((v) => String(v).padStart(2, '0'))
        .join('.')
      const url = new URL(href, window.location.href)
      setSlate({
        title,
        scene: String(sceneNumber(url.pathname, cs.map((c) => c.slug ?? ''))).padStart(2, '0'),
        take,
        date,
        frame: `RGN · FRAME ${String(1000 + take * 24).slice(-4)}`,
      })
      setPhase('in')
      pending = { target: url.pathname, startedAt: performance.now(), arrived: false, revealed: false }
      clearTimers()
      timers.push(
        window.setTimeout(() => {
          r.push(href, { scroll: false })
          scrollTop()
        }, COVER_MS),
      )
      timers.push(
        window.setTimeout(() => {
          if (pending?.arrived) reveal()
        }, MIN_REVEAL_MS),
      )
      timers.push(window.setTimeout(reveal, MAX_WAIT_MS))
    }

    onArrive.current = (path: string) => {
      if (!pending || pending.target !== path) return
      pending.arrived = true
      if (performance.now() - pending.startedAt >= MIN_REVEAL_MS) reveal()
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return
      const raw = a.getAttribute('href') ?? ''
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (/^\/(studio|api)(\/|$)/.test(url.pathname)) return
      // Same page (only the hash or query changes): no scene change.
      if (url.pathname === window.location.pathname) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      e.preventDefault()
      const { courses: cs, bundle: b } = latest.current
      go(url.pathname + url.search + url.hash, titleFor(url.pathname, a, cs, b))
    }

    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      clearTimers()
      onArrive.current = null
    }
  }, [])

  const sc = settings?.sceneTransition
  const cls = [styles.cut, phase !== 'idle' ? styles.on : '', phase === 'in' ? styles.in : '', phase === 'out' ? styles.out : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} aria-hidden="true">
      <div className={styles.strip}>
        <span className={`${styles.edge} ${styles.edgeL}`} />
        <span className={`${styles.edge} ${styles.edgeR}`} />
        <span className={styles.fr}>{slate.frame || sc?.topLabel || 'RGN · 35MM'}</span>
        <span className={`${styles.fr} ${styles.frB}`}>{sc?.bottomLabel || 'HOOK. LINE. HEART.'}</span>
        <div className={styles.slate}>
          <div className={`${styles.stick} ${styles.stickTop}`} />
          <div className={`${styles.stick} ${styles.stickLow}`} />
          <div className={styles.board}>
            <div className={styles.r1}>
              <span className="stack" style={{ gap: 2 }}>
                <span className={styles.k}>PROD.</span>
                <span className={styles.prod}>{sc?.productionName || 'Reel Good News'}</span>
              </span>
              <span className={styles.rl}>{phase !== 'idle' ? <Reel disc="#F23300" hole="#091527" /> : null}</span>
            </div>
            <strong className={styles.ttl}>{slate.title}</strong>
            <div className={styles.cells}>
              <div>
                <span className={styles.k}>SCENE</span>
                <b>{slate.scene}</b>
              </div>
              <div>
                <span className={styles.k}>TAKE</span>
                <b>{slate.take || 1}</b>
              </div>
              <div>
                <span className={styles.k}>DATE</span>
                <b className={styles.date}>{slate.date}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
