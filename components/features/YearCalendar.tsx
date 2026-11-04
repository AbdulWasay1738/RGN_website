'use client'

import { useCallback, useEffect, useRef, type CSSProperties } from 'react'
import type { MethodCalendarSection } from '@/lib/sanity/types'
import styles from './YearCalendar.module.css'

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Ripple distance of each day from Day 1 (Jan 1), as in the prototype. */
const GRID = MONTH_LENGTHS.map((len, mi) =>
  Array.from({ length: len }, (_, di) => Math.round(Math.sqrt(di * di + mi * 1.12 * (mi * 1.12)))),
)

/**
 * "Your content year": a typical-approach strip of 365 production days against
 * the Reel Good News year, where one orange production day (Jan 1) feeds the
 * other 364. Day 1 lights first, then the year ripples out from it when the
 * card scrolls into view, and again on Replay.
 */
export function YearCalendar({ labels }: { labels?: MethodCalendarSection['calendar'] }) {
  const ref = useRef<HTMLDivElement>(null)

  const play = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove(styles.animOn)
    void el.offsetWidth // restart the CSS animations
    el.classList.add(styles.animOn)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        play()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [play])

  const replay = labels?.replayLabel ?? ''
  const replayText = replay && !replay.includes('↻') ? `${replay} ↻` : replay

  return (
    <div ref={ref} className={`${styles.year} rv`}>
      <div className={styles.yhead}>
        <span>{labels?.title}</span>
        {replayText ? (
          <button type="button" className={`tlink ${styles.replay}`} onClick={play}>
            {replayText}
          </button>
        ) : null}
      </div>
      {labels?.caption ? <p className={styles.ycap}>{labels.caption}</p> : null}
      <div className={styles.visual} role="img" aria-label={labels?.ariaLabel || undefined}>
        <div className={styles.ytyp}>
          <span className={styles.ylab}>
            <span>{labels?.typicalLabel}</span>
            <em>{labels?.typicalNote}</em>
          </span>
          <div className={styles.ymini}>
            {Array.from({ length: 365 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
        <span className={`${styles.ylab} ${styles.approach}`}>
          <span>{labels?.approachLabel}</span>
          <em>{labels?.approachNote}</em>
        </span>
        {labels?.calloutTag ? (
          <div className={styles.ycall}>
            <span className={styles.tag}>{labels.calloutTag}</span>
          </div>
        ) : null}
        {GRID.map((days, mi) => (
          <div key={mi} className={styles.mrow}>
            <span className={styles.ml}>{MONTHS[mi]}</span>
            <div className={styles.days}>
              {days.map((r, di) =>
                mi === 0 && di === 0 ? (
                  <span key={di} className={`${styles.d} ${styles.first}`} />
                ) : (
                  <span key={di} className={styles.d} style={{ '--r': r } as CSSProperties} />
                ),
              )}
            </div>
          </div>
        ))}
        <div className={styles.yfoot}>
          {labels?.legendProduction ? (
            <span>
              <i className={styles.keyDay} />
              {labels.legendProduction}
            </span>
          ) : null}
          {labels?.legendContent ? (
            <span>
              <i className={styles.keyContent} />
              {labels.legendContent}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
