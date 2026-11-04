'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import styles from './Toasts.module.css'

type Toast = { id: number; message: string; leaving: boolean }
type ToastFn = (message: string) => void

const ToastContext = createContext<ToastFn>(() => {})

let nextId = 1

/** Small confirmation messages (subscribed, copied, cookie choice). Announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback<ToastFn>((message) => {
    const id = nextId++
    setToasts((t) => [...t, { id, message, leaving: false }])
    window.setTimeout(
      () => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))),
      3200,
    )
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.toasts} aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.leaving ? styles.leaving : ''}`}>
            <span className={styles.tick}>
              <Icon name="check" size={18} />
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
