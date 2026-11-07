'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/forms'

type BaseProps = {
  id: string
  name: string
  label: string
  required?: boolean
  error?: string
  help?: string
  className?: string
}

/** Label + input with an accessible error message (aria-invalid, aria-describedby). */
export function Field({
  id,
  name,
  label,
  required,
  error,
  help,
  className,
  type = 'text',
  autoComplete,
  placeholder,
  inputClassName,
  defaultValue,
}: BaseProps & {
  type?: 'text' | 'email' | 'tel' | 'url' | 'date'
  autoComplete?: string
  placeholder?: string
  inputClassName?: string
  defaultValue?: string
}) {
  const describedBy = [error ? `${id}-err` : '', help ? `${id}-help` : ''].filter(Boolean).join(' ') || undefined
  return (
    <label className={['field', error ? 'err' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClassName}
        defaultValue={defaultValue}
      />
      {help ? (
        <span className="help" id={`${id}-help`}>
          {help}
        </span>
      ) : null}
      {error ? (
        <span className="em" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}

/** Phone input after a fixed country prefix, for example "US +1" (the growth call form). */
export function PhoneField({
  id,
  name,
  label,
  prefix,
  prefixLabel,
  required,
  error,
  className,
  placeholder,
  defaultValue,
  autoComplete = 'tel-national',
}: BaseProps & {
  /** Shown in the box, for example "US +1" */
  prefix: string
  /** Read to screen readers after the label, for example "United States, +1" */
  prefixLabel: string
  placeholder?: string
  defaultValue?: string
  autoComplete?: string
}) {
  return (
    <label className={['field', error ? 'err' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      <span>
        {label}
        <span className="sr-only"> ({prefixLabel})</span>
      </span>
      <span className="tel">
        <span className="cc" aria-hidden="true">
          {prefix}
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
      </span>
      {error ? (
        <span className="em" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}

export function SelectField({
  id,
  name,
  label,
  required,
  error,
  className,
  placeholder = 'Select',
  options,
}: BaseProps & { placeholder?: string; options: string[] }) {
  return (
    <label className={['field', error ? 'err' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      {label}
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {error ? (
        <span className="em" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}

export function TextAreaField({ id, name, label, required, error, className, rows = 4 }: BaseProps & { rows?: number }) {
  return (
    <label className={['field', error ? 'err' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      {label}
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error ? (
        <span className="em" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </label>
  )
}

/** Optional, unticked consent box. Wording comes from the Studio ("[Counsel to review]"). */
export function Consent({ id, name, children, defaultChecked }: { id: string; name: string; children: ReactNode; defaultChecked?: boolean }) {
  return (
    <label className="consent" htmlFor={id}>
      <input id={id} type="checkbox" name={name} value="yes" defaultChecked={defaultChecked} />
      <span>{children}</span>
    </label>
  )
}

/** Honeypot + render timestamp. Put inside every <form>. */
export function SpamTraps() {
  const stamp = useRef<HTMLInputElement>(null)
  // Set after mount so server and client markup match.
  useEffect(() => {
    if (stamp.current) stamp.current.value = String(Date.now())
  }, [])
  return (
    <>
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name={TIMESTAMP_FIELD} ref={stamp} defaultValue="" />
    </>
  )
}
