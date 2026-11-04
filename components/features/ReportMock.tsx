'use client'

import Image from 'next/image'
import { useEffect, useRef, type CSSProperties } from 'react'
import type { Assessment } from '@/lib/sanity/types'
import styles from './ReportMock.module.css'

/** Sample bar values from the prototype (a layout preview, not real results). */
const BAR_VALUES = [62, 38, 74, 45, 56]
const DEFAULT_AREAS = ['Marketing efficiency', 'Sales enablement', 'Expertise capture', 'Content strategy', 'Measurement']
const PRIORITY_WIDTHS = [100, 70, 82]

/**
 * The sample Marketing Efficiency Report card. Its bars grow when the card
 * scrolls into view. `areas` defaults to the five assessment areas.
 */
export function ReportMock({ labels, areas }: { labels?: Assessment['reportMock']; areas?: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const names = (areas?.length ? areas : DEFAULT_AREAS).slice(0, 5)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        el.classList.remove(styles.animOn)
        void el.offsetWidth
        el.classList.add(styles.animOn)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={styles.wrap}>
      <div ref={ref} className={styles.report}>
        <div className={`row ${styles.head}`}>
          <span className="stack g4">
            {labels?.sampleLabel ? <span className={styles.sample}>{labels.sampleLabel}</span> : null}
            {labels?.title ? <strong className={styles.title}>{labels.title}</strong> : null}
            {labels?.preparedFor ? <span className={styles.prepared}>{labels.preparedFor}</span> : null}
          </span>
          <Image src="/img/logo.png" alt="" width={1200} height={296} className={styles.logo} sizes="90px" />
        </div>
        <div className={`stack g8 ${styles.bars}`}>
          {names.map((name, k) => (
            <span key={name + k} className={`stack ${styles.barRow}`}>
              {name}
              <span className="bar" aria-hidden="true">
                <i className={k === 1 || k === 3 ? 'o' : ''} style={{ '--w': `${BAR_VALUES[k] ?? 50}%`, '--k': k } as CSSProperties} />
              </span>
            </span>
          ))}
        </div>
        <div className={`stack g8 ${styles.priorities}`}>
          {labels?.prioritiesLabel ? <span className={styles.prioritiesLabel}>{labels.prioritiesLabel}</span> : null}
          {PRIORITY_WIDTHS.map((w, i) => (
            <span key={i} className={`row g8 nowrap ${styles.priority}`} aria-hidden="true">
              <span className={styles.num}>{i + 1}</span>
              <span className="skel" style={{ width: `${w}%` }} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
