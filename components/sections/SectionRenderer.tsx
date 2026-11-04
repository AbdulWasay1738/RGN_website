import type { ComponentType } from 'react'
import type { Section } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import { AssessmentCta } from './AssessmentCta'
import { CtaPanels } from './CtaPanels'
import { Episodes } from './Episodes'
import { FaqBlock } from './FaqBlock'
import { FinalCta } from './FinalCta'
import { FormBlock } from './FormBlock'
import { FounderStory } from './FounderStory'
import { Gallery } from './Gallery'
import { HeroFounder } from './HeroFounder'
import { HowItWorks } from './HowItWorks'
import { ImageText } from './ImageText'
import { LinkCards } from './LinkCards'
import { MediaBand } from './MediaBand'
import { MethodCalendar } from './MethodCalendar'
import { OfferGrid } from './OfferGrid'
import { PageHero } from './PageHero'
import { ProfileBio } from './ProfileBio'
import { RichTextSection } from './RichTextSection'
import { SocialFeed } from './SocialFeed'
import { Statement } from './Statement'
import { StatsBlock } from './StatsBlock'
import { TeamGrid } from './TeamGrid'
import { Testimonials } from './Testimonials'
import { Ticker } from './Ticker'
import { Timeline } from './Timeline'
import { ValuesGrid } from './ValuesGrid'

/** Props every section component receives. */
export type SectionProps<T extends Section = Section> = {
  section: T
  /** Position on the page (0 = first). The first section loads its images with priority. */
  index: number
  /** The page title, for breadcrumbs */
  pageTitle?: string
}

// Each component accepts SectionProps<ItsOwnSectionType>.
const COMPONENTS: Record<Section['_type'], ComponentType<SectionProps<never>>> = {
  heroFounder: HeroFounder,
  ticker: Ticker,
  methodCalendar: MethodCalendar,
  howItWorks: HowItWorks,
  offerGrid: OfferGrid,
  assessmentCta: AssessmentCta,
  statsBlock: StatsBlock,
  testimonials: Testimonials,
  founderStory: FounderStory,
  faqBlock: FaqBlock,
  finalCta: FinalCta,
  pageHero: PageHero,
  statement: Statement,
  valuesGrid: ValuesGrid,
  timeline: Timeline,
  teamGrid: TeamGrid,
  ctaPanels: CtaPanels,
  gallery: Gallery,
  formSection: FormBlock,
  episodes: Episodes,
  socialFeed: SocialFeed,
  richText: RichTextSection,
  imageText: ImageText,
  linkCards: LinkCards,
  profileBio: ProfileBio,
  mediaBand: MediaBand,
}

/** Renders a page's sections in order, skipping hidden ones and unknown types. */
export function SectionRenderer({ sections, pageTitle }: { sections?: Section[] | null; pageTitle?: string }) {
  return (
    <>
      {(sections ?? []).map((section, index) => {
        if (!section || section.hidden) return null
        const Component = COMPONENTS[clean(section._type) as Section['_type']] as ComponentType<SectionProps> | undefined
        if (!Component) return null
        return <Component key={section._key} section={section} index={index} pageTitle={pageTitle} />
      })}
    </>
  )
}
