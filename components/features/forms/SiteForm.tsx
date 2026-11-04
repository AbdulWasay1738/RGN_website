'use client'

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { submitForm } from '@/app/actions/forms'
import { ButtonLink, buttonClass } from '@/components/ui/Button'
import { Consent, Field, SelectField, SpamTraps, TextAreaField } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { FORM_FIELDS, validateField, validateForm, VALIDATION_MESSAGES, type FieldErrors, type FormValues } from '@/lib/forms'
import type { FormKind } from '@/lib/sanity/types'
import styles from './SiteForm.module.css'

export type SiteFormProps = {
  kind: FormKind
  /** Panel classes for the form box (panel, panel-w, panel-l) */
  className?: string
  /** Content above the fields inside the panel (Careers puts the headline here) */
  header?: ReactNode
  submitLabel?: string
  submitStyle?: 'primary' | 'dark'
  /** Small note beside the submit button */
  footnote?: string
  consentText?: string
  subjectOptions?: string[]
  selectOptions?: string[]
  successTitle?: string
  successBody?: string
  successCtaLabel?: string
}

/** Default option lists when the editor has not set any (they match the prototype). */
const DEFAULT_SELECT: Partial<Record<FormKind, string[]>> = {
  partner: ['1 to 9', '10 to 50', '51 to 300', '300+'],
  speaking: ['Under 50', '50 to 200', '200+'],
}

function formValues(form: HTMLFormElement): FormValues {
  const values: FormValues = {}
  new FormData(form).forEach((v, k) => {
    if (typeof v === 'string') values[k] = v
  })
  return values
}

/**
 * The contact, partner, speaking, podcast-guest and talent forms. Field sets are
 * fixed in code (docs/04); headings, buttons and success messages come from the
 * Studio. Validates in the browser, then on the server through submitForm().
 */
export function SiteForm(props: SiteFormProps) {
  const { kind, className, header, submitLabel, submitStyle = 'primary', footnote, consentText, successTitle, successBody, successCtaLabel } = props
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${kind}-${uid}-${name}`
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (done) successRef.current?.focus()
  }, [done])

  const focusFirstError = useCallback(
    (errs: FieldErrors) => {
      const first = FORM_FIELDS[kind].find((f) => errs[f.name])
      if (!first) return
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${first.name}"]`)
      el?.focus()
    },
    [kind],
  )

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setAttempted(true)
    const errs = validateForm(kind, formValues(form))
    setErrors(errs)
    if (Object.keys(errs).length) {
      setMessage(VALIDATION_MESSAGES.failed)
      focusFirstError(errs)
      return
    }
    setPending(true)
    setMessage(null)
    try {
      const result = await submitForm(kind, new FormData(form))
      if (result.ok) {
        track(`form_${kind}`)
        setDone(true)
      } else {
        setErrors(result.errors)
        setMessage(result.message ?? VALIDATION_MESSAGES.failed)
        focusFirstError(result.errors)
      }
    } catch {
      setMessage(VALIDATION_MESSAGES.failed)
    } finally {
      setPending(false)
    }
  }

  /** After the first attempt, re-check a field when it loses focus. */
  function onBlur(e: React.FocusEvent<HTMLFormElement>) {
    if (!attempted) return
    const target = e.target as unknown as HTMLInputElement
    const spec = FORM_FIELDS[kind].find((f) => f.name === target.name)
    if (!spec || spec.type === 'radio' || spec.type === 'checkbox') return
    const err = validateField(spec, target.value)
    setErrors((prev) => {
      const next = { ...prev }
      if (err) next[spec.name] = err
      else delete next[spec.name]
      return next
    })
  }

  if (done) {
    return (
      <div className={`${className ?? ''} ${styles.successBox}`} role="status">
        <div className="success">
          <span className="ok">
            <Icon name="check" />
          </span>
          <h3 ref={successRef} tabIndex={-1} className={`display ${styles.successTitle}`}>
            {successTitle}
          </h3>
          {successBody ? <p className={styles.successBody}>{successBody}</p> : null}
          {successCtaLabel ? (
            <ButtonLink href="/" style="outline" small>
              {successCtaLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    )
  }

  const err = (name: string) => errors[name]
  const options = (props.selectOptions?.length ? props.selectOptions : DEFAULT_SELECT[kind]) ?? []

  let fields: ReactNode = null
  switch (kind) {
    case 'contact': {
      const subjects = props.subjectOptions?.length ? props.subjectOptions : []
      fields = (
        <>
          <div className="fgrid">
            <Field id={id('name')} name="name" label="Name" required autoComplete="name" error={err('name')} />
            <Field id={id('email')} name="email" label="Email" type="email" required autoComplete="email" error={err('email')} />
          </div>
          {subjects.length ? (
            <fieldset className={`stack g8 ${styles.fieldset}`}>
              <legend className={styles.legend}>Subject</legend>
              <div className="radio-pills">
                {subjects.map((s, i) => (
                  <label key={s} htmlFor={id(`subject${i}`)}>
                    <input id={id(`subject${i}`)} type="radio" name="subject" value={s} defaultChecked={i === 0} />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <TextAreaField id={id('message')} name="message" label="Message" rows={6} required error={err('message')} />
        </>
      )
      break
    }
    case 'partner':
      fields = (
        <>
          <div className="fgrid">
            <Field id={id('firstName')} name="firstName" label="First name" required autoComplete="given-name" error={err('firstName')} />
            <Field id={id('lastName')} name="lastName" label="Last name" required autoComplete="family-name" error={err('lastName')} />
            <Field id={id('email')} name="email" label="Work email" type="email" required autoComplete="email" error={err('email')} />
            <Field id={id('phone')} name="phone" label="Mobile number" type="tel" required autoComplete="tel" error={err('phone')} />
            <Field id={id('company')} name="company" label="Company" required autoComplete="organization" error={err('company')} />
            <Field id={id('website')} name="website" label="Website" type="url" required autoComplete="url" error={err('website')} />
            <Field id={id('role')} name="role" label="Your role" required autoComplete="organization-title" error={err('role')} />
            <SelectField id={id('companySize')} name="companySize" label="Company size" required options={options} error={err('companySize')} />
          </div>
          <TextAreaField id={id('help')} name="help" label="What should we help with?" rows={4} required error={err('help')} />
          {consentText ? (
            <Consent id={id('consent')} name="consent">
              {consentText}
            </Consent>
          ) : null}
        </>
      )
      break
    case 'speaking':
      fields = (
        <>
          <div className="fgrid">
            <Field id={id('name')} name="name" label="Name" required autoComplete="name" error={err('name')} />
            <Field id={id('organization')} name="organization" label="Organization" required autoComplete="organization" error={err('organization')} />
            <Field id={id('eventName')} name="eventName" label="Event name" required error={err('eventName')} />
            <Field id={id('eventDate')} name="eventDate" label="Event date" type="date" required error={err('eventDate')} />
            <Field id={id('topic')} name="topic" label="Topic" required error={err('topic')} />
            <SelectField id={id('audienceSize')} name="audienceSize" label="Audience size" required options={options} error={err('audienceSize')} />
          </div>
          <TextAreaField id={id('message')} name="message" label="Message" rows={4} error={err('message')} />
        </>
      )
      break
    case 'guest':
      fields = (
        <div className="fgrid">
          <Field id={id('name')} name="name" label="Name" required autoComplete="name" error={err('name')} />
          <Field id={id('company')} name="company" label="Company" required autoComplete="organization" error={err('company')} />
          <Field id={id('topic')} name="topic" label="Topic" required error={err('topic')} />
          <Field id={id('link')} name="link" label="Link to your work" type="url" required autoComplete="url" error={err('link')} />
        </div>
      )
      break
    case 'talent':
      fields = (
        <>
          <div className="fgrid">
            <Field id={id('name')} name="name" label="Name" required autoComplete="name" error={err('name')} />
            <Field id={id('email')} name="email" label="Email" type="email" required autoComplete="email" error={err('email')} />
            <Field id={id('role')} name="role" label="Role of interest" required error={err('role')} />
            <Field id={id('link')} name="link" label="Link to your work or LinkedIn" type="url" required autoComplete="url" error={err('link')} />
          </div>
          <TextAreaField id={id('note')} name="note" label="A short note" rows={3} error={err('note')} />
        </>
      )
      break
  }

  const button = (
    <button className={buttonClass(submitStyle)} type="submit" disabled={pending} aria-disabled={pending || undefined}>
      {submitLabel}
    </button>
  )

  return (
    <form ref={formRef} className={`form ${className ?? ''}`} onSubmit={onSubmit} onBlur={onBlur} noValidate>
      {header}
      <SpamTraps />
      {fields}
      {message ? (
        <p className={styles.formError} role="alert">
          {message}
        </p>
      ) : null}
      {footnote ? (
        <div className="row g16 between center">
          <span className={`muted ${styles.footnote}`}>{footnote}</span>
          {button}
        </div>
      ) : (
        <div className={styles.end}>{button}</div>
      )}
    </form>
  )
}
