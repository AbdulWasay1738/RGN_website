import { PortableText, type PortableTextComponents } from 'next-sanity'
import Link from 'next/link'
import type { PortableTextValue } from '@/lib/sanity/types'

/**
 * Portable text renderer for blog posts, legal pages and rich-text sections.
 * Custom blocks: `pullQuote` and `decisionRule` (blog posts).
 */
export function RichText({
  value,
  decisionRuleLabel = 'The decision rule',
  className,
}: {
  value?: PortableTextValue | null
  decisionRuleLabel?: string
  className?: string
}) {
  if (!value?.length) return null
  const components: PortableTextComponents = {
    types: {
      pullQuote: ({ value: v }: { value: { text?: string } }) => (
        <figure className="pull-quote">
          <blockquote>{v.text}</blockquote>
        </figure>
      ),
      decisionRule: ({ value: v }: { value: { text?: string } }) => (
        <div className="decision-rule stack g8">
          <span className="eyebrow">{decisionRuleLabel}</span>
          <p>{v.text}</p>
        </div>
      ),
    },
    marks: {
      inlineLink: InlineLink,
      link: InlineLink,
    },
  }
  return (
    <div className={className}>
      <PortableText value={value as never} components={components} />
    </div>
  )
}

/** A link inside rich text (the `inlineLink` annotation). Site paths stay in the tab; other sites open a new one. */
function InlineLink({ children, value }: { children: React.ReactNode; value?: { href?: string } }) {
  const href = value?.href ?? '#'
  if (href.startsWith('/') || href.startsWith('#')) return <Link href={href}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
