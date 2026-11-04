import type { IconName } from '@/lib/sanity/types'

type Name = IconName | 'back' | 'plus' | 'x' | 'close' | 'play' | 'pause' | 'star' | 'chevron' | 'menu' | 'link' | 'bundle'

/** The prototype's icon set. Decorative by default (aria-hidden). */
export function Icon({
  name,
  size,
  className,
  title,
}: {
  name: Name
  size?: number
  className?: string
  title?: string
}) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const }
  const stroke = { fill: 'none', stroke: 'currentColor' }
  switch (name) {
    case 'arrow':
      return (
        <svg className={className ?? 'i'} viewBox="0 0 14 14" {...stroke} strokeWidth="2" {...a11y}>
          <path d="M2 7h10M8 3l4 4-4 4" />
        </svg>
      )
    case 'back':
      return (
        <svg className={className ?? 'i'} viewBox="0 0 14 14" {...stroke} strokeWidth="2" {...a11y}>
          <path d="M12 7H2M6 3L2 7l4 4" />
        </svg>
      )
    case 'chevron':
      return (
        <svg className={className ?? 'i'} viewBox="0 0 10 6" {...stroke} strokeWidth="1.8" {...a11y}>
          <path d="M1 1l4 4 4-4" />
        </svg>
      )
    case 'plus':
      return (
        <svg width={size ?? 14} height={size ?? 14} viewBox="0 0 14 14" {...stroke} strokeWidth="2" className={className} {...a11y}>
          <path d="M2 7h10M7 2v10" />
        </svg>
      )
    case 'check':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 18 18" {...stroke} strokeWidth="2.2" className={className} {...a11y}>
          <path d="M3 9.5l4 4 8-9" />
        </svg>
      )
    case 'x':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="2.2" className={className} {...a11y}>
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      )
    case 'close':
      return (
        <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" {...stroke} strokeWidth="2" className={className} {...a11y}>
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      )
    case 'menu':
      return (
        <svg width={size ?? 18} height={((size ?? 18) * 14) / 18} viewBox="0 0 18 14" {...stroke} strokeWidth="2" className={className} {...a11y}>
          <path d="M1 1h16M1 7h16M1 13h10" />
        </svg>
      )
    case 'calendar':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="2.5" y="4" width="15" height="13.5" rx="2" />
          <path d="M2.5 8h15M6.5 2v4M13.5 2v4" />
        </svg>
      )
    case 'clock':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 5.5V10l3 2" />
        </svg>
      )
    case 'pin':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <path d="M10 18s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z" />
          <circle cx="10" cy="8" r="2" />
        </svg>
      )
    case 'lock':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="3" y="9" width="14" height="9" rx="2" />
          <path d="M6 9V6a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case 'phone':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="5" y="2" width="10" height="16" rx="2" />
          <path d="M9 15h2" />
        </svg>
      )
    case 'people':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <circle cx="7" cy="7" r="3" />
          <circle cx="14" cy="8" r="2.5" />
          <path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M12 12.5c2.5 0 5 1.5 5 4.5" />
        </svg>
      )
    case 'mail':
      return (
        <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
          <path d="M3 5.5l7 5.5 7-5.5" />
        </svg>
      )
    case 'play':
      return (
        <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 20 20" className={className} {...a11y}>
          <path d="M6 4l11 6-11 6z" fill="currentColor" />
        </svg>
      )
    case 'pause':
      return (
        <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 20 20" className={className} {...a11y}>
          <path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor" />
        </svg>
      )
    case 'star':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 18 18" className={className} {...a11y}>
          <path d="M9 0l2.2 6.8L18 9l-6.8 2.2L9 18l-2.2-6.8L0 9l6.8-2.2z" fill="#F23300" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 16 16" {...stroke} strokeWidth="1.5" className={className} {...a11y}>
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
          <path d="M4.5 7v4.5M4.5 4.6v.1M7.5 11.5V7m0 2c0-1.5 3.5-2.4 3.5.5v2" />
        </svg>
      )
    case 'link':
      return (
        <svg width={size ?? 18} height={size ?? 18} viewBox="0 0 18 18" {...stroke} strokeWidth="1.6" className={className} {...a11y}>
          <path d="M7.5 10.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-1 1M10.5 7.5a3 3 0 0 0-4.2 0L3.7 10.1a3 3 0 0 0 4.2 4.2l1-1" />
        </svg>
      )
    case 'bundle':
      return (
        <svg width={size ?? 22} height={size ?? 22} viewBox="0 0 24 24" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="3" y="6" width="12" height="15" rx="2" />
          <path d="M7 3h11a2 2 0 0 1 2 2v13" />
        </svg>
      )
    case 'target':
      return (
        <svg width={size ?? 30} height={size ?? 30} viewBox="0 0 30 30" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <circle cx="15" cy="15" r="11" />
          <circle cx="15" cy="15" r="6" />
          <circle cx="15" cy="15" r="1.6" fill="currentColor" />
        </svg>
      )
    case 'camera':
      return (
        <svg width={size ?? 30} height={size ?? 30} viewBox="0 0 30 30" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="3" y="8" width="17" height="14" rx="2" />
          <path d="M20 13l7-4v12l-7-4" />
        </svg>
      )
    case 'film':
      return (
        <svg width={size ?? 30} height={size ?? 30} viewBox="0 0 30 30" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <rect x="4" y="4" width="22" height="22" rx="3" />
          <path d="M4 10h22M4 20h22M10 4v6M20 4v6M10 20v6M20 20v6" />
        </svg>
      )
    case 'broadcast':
      return (
        <svg width={size ?? 30} height={size ?? 30} viewBox="0 0 30 30" {...stroke} strokeWidth="1.8" className={className} {...a11y}>
          <circle cx="15" cy="15" r="2.5" />
          <path d="M9.5 9.5a8 8 0 0 0 0 11M20.5 9.5a8 8 0 0 1 0 11M5.5 5.5a13.5 13.5 0 0 0 0 19M24.5 5.5a13.5 13.5 0 0 1 0 19" />
        </svg>
      )
    default:
      return null
  }
}
