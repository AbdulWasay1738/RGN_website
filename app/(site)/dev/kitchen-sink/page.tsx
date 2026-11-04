import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Brush, Felt, QuoteMark, RBadge, Shard, SpinningReel, Tear, Watermark } from '@/components/brand'
import { Accordion } from '@/components/ui/Accordion'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { ButtonLink } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'
import { CountUp } from '@/components/ui/CountUp'
import { Consent, Field, SelectField, TextAreaField } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { Seats } from '@/components/ui/Seats'
import type { Background, Faq } from '@/lib/sanity/types'
import styles from './kitchen-sink.module.css'

export const metadata: Metadata = { title: 'Kitchen sink', robots: { index: false, follow: false } }

/*
 * Temporary development page showing every UI primitive and brand component.
 * All strings here are dev-only placeholders, not client copy.
 * Blocked in production; remove before launch.
 */

const SAMPLE_FAQS: Faq[] = [
  { _id: 'dev-1', _type: 'faq', question: '[Dev only] Sample question one?', answer: '[Dev only] Sample answer one.' },
  { _id: 'dev-2', _type: 'faq', question: '[Dev only] Sample question two?', answer: '[Dev only] Sample answer two.' },
]

const BACKGROUNDS: Background[] = ['white', 'paper', 'navy', 'ink', 'lavender', 'lavender-tint', 'orange']

export default function KitchenSinkPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <>
      <Band background="paper">
        <div className="wrap stack g24">
          <span className="eyebrow">[Dev only] Kitchen sink</span>
          <h1 className="h1">
            <AccentText text="[Dev only] Heading one with an *accent*" />
          </h1>
          <h2 className="h2">
            <AccentText text="[Dev only] Heading two with a _swoosh_ word" />
          </h2>
          <h3 className="h3">[Dev only] Heading three</h3>
          <span className="hand">[Dev only] Handwritten line</span>
          <span className="script" style={{ fontSize: 44 }}>
            [Dev only] Script
          </span>
          <p className="lead">[Dev only] Lead paragraph in Nunito Sans.</p>
        </div>
      </Band>

      <Band>
        <div className="wrap stack g24">
          <span className="eyebrow">Buttons</span>
          <div className="row g12 center">
            <ButtonLink href="/dev/kitchen-sink" style="primary" arrow>
              Primary
            </ButtonLink>
            <ButtonLink href="/dev/kitchen-sink" style="dark">
              Dark
            </ButtonLink>
            <ButtonLink href="/dev/kitchen-sink" style="outline">
              Outline
            </ButtonLink>
            <ButtonLink href="/dev/kitchen-sink" style="textLink" arrow>
              Text link
            </ButtonLink>
            <ButtonLink href="/dev/kitchen-sink" style="primary" small>
              Small
            </ButtonLink>
          </div>
          <div className={`row g12 center navy ${styles.darkRow}`}>
            <ButtonLink href="/dev/kitchen-sink" style="outlineLight">
              Outline light
            </ButtonLink>
            <ButtonLink href="/dev/kitchen-sink" style="white">
              White
            </ButtonLink>
          </div>
          <span className="eyebrow">Chips</span>
          <div className="row g8">
            <span className="chip chip-o">chip-o</span>
            <span className="chip chip-n">chip-n</span>
            <span className="chip chip-l">chip-l</span>
            <span className="chip chip-lv">chip-lv</span>
            <span className="chip chip-line-l">chip-line-l</span>
            <span className="chip chip-n">
              <span className="dot pulse" />
              Pulse
            </span>
          </div>
          <span className="eyebrow">Icons</span>
          <div className="row g16 center">
            {(['arrow', 'calendar', 'clock', 'pin', 'lock', 'phone', 'people', 'target', 'camera', 'film', 'broadcast', 'linkedin', 'check', 'mail', 'star'] as const).map((n) => (
              <Icon key={n} name={n} size={24} className={n === 'arrow' ? 'i' : undefined} />
            ))}
          </div>
        </div>
      </Band>

      <Band background="navy">
        <div className="wrap stack g24">
          <span className="eyebrow">Countdowns (to the workshop)</span>
          <Countdown to="workshopAt" label="Time until the workshop" />
          <Countdown to="workshopAt" tone="lav" label="Time until the workshop" />
          <div className={styles.orangeBox}>
            <Countdown to="workshopAt" tone="light" label="Time until the workshop" />
          </div>
          <span className="eyebrow">Seats (3 of 10 sold)</span>
          <Seats sold={3} cap={10} zoomChip="[Dev only] + Zoom" />
          <span className="eyebrow">Count-up</span>
          <span className="stat-n">
            <CountUp to={250} />
            <em>+</em>
          </span>
        </div>
      </Band>

      <Band background="paper">
        <div className="wrap row g64">
          <div className="side stack g16">
            <span className="eyebrow">Accordion</span>
            <Accordion items={SAMPLE_FAQS} openFirst />
          </div>
          <form className="grow panel-w form" noValidate>
            <div className="fgrid">
              <Field id="ks-name" name="name" label="[Dev only] Name" required />
              <Field id="ks-email" name="email" type="email" label="[Dev only] Email" error="Enter an email address like name@company.com" />
            </div>
            <SelectField id="ks-size" name="size" label="[Dev only] Size" options={['A', 'B', 'C']} />
            <TextAreaField id="ks-msg" name="message" label="[Dev only] Message" />
            <Consent id="ks-ok" name="consent">
              [Dev only] Optional consent text.
            </Consent>
          </form>
        </div>
      </Band>

      {BACKGROUNDS.map((bg) => (
        <Band key={bg} background={bg} watermark="top-right" padding="tight">
          <div className="wrap">
            <span className="eyebrow">Band: {bg}</span>
            <h2 className="h3">
              <AccentText text={`[Dev only] Band *${bg}*`} />
            </h2>
          </div>
        </Band>
      ))}

      <Band background="ink">
        <div className="wrap row g48 center">
          <RBadge size={96} />
          <QuoteMark width={88} />
          <SpinningReel disc="#13233F" hole="#091527" ring="#C6A7ED" seconds={20} style={{ width: 200, height: 200 }} />
        </div>
      </Band>

      <Band background="paper">
        <div className="wrap row g64">
          <div className={styles.brushBox}>
            <Brush style={{ left: '-8%', top: 40, width: '118%', height: 200, transform: 'rotate(-12deg)' }} />
          </div>
          <div className={styles.feltBox}>
            <Felt style={{ left: 0, top: 0, width: '100%', height: '100%' }} />
            <Shard style={{ right: 6, top: 10, width: '58%', height: '34%', clipPath: 'polygon(0 0,100% 0,100% 100%)' }} />
            <Watermark style={{ right: 10, bottom: 10, width: 120, color: '#C6A7ED' }} />
          </div>
        </div>
      </Band>

      <section className={`ink ${styles.tearBox}`}>
        <Tear fill="#FAF7F2" position="top" />
        <div className="wrap">
          <span className="eyebrow">Torn edge above</span>
        </div>
      </section>
    </>
  )
}
