import { SpinningReel } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { ButtonLink } from '@/components/ui/Button'
import styles from './not-found.module.css'

/** 404. Fixed copy (docs/05): any broken link lands here, inside the site layout. */
export default function NotFound() {
  return (
    <section className={`navy ${styles.section}`}>
      <title>Page not found · Reel Good News</title>
      <meta name="robots" content="noindex" />
      <SpinningReel disc="#13233F" hole="#091527" ring="#C6A7ED" seconds={40} className={styles.reel} />
      <div className={`wrap stack g24 ${styles.inner}`}>
        <span className="eyebrow fade-up">Error 404 · scene missing</span>
        <AccentText as="h1" text="This page isn't *good news.*" className={`h1 fade-up ${styles.title}`} />
        <p className={`lead fade-up ${styles.lead}`}>This page does not exist. The good news lives here:</p>
        <div className={`row g12 fade-up ${styles.actions}`}>
          <ButtonLink href="/" style="primary" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink href="/workshop" style="outlineLight">
            The workshop
          </ButtonLink>
          <ButtonLink href="/courses/attract-the-right-audience" style="outlineLight">
            The courses
          </ButtonLink>
          <ButtonLink href="/blog" style="outlineLight">
            The blog
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
