import Link from 'next/link'
import { Band } from '@/components/ui/Band'
import type { GrowthCallCtaSection } from '@/lib/sanity/types'
import type { SectionProps } from './SectionRenderer'

/** "Not sure the in-person workshop fits? Book a growth strategy call": a line linking to /growth-strategy. */
export function GrowthCallCta({ section }: SectionProps<GrowthCallCtaSection>) {
  if (!section.linkLabel) return null
  return (
    <Band background={section.background} watermark={section.watermark} anchorId={section.anchorId} padding="tight">
      <p className="wrap rv" style={{ margin: '0 auto', fontWeight: 700 }}>
        {section.line ? `${section.line} ` : null}
        <Link href="/growth-strategy" className="tlink" style={{ textDecoration: 'underline' }} data-track="growth_link">
          {section.linkLabel}
        </Link>
      </p>
    </Band>
  )
}
