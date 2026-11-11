'use client'

import Link from 'next/link'
import { useId, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { submitForm } from '@/app/actions/forms'
import { useSalesCalendar } from '@/components/providers/SalesCalendarProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { CtaLink } from '@/components/ui/Button'
import { Consent, Field, PhoneField, SpamTraps } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { FORM_FIELDS, validateForm, VALIDATION_MESSAGES, type FieldErrors } from '@/lib/forms'
import {
  bookableDays,
  dayKey,
  dayLabel,
  lastMonthOffset,
  monthGrid,
  monthLabel,
  slotStart,
} from '@/lib/growth-call'
import { downloadIcs } from '@/lib/ics'
import type { GrowthCall } from '@/lib/sanity/types'
import { clean, interpolate, plainText } from '@/lib/text'
import styles from './growth.module.css'

type Lead = {
  firstName: string
  lastName: string
  phone: string
  email: string
  smsConsent: boolean
}

const IDS: Record<string, string> = {
  phone: 'gr-ph',
  firstName: 'gr-fn',
  lastName: 'gr-ln',
  email: 'gr-em',
}
const WEEKDAY_HEADINGS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** "By continuing, you agree to our Terms and Privacy Policy." with the two legal links. */
function TermsLine({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className={styles.terms}>
      {text.split(/(Privacy Policy|Terms)/).map((part, i) =>
        part === 'Terms' ? (
          <Link key={i} href="/legal/terms">
            Terms
          </Link>
        ) : part === 'Privacy Policy' ? (
          <Link key={i} href="/legal/privacy">
            Privacy Policy
          </Link>
        ) : (
          part
        ),
      )}
    </p>
  )
}

/**
 * The growth call card: step 1 (the form) then step 2 (day, time, confirm).
 * Continue sends the lead straight away through submitForm('growth'), so the
 * team can call even if no time is ever booked. The calendar stays locked
 * until then. Phase 6: Confirm creates the GoHighLevel appointment.
 */
export function GrowthBooking({
  content,
  booking,
}: {
  content: GrowthCall
  booking?: { embedUrl: string | null; link: string } | null
}) {
  const toast = useToast()
  const { now } = useSalesCalendar()
  const monthHeadingId = useId()
  const calendarRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const [lead, setLead] = useState<Lead | null>(null)
  const [lastLead, setLastLead] = useState<Lead | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [month, setMonth] = useState(0)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const windowDays = content.bookingWindowDays ?? 30
  const weekdays = content.availableWeekdays?.length
    ? content.availableWeekdays.map((w) => clean(w))
    : undefined
  // With a real booking calendar, the sample calendar only shows (locked) until the form is sent.
  const available = booking ? new Set<string>() : bookableDays(now, { weekdays, windowDays })
  const maxMonth = lastMonthOffset(now, windowDays)
  const { first, cells } = monthGrid(now, month)
  const slots = content.slotLabels?.length ? content.slotLabels : []
  const locked = !lead

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const values: Record<string, string> = {}
    fd.forEach((v, k) => {
      if (typeof v === 'string') values[k] = v
    })
    const errs = validateForm('growth', values)
    setErrors(errs)
    setFormError('')
    const firstBad = FORM_FIELDS.growth.find((f) => errs[f.name] && IDS[f.name])
    if (firstBad) {
      window.requestAnimationFrame(() => document.getElementById(IDS[firstBad.name])?.focus())
      return
    }
    setBusy(true)
    const result = await submitForm('growth', fd).catch(() => null)
    setBusy(false)
    if (!result || !result.ok) {
      setErrors(result && !result.ok ? result.errors : {})
      setFormError(
        result && !result.ok && result.message ? result.message : VALIDATION_MESSAGES.failed,
      )
      return
    }
    const next: Lead = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      smsConsent: values.smsConsent === 'yes',
    }
    setLead(next)
    setLastLead(next)
    track('growth_lead')
    if (content.leadSavedMessage) toast(content.leadSavedMessage)
    window.requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      document.getElementById(monthHeadingId)?.focus()
    })
  }

  const onLockedClick = (e: MouseEvent) => {
    if (!locked) return
    // Month buttons still work while locked.
    if ((e.target as HTMLElement).closest('button')) return
    if (content.lockedMessage) toast(content.lockedMessage)
    document.getElementById(IDS.phone)?.focus()
  }

  const confirm = () => {
    if (!day || !slot) return
    // Phase 6: create the appointment on the GoHighLevel calendar (content.ghlCalendarId) here.
    setDone(true)
    track('growth_booked')
    if (content.bookedMessage) toast(content.bookedMessage)
    window.requestAnimationFrame(() => doneRef.current?.focus())
  }

  const addToCalendar = () => {
    if (!day || !slot) return
    const start = slotStart(day, slot)
    if (!start) return
    const minutes = content.callMinutes ?? 30
    downloadIcs(
      {
        title: plainText(content.headline) || 'Growth strategy call',
        start,
        end: new Date(start.getTime() + minutes * 6e4),
        description: content.intro ?? undefined,
        url:
          typeof window !== 'undefined' ? `${window.location.origin}/growth-strategy` : undefined,
        uid: `growth-call-${day}-${slot.replace(/\W/g, '')}@reelgoodnews.com`,
      },
      'growth-strategy-call.ics',
    )
  }

  if (done && day && slot) {
    return (
      <div className={`success ${styles.done}`}>
        <span className="ok">
          <Icon name="check" />
        </span>
        <h2 className={styles.doneTitle} ref={doneRef} tabIndex={-1}>
          {content.successTitle}
        </h2>
        {content.successBody ? (
          <p className={styles.doneBody}>
            {interpolate(content.successBody, { date: dayLabel(day), time: slot })}
          </p>
        ) : null}
        <div className={`row g12 ${styles.doneActions}`}>
          {content.addToCalendarLabel ? (
            <button type="button" className="btn btn-o btn-sm" onClick={addToCalendar}>
              {content.addToCalendarLabel}
            </button>
          ) : null}
          <CtaLink cta={content.successCta} fallbackStyle="dark" small />
        </div>
      </div>
    )
  }

  return (
    <>
      <ol className={styles.steps} aria-label="Booking steps">
        <li
          className={lead ? styles.stepDone : styles.stepOn}
          aria-current={lead ? undefined : 'step'}
        >
          <i aria-hidden="true" />
          {content.formStepLabel}
        </li>
        <li className={lead ? styles.stepOn : undefined} aria-current={lead ? 'step' : undefined}>
          <i aria-hidden="true" />
          {content.bookStepLabel}
        </li>
      </ol>

      {lead ? (
        <div className={styles.leadSum}>
          <span>
            <strong>
              {lead.firstName} {lead.lastName}
            </strong>{' '}
            · {lead.phone}
          </span>
          <button type="button" className={`tlink ${styles.edit}`} onClick={() => setLead(null)}>
            {content.editLabel || 'Edit'}
          </button>
        </div>
      ) : (
        <form
          className={`form ${styles.form}`}
          onSubmit={onSubmit}
          noValidate
          aria-label={content.formStepLabel || 'Your details'}
        >
          <PhoneField
            id={IDS.phone}
            name="phone"
            label="Mobile number"
            prefix="US +1"
            prefixLabel="United States, +1"
            placeholder="(555) 010-2345"
            required
            error={errors.phone}
            defaultValue={lastLead?.phone}
          />
          <div className="fgrid">
            <Field
              id={IDS.firstName}
              name="firstName"
              label="First name"
              required
              autoComplete="given-name"
              error={errors.firstName}
              defaultValue={lastLead?.firstName}
            />
            <Field
              id={IDS.lastName}
              name="lastName"
              label="Last name"
              required
              autoComplete="family-name"
              error={errors.lastName}
              defaultValue={lastLead?.lastName}
            />
          </div>
          <Field
            id={IDS.email}
            name="email"
            type="email"
            label="Work email"
            required
            autoComplete="email"
            error={errors.email}
            defaultValue={lastLead?.email}
          />
          {content.consentText ? (
            <Consent id="gr-ok" name="smsConsent" defaultChecked={lastLead?.smsConsent}>
              {content.consentText}
            </Consent>
          ) : null}
          <TermsLine text={content.termsLine} />
          <SpamTraps />
          {formError ? (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          ) : null}
          <button className="btn btn-p btn-block" type="submit" disabled={busy}>
            {content.continueLabel || 'Continue'}
          </button>
        </form>
      )}

      {!locked && booking ? (
        <div className={styles.booking} ref={calendarRef}>
          <h2 className={styles.month} id={monthHeadingId} tabIndex={-1}>
            {content.bookStepLabel || 'Book your call'}
          </h2>
          {booking.embedUrl ? (
            <iframe
              src={booking.embedUrl}
              title={content.bookStepLabel || 'Book your call'}
              className={styles.frame}
              loading="lazy"
            />
          ) : null}
          <a
            href={booking.link}
            target="_blank"
            rel="noopener noreferrer"
            className={booking.embedUrl ? `tlink ${styles.newTab}` : 'btn btn-p btn-block'}
            onClick={() => track('growth_booking_open')}
          >
            {content.bookingLinkLabel || 'Open the booking calendar in a new tab'}
          </a>
        </div>
      ) : (
        <div
          className={`${styles.cal} ${locked ? styles.locked : ''}`}
          ref={calendarRef}
          onClick={onLockedClick}
        >
          <div className={styles.calHead}>
            <h2 className={styles.month} id={monthHeadingId} tabIndex={-1}>
              {monthLabel(first)}
            </h2>
            <div className={styles.nav}>
              <button
                type="button"
                aria-label="Previous month"
                disabled={month <= 0}
                onClick={() => setMonth((m) => Math.max(0, m - 1))}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next month"
                disabled={month >= maxMonth}
                onClick={() => setMonth((m) => Math.min(maxMonth, m + 1))}
              >
                ›
              </button>
            </div>
          </div>
          <div
            className={styles.grid}
            role="group"
            aria-labelledby={monthHeadingId}
            aria-hidden={locked ? true : undefined}
          >
            {WEEKDAY_HEADINGS.map((w) => (
              <span key={w} className={styles.wd} aria-hidden="true">
                {w}
              </span>
            ))}
            {cells.map((cell, i) => {
              if (!cell) return <span key={`b${i}`} aria-hidden="true" />
              const key = dayKey(cell)
              const n = cell.getUTCDate()
              if (locked || !available.has(key)) {
                return (
                  <span
                    key={key}
                    className={`${styles.dy} ${available.has(key) ? styles.av : ''}`}
                    aria-hidden="true"
                  >
                    {n}
                  </span>
                )
              }
              const selected = day === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.dy} ${styles.av} ${selected ? styles.sel : ''}`}
                  aria-pressed={selected}
                  aria-label={`${dayLabel(key)}, available`}
                  onClick={() => {
                    setDay(key)
                    setSlot(null)
                  }}
                >
                  {n}
                </button>
              )
            })}
          </div>
          {locked && content.lockedMessage ? (
            <p className={styles.lockMsg} role="note">
              {content.lockedMessage}
            </p>
          ) : null}
          {!locked && day ? (
            <div className="stack g8">
              <strong className={styles.slotHead}>
                {dayLabel(day)}
                {content.timezoneLabel ? ` · ${content.timezoneLabel}` : ''}
              </strong>
              <div className={styles.slots} role="group" aria-label="Available times">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.slot}
                    aria-pressed={slot === s}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {!locked && day && slot ? (
            <button
              type="button"
              className="btn btn-p btn-block"
              onClick={confirm}
              data-track="growth_booked"
            >
              {content.confirmLabel || 'Confirm'}
            </button>
          ) : null}
        </div>
      )}
    </>
  )
}
