import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SpinningReel } from '@/components/brand'
import { AttendanceProvider, ReserveButton } from '@/components/features/workshop/Attendance'
import { TicketsSection } from '@/components/features/workshop/TicketsSection'
import styles from '@/components/features/workshop/workshop.module.css'
import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { AccentText } from '@/components/ui/AccentText'
import { Accordion } from '@/components/ui/Accordion'
import { ButtonLink } from '@/components/ui/Button'
import { WorkshopPriceText } from '@/components/ui/Commerce'
import { Countdown } from '@/components/ui/Countdown'
import { Icon } from '@/components/ui/Icon'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { SanityImage } from '@/components/ui/SanityImage'
import { calendarDates, workshopPrice } from '@/lib/sales-calendar'
import { sanityFetch } from '@/lib/sanity/fetch'
import { imageUrlFor } from '@/lib/sanity/image'
import { getLayoutData } from '@/lib/sanity/layout'
import { WORKSHOP_QUERY } from '@/lib/sanity/queries'
import type { Workshop } from '@/lib/sanity/types'
import { breadcrumbLd, buildMetadata, eventLd, faqPageLd } from '@/lib/seo'

const getWorkshop = () => sanityFetch<Workshop | null>({ query: WORKSHOP_QUERY, tags: ['workshop', 'faq'] })

export async function generateMetadata(): Promise<Metadata> {
  const [ws, layout] = await Promise.all([getWorkshop(), getLayoutData()])
  return buildMetadata({
    seo: ws?.seo,
    title: ws?.title,
    description: ws?.lead,
    path: '/workshop',
    settings: layout.settings,
  })
}

export default async function WorkshopPage() {
  const [ws, layout] = await Promise.all([getWorkshop(), getLayoutData()])
  if (!ws) notFound()

  const dates = calendarDates(layout.calendar)
  const stub = ws.stub ?? {}
  const chips = ws.heroChips ?? []
  const what = ws.whatThisIs ?? {}
  const agenda = ws.agenda ?? {}
  const host = ws.hostSection ?? {}
  const archive = ws.archive ?? {}
  const infoPills: Array<{ icon: 'calendar' | 'clock' | 'pin'; text?: string }> = [
    { icon: 'calendar', text: ws.dateLabel },
    { icon: 'clock', text: ws.timeLabel },
    { icon: 'pin', text: ws.venue },
  ]
  const archiveImages = archive.images ?? []

  return (
    <AttendanceProvider>
      <JsonLd
        data={[
          eventLd({
            name: ws.title ?? 'Workshop',
            description: ws.lead,
            startDate: dates.workshopAt.toISOString(),
            venue: ws.venue,
            path: '/workshop',
            price: workshopPrice(ws, new Date(), dates),
            image: imageUrlFor(host.image) ?? '/og-default.jpg',
          }),
          faqPageLd(ws.faqs),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: ws.title ?? 'Workshop', path: '/workshop' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className={`navy ${styles.hero}`}>
        <SpinningReel disc="#13233F" hole="#091527" seconds={120} className={styles.heroReel} />
        <div className={`wrap row g64 ${styles.heroRow}`}>
          <div className="grow stack g24">
            <nav className="crumb fade-up" aria-label="Breadcrumb">
              <Link href="/">Home</Link> /{' '}
              <span className="here" aria-current="page">
                Workshop
              </span>
            </nav>
            {chips.length ? (
              <div className="row g8 fade-up">
                {chips.map((c, i) => (
                  <span key={c} className={`chip ${i === 0 ? 'chip-o' : 'chip-line'}`}>
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            {ws.handLine ? (
              <span className={`fade-up ${styles.handLine}`} style={{ ['--dl' as string]: '.1s' }}>
                {ws.handLine}
              </span>
            ) : null}
            <AccentText as="h1" className="h1 fade-up" style={{ ['--dl' as string]: '.18s' }} text={ws.headline} />
            {ws.lead ? (
              <p className="lead fade-up" style={{ ['--dl' as string]: '.26s' }}>
                {ws.lead}
              </p>
            ) : null}
            <div className="row g12 fade-up" style={{ ['--dl' as string]: '.34s' }}>
              {infoPills
                .filter((p) => p.text)
                .map((p) => (
                  <span key={p.icon} className={styles.infoPill}>
                    <span className={styles.infoIcon}>
                      <Icon name={p.icon} />
                    </span>
                    {p.text}
                  </span>
                ))}
            </div>
            <div className="row g24 center fade-up" style={{ ['--dl' as string]: '.42s' }}>
              <ReserveButton arrow trackId="workshop_hero_reserve">
                {ws.reserveLabel}
              </ReserveButton>
              <span className={styles.heroPriceNote}>
                <strong className={styles.heroPrice}>
                  <WorkshopPriceText workshop={ws} />
                </strong>{' '}
                <DateSwitch rule="earlyBird" whenTrue={ws.priceNotes?.earlyBird} whenFalse={ws.priceNotes?.standard} />
              </span>
            </div>
          </div>

          <div className={`side fade-up ${styles.ticketSide}`} style={{ ['--dl' as string]: '.3s' }}>
            <div aria-hidden="true" className={styles.ticketBack} />
            <div className={styles.ticketFront}>
              <div className={styles.ticketTop}>
                {stub.eyebrow ? <span className="eyebrow">{stub.eyebrow}</span> : null}
                {stub.day ? <span className={styles.ticketLine}>{stub.day}</span> : null}
                {stub.date ? <span className={styles.ticketDate}>{stub.date}</span> : null}
                {stub.line ? <span className={styles.ticketLine}>{stub.line}</span> : null}
              </div>
              <div className={styles.ticketBottom}>
                <Countdown
                  to="workshopAt"
                  tone="lav"
                  label="Time until the workshop"
                  doneContent={stub.doneLabel ? <span className="chip chip-o">{stub.doneLabel}</span> : null}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What this is */}
      <section className="band paper">
        <div className="wrap row g64">
          <div className={`side stack g16 rv ${styles.whatSide}`}>
            {what.eyebrow ? <span className="eyebrow">{what.eyebrow}</span> : null}
            <AccentText as="p" className="statement" text={what.statement} />
          </div>
          <div className={`side stack g16 rv ${styles.whatBody}`}>
            <RichText value={what.body} className={styles.richBody} />
            {what.closingLine ? <p className={styles.closingLine}>{what.closingLine}</p> : null}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      {ws.outcomes?.length ? (
        <section className="band">
          <div className="wrap">
            <AccentText as="h2" className={`h2 rv ${styles.outcomesHead}`} text={ws.outcomesHeadline} />
            <div className="grid" style={{ ['--min' as string]: '210px', ['--gap' as string]: '20px' }}>
              {ws.outcomes.map((t, i, all) => (
                <div key={t} className={`card lift rv ${styles.outcomeCard} ${i === all.length - 1 ? styles.outcomeCardLast : ''}`}>
                  <span className={`outline ${styles.outcomeNum}`} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className={styles.outcomeText}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Agenda, who it is for, no need for */}
      <section className="band navy">
        <div className="wrap row g64">
          <div className="grow stack g8">
            {agenda.eyebrow ? <span className="eyebrow">{agenda.eyebrow}</span> : null}
            <AccentText as="h2" className={`h2 ${styles.agendaHead}`} text={agenda.headline} />
            <ol className="stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {(agenda.items ?? []).map((a) => (
                <li key={a._key} className={`rv ${styles.agendaRow}`}>
                  <span className={styles.agendaTime}>{a.time}</span>
                  <span className="stack">
                    <strong className={styles.agendaTitle}>{a.title}</strong>
                    <span className={styles.agendaText}>{a.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="side stack g20">
            {ws.whoItIsFor?.text ? (
              <div className={`rv ${styles.whoCard}`}>
                {ws.whoItIsFor.eyebrow ? <span className="eyebrow">{ws.whoItIsFor.eyebrow}</span> : null}
                <p className={styles.whoText}>{ws.whoItIsFor.text}</p>
              </div>
            ) : null}
            {ws.noNeedFor?.items?.length ? (
              <div className={`rv ${styles.noNeedCard}`}>
                {ws.noNeedFor.eyebrow ? <span className="eyebrow">{ws.noNeedFor.eyebrow}</span> : null}
                <ul className="stack g12" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {ws.noNeedFor.items.map((t) => (
                    <li key={t} className={styles.noNeedItem}>
                      <span className={styles.noNeedIcon}>
                        <Icon name="x" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tickets */}
      <TicketsSection workshop={ws} />

      {/* Hosts */}
      <section className="band">
        <div className="wrap row g64 center">
          <div className={`side rv ${styles.hostArt}`}>
            <SpinningReel disc="#C6A7ED" hole="#F1EAFB" seconds={90} className={styles.hostReel} />
            <SanityImage
              image={host.image}
              fallback={{ file: 'jenna-cutout.webp', alt: 'Jenna Colombo, founder of Reel Good News.' }}
              className={styles.hostCutout}
              sizes="220px"
            />
          </div>
          <div className="grow stack g20 rv">
            {host.eyebrow ? <span className="eyebrow">{host.eyebrow}</span> : null}
            <AccentText as="h2" className="h2" text={host.headline} />
            {host.body ? <p className="lead">{host.body}</p> : null}
            {host.chips?.length ? (
              <div className="row g12">
                {host.chips.map((c) => (
                  <span key={c} className={styles.hostChip}>
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            {host.linkLabel ? (
              <ButtonLink href={host.link?.href} style="textLink" arrow>
                {host.linkLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </section>

      {/* Archive */}
      {archiveImages.length || archive.headline ? (
        <section className="band ink">
          <div className={`wrap row g48 ${styles.archiveRow}`}>
            <div className="side stack g16 rv">
              {archive.eyebrow ? <span className="eyebrow">{archive.eyebrow}</span> : null}
              <AccentText as="h2" className="h2" text={archive.headline} />
              {archive.lead ? <p className="lead">{archive.lead}</p> : null}
            </div>
            {archiveImages.length ? (
              <div className={`grow grid ${styles.gallery}`} style={{ ['--min' as string]: '220px', ['--gap' as string]: '20px' }}>
                {archiveImages.map((img, i) => (
                  <figure key={img._key ?? i} className="rv stack g8">
                    <SanityImage
                      image={img}
                      className={`${styles.galleryImg} ${i % 2 === 0 ? styles.tiltLeft : styles.tiltRight}`}
                      sizes="(max-width: 760px) 90vw, 360px"
                    />
                    {img.caption ? <figcaption className={styles.caption}>{img.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* FAQs */}
      {ws.faqs?.length ? (
        <section className="band">
          <div className="wrap row g64">
            <div className="side stack g16">
              <AccentText as="h2" className="h2" text={ws.faqHeadline} />
              {ws.faqLinkLabel ? (
                <ButtonLink href={ws.faqLink?.href ?? '/contact'} style="textLink" arrow>
                  {ws.faqLinkLabel}
                </ButtonLink>
              ) : null}
            </div>
            <div className="grow">
              <Accordion items={ws.faqs} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Closing band */}
      {ws.closingBand?.headline ? (
        <section className="orangeb">
          <div className={`wrap row g32 ${styles.closingRow}`}>
            <AccentText as="h2" className={`rv ${styles.closingHeadline}`} text={ws.closingBand.headline} />
            <ReserveButton style="dark" trackId="workshop_closing_reserve">
              {ws.closingBand.ctaLabel || ws.reserveLabel}
            </ReserveButton>
          </div>
        </section>
      ) : null}
    </AttendanceProvider>
  )
}
