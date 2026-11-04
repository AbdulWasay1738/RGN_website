import { ButtonLink } from '@/components/ui/Button'
import type { Book } from '@/lib/sanity/types'
import styles from './BookCard.module.css'

/** The book pre-order card with a small 3D cover. */
export function BookCard({ book }: { book: Book }) {
  const card = book.card
  return (
    <article className={`card lift rv ${styles.book}`}>
      <div className={styles.art} aria-hidden="true">
        <div className="book3d">
          <span className={`sp ${styles.spine}`} />
          <span className={`cv ${styles.cover}`}>
            {book.coverAccentWord ? <span className={styles.accent}>{book.coverAccentWord}</span> : null}
            {book.coverRest ? <span className={styles.rest}>{book.coverRest}</span> : null}
            {book.author ? <span className={styles.author}>{book.author}</span> : null}
          </span>
        </div>
      </div>
      <div className={`stack g12 ${styles.body}`}>
        {card?.chip ? <span className={`chip chip-l ${styles.chip}`}>{card.chip}</span> : null}
        {book.title ? <h3 className="h3">{book.title}</h3> : null}
        {card?.body ? <p className={styles.text}>{card.body}</p> : null}
        {card?.ctaLabel ? (
          <ButtonLink href="/book" style="outline" small className={styles.cta}>
            {card.ctaLabel}
          </ButtonLink>
        ) : null}
      </div>
    </article>
  )
}
