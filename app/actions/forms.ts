'use server'

import {
  deliverForm,
  FORM_FIELDS,
  HONEYPOT_FIELD,
  MIN_FILL_MS,
  pickFields,
  TIMESTAMP_FIELD,
  validateForm,
  VALIDATION_MESSAGES,
  type FormKind,
  type FormResult,
  type FormValues,
} from '@/lib/forms'

/**
 * The one server action every form calls: `submitForm(kind, formData)`.
 * Spam that trips the honeypot or the time trap gets a quiet "success" so bots
 * learn nothing; real errors come back per field.
 */
export async function submitForm(kind: FormKind, formData: FormData): Promise<FormResult> {
  if (!(kind in FORM_FIELDS)) return { ok: false, errors: {}, message: VALIDATION_MESSAGES.failed }

  const values: FormValues = {}
  formData.forEach((v, k) => {
    if (typeof v === 'string') values[k] = v
  })

  const honeypot = values[HONEYPOT_FIELD]
  const renderedAt = Number(values[TIMESTAMP_FIELD])
  const tooFast = Number.isFinite(renderedAt) && renderedAt > 0 && Date.now() - renderedAt < MIN_FILL_MS
  if (honeypot || tooFast) return { ok: true }

  const errors = validateForm(kind, values)
  if (Object.keys(errors).length) return { ok: false, errors, message: VALIDATION_MESSAGES.failed }

  await deliverForm(kind, pickFields(kind, values))
  return { ok: true }
}
