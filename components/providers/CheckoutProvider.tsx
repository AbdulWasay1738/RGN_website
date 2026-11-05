'use client'

import dynamic from 'next/dynamic'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

// Loaded on first use so the modal's code stays out of the initial page JavaScript.
const CheckoutModal = dynamic(() => import('@/components/features/CheckoutModal').then((m) => m.CheckoutModal), {
  ssr: false,
})

export type CheckoutOffer =
  | { kind: 'workshop'; attendance?: 'in-person' | 'zoom' }
  | { kind: 'course'; slug: string }
  | { kind: 'bundle' }
  | { kind: 'book' }

type Ctx = { open: (offer: CheckoutOffer) => void; close: () => void }

const CheckoutContext = createContext<Ctx>({ open: () => {}, close: () => {} })

/**
 * "Enroll now", "Get the bundle", "Reserve my seat" and "Pre-order" open the
 * checkout modal from anywhere. Phase 6 swaps the modal's payment step for a
 * redirect to Stripe Checkout; this API stays the same.
 */
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [offer, setOffer] = useState<CheckoutOffer | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const open = useCallback((o: CheckoutOffer) => {
    lastFocus.current = document.activeElement as HTMLElement | null
    setOffer(o)
  }, [])

  const close = useCallback(() => {
    setOffer(null)
    window.setTimeout(() => lastFocus.current?.focus?.(), 0)
  }, [])

  return (
    <CheckoutContext.Provider value={{ open, close }}>
      {children}
      {offer ? <CheckoutModal offer={offer} onClose={close} /> : null}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  return useContext(CheckoutContext)
}
