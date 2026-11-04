'use client'

import { useId, useState } from 'react'
import type { Faq } from '@/lib/sanity/types'
import { Icon } from './Icon'

/** FAQ accordion. Each question is a button with aria-expanded controlling its answer. */
export function Accordion({ items, openFirst = false }: { items?: Faq[] | null; openFirst?: boolean }) {
  const list = (items ?? []).filter((f) => f?.question)
  const [open, setOpen] = useState<Set<number>>(() => new Set(openFirst && list.length ? [0] : []))
  const baseId = useId()
  if (!list.length) return null
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  return (
    <div className="faq">
      {list.map((f, i) => {
        const isOpen = open.has(i)
        const panelId = `${baseId}-a${i}`
        return (
          <div key={f._id ?? i} className={`qa${isOpen ? ' open' : ''}`}>
            <h3 style={{ margin: 0, font: 'inherit' }}>
              <button className="q" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(i)} type="button">
                {f.question}
                <span className="pm">
                  <Icon name="plus" />
                </span>
              </button>
            </h3>
            <div className="a" id={panelId} role="region" aria-hidden={!isOpen}>
              <div>
                <p>{f.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
