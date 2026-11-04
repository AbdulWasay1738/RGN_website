/**
 * Brand identity components, ported from the prototype's helper functions
 * (wm, brush, felt, tear, reel, QUOTE). All are decorative and hidden from
 * assistive technology.
 */
import type { CSSProperties } from 'react'
import type { Background, WatermarkPosition } from '@/lib/sanity/types'

/** SVG filter defs for the brush and torn-felt shapes. Rendered once in the root layout. */
export function BrandFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="rgnBrush" x="-8%" y="-20%" width="116%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves={3} seed={4} result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale={34} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.75" numOctaves={2} seed={9} result="streak" />
        <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.25" result="mask" />
        <feComposite in="rough" in2="mask" operator="in" />
      </filter>
      <filter id="rgnTorn" x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={4} seed={2} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale={16} xChannelSelector="R" yChannelSelector="G" result="r" />
        <feTurbulence type="turbulence" baseFrequency="0.85" numOctaves={2} seed={5} result="f" />
        <feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="fm" />
        <feComposite in="r" in2="fm" operator="in" />
      </filter>
    </svg>
  )
}

/** The script "R" from the logo as a CSS mask; its colour comes from `color`. */
export function Watermark({ style, className }: { style?: CSSProperties; className?: string }) {
  return <span className={['wm', className].filter(Boolean).join(' ')} aria-hidden="true" style={style} />
}

/** Low-contrast watermark tone for each band background. */
export const WATERMARK_TONE: Record<Background, { color: string; opacity?: number }> = {
  white: { color: '#F2EFEA' },
  paper: { color: '#EFE8DC' },
  navy: { color: '#16233A' },
  ink: { color: '#152238' },
  lavender: { color: '#B898E3' },
  'lavender-tint': { color: '#E7DCF7' },
  orange: { color: '#FFFFFF', opacity: 0.14 },
}

const WATERMARK_POSITION: Record<Exclude<WatermarkPosition, 'none'>, CSSProperties> = {
  'top-right': { right: -120, top: -60, width: 520 },
  'top-left': { left: -120, top: 20, width: 620 },
  'bottom-left': { left: -160, bottom: -140, width: 480 },
  'bottom-right': { right: -140, bottom: -120, width: 460 },
  'center-right': { right: -60, top: '50%', width: 520, transform: 'translateY(-50%)' },
}

/** Watermark placed by a section's `watermark` setting, toned to its background. */
export function SectionWatermark({ position, background = 'white' }: { position?: WatermarkPosition; background?: Background }) {
  if (!position || position === 'none') return null
  const tone = WATERMARK_TONE[background] ?? WATERMARK_TONE.white
  return <Watermark style={{ ...WATERMARK_POSITION[position], color: tone.color, opacity: tone.opacity }} />
}

/** Orange circle with a white R. */
export function RBadge({ size, style }: { size?: number | string; style?: CSSProperties }) {
  return <span className="rbadge" aria-hidden="true" style={{ ...(size ? { width: size, height: size } : {}), ...style }} />
}

/** Coral dry-brush stroke (behind the hero portrait). */
export function Brush({ style, color = '#FF4739' }: { style?: CSSProperties; color?: string }) {
  return (
    <svg className="brush" style={style} viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M40 70 C 260 30, 620 20, 960 60 L 975 205 C 700 238, 330 245, 25 212 Z" fill={color} filter="url(#rgnBrush)" />
    </svg>
  )
}

/** Torn red felt block (behind the founder photo). */
export function Felt({ style, color = '#FF4739' }: { style?: CSSProperties; color?: string }) {
  return (
    <svg className="felt" style={style} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <rect x="14" y="14" width="272" height="372" fill={color} filter="url(#rgnTorn)" />
    </svg>
  )
}

/** Lavender folded-paper triangle framing a photo. */
export function Shard({ style }: { style?: CSSProperties }) {
  return <span className="shard" aria-hidden="true" style={style} />
}

/** Deterministic jagged path (same seed as the prototype), so server and client match. */
function tearPath() {
  let x = 0
  let d = 'M0 28 L0 14'
  let k = 7
  while (x < 1440) {
    k = (k * 9301 + 49297) % 233280
    const r = k / 233280
    x += 10 + r * 26
    const y = 4 + ((k >> 3) % 17)
    d += ` L${Math.min(1440, x).toFixed(0)} ${y}`
  }
  return d + ' L1440 28 Z'
}
const TEAR_D = tearPath()

/** Torn-paper edge used as a section transition. `top` flips it to the top edge. */
export function Tear({ fill, position = 'bottom' }: { fill: string; position?: 'top' | 'bottom' }) {
  return (
    <svg className={`tear ${position === 'top' ? 't' : 'b'}`} viewBox="0 0 1440 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={TEAR_D} fill={fill} />
    </svg>
  )
}

const REEL_HOLES: Array<[number, number]> = [
  [300, 140],
  [438, 220],
  [438, 380],
  [300, 460],
  [162, 380],
  [162, 220],
]

/** Film-reel SVG. Wrap in <SpinningReel> for the slow rotation. */
export function Reel({ disc, hole, ring }: { disc: string; hole: string; ring?: string }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true">
      <circle cx="300" cy="300" r="290" fill={disc} />
      {ring ? <circle cx="300" cy="300" r="290" fill="none" stroke={ring} strokeWidth="2" strokeDasharray="2 10" /> : null}
      {REEL_HOLES.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="62" fill={hole} />
      ))}
      <circle cx="300" cy="300" r="34" fill={hole} />
      {ring ? <circle cx="300" cy="300" r="12" fill={ring} /> : null}
    </svg>
  )
}

/** A reel that spins slowly (stops for reduced-motion users). Size and position come from `style`. */
export function SpinningReel({
  disc,
  hole,
  ring,
  seconds = 90,
  style,
  className,
}: {
  disc: string
  hole: string
  ring?: string
  seconds?: number
  style?: CSSProperties
  className?: string
}) {
  return (
    <div className={className} style={style} aria-hidden="true">
      <div className="reel-spin" style={{ ['--spin' as string]: `${seconds}s` }}>
        <Reel disc={disc} hole={hole} ring={ring} />
      </div>
    </div>
  )
}

/** Lavender quotation mark (quote-mark.svg). */
export function QuoteMark({ width = 88, color = '#C6A7ED', style }: { width?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={width} height={Math.round(width * 0.76)} viewBox="0 0 332 252" aria-hidden="true" style={style}>
      <path
        fill={color}
        d="M85.9,107.9c-15.7,0-30.1,5.2-41.8,13.9,1.2-36.4,29.3-72.7,84.7-109.1L120.6,0C40.2,49.9,0,104.7,0,164.4s7.5,48.9,22.4,64.4c14.9,15.5,33.8,23.3,56.6,23.3s41.3-6.2,55.3-18.7c14-12.5,21-27.6,21-45.2s0-.3,0-.6c.4-3.1.7-6.3.7-9.6,0-38.7-31.4-70.1-70.1-70.1Z"
      />
      <path
        fill={color}
        d="M312.4,226.4c.9-1,2-2,2.8-3.1,10.3-12.2,16.6-28,16.6-45.2,0-38.7-31.4-70.1-70.1-70.1s-33.9,6.6-46.2,17.5c0-.4,0-.8,0-1.2,0-37.1,28.3-74.3,84.9-111.4L292.2,0c-80.4,49.9-120.6,104.7-120.6,164.4s7.5,48.9,22.4,64.4c14.9,15.5,33.8,23.3,56.6,23.3s41.3-6.2,55.3-18.7c2-1.7,3.5-3.7,5.2-5.6.4-.4.8-.9,1.3-1.4Z"
      />
    </svg>
  )
}

/** Subtle noise overlay; add as the last child of a positioned element. */
export function Grain({ opacity = 0.22 }: { opacity?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--grain)',
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  )
}
