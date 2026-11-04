import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Band } from '@/components/ui/Band'
import type { Background, LinkCardsSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './LinkCards.module.css'

const grid = { ['--min' as string]: '240px', ['--gap' as string]: '16px' } as CSSProperties

/** Quick-link cards (Contact). Cards whose page is hidden or missing drop out. */
export function LinkCards({ section }: SectionProps<LinkCardsSection>) {
  const background: Background = clean(section.background) ?? 'white'
  const items = (section.items ?? []).filter((it) => it?.title && it.link?.href)
  if (!items.length) return null
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId} padding="tight">
      <ul className={`wrap grid ${styles.list}`} style={grid}>
        {items.map((it, i) => (
          <li key={it._key ?? i} className={styles.item}>
            <Link href={it.link!.href!} className={`card lift ${styles.card}`}>
              {it.eyebrow ? <span className="eyebrow">{it.eyebrow}</span> : null}
              <strong className={`display ${styles.title}`}>{it.title}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  )
}
