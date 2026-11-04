'use client'

import { useToast } from '@/components/providers/ToastProvider'
import { buttonClass } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import styles from './EmailCard.module.css'

/** Contact email with a copy-to-clipboard button. */
export function EmailCard({ label, email, copyLabel }: { label?: string; email: string; copyLabel?: string }) {
  const toast = useToast()
  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      toast(`Copied ${email}`)
    } catch {
      toast('Select the text to copy it')
    }
  }
  return (
    <div className={`row g16 nowrap center ${styles.card}`}>
      <span className="icon-tile">
        <Icon name="mail" />
      </span>
      <span className={styles.text}>
        {label ? (
          <>
            <span className={`muted ${styles.label}`}>{label}</span>
            <br />
          </>
        ) : null}
        <a href={`mailto:${email}`} className={styles.email}>
          {email}
        </a>
      </span>
      {copyLabel ? (
        <button type="button" className={buttonClass('outline', { small: true })} onClick={copy} aria-label={`${copyLabel} ${email}`}>
          {copyLabel}
        </button>
      ) : null}
    </div>
  )
}
