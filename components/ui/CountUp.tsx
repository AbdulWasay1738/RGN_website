'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A number that counts up from zero when it scrolls into view.
 * Server render and reduced-motion users see the final value.
 */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(to)

  useEffect(() => {
    const el = ref.current
    if (!el || !to || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        const t0 = performance.now()
        const dur = 1400
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur)
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        setValue(0)
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
