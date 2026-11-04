'use client'

import { useEffect, useRef } from 'react'
import { useToast } from '@/components/providers/ToastProvider'
import { Icon } from '@/components/ui/Icon'
import styles from './blog.module.css'

/** Orange reading-progress line along the top of a blog post. Decorative. */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight || 1
      const pct = Math.min(100, Math.max(0, (el.scrollTop / max) * 100))
      if (ref.current) ref.current.style.width = `${pct.toFixed(1)}%`
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])
  return <div ref={ref} className={styles.progress} aria-hidden="true" />
}

/** LinkedIn share and copy-link buttons. */
export function ShareButtons({ url, title, label }: { url: string; title: string; label?: string }) {
  const toast = useToast()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast(`Copied ${url}`)
    } catch {
      toast('Select the address bar to copy the link')
    }
  }
  return (
    <aside className={`side stack g16 ${styles.share}`} aria-labelledby="share-label">
      <span className={`eyebrow ${styles.shareLabel}`} id="share-label">
        {label ?? 'Share'}
      </span>
      <div className="row g8">
        <a
          className="circ"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${title}" on LinkedIn (opens in a new tab)`}
        >
          <Icon name="linkedin" />
        </a>
        <button type="button" className="circ" onClick={copy} aria-label="Copy the link to this post">
          <Icon name="link" />
        </button>
      </div>
    </aside>
  )
}
