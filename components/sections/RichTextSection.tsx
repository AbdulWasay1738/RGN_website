import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { RichText } from '@/components/ui/RichText'
import type { Background, RichTextSection as RichTextSectionData } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'

/** Free text for pages the client builds: optional eyebrow and headline above an article column. */
export function RichTextSection({ section }: SectionProps<RichTextSectionData>) {
  const background: Background = clean(section.background) ?? 'white'
  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap narrow stack g20">
        {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        <AccentText as="h2" text={section.headline} className="h2" />
        <RichText value={section.body} className="article" />
      </div>
    </Band>
  )
}
