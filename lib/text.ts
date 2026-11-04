import { stegaClean } from 'next-sanity'

export type AccentSegment = { text: string; kind: 'plain' | 'accent' | 'swoosh' }

/**
 * Splits accent text into segments. `*word*` is an accent span and `_word_`
 * is the swoosh word in the home hero. Unmatched markers stay as plain text.
 */
export function parseAccentText(input: string | undefined | null): AccentSegment[] {
  if (!input) return []
  const out: AccentSegment[] = []
  const re = /\*([^*]+)\*|_([^_]+)_/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    if (m.index > last) out.push({ text: input.slice(last, m.index), kind: 'plain' })
    if (m[1] !== undefined) out.push({ text: m[1], kind: 'accent' })
    else out.push({ text: m[2], kind: 'swoosh' })
    last = m.index + m[0].length
  }
  if (last < input.length) out.push({ text: input.slice(last), kind: 'plain' })
  return out
}

/** Removes accent markers, for metadata, aria labels and slate titles. */
export function plainText(input: string | undefined | null) {
  return stegaClean(input ?? '').replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1')
}

/** Replaces `{name}` tokens: interpolate('Step {step} of 04', {step: '01'}). */
export function interpolate(template: string | undefined | null, values: Record<string, string | number>) {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (all, key: string) =>
    key in values ? String(values[key]) : all,
  )
}

/** Replaces the "[number]" placeholder once the client sets the report turnaround. */
export function fillNumber(text: string | undefined | null, days: number | undefined | null) {
  if (!text) return ''
  if (typeof days !== 'number') return text
  return text.replace(/\[number\]/g, String(days))
}

/** Clean a value used for logic (enums, ids) in case it carries preview markers. */
export function clean<T>(value: T): T {
  return stegaClean(value) as T
}

export function formatUsd(amount: number | undefined | null) {
  if (typeof amount !== 'number') return ''
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
}
