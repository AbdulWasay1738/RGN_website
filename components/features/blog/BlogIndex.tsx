'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRef, type KeyboardEvent } from 'react'
import { SpinningReel } from '@/components/brand'
import { AccentText } from '@/components/ui/AccentText'
import { SanityImage } from '@/components/ui/SanityImage'
import type { BlogSettings, PostSummary, PostTopic } from '@/lib/sanity/types'
import { clean } from '@/lib/text'
import { coverLines, readTime, TONES, TOPICS, topicLabel } from './topics'
import styles from './blog.module.css'

type Topic = 'ALL' | PostTopic

type Props = { settings: BlogSettings | null; posts: PostSummary[] }

function parseTopic(value: string | null): Topic {
  const up = (value ?? '').toUpperCase()
  return (TOPICS as string[]).includes(up) ? (up as PostTopic) : 'ALL'
}

/** Reads `?topic=` from the URL. Wrap in <Suspense> with <BlogIndexView topic="ALL" /> as the fallback. */
export function BlogIndex(props: Props) {
  const params = useSearchParams()
  const topic = parseTopic(params.get('topic'))
  const select = (t: Topic) => {
    const url = new URL(window.location.href)
    if (t === 'ALL') url.searchParams.delete('topic')
    else url.searchParams.set('topic', t.toLowerCase())
    // Native history updates stay in sync with useSearchParams and keep the scroll position.
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }
  return <BlogIndexView {...props} topic={topic} onSelect={select} />
}

/** The blog index for one topic. Also the static (no JavaScript) rendering with every post. */
export function BlogIndexView({ settings, posts, topic, onSelect }: Props & { topic: Topic; onSelect?: (t: Topic) => void }) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const tabs: Topic[] = ['ALL', ...TOPICS]
  const featured = posts.find((p) => p.featured)
  const showFeatured = !!featured && (topic === 'ALL' || clean(featured.topic) === topic)
  const list = posts.filter((p) => !(featured && p._id === featured._id) && (topic === 'ALL' || clean(p.topic) === topic))
  const activeIndex = tabs.indexOf(topic)

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let target = -1
    if (e.key === 'ArrowRight') target = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') target = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = tabs.length - 1
    if (target < 0) return
    e.preventDefault()
    onSelect?.(tabs[target])
    tabRefs.current[target]?.focus()
  }

  return (
    <>
      <section className="paper">
        <div className={`wrap stack g20 ${styles.header}`}>
          {settings?.eyebrow ? <span className="eyebrow fade-up">{settings.eyebrow}</span> : null}
          <AccentText as="h1" text={settings?.headline ?? 'The blog'} className={`h1 fade-up ${styles.title}`} />
          <div className={`fade-up ${styles.tabs}`} role="tablist" aria-label="Topics">
            {tabs.map((t, i) => (
              <button
                key={t}
                id={`tab-${t.toLowerCase()}`}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                aria-selected={topic === t}
                aria-controls="post-grid"
                tabIndex={i === activeIndex ? 0 : -1}
                className={styles.tab}
                onClick={() => onSelect?.(t)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {t === 'ALL' ? settings?.allLabel ?? 'All' : topicLabel(t, settings)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showFeatured && featured ? <FeaturedPost post={featured} settings={settings} /> : null}

      <section className={`band ${showFeatured ? styles.gridBand : styles.gridBandTight}`}>
        <div className="wrap">
          <div
            id="post-grid"
            role="tabpanel"
            aria-labelledby={`tab-${topic.toLowerCase()}`}
            className="grid"
            style={{ ['--min' as string]: '320px', ['--gap' as string]: '32px 24px' }}
          >
            {list.length ? (
              list.map((p, k) => <PostCard key={`${topic}-${p._id}`} post={p} index={k} settings={settings} />)
            ) : (
              <p className="muted">{settings?.emptyText ?? 'No posts in this topic yet.'}</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function FeaturedPost({ post, settings }: { post: PostSummary; settings: BlogSettings | null }) {
  const lines = coverLines(post.coverLine ?? post.title)
  if (!post.slug) return null
  return (
    <section className="paper">
      <div className={`wrap ${styles.featuredWrap}`}>
        <Link href={`/blog/${post.slug}`} className={`ticket lift rv ${styles.featured}`}>
          <div className={styles.featuredArt} aria-hidden="true">
            <SpinningReel disc="#091527" hole="#F23300" seconds={60} className={styles.featuredReel} />
            <span className={styles.featuredLines}>
              {lines.map((l, i) => (
                <span key={i} className={lines.length > 1 && i === lines.length - 1 ? styles.lastLine : undefined}>
                  {l}
                </span>
              ))}
            </span>
          </div>
          <div className={`stack g16 ${styles.featuredBody}`}>
            <span className="row g8">
              <span className="chip chip-lv">{settings?.featuredLabel ?? 'Featured'}</span>
              <span className="chip chip-line">
                {topicLabel(clean(post.topic), settings)} · {readTime(post.readingTime, settings)}
              </span>
            </span>
            <span className={styles.featuredTitle}>{post.title}</span>
            {post.excerpt ? <span className={styles.featuredExcerpt}>{post.excerpt}</span> : null}
            {post.author?.name ? (
              <span className={`row g12 ${styles.author}`}>
                <SanityImage image={post.author.photo} fallback={{ file: 'jenna-square.jpg', alt: '' }} alt="" className={styles.avatar} sizes="40px" />
                {post.author.name}
              </span>
            ) : null}
          </div>
        </Link>
      </div>
    </section>
  )
}

function PostCard({ post, index, settings }: { post: PostSummary; index: number; settings: BlogSettings | null }) {
  if (!post.slug) return null
  return (
    <Link href={`/blog/${post.slug}`} className={styles.postCard} style={{ animation: `pageIn .5s ${index * 60}ms var(--ease) both` }}>
      <div className={`${styles.postCover} ${TONES[index % 3]}`} aria-hidden="true">
        {post.number ? <span className={styles.coverNo}>NO. {post.number}</span> : <span />}
        <span className={styles.coverLine}>{post.coverLine}</span>
      </div>
      <span className={`eyebrow ${styles.cardEyebrow}`}>
        {topicLabel(clean(post.topic), settings)} · {readTime(post.readingTime, settings)}
      </span>
      <span className={styles.cardTitle}>{post.title}</span>
      {post.excerpt ? <span className={`muted ${styles.cardExcerpt}`}>{post.excerpt}</span> : null}
    </Link>
  )
}
