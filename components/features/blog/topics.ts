import type { BlogSettings, PostTopic } from '@/lib/sanity/types'
import { interpolate } from '@/lib/text'
import styles from './blog.module.css'

export const TOPICS: PostTopic[] = ['OFFERS', 'CONTENT', 'POSITIONING', 'GROWTH', 'MEASUREMENT']

/** Topic name for tabs and crumbs: the Studio label, or "Content" style sentence case. */
export function topicLabel(topic: string | undefined, settings?: BlogSettings | null) {
  if (!topic) return ''
  const custom = settings?.topicLabels?.[topic as PostTopic]
  if (custom) return custom
  return topic.charAt(0) + topic.slice(1).toLowerCase()
}

/** "3 min read" (never less than one minute). */
export function readTime(minutes: number | undefined | null, settings?: BlogSettings | null) {
  return interpolate(settings?.readTimeLabel ?? '{n} min read', { n: Math.max(1, Math.round(minutes ?? 1)) })
}

/** Card covers rotate through navy, lavender and paper. */
export const TONES = [styles.toneNavy, styles.toneLav, styles.tonePaper]

/** Splits a cover line into sentences, one per line ("Hook." "Line." "Heart."). */
export function coverLines(text: string | undefined | null) {
  if (!text) return []
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
