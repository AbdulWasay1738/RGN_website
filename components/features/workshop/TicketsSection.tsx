'use client'

import Link from 'next/link'
import { useDateRule } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { AccentText } from '@/components/ui/AccentText'
import { Icon } from '@/components/ui/Icon'
import { seatLine, Seats } from '@/components/ui/Seats'
import { seatCap, seatsLeft } from '@/lib/sales-calendar'
import type { Workshop } from '@/lib/sanity/types'
import { clean, interpolate } from '@/lib/text'
import { ReserveButton, useAttendance } from './Attendance'
import styles from './workshop.module.css'

/**
 * Tickets: attendance toggle, the early-bird and standard cards (which one is
 * on sale flips at the early-bird cutoff), reassurance list, the seat row and
 * the link to the growth strategy call.
 */
export function TicketsSection({ workshop }: { workshop: Workshop }) {
  const t = workshop.tickets ?? {}
  const growth = workshop.growthCallLink
  const { calendar, settings } = useSite()
  const toast = useToast()
  const { attendance, setAttendance } = useAttendance()
  const early = useDateRule('earlyBird')
  const left = seatsLeft(calendar)
  const cap = seatCap(calendar)
  const sold = Math.min(cap, calendar?.seatsSold ?? 0)
  const line = seatLine({ left, cap, template: workshop.seatsLine, soldOut: workshop.soldOutLine })

  const choose = (a: 'in-person' | 'zoom') => {
    setAttendance(a)
    if (a === 'zoom') toast(t.zoomToast || t.zoomToggle || 'Zoom')
    else toast(line)
  }

  return (
    <section className="band paper" id="tickets" aria-labelledby="tickets-heading">
      <div className="wrap stack g32">
        <div className={`sec-head ${styles.ticketsHead}`}>
          <div className="stack rv">
            {t.eyebrow ? <span className="eyebrow">{t.eyebrow}</span> : null}
            <AccentText as="h2" className="h2" text={t.headline} id="tickets-heading" />
          </div>
          <div className="seg rv" role="group" aria-label="Attendance">
            <button type="button" aria-pressed={attendance === 'in-person'} onClick={() => choose('in-person')}>
              {t.inPersonToggle} · {interpolate(settings?.checkout?.seatsLeftLabel || '{n} left', { n: left })}
            </button>
            <button type="button" aria-pressed={attendance === 'zoom'} onClick={() => choose('zoom')}>
              {t.zoomToggle}
            </button>
          </div>
        </div>

        <div className="grid" style={{ ['--min' as string]: '320px', ['--gap' as string]: '24px' }}>
          <TicketCard
            active={early}
            label={t.earlyBirdLabel}
            price={workshop.earlyBirdPrice}
            window={t.earlyBirdWindow}
            onSale={t.onSaleLabel}
            notOnSaleChip={t.earlyBirdEndedChip}
            notOnSaleLabel={t.earlyBirdEndedLabel}
            includes={workshop.includes}
            reserveLabel={workshop.reserveLabel}
          />
          <TicketCard
            active={!early}
            label={t.standardLabel}
            price={workshop.standardPrice}
            window={t.standardWindow}
            onSale={t.onSaleLabel}
            notOnSaleChip={t.standardUpcomingChip}
            notOnSaleLabel={t.standardUpcomingLabel}
            includes={workshop.includes}
            reserveLabel={workshop.reserveLabel}
          />
          {t.reassurances?.length ? (
            <div className={`stack g16 rv ${styles.reassurances}`}>
              {t.reassurances.map((r) => (
                <span key={r._key} className={styles.reassurance}>
                  <span className="icon-tile">{r.icon ? <Icon name={clean(r.icon)} /> : null}</span>
                  <span>
                    <strong>{r.title}</strong>
                    <br />
                    <span className={styles.reassuranceText}>{r.text}</span>
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="stack g8 rv">
          <span className={styles.seatLine}>{line}</span>
          <Seats sold={sold} cap={cap} />
        </div>
        {growth?.workshopLinkLabel ? (
          <p className={`rv ${styles.growthLine}`}>
            {growth.workshopLine ? `${growth.workshopLine} ` : null}
            <Link href="/growth-strategy" className="tlink" data-track="workshop_growth">
              {growth.workshopLinkLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}

function TicketCard({
  active,
  label,
  price,
  window,
  onSale,
  notOnSaleChip,
  notOnSaleLabel,
  includes,
  reserveLabel,
}: {
  active: boolean
  label?: string
  price?: number
  window?: string
  onSale?: string
  notOnSaleChip?: string
  notOnSaleLabel?: string
  includes?: string[]
  reserveLabel?: string
}) {
  return (
    <article className={`card rv ${active ? 'lift' : ''} ${styles.ticketCard} ${active ? styles.ticketCardActive : ''}`}>
      <div className={`stack g12 ${styles.ticketCardBody}`}>
        <div className={styles.ticketCardHead}>
          <span className={`eyebrow ${styles.ticketLabel}`}>{label}</span>
          {active ? (
            onSale ? <span className="chip chip-o">{onSale}</span> : null
          ) : notOnSaleChip ? (
            <span className="chip chip-line-l">{notOnSaleChip}</span>
          ) : null}
        </div>
        {typeof price === 'number' ? <span className={styles.ticketPrice}>${price}</span> : null}
        {window ? <span className={styles.ticketWindow}>{window}</span> : null}
        {includes?.length ? (
          <div className={`stack g8 ${styles.includes}`}>
            {includes.map((item) => (
              <span key={item} className={styles.includeItem}>
                <span className={styles.includeIcon}>
                  <Icon name="check" />
                </span>
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className={styles.ticketCardFoot}>
        {active ? (
          <ReserveButton block>{reserveLabel}</ReserveButton>
        ) : notOnSaleLabel ? (
          <span className={styles.ticketClosed}>{notOnSaleLabel}</span>
        ) : null}
      </div>
    </article>
  )
}
