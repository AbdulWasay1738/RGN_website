'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { SpinningReel } from '@/components/brand'
import { DateSwitch, useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { AccentText } from '@/components/ui/AccentText'
import { buttonClass } from '@/components/ui/Button'
import { BundlePriceText, CoursePriceText, WorkshopPriceText } from '@/components/ui/Commerce'
import { Icon } from '@/components/ui/Icon'
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from '@/lib/ics'
import type { OrderConfirmation } from '@/lib/sanity/types'
import styles from './order.module.css'

export type OrderParams = {
  offer?: string | null
  att?: string | null
  name?: string | null
  ref?: string | null
  demo?: string | null
}

/** Reads the order from the URL. Phase 6: read the Stripe session server-side from `session_id` instead. */
export function OrderFromSearch({ data }: { data: OrderConfirmation | null }) {
  const sp = useSearchParams()
  const params: OrderParams = {
    offer: sp.get('offer'),
    att: sp.get('att'),
    name: sp.get('name'),
    ref: sp.get('ref'),
    demo: sp.get('demo'),
  }
  return <OrderView data={data} params={params} />
}

/** "You're in." Ticket (workshop) or enrolment card (courses, bundle), next steps and upsells. */
export function OrderView({ data, params }: { data: OrderConfirmation | null; params: OrderParams | null }) {
  const site = useSite()
  const { dates } = useSalesCalendar()
  const d = data ?? {}
  const labels = site.settings?.checkout ?? {}

  const offer = params?.offer || 'workshop'
  const course = site.courses.find((c) => c.slug === offer)
  const isBundle = offer === 'bundle'
  const isWorkshop = !course && !isBundle
  const isSample = !params?.offer || params.demo === '1'
  const zoom = params?.att === 'zoom'
  const ref = params?.ref && /^\d{1,8}$/.test(params.ref) ? params.ref : '0000'
  const buyer = params?.name?.trim().slice(0, 80)

  const name = isWorkshop ? site.workshop?.title : isBundle ? site.bundle?.title : course?.title
  const stub = (isWorkshop ? d.workshopStub : d.courseStub) ?? {}
  const rows = d.rows ?? {}

  const price: ReactNode = isWorkshop ? (
    <WorkshopPriceText workshop={site.workshop} />
  ) : isBundle ? (
    typeof site.bundle?.price === 'number' ? (
      <BundlePriceText bundle={site.bundle} />
    ) : ''
  ) : course ? (
    <CoursePriceText course={course} />
  ) : null

  const lines: Array<{ key: string; label?: string; value: ReactNode }> = [
    isWorkshop
      ? {
          key: 'ticket',
          label: rows.ticket,
          value: (
            <>
              <DateSwitch rule="earlyBird" whenTrue={labels.earlyBirdTicket || 'Early-bird'} whenFalse={labels.standardTicket || 'Standard'} /> ·{' '}
              {price}
            </>
          ),
        }
      : { key: 'price', label: rows.price, value: price },
    isWorkshop
      ? { key: 'attending', label: rows.attending, value: zoom ? d.zoomLabel : d.inPersonLabel }
      : { key: 'access', label: rows.access, value: d.accessValue },
    { key: 'name', label: rows.name, value: buyer || d.buyerPlaceholder },
    { key: 'order', label: rows.order, value: `RGN-${ref}` },
  ]

  const event: CalendarEvent = isWorkshop
    ? {
        title: site.workshop?.title ?? 'Workshop',
        start: dates.workshopAt,
        end: new Date(dates.workshopAt.getTime() + 2 * 3600e3),
        description: [site.workshop?.dateLabel, site.workshop?.timeLabel].filter(Boolean).join(', '),
        location: zoom ? 'Zoom' : site.workshop?.venue || 'Zoom',
        uid: 'workshop@reelgoodnews.com',
      }
    : {
        title: name ?? 'Reel Good News',
        start: dates.coursesOpenAt,
        end: new Date(dates.coursesOpenAt.getTime() + 3600e3),
        location: 'Online',
        uid: `${offer}-lessons@reelgoodnews.com`,
      }
  const fileName = isWorkshop ? 'reel-good-news-workshop.ics' : 'reel-good-news-lessons.ics'
  const cal = d.calendarButtons ?? {}
  const steps = d.steps ?? []

  return (
    <>
      <section className={`navy ${styles.hero}`}>
        <SpinningReel disc="#13233F" hole="#091527" seconds={90} className={styles.heroReel} />
        <div className={`wrap row g48 ${styles.heroRow}`}>
          <div className="grow stack g20">
            <span className={styles.badge} aria-hidden="true">
              <Icon name="check" />
            </span>
            <span className="eyebrow fade-up">
              {d.eyebrow}
              {isSample ? d.sampleSuffix : null}
            </span>
            <AccentText as="h1" className={`h1 fade-up ${styles.title}`} style={{ ['--dl' as string]: '.1s' }} text={d.headline} />
            <p className="lead fade-up" style={{ ['--dl' as string]: '.2s' }}>
              {isWorkshop ? d.workshopLead : d.courseLead}
            </p>
          </div>
          <div className={`side fade-up ${styles.card}`} style={{ ['--dl' as string]: '.3s' }}>
            <div className={`${styles.stub} ${isWorkshop ? styles.stubWorkshop : ''}`}>
              <span className="stack" style={{ lineHeight: 1.1 }}>
                <span className={styles.stubLabel}>{stub.label}</span>
                <span className={styles.stubDate}>{stub.date}</span>
              </span>
              <span className={styles.stubSide}>
                {stub.line1}
                <br />
                {stub.line2}
              </span>
            </div>
            <div className={`stack g12 ${styles.rows}`}>
              <strong className={styles.orderName}>{name}</strong>
              <dl className="stack g12" style={{ margin: 0 }}>
                {lines.map((r) => (
                  <div key={r.key} className={styles.row}>
                    <dt className="muted">{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {steps.length ? (
        <section className="band paper">
          <div className="wrap">
            <AccentText as="h2" className={`h2 ${styles.nextHead}`} text={d.nextHeadline} />
            <ol className="grid" style={{ ['--min' as string]: '260px', ['--gap' as string]: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
              {steps.map((s, i) => {
                const last = i === steps.length - 1
                return (
                  <li key={s._key} className={`card lift rv ${styles.step} ${last ? styles.stepLast : ''}`}>
                    <span className={`outline ${styles.stepNum}`} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <strong className={styles.stepTitle}>{isWorkshop ? s.title : s.courseTitle || s.title}</strong>
                    {s.text ? <p className={styles.stepText}>{s.text}</p> : null}
                    {s.showCalendarButtons ? (
                      <div className="row g8">
                        <a
                          className={buttonClass('outline', { small: true })}
                          href={googleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cal.google || 'Google'}
                        </a>
                        <button type="button" className={buttonClass('outline', { small: true })} onClick={() => downloadIcs(event, fileName)}>
                          {cal.apple || 'Apple'}
                        </button>
                        <button type="button" className={buttonClass('outline', { small: true })} onClick={() => downloadIcs(event, fileName)}>
                          {cal.outlook || 'Outlook'}
                        </button>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {d.upsells?.length ? (
        <section className="band">
          <div className="wrap grid" style={{ ['--min' as string]: '340px', ['--gap' as string]: '20px' }}>
            {d.upsells.map((u) => {
              if (!u.link?.href) return null
              return (
                <Link key={u._key} href={u.link.href} className={`card lift ${styles.upsell}`}>
                  {u.eyebrow ? <span className="eyebrow">{u.eyebrow}</span> : null}
                  <strong className={styles.upsellTitle}>{u.title}</strong>
                  {u.kind === 'course' && u.course ? (
                    <span className={styles.upsellText}>
                      <CoursePriceText course={u.course} /> <DateSwitch rule="intro" whenTrue={u.introNote} whenFalse={u.regularNote} />
                    </span>
                  ) : u.text ? (
                    <span className={styles.upsellText}>{u.text}</span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </>
  )
}
