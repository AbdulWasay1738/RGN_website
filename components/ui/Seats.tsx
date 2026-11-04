import { interpolate } from '@/lib/text'

/** The in-person seat visual: one block per seat, sold seats dimmed. */
export function Seats({
  sold,
  cap,
  zoomChip,
  className,
}: {
  sold: number
  cap: number
  /** Optional dashed "+ Zoom" chip after the seats */
  zoomChip?: string
  className?: string
}) {
  return (
    <div className={['seats', className].filter(Boolean).join(' ')} role="img" aria-label={`${Math.max(0, cap - sold)} of ${cap} in-person seats left`}>
      {Array.from({ length: cap }, (_, i) => (
        <span key={i} className={`seat${i < sold ? ' sold' : ''}`} />
      ))}
      {zoomChip ? <span className="zoom-chip">{zoomChip}</span> : null}
    </div>
  )
}

/** "7 of 10 in-person seats left · then Zoom", or the sold-out line. */
export function seatLine(opts: { left: number; cap: number; template?: string; soldOut?: string }) {
  if (opts.left <= 0) return opts.soldOut ?? 'In-person seats sold out. Zoom seats remain.'
  return interpolate(opts.template ?? '{left} of {cap} in-person seats left · then Zoom', {
    left: opts.left,
    cap: opts.cap,
  })
}
