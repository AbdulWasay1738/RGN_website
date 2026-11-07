import { createElement, type CSSProperties, type ElementType } from 'react'
import { parseAccentText } from '@/lib/text'

/**
 * Renders a headline where `*words*` take the accent colour in the same font
 * (the client's rule: never two typefaces in one headline). `_word_` draws the
 * lavender swoosh under a coral word (home hero only). A new line in the
 * field becomes a line break.
 */
export function AccentText({
  text,
  as = 'span',
  className,
  style,
  tone = 'acc',
  id,
}: {
  text?: string | null
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** acc: orange (coral on dark bands). acc-l: lavender. */
  tone?: 'acc' | 'acc-l'
  id?: string
}) {
  const segments = parseAccentText(text)
  if (!segments.length) return null
  return createElement(
    as,
    { className, style, id },
    segments.map((s, i) => {
      if (s.kind === 'accent') {
        return (
          <span key={i} className={tone}>
            {s.text}
          </span>
        )
      }
      if (s.kind === 'swoosh') return <Swoosh key={i} text={s.text} className={s.accent ? tone : undefined} />
      if (s.kind === 'break') return <br key={i} />
      return s.text
    }),
  )
}

export function Swoosh({ text, className }: { text: string; className?: string }) {
  return (
    <span className={['swoosh', className].filter(Boolean).join(' ')}>
      {text}
      <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 16 C 70 4, 160 2, 296 12" fill="none" stroke="#C6A7ED" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** Inline `**bold**` for plain strings (blog list items). */
export function InlineBold({ text }: { text?: string | null }) {
  if (!text) return null
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p))}
    </>
  )
}
