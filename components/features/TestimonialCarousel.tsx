'use client'

import { useEffect, useState } from 'react'
import { QuoteMark } from '@/components/brand'
import { Icon } from '@/components/ui/Icon'
import type { Testimonial } from '@/lib/sanity/types'
import styles from './TestimonialCarousel.module.css'

const ADVANCE_MS = 8000

/**
 * Large rotating quote with dots, previous/next and three mini quotes.
 * Auto-advances every 8 seconds; pauses on hover or keyboard focus, has a
 * pause button (WCAG 2.2.2), stops after the visitor picks a quote, and never
 * auto-advances with reduced motion.
 */
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const list = items.filter((t) => t?.quote)
  const count = list.length
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const paused = hovered || focused || stopped || reduced
  useEffect(() => {
    if (paused || count < 2) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), ADVANCE_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, count])

  if (!count) return null
  const current = list[index % count]
  const pick = (i: number) => {
    setStopped(true)
    setIndex(((i % count) + count) % count)
  }
  const others = [1, 2, 3].filter((k) => k < count).map((k) => (index + k) % count)

  return (
    <div
      className={`${styles.tbox} rv`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <figure className={`grow stack g24 ${styles.figure}`}>
        <QuoteMark width={88} />
        <div className={styles.tq} aria-live={stopped ? 'polite' : 'off'}>
          <blockquote key={index}>{current.quote}</blockquote>
        </div>
        <figcaption className={`row g16 ${styles.caption}`}>
          <span className={styles.name}>
            {current.name ? <strong className={styles.nameStrong}>{current.name}</strong> : null}
            {current.company ? (
              <>
                <br />
                <span className="muted">{current.company}</span>
              </>
            ) : null}
          </span>
          {count > 1 ? (
            <span className={`row g12 ${styles.controls}`}>
              {!reduced ? (
                <button
                  type="button"
                  className={styles.pause}
                  aria-label={stopped ? 'Play testimonials' : 'Pause testimonials'}
                  onClick={() => setStopped((v) => !v)}
                >
                  <Icon name={stopped ? 'play' : 'pause'} size={14} />
                </button>
              ) : null}
              <span className={styles.dots}>
                {list.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
                    aria-label={`Show testimonial ${i + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => pick(i)}
                  />
                ))}
              </span>
              <button type="button" className="circ" aria-label="Previous testimonial" onClick={() => pick(index - 1)}>
                <Icon name="back" />
              </button>
              <button type="button" className="circ fill" aria-label="Next testimonial" onClick={() => pick(index + 1)}>
                <Icon name="arrow" />
              </button>
            </span>
          ) : null}
        </figcaption>
      </figure>
      {others.length ? (
        <div className={`side stack g12 ${styles.side}`}>
          {others.map((i) => {
            const t = list[i]
            return (
              <button key={i} type="button" className={styles.mini} onClick={() => pick(i)}>
                <span className={styles.miniQuote}>&quot;{t.quote}&quot;</span>
                <span className={styles.miniName}>
                  {t.name ? <strong>{t.name}</strong> : null}
                  {t.name && t.company ? ' · ' : null}
                  {t.company}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
