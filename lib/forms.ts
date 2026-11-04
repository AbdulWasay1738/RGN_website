/**
 * Form definitions shared by the browser (instant validation) and the server
 * action (the real check). Field sets are fixed in code to match the client's
 * copy document; labels and messages around them are editable in the Studio.
 *
 * Phase 6: only `deliverForm` changes, to create or update the GoHighLevel
 * contact, add the source tag (and `sms-consent` when ticked) and store
 * assessment answers as a note.
 */

export type FormKind =
  | 'contact'
  | 'partner'
  | 'speaking'
  | 'guest'
  | 'talent'
  | 'newsletter'
  | 'assessment'
  | 'checkout'

export type FieldType = 'text' | 'email' | 'tel' | 'url' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'hidden'

export type FieldSpec = {
  name: string
  type: FieldType
  required?: boolean
  autoComplete?: string
}

/** The fields each form accepts. Anything else in the payload is dropped. */
export const FORM_FIELDS: Record<FormKind, FieldSpec[]> = {
  contact: [
    { name: 'name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'subject', type: 'radio' },
    { name: 'message', type: 'textarea', required: true },
  ],
  partner: [
    { name: 'firstName', type: 'text', required: true, autoComplete: 'given-name' },
    { name: 'lastName', type: 'text', required: true, autoComplete: 'family-name' },
    { name: 'email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'company', type: 'text', required: true, autoComplete: 'organization' },
    { name: 'website', type: 'url', required: true, autoComplete: 'url' },
    { name: 'role', type: 'text', required: true, autoComplete: 'organization-title' },
    { name: 'companySize', type: 'select', required: true },
    { name: 'help', type: 'textarea', required: true },
    { name: 'consent', type: 'checkbox' },
  ],
  speaking: [
    { name: 'name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'organization', type: 'text', required: true, autoComplete: 'organization' },
    { name: 'eventName', type: 'text', required: true },
    { name: 'eventDate', type: 'date', required: true },
    { name: 'topic', type: 'text', required: true },
    { name: 'audienceSize', type: 'select', required: true },
    { name: 'message', type: 'textarea' },
  ],
  guest: [
    { name: 'name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'company', type: 'text', required: true, autoComplete: 'organization' },
    { name: 'topic', type: 'text', required: true },
    { name: 'link', type: 'url', required: true, autoComplete: 'url' },
  ],
  talent: [
    { name: 'name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'role', type: 'text', required: true },
    { name: 'link', type: 'url', required: true, autoComplete: 'url' },
    { name: 'note', type: 'textarea' },
  ],
  newsletter: [{ name: 'email', type: 'email', required: true, autoComplete: 'email' }],
  assessment: [
    { name: 'firstName', type: 'text', required: true, autoComplete: 'given-name' },
    { name: 'lastName', type: 'text', required: true, autoComplete: 'family-name' },
    { name: 'email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'company', type: 'text', required: true, autoComplete: 'organization' },
    { name: 'role', type: 'text', required: true, autoComplete: 'organization-title' },
    { name: 'companySize', type: 'select', required: true },
    { name: 'consent', type: 'checkbox' },
    /** JSON: [{ area, question, answer }] */
    { name: 'answers', type: 'hidden' },
  ],
  checkout: [
    { name: 'offer', type: 'hidden', required: true },
    { name: 'attendance', type: 'radio' },
    { name: 'name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'phone', type: 'tel', required: true, autoComplete: 'tel' },
    { name: 'smsConsent', type: 'checkbox' },
  ],
}

/** Fixed UI text (allowed in code by docs/04): validation messages. */
export const VALIDATION_MESSAGES = {
  required: 'Required',
  email: 'Enter an email address like name@company.com',
  url: 'Enter a full link starting with https://',
  tel: 'Enter a phone number',
  generic: 'Check this field',
  failed: 'That did not send. Check the highlighted fields and try again.',
}

export type FormValues = Record<string, string>
export type FieldErrors = Record<string, string>
export type FormResult = { ok: true } | { ok: false; errors: FieldErrors; message?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}/i
const TEL_RE = /^[+()\-.\s\d]{7,}$/

export function validateField(spec: FieldSpec, raw: string | undefined): string | null {
  const value = (raw ?? '').trim()
  if (!value) return spec.required ? VALIDATION_MESSAGES.required : null
  if (value.length > 5000) return VALIDATION_MESSAGES.generic
  if (spec.type === 'email' && !EMAIL_RE.test(value)) return VALIDATION_MESSAGES.email
  if (spec.type === 'url' && !URL_RE.test(value)) return VALIDATION_MESSAGES.url
  if (spec.type === 'tel' && !TEL_RE.test(value)) return VALIDATION_MESSAGES.tel
  return null
}

export function validateForm(kind: FormKind, values: FormValues): FieldErrors {
  const errors: FieldErrors = {}
  for (const spec of FORM_FIELDS[kind]) {
    const err = validateField(spec, values[spec.name])
    if (err) errors[spec.name] = err
  }
  return errors
}

/** Keeps only the known fields for a form. */
export function pickFields(kind: FormKind, values: FormValues): FormValues {
  const out: FormValues = {}
  for (const spec of FORM_FIELDS[kind]) {
    const v = values[spec.name]
    if (typeof v === 'string') out[spec.name] = v.trim()
  }
  return out
}

/** Honeypot input name. Hidden from people; bots tend to fill it. */
export const HONEYPOT_FIELD = 'company_website'
/** Hidden timestamp (ms) set when the form renders. */
export const TIMESTAMP_FIELD = 'rendered_at'
/** Submissions faster than this after render are treated as bots. */
export const MIN_FILL_MS = 2500

/**
 * Delivery. First build: validate, log in development, return success.
 * Phase 6: send to GoHighLevel here. Nothing else in the app changes.
 */
export async function deliverForm(kind: FormKind, data: FormValues): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[form:${kind}]`, data)
  }
}
