'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { submitForm } from '@/app/actions/forms'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import type { Assessment } from '@/lib/sanity/types'
import { clean, interpolate } from '@/lib/text'
import { clearAssessment, readAnswers, readDetails, saveAnswers, type AssessmentDetails } from './storage'
import styles from './assessment.module.css'

const KEYS = 'ABCDEF'
const MIN_SENDING_MS = 1200

/** Submits the answers, keeping the "sending" state visible for at least MIN_SENDING_MS. */
async function sendAnswers(fd: FormData): Promise<boolean> {
  const minimum = new Promise((resolve) => window.setTimeout(resolve, MIN_SENDING_MS))
  try {
    const [result] = await Promise.all([submitForm('assessment', fd), minimum])
    return result.ok
  } catch {
    await minimum
    return false
  }
}

type Props = {
  flow?: Assessment['flow']
  areas?: Assessment['areas']
  questions?: Assessment['questions']
}

/**
 * One question per step, with the area tracker and progress bar.
 * Arriving without the details from /assessment sends the visitor back there.
 */
export function AssessmentFlow({ flow, areas, questions }: Props) {
  const router = useRouter()
  const list = (questions ?? []).filter((q) => q?.question && (q.options?.length ?? 0) > 0)
  const areaList = (areas ?? []).filter((a) => a?.name)

  const [details, setDetails] = useState<AssessmentDetails | null>(null)
  const [answers, setAnswers] = useState<Array<number | null>>([])
  const [step, setStep] = useState(0)
  const [showError, setShowError] = useState(false)
  const [sending, setSending] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const firstRender = useRef(true)

  // Guard: the flow needs the details from the start form.
  useEffect(() => {
    const d = readDetails()
    if (!d) {
      router.replace('/assessment')
      return
    }
    const saved = readAnswers()
    const firstOpen = saved.findIndex((v) => v == null)
    // sessionStorage only exists in the browser, so this state must be read after mount
    // (reading it during render would break hydration of the static shell).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetails(d)
    setAnswers(saved)
    if (saved.length && firstOpen === -1 && saved.length >= list.length) setStep(Math.max(0, list.length - 1))
    else if (firstOpen > 0) setStep(firstOpen)
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Move focus to the new question so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  if (!details || !list.length) return <section className={`paper ${styles.loading}`} aria-busy="true" />

  const total = list.length
  const q = list[Math.min(step, total - 1)]
  const selected = answers[step] ?? null
  const currentArea = areaList.length ? areaList.findIndex((a) => clean(a.name) === clean(q.area)) : -1
  const curIdx = currentArea >= 0 ? currentArea : Math.min(step, Math.max(0, areaList.length - 1))
  const areaName = q.area ?? areaList[curIdx]?.name ?? ''
  const remaining = total - step
  const isLast = step === total - 1

  const choose = (i: number) => {
    const next = [...answers]
    while (next.length < total) next.push(null)
    next[step] = i
    setAnswers(next)
    saveAnswers(next)
    setShowError(false)
  }

  const onOptionKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const count = q.options?.length ?? 0
    let target = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = (i + 1) % count
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = (i - 1 + count) % count
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = count - 1
    if (target < 0) return
    e.preventDefault()
    choose(target)
    optionRefs.current[target]?.focus()
  }

  const back = () => {
    setShowError(false)
    if (step === 0) router.push('/assessment')
    else setStep(step - 1)
  }

  const next = async () => {
    if (selected == null) {
      setShowError(true)
      return
    }
    if (!isLast) {
      setStep(step + 1)
      return
    }
    setSending(true)
    track('assessment_submit')
    const fd = new FormData()
    for (const [k, v] of Object.entries(details)) fd.set(k, v)
    fd.set(
      'answers',
      JSON.stringify(
        list.map((item, i) => ({
          area: item.area ?? '',
          question: item.question ?? '',
          answer: answers[i] != null ? item.options?.[answers[i] as number] ?? '' : '',
        })),
      ),
    )
    const ok = await sendAnswers(fd)
    if (ok) {
      clearAssessment()
      router.push('/assessment/thank-you')
    } else {
      // The stored details failed the server check: send the visitor back to fix them.
      router.push('/assessment')
    }
  }

  const progress = Math.round(((step + 1) / total) * 100)
  const minutesTemplate = remaining === 1 ? flow?.minuteLeft ?? 'About {n} minute left' : flow?.minutesLeft ?? 'About {n} minutes left'

  return (
    <section className={`paper ${styles.flowSection}`}>
      <div className={`${styles.pbar} ${styles.pbarFlat}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Assessment progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className={`wrap row g48 ${styles.flowWrap}`}>
        {areaList.length ? (
          <nav className={`side stack g8 ${styles.areas}`} aria-label="Assessment areas">
            {flow?.areasEyebrow ? <span className={`eyebrow ${styles.areasEyebrow}`}>{flow.areasEyebrow}</span> : null}
            {areaList.map((a, i) => {
              const state = i === curIdx ? styles.cur : i < curIdx ? styles.done : ''
              return (
                <span key={a._key} className={`${styles.area} ${state}`} aria-current={i === curIdx ? 'step' : undefined}>
                  <i aria-hidden="true">{i < curIdx ? <Icon name="check" size={14} /> : i + 1}</i>
                  {a.name}
                </span>
              )
            })}
          </nav>
        ) : null}

        <section className={`grow panel-w stack g24 ${styles.question}`} key={sending ? 'sending' : step} aria-labelledby="as-q">
          {sending ? (
            <div className={`stack g16 ${styles.sending}`} role="status">
              <span className="spin" aria-hidden="true" />
              <strong className={styles.sendingTitle}>{flow?.sendingLabel ?? 'Sending your answers to our team…'}</strong>
            </div>
          ) : (
            <>
              <div className={`row ${styles.areaLabel}`}>
                <span>{interpolate(flow?.areaLabel ?? 'AREA {n} · {area}', { n: curIdx + 1, area: areaName })}</span>
                {clean(q.status) !== 'final' && flow?.draftChip ? <span className="chip chip-l">{flow.draftChip}</span> : null}
              </div>
              <h1 id="as-q" ref={headingRef} tabIndex={-1} className={styles.questionTitle}>
                {q.question}
              </h1>
              {flow?.helper ? <p className="muted" style={{ margin: 0 }}>{flow.helper}</p> : null}
              <div className={styles.opts} role="radiogroup" aria-labelledby="as-q" aria-describedby={showError ? 'as-err' : undefined}>
                {(q.options ?? []).map((o, i) => {
                  const checked = selected === i
                  const focusable = selected == null ? i === 0 : checked
                  return (
                    <button
                      key={`${step}-${i}`}
                      ref={(el) => {
                        optionRefs.current[i] = el
                      }}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={focusable ? 0 : -1}
                      className={styles.opt}
                      onClick={() => choose(i)}
                      onKeyDown={(e) => onOptionKey(e, i)}
                    >
                      <span className={styles.k} aria-hidden="true">
                        {KEYS[i] ?? i + 1}
                      </span>
                      {o}
                    </button>
                  )
                })}
              </div>
              <p className={styles.ansErr} id="as-err" aria-live="assertive">
                {showError ? flow?.errorText ?? 'Choose an answer to continue.' : ''}
              </p>
              <div className={`row g16 ${styles.flowFoot}`}>
                <button type="button" className="tlink" onClick={back}>
                  <Icon name="back" /> {flow?.backLabel ?? 'Back'}
                </button>
                <span className={`muted ${styles.timeLeft}`}>{interpolate(minutesTemplate, { n: remaining })}</span>
                <button type="button" className="btn btn-p" onClick={next}>
                  {isLast ? flow?.submitLabel ?? 'Submit my answers' : flow?.nextLabel ?? 'Next question'} <Icon name="arrow" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
