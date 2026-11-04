import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { ButtonLink } from '@/components/ui/Button'
import { BuyButton, CoursePrice } from '@/components/ui/Commerce'
import type { Course, CourseTemplate } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import styles from './CourseCard.module.css'

/** Online course card: textured cover with the step number, intro or regular price, Enroll and Details. */
export function CourseCard({ course, labels }: { course: Course; labels?: CourseTemplate | null }) {
  const slug = clean(course.slug)
  const stepNumber = Number.parseInt(clean(course.stepNumber) ?? '', 10)
  const prefix = labels?.cardChipPrefix
  const chip = (state?: string) => [prefix, state].filter(Boolean).join(' · ')
  const hasChip = !!(prefix || labels?.opensSoonLabel || labels?.onDemandLabel)

  return (
    <article className={`card lift rv ${styles.course}`}>
      <div className="cover">
        {Number.isFinite(stepNumber) ? (
          <span className="big" aria-hidden="true">
            {stepNumber}
          </span>
        ) : null}
        {hasChip ? (
          <span className={`chip chip-lv ${styles.chip}`}>
            <DateSwitch rule="coursesOpen" whenTrue={chip(labels?.onDemandLabel)} whenFalse={chip(labels?.opensSoonLabel)} />
          </span>
        ) : (
          <span />
        )}
        {course.word ? <span className="word">{course.word}</span> : null}
      </div>
      <div className={`stack g12 ${styles.body}`}>
        {course.title ? <h3 className={styles.title}>{course.title}</h3> : null}
        {course.summary ? <p className={styles.summary}>{course.summary}</p> : null}
        <div className={`price ${styles.price}`}>
          <CoursePrice course={course} regularLabel={labels?.regularPriceLabel} saveLabel={labels?.saveLabel} />
        </div>
        <div className="row g8">
          {slug && labels?.enrollLabel ? (
            <BuyButton offer={{ kind: 'course', slug }} small className={styles.enroll} trackId={`buy_${slug}`}>
              {labels.enrollLabel}
            </BuyButton>
          ) : null}
          {slug && labels?.detailsLabel ? (
            <ButtonLink href={`/courses/${slug}`} style="outline" small>
              {labels.detailsLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </article>
  )
}
