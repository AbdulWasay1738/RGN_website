import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Reel } from '@/components/brand'
import styles from '@/components/features/book/book.module.css'
import { AccentText } from '@/components/ui/AccentText'
import { ButtonLink } from '@/components/ui/Button'
import { BuyButton } from '@/components/ui/Commerce'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { SanityImage } from '@/components/ui/SanityImage'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { BOOK_QUERY } from '@/lib/sanity/queries'
import type { Book } from '@/lib/sanity/types'
import { bookLd, breadcrumbLd, buildMetadata } from '@/lib/seo'

const PATH = '/book'
const getBook = () => sanityFetch<Book | null>({ query: BOOK_QUERY, tags: ['book'] })

export async function generateMetadata(): Promise<Metadata> {
  const [book, layout] = await Promise.all([getBook(), getLayoutData()])
  if (!book || book.hidden) return {}
  return buildMetadata({ seo: book.seo, title: book.title, description: book.subtitle, path: PATH, settings: layout.settings })
}

export default async function BookPage() {
  const [book, layout] = await Promise.all([getBook(), getLayoutData()])
  // The client can hide this page until the book exists.
  if (!book || book.hidden) notFound()

  const inside = book.inside ?? {}
  const bonus = book.preorderBonus
  const showBonus = !!bonus?.show && !!bonus.text

  return (
    <>
      <JsonLd
        data={[
          bookLd({ name: book.title ?? '', author: book.author, description: book.subtitle, path: PATH }),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: book.title ?? 'Book', path: PATH },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="lavt">
        <div className={`wrap row g64 ${styles.heroRow}`}>
          <div className={`side fade-up ${styles.coverSide}`} style={{ ['--dl' as string]: '.2s' }} aria-hidden="true">
            <div className="book3d">
              <span className={styles.spine}>
                <span className={styles.spineText}>{book.spineText}</span>
              </span>
              <span className={styles.cover}>
                <span className={styles.coverReel}>
                  <Reel disc="#13233F" hole="#091527" />
                </span>
                <SanityImage
                  image={layout.settings?.logoInverted}
                  fallback={{ file: 'logo-invert.png', alt: '' }}
                  alt=""
                  className={styles.coverLogo}
                  sizes="120px"
                />
                <span className={`stack ${styles.coverTitle}`}>
                  {book.coverAccentWord ? <span className={styles.coverAccent}>{book.coverAccentWord}</span> : null}
                  {book.coverRest ? <span className={styles.coverRest}>{book.coverRest}</span> : null}
                  {book.coverTagline ? <span className={styles.coverTagline}>{book.coverTagline}</span> : null}
                </span>
                {book.author ? <span className={styles.coverAuthor}>{book.author}</span> : null}
              </span>
            </div>
          </div>
          <div className="grow stack g20">
            {book.chip ? <span className={`chip chip-o fade-up ${styles.chip}`}>{book.chip}</span> : null}
            <h1 className="h1 fade-up" style={{ ['--dl' as string]: '.08s' }}>
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="lead fade-up" style={{ ['--dl' as string]: '.16s' }}>
                {book.subtitle}
              </p>
            ) : null}
            {book.publicationLine ? (
              <span className={`row g8 fade-up ${styles.publication}`} style={{ ['--dl' as string]: '.22s' }}>
                <span className={styles.calIcon}>
                  <Icon name="calendar" />
                </span>
                {book.publicationLine}
              </span>
            ) : null}
            <div className="row g24 center fade-up" style={{ ['--dl' as string]: '.3s' }}>
              {book.preorderUrl ? (
                <ButtonLink href={book.preorderUrl} newTab track="buy_book">
                  {book.ctaLabel}
                </ButtonLink>
              ) : (
                <BuyButton offer={{ kind: 'book' }} trackId="buy_book">
                  {book.ctaLabel}
                </BuyButton>
              )}
              {book.price ? <span className={styles.price}>{book.price}</span> : null}
            </div>
            {book.byline ? <span className={`muted ${styles.byline}`}>{book.byline}</span> : null}
          </div>
        </div>
      </section>

      {/* Statement */}
      {book.statement || book.body?.length ? (
        <section className="band">
          <div className={`wrap narrow stack g24 ${styles.statementWrap}`}>
            <AccentText as="p" className={`rv ${styles.statement}`} text={book.statement} />
            <RichText value={book.body} className={`rv ${styles.body}`} />
          </div>
        </section>
      ) : null}

      {/* What's inside */}
      {inside.items?.length ? (
        <section className="band navy">
          <div className="wrap">
            <div className="sec-head">
              <AccentText as="h2" className="h2 rv" text={inside.headline} />
              {inside.eyebrow ? <span className="eyebrow">{inside.eyebrow}</span> : null}
            </div>
            <ul className="grid" style={{ ['--min' as string]: '200px', ['--gap' as string]: '16px', listStyle: 'none', margin: 0, padding: 0 }}>
              {inside.items.map((x, i, all) => (
                <li key={x._key} className={`tile lift rv ${styles.insideTile}${i === all.length - 1 ? ' lv' : ''}`}>
                  <span className={styles.insideWord}>{x.word}</span>
                  <p className={styles.insideLine}>{x.line}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* The point + optional pre-order bonus */}
      {book.quote?.text || showBonus ? (
        <section className="band paper">
          <div className="wrap row g32">
            {book.quote?.text ? (
              <figure className={`grow panel-w stack g20 rv ${styles.quoteFigure}`}>
                {book.quote.eyebrow ? <span className="eyebrow">{book.quote.eyebrow}</span> : null}
                <blockquote className={styles.quote}>{book.quote.text}</blockquote>
              </figure>
            ) : null}
            {showBonus ? (
              <div className={`side stack g12 rv ${styles.bonus}`}>
                {bonus?.eyebrow ? <span className="eyebrow">{bonus.eyebrow}</span> : null}
                <p className={styles.bonusText}>{bonus?.text}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  )
}
