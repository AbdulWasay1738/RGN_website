import { Icon } from '@/components/ui/Icon'
import type { TickerSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'

/** Gradient marquee of short phrases with coral star separators. Pauses on hover. */
export function Ticker({ section }: SectionProps<TickerSection>) {
  const phrases = (section.phrases ?? []).filter(Boolean)
  if (!phrases.length) return null
  // Two copies make the loop seamless; the second copy is hidden from screen readers.
  const items = [...phrases.map((p) => ({ p, dup: false })), ...phrases.map((p) => ({ p, dup: true }))]
  return (
    <div className="ticker" id={clean(section.anchorId) || undefined}>
      <div className="ticker-track">
        {items.map(({ p, dup }, i) => (
          <span key={i} aria-hidden={dup || undefined}>
            {p}
            <Icon name="star" />
          </span>
        ))}
      </div>
    </div>
  )
}
