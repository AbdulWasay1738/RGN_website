'use client'

import { useState } from 'react'
import { AccentText } from '@/components/ui/AccentText'
import { Band } from '@/components/ui/Band'
import { Icon } from '@/components/ui/Icon'
import type { Background, EpisodesSection } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import type { SectionProps } from './SectionRenderer'
import styles from './Episodes.module.css'

const BARS = 28

/** Waveform bar heights, the same formula as the prototype so each row looks different. */
function barHeight(i: number, row: number) {
  return Math.round(Math.abs(Math.sin((i + 1) * (1.7 + row * 0.6))) * 32 + 8)
}

/** Podcast "Latest episodes.": play toggles a waveform preview; links open Spotify or YouTube. */
export function Episodes({ section }: SectionProps<EpisodesSection>) {
  const background: Background = clean(section.background) ?? 'paper'
  const items = (section.items ?? []).filter((e) => e?.title || e?.number)
  const [playing, setPlaying] = useState<number | null>(null)

  return (
    <Band background={background} watermark={section.watermark} anchorId={section.anchorId}>
      <div className="wrap narrow stack g16">
        <div className={`sec-head ${styles.head}`}>
          <AccentText as="h2" text={section.headline} className="h2" />
          {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
        </div>
        {items.map((ep, row) => {
          const on = playing === row
          const label = `${on ? 'Pause' : 'Play'} episode ${clean(ep.number) ?? row + 1}`
          return (
            <article key={ep._key ?? row} className={`rv ${styles.ep}`}>
              <button
                type="button"
                className={styles.play}
                aria-pressed={on}
                aria-label={label}
                onClick={() => setPlaying(on ? null : row)}
              >
                <Icon name={on ? 'pause' : 'play'} />
              </button>
              <div className={`stack g4 ${styles.info}`}>
                <span className={`eyebrow ${styles.epEyebrow}`}>
                  Episode {ep.number}
                  {ep.guest ? ` · ${ep.guest}` : ''}
                </span>
                <h3 className={`display ${styles.title}`}>{ep.title}</h3>
                {ep.summary ? <span className={`muted ${styles.summary}`}>{ep.summary}</span> : null}
                {ep.spotifyUrl || ep.youtubeUrl ? (
                  <span className="row g16">
                    {ep.spotifyUrl ? (
                      <a className="tlink" href={ep.spotifyUrl} target="_blank" rel="noopener noreferrer">
                        Spotify <Icon name="arrow" />
                      </a>
                    ) : null}
                    {ep.youtubeUrl ? (
                      <a className="tlink" href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        YouTube <Icon name="arrow" />
                      </a>
                    ) : null}
                  </span>
                ) : null}
              </div>
              <div className={`${styles.wave} ${on ? styles.on : ''}`} aria-hidden="true">
                {Array.from({ length: BARS }, (_, i) => (
                  <i
                    key={i}
                    className={i < 10 ? styles.o : undefined}
                    style={{ height: barHeight(i, row), ['--k' as string]: i }}
                  />
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </Band>
  )
}
