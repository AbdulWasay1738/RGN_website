import type { CSSProperties, ReactNode } from 'react'
import { SectionWatermark } from '@/components/brand'
import type { Background, WatermarkPosition } from '@/lib/sanity/types'
import { clean } from '@/lib/text'

export const BACKGROUND_CLASS: Record<Background, string> = {
  white: 'whiteb',
  paper: 'paper',
  navy: 'navy',
  ink: 'ink',
  lavender: 'lavb',
  'lavender-tint': 'lavt',
  orange: 'orangeb',
}

/**
 * A full-width colour band (a page section). Handles the background, the
 * optional R watermark, the anchor id and the standard vertical padding.
 */
export function Band({
  background = 'white',
  watermark,
  anchorId,
  padding = 'band',
  className,
  style,
  children,
  as: Tag = 'section',
  labelledBy,
}: {
  background?: Background
  watermark?: WatermarkPosition
  anchorId?: string
  /** band: 112px (64px mobile). tight: 80px. none: no padding. */
  padding?: 'band' | 'tight' | 'none'
  className?: string
  style?: CSSProperties
  children: ReactNode
  as?: 'section' | 'div'
  labelledBy?: string
}) {
  const bg = clean(background) ?? 'white'
  const wm = clean(watermark)
  const hasWm = !!wm && wm !== 'none'
  const cls = [
    BACKGROUND_CLASS[bg] ?? '',
    padding === 'band' ? 'band' : padding === 'tight' ? 'band tight' : '',
    hasWm || bg === 'orange' ? 'wm-host' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <Tag id={clean(anchorId) || undefined} className={cls} style={style} aria-labelledby={labelledBy}>
      {hasWm ? <SectionWatermark position={wm} background={bg} /> : null}
      {children}
    </Tag>
  )
}
