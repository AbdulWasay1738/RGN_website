import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import type { Cta, CtaStyle } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import { Icon } from './Icon'

const STYLE_CLASS: Record<CtaStyle, string> = {
  primary: 'btn btn-p',
  dark: 'btn btn-d',
  outline: 'btn btn-o',
  outlineLight: 'btn btn-ol',
  white: 'btn btn-w',
  textLink: 'tlink',
}

export function buttonClass(style: CtaStyle = 'primary', opts: { small?: boolean; block?: boolean; className?: string } = {}) {
  return [STYLE_CLASS[style] ?? STYLE_CLASS.primary, opts.small && style !== 'textLink' ? 'btn-sm' : '', opts.block ? 'btn-block' : '', opts.className ?? '']
    .filter(Boolean)
    .join(' ')
}

type ButtonLinkProps = {
  href?: string
  style?: CtaStyle
  small?: boolean
  block?: boolean
  /** Show the arrow icon after the label (it nudges right on hover) */
  arrow?: boolean
  newTab?: boolean
  className?: string
  css?: CSSProperties
  /** Analytics event name, sent through lib/analytics once consent exists */
  track?: string
  children: ReactNode
}

/**
 * A link styled as a button. Internal links use next/link (so the scene
 * transition can intercept them); external links open normally.
 * Renders nothing when there is no href (for example a link to a hidden page).
 */
export function ButtonLink({ href, style = 'primary', small, block, arrow, newTab, className, css, track, children }: ButtonLinkProps) {
  if (!href) return null
  const cls = buttonClass(clean(style), { small, block, className })
  const content = (
    <>
      {children}
      {arrow ? <Icon name="arrow" /> : null}
    </>
  )
  const isInternal = href.startsWith('/') || href.startsWith('#')
  if (isInternal && !newTab) {
    return (
      <Link href={href} className={cls} style={css} data-track={track}>
        {content}
      </Link>
    )
  }
  return (
    <a href={href} className={cls} style={css} data-track={track} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {content}
    </a>
  )
}

/** Renders a CMS call to action. */
export function CtaLink({
  cta,
  fallbackStyle = 'primary',
  small,
  block,
  arrow,
  className,
  track,
}: {
  cta?: Cta | null
  fallbackStyle?: CtaStyle
  small?: boolean
  block?: boolean
  arrow?: boolean
  className?: string
  track?: string
}) {
  if (!cta?.label || !cta.link?.href) return null
  const style = clean(cta.style) ?? fallbackStyle
  return (
    <ButtonLink
      href={cta.link.href}
      newTab={cta.link.newTab}
      style={style}
      small={small}
      block={block}
      arrow={arrow ?? style === 'textLink'}
      className={className}
      track={track}
    >
      {cta.label}
    </ButtonLink>
  )
}
