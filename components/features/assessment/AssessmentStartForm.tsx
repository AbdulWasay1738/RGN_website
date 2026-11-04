'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Consent, Field, SelectField, SpamTraps } from '@/components/ui/Field'
import { track } from '@/lib/analytics'
import { FORM_FIELDS, HONEYPOT_FIELD, TIMESTAMP_FIELD, validateForm, VALIDATION_MESSAGES, type FieldErrors } from '@/lib/forms'
import type { Assessment } from '@/lib/sanity/types'
import { saveDetails } from './storage'
import styles from './assessment.module.css'

const IDS: Record<string, string> = {
  firstName: 'as-fn',
  lastName: 'as-ln',
  email: 'as-em',
  phone: 'as-ph',
  company: 'as-co',
  role: 'as-ro',
  companySize: 'as-sz',
}

/** "Start here": the visitor's details. On success the question flow opens. */
export function AssessmentStartForm({ form }: { form?: Assessment['form'] }) {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const values: Record<string, string> = {}
    fd.forEach((v, k) => {
      if (typeof v === 'string') values[k] = v
    })
    const errs = validateForm('assessment', values)
    setErrors(errs)
    const firstBad = FORM_FIELDS.assessment.find((f) => errs[f.name] && IDS[f.name])
    if (firstBad) {
      window.requestAnimationFrame(() => document.getElementById(IDS[firstBad.name])?.focus())
      return
    }
    setBusy(true)
    const details: Record<string, string> = {}
    for (const f of FORM_FIELDS.assessment) {
      if (f.name !== 'answers' && values[f.name] !== undefined) details[f.name] = values[f.name].trim()
    }
    details[HONEYPOT_FIELD] = values[HONEYPOT_FIELD] ?? ''
    details[TIMESTAMP_FIELD] = values[TIMESTAMP_FIELD] ?? ''
    saveDetails(details)
    track('form_assessment')
    router.push('/assessment/questions')
  }

  const hasErrors = Object.keys(errors).length > 0
  const sizes = form?.companySizes?.length ? form.companySizes : ['1 to 9', '10 to 50', '51 to 300', '300+']

  return (
    <form className={`side panel-w form fade-up ${styles.formPanel}`} onSubmit={onSubmit} noValidate aria-labelledby="as-title">
      <div className={`row ${styles.formHead}`}>
        <strong className={styles.formTitle} id="as-title">
          {form?.title ?? 'Start here'}
        </strong>
        {form?.stepLabel ? <span className={styles.stepLabel}>{form.stepLabel}</span> : null}
      </div>
      <div className={styles.pbar} aria-hidden="true">
        <i style={{ width: '6%' }} />
      </div>
      <div className="fgrid">
        <Field id={IDS.firstName} name="firstName" label={form?.firstNameLabel ?? 'First name'} required autoComplete="given-name" error={errors.firstName} />
        <Field id={IDS.lastName} name="lastName" label={form?.lastNameLabel ?? 'Last name'} required autoComplete="family-name" error={errors.lastName} />
      </div>
      <Field id={IDS.email} name="email" type="email" label={form?.emailLabel ?? 'Work email'} required autoComplete="email" error={errors.email} />
      <Field id={IDS.phone} name="phone" type="tel" label={form?.phoneLabel ?? 'Mobile number'} required autoComplete="tel" error={errors.phone} />
      <div className="fgrid">
        <Field id={IDS.company} name="company" label={form?.companyLabel ?? 'Company'} required autoComplete="organization" error={errors.company} />
        <Field id={IDS.role} name="role" label={form?.roleLabel ?? 'Your role'} required autoComplete="organization-title" error={errors.role} />
      </div>
      <SelectField
        id={IDS.companySize}
        name="companySize"
        label={form?.sizeLabel ?? 'Company size'}
        placeholder={form?.sizePlaceholder ?? 'Select company size'}
        options={sizes}
        required
        error={errors.companySize}
      />
      {form?.consentText ? (
        <Consent id="as-ok" name="consent">
          {form.consentText}
        </Consent>
      ) : null}
      <SpamTraps />
      {hasErrors ? (
        <p className={styles.formError} role="alert">
          {VALIDATION_MESSAGES.failed}
        </p>
      ) : null}
      <button className="btn btn-p btn-block" type="submit" disabled={busy}>
        {form?.submitLabel ?? 'Start the free assessment'}
      </button>
    </form>
  )
}
