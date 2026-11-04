import Link from 'next/link'
import type { CSSProperties } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { buttonClass } from '@/components/ui/Button'
import type { Background, CtaPanelsSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './CtaPanels.module.css'

const grid = { ['--min' as string]: '340px', ['--gap' as string]: '20px' } as CSSProperties

/** Big closing panels (About). Each whole panel is one link; the button inside is styling only. */
export function CtaPanels({ section, index }: SectionProps<CtaPanelsSection>) {
  const background: Background = clean(section.background) ?? 'white'
  const panels = (section.panels ?? []).filter((p) => p?.headline)
  // Continues the white band above it, as in the prototype.
  const style: CSSProperties | undefined = background === 'white' && index > 0 ? { paddingTop: 0 } : undefined

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId} style={style}>
      <div className="wrap grid" style={grid}>
        {panels.map((p, i) => {
          const navy = clean(p.tone) === 'navy'
          const btnStyle = clean(p.cta?.style) ?? (navy ? 'primary' : 'dark')
          const inner = (
            <>
              <AccentText text={p.headline} className={`display ${styles.headline}`} tone="acc-l" as="h2" />
              {p.cta?.label ? (
                <span className={buttonClass(btnStyle === 'textLink' ? 'dark' : btnStyle, { small: true })} style={{ alignSelf: 'flex-start' }}>
                  {p.cta.label}
                </span>
              ) : null}
            </>
          )
          const cls = `card lift ${styles.panel} ${navy ? styles.navy : styles.lav}`
          return p.cta?.link?.href ? (
            <Link key={p._key ?? i} href={p.cta.link.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <div key={p._key ?? i} className={cls}>
              {inner}
            </div>
          )
        })}
      </div>
    </Band>
  )
}
