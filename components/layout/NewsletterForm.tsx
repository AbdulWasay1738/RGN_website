'use client'

import { useRef, useState, useTransition, type FormEvent } from 'react'
import { submitForm } from '@/app/actions/forms'
import { useToast } from '@/components/providers/ToastProvider'
import { SpamTraps } from '@/components/ui/Field'
import { track } from '@/lib/analytics'
import { validateField } from '@/lib/forms'
import styles from './Footer.module.css'

/** Footer newsletter signup: validated work email, success toast. */
export function NewsletterForm({
  label,
  placeholder,
  button,
  success,
}: {
  label?: string
  placeholder?: string
  button?: string
  success?: string
}) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | undefined>()
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const err = validateField({ name: 'email', type: 'email', required: true }, String(fd.get('email') ?? ''))
    if (err) {
      setError(err)
      inputRef.current?.focus()
      return
    }
    setError(undefined)
    startTransition(async () => {
      const res = await submitForm('newsletter', fd)
      if (res.ok) {
        form.reset()
        track('form_newsletter')
        if (success) toast(success)
      } else {
        setError(res.errors.email ?? res.message)
        inputRef.current?.focus()
      }
    })
  }

  return (
    <form className={`row g8 ${styles.newsForm}`} onSubmit={onSubmit} noValidate>
      <SpamTraps />
      <label className={`field ${error ? 'err' : ''} ${styles.newsField}`} htmlFor="nl-email">
        {label || 'Work email'}
        <input
          ref={inputRef}
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'nl-email-err' : undefined}
          className={styles.newsInput}
        />
        {error ? (
          <span className={`em ${styles.newsError}`} id="nl-email-err">
            {error}
          </span>
        ) : null}
      </label>
      <button className={`btn btn-p ${styles.newsBtn}`} type="submit" disabled={pending}>
        {button || 'Subscribe'}
      </button>
    </form>
  )
}
