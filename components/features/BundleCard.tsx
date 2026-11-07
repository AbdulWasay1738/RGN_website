import { ButtonLink } from '@/components/ui/Button'
import { BundlePrice } from '@/components/ui/Commerce'
import type { Bundle } from '@/lib/sanity/types'
import styles from './BundleCard.module.css'

/** The Content Machine bundle card: fanned course covers and the price by date ($399 against $597 during the intro period). */
export function BundleCard({ bundle, fanNumbers }: { bundle: Bundle; fanNumbers: string[] }) {
  const card = bundle.card
  const nums = fanNumbers.slice(0, 3)
  return (
    <article className={`card lift rv ${styles.bundle}`}>
      <div className="fan" aria-hidden="true">
        {nums.map((n, i) =>
          i === nums.length - 1 ? (
            <span key={i} className={styles.fanLast}>
              {card?.fanWord ? <span className={styles.fanWord}>{card.fanWord}</span> : <span />}
              {n}
            </span>
          ) : (
            <span key={i}>{n}</span>
          ),
        )}
      </div>
      <div className={`stack g12 ${styles.body}`}>
        {card?.chip ? <span className={`chip chip-n ${styles.chip}`}>{card.chip}</span> : null}
        {bundle.title ? <h3 className="h3">{bundle.title}</h3> : null}
        {card?.body ? <p className={styles.text}>{card.body}</p> : null}
        <div className={`row g16 ${styles.buyRow}`}>
          {typeof bundle.price === 'number' ? (
            <span className="price">
              <BundlePrice bundle={bundle} wasClassName={styles.was} />
            </span>
          ) : null}
          {card?.ctaLabel ? (
            <ButtonLink href="/courses/content-machine" style="dark" small>
              {card.ctaLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </article>
  )
}
