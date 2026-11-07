import type { CSSProperties, ReactNode } from 'react'
import { BookCard } from '@/components/features/BookCard'
import { BundleCard } from '@/components/features/BundleCard'
import { CourseCard } from '@/components/features/CourseCard'
import { WorkshopTicket } from '@/components/features/WorkshopTicket'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { sanityFetch } from '@/lib/sanity/fetch'
import type { Book, Bundle, Course, CourseTemplate, OfferGridSection, OfferItem, Workshop } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './OfferGrid.module.css'

const OFFER_LABELS_QUERY = `{
  "template": *[_id == "courseTemplate"][0],
  "steps": *[_type == "course"] | order(orderRank asc, order asc){ stepNumber }
}`

type Group =
  | { kind: 'workshop'; item: Workshop }
  | { kind: 'courses'; items: Course[] }
  | { kind: 'extras'; items: Array<Bundle | Book> }

/** Groups the editor's ordered list: the workshop full width, runs of courses in a grid, runs of bundle and book in a two-up grid. */
function groupItems(items: OfferItem[]): Group[] {
  const groups: Group[] = []
  for (const item of items) {
    if (!item?._type) continue
    const type = clean(item._type)
    const last = groups.at(-1)
    if (type === 'workshop') groups.push({ kind: 'workshop', item: item as Workshop })
    else if (type === 'course') {
      if (last?.kind === 'courses') last.items.push(item as Course)
      else groups.push({ kind: 'courses', items: [item as Course] })
    } else if (type === 'bundle' || type === 'book') {
      if (type === 'book' && (item as Book).hidden) continue
      if (last?.kind === 'extras') last.items.push(item as Bundle | Book)
      else groups.push({ kind: 'extras', items: [item as Bundle | Book] })
    }
  }
  return groups
}

/** "Choose a starting point": the workshop ticket, the course cards, the bundle and the book. */
export async function OfferGrid({ section }: SectionProps<OfferGridSection>) {
  const labels = await sanityFetch<{ template: CourseTemplate | null; steps: Array<{ stepNumber?: string }> | null }>({
    query: OFFER_LABELS_QUERY,
    tags: ['courseTemplate', 'course'],
  })
  const fanNumbers = (labels?.steps ?? [])
    .map((s) => Number.parseInt(clean(s?.stepNumber) ?? '', 10))
    .filter((n) => Number.isFinite(n))
    .map(String)
  const fan = fanNumbers.length >= 3 ? fanNumbers : ['1', '3', '4']
  const groups = groupItems(section.items ?? [])

  const render = (g: Group, i: number): ReactNode => {
    if (g.kind === 'workshop') return <WorkshopTicket key={i} workshop={g.item} />
    if (g.kind === 'courses') {
      return (
        <div key={i} className="grid" style={{ '--min': '320px', '--gap': '24px' } as CSSProperties}>
          {g.items.map((c) => (
            <CourseCard key={c._id} course={c} labels={labels?.template} />
          ))}
        </div>
      )
    }
    return (
      <div key={i} className="grid" style={{ '--min': '380px', '--gap': '24px' } as CSSProperties}>
        {g.items.map((x) =>
          clean(x._type) === 'bundle' ? (
            <BundleCard key={x._id} bundle={x as Bundle} fanNumbers={fan} />
          ) : (
            <BookCard key={x._id} book={x as Book} />
          ),
        )}
      </div>
    )
  }

  return (
    <Band
      background={section.background ?? 'paper'}
      watermark={section.watermark}
      anchorId={section.anchorId || 'offers'}
    >
      <div className="wrap stack g24">
        <div className={`sec-head ${styles.head}`}>
          <div className="stack rv">
            {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
            <AccentText as="h2" className="h2" text={section.headline} />
          </div>
          {section.note ? <p className={`muted rv ${styles.note}`}>{section.note}</p> : null}
        </div>
        {groups.map(render)}
      </div>
    </Band>
  )
}
