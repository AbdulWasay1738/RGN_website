import { stegaClean } from 'next-sanity'

export type AccentSegment = {
  text: string
  /** `break` is a line break (a new line in the field) and has no text */
  kind: 'plain' | 'accent' | 'swoosh' | 'break'
  /** A swoosh word inside `*accent*` text also takes the accent colour */
  accent?: boolean
}

/** Splits one line into plain and swoosh segments. */
function swooshSegments(text: string, accent: boolean): AccentSegment[] {
  const out: AccentSegment[] = []
  const re = /_([^_]+)_/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), kind: accent ? 'accent' : 'plain' })
    out.push(accent ? { text: m[1], kind: 'swoosh', accent: true } : { text: m[1], kind: 'swoosh' })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), kind: accent ? 'accent' : 'plain' })
  return out
}

/**
 * Splits accent text into segments. `*words*` is an accent span, `_word_`
 * is the swoosh word in the home hero (it can sit inside an accent span), and
 * a new line is a line break. Unmatched markers stay as plain text.
 */
export function parseAccentText(input: string | undefined | null): AccentSegment[] {
  if (!input) return []
  const out: AccentSegment[] = []
  input.split(/\r?\n/).forEach((line, i) => {
    if (i > 0) out.push({ text: '', kind: 'break' })
    const re = /\*([^*]+)\*/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(...swooshSegments(line.slice(last, m.index), false))
      out.push(...swooshSegments(m[1], true))
      last = m.index + m[0].length
    }
    if (last < line.length) out.push(...swooshSegments(line.slice(last), false))
  })
  return out
}

/** Removes accent markers and line breaks, for metadata, aria labels and slate titles. */
export function plainText(input: string | undefined | null) {
  return stegaClean(input ?? '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s*\r?\n\s*/g, ' ')
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

/**
 * Values for the bundle price tokens in Studio texts:
 * interpolate('All three for {introPrice}, then {price}.', bundlePriceTokens(bundle)).
 */
export function bundlePriceTokens(
  bundle: { price?: number; introPrice?: number; compareAt?: number; compareAtIntro?: number } | null | undefined,
): Record<string, string> {
  const price = bundle?.price
  const compareAt = bundle?.compareAt
  const tokens: Record<string, string> = {}
  if (typeof price === 'number') tokens.price = formatUsd(price)
  if (typeof bundle?.introPrice === 'number') tokens.introPrice = formatUsd(bundle.introPrice)
  if (typeof compareAt === 'number') tokens.compareAt = formatUsd(compareAt)
  if (typeof bundle?.compareAtIntro === 'number') tokens.compareAtIntro = formatUsd(bundle.compareAtIntro)
  if (typeof price === 'number' && typeof compareAt === 'number') tokens.save = formatUsd(compareAt - price)
  return tokens
}
