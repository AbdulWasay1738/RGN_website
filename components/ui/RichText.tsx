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
      link: ({ children, value: v }: { children: React.ReactNode; value?: { href?: string } }) => {
        const href = v?.href ?? '#'
        return href.startsWith('/') ? (
          <Link href={href}>{children}</Link>
        ) : (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      },
    },
  }
  return (
    <div className={className}>
      <PortableText value={value as never} components={components} />
    </div>
  )
}
