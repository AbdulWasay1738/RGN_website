'use client'

import { DateSwitch } from '@/components/providers/SalesCalendarProvider'
import { useSite } from '@/components/providers/SiteProvider'
import { ButtonLink } from '@/components/ui/Button'
import { WorkshopPriceText } from '@/components/ui/Commerce'
import { Countdown } from '@/components/ui/Countdown'
import { seatLine, Seats } from '@/components/ui/Seats'
import { seatCap, seatsLeft } from '@/lib/sales-calendar'
import type { Workshop } from '@/lib/sanity/types'
import styles from './WorkshopTicket.module.css'

/**
 * The live workshop as a ticket on the home offer grid: chips, title, seats,
 * date-aware price, and an orange perforated stub with a live countdown.
 */
export function WorkshopTicket({ workshop }: { workshop: Workshop }) {
  const { calendar } = useSite()
  const cap = seatCap(calendar)
  const left = seatsLeft(calendar)
  const sold = cap - left

  const baseChips = workshop.card?.chips?.length ? workshop.card.chips : (workshop.heroChips ?? [])
  const chips = [...baseChips]
  if (workshop.stepLabel && !chips.includes(workshop.stepLabel)) chips.push(workshop.stepLabel)

  const stub = workshop.stub
  const notes = workshop.priceNotes

  return (
    <article className="ticket lift rv">
      <div className={`grow stack g20 ${styles.body}`}>
        {chips.length ? (
          <div className="row g8">
            {chips.map((c, i) => (
              <span key={`${c}-${i}`} className={i === 0 ? 'chip chip-o' : 'chip chip-line'}>
                {c}
              </span>
            ))}
          </div>
        ) : null}
        {workshop.title ? <h3 className={styles.title}>{workshop.title}</h3> : null}
        {workshop.card?.summary ? <p className={styles.summary}>{workshop.card.summary}</p> : null}
        <div className="stack g8">
          <span className={styles.seatLine}>
            {seatLine({ left, cap, template: workshop.seatsLine, soldOut: workshop.soldOutLine })}
          </span>
          <Seats sold={sold} cap={cap} zoomChip={workshop.zoomChip} />
        </div>
        <div className={`row g24 ${styles.buyRow}`}>
          <ButtonLink href="/workshop" style="primary" arrow track="home_workshop_card">
            {workshop.reserveLabel}
          </ButtonLink>
          <span className={`row g8 ${styles.price}`}>
            <span className={styles.priceNow}>
              <WorkshopPriceText workshop={workshop} />
            </span>
            <span className={styles.priceNote}>
              <DateSwitch rule="earlyBird" whenTrue={notes?.earlyBirdShort} whenFalse={notes?.standard} />
            </span>
          </span>
        </div>
      </div>
      <div className="stub">
        <div className="perf" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className={`stack ${styles.stubText}`}>
          {stub?.eyebrow ? <span className={`eyebrow ${styles.stubEyebrow}`}>{stub.eyebrow}</span> : null}
          {stub?.day ? <span className={styles.stubLine}>{stub.day}</span> : null}
          {stub?.date ? <span className={styles.stubDate}>{stub.date}</span> : null}
          {stub?.line ? <span className={styles.stubLine}>{stub.line}</span> : null}
        </div>
        <div className={styles.stubCount}>
          <Countdown
            to="workshopAt"
            label="Time until the workshop"
            doneContent={stub?.doneLabel ? <span className="chip chip-n">{stub.doneLabel}</span> : null}
          />
        </div>
      </div>
    </article>
  )
}
