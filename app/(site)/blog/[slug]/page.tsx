import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SpinningReel } from '@/components/brand'
import styles from '@/components/features/blog/blog.module.css'
import { ReadingProgress, ShareButtons } from '@/components/features/blog/PostTools'
import { readTime, TONES, topicLabel } from '@/components/features/blog/topics'
import { AccentText } from '@/components/ui/AccentText'
import { CtaLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { SanityImage } from '@/components/ui/SanityImage'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { BLOG_SETTINGS_QUERY, POST_QUERY, POST_SLUGS_QUERY, POSTS_QUERY } from '@/lib/sanity/queries'
import type { BlogSettings, Post, PostSummary } from '@/lib/sanity/types'
import { absoluteUrl, blogPostingLd, breadcrumbLd, buildMetadata } from '@/lib/seo'
import { clean, plainText } from '@/lib/text'

type Params = { params: Promise<{ slug: string }> }

const getPost = (slug: string) => sanityFetch<Post | null>({ query: POST_QUERY, params: { slug }, tags: ['post', 'teamMember'] })
const getPosts = () => sanityFetch<PostSummary[] | null>({ query: POSTS_QUERY, tags: ['post', 'teamMember'] })
const getBlog = () => sanityFetch<BlogSettings | null>({ query: BLOG_SETTINGS_QUERY, tags: ['blogSettings'] })

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({ query: POST_SLUGS_QUERY, tags: ['post'] })
    return (slugs ?? []).filter(Boolean).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [post, { settings }] = await Promise.all([getPost(slug), getLayoutData()])
  if (!post) return {}
  return buildMetadata({
    seo: post.seo,
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    settings,
    type: 'article',
    publishedTime: post.publishedAt,
  })
}

function formatDate(iso?: string) {
  if (!iso) return '[Publish date]'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d)
}

/** A blog post: reading progress, cover, share buttons, body, assessment CTA and three related posts. */
export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const [post, posts, blog, { settings }] = await Promise.all([getPost(slug), getPosts(), getBlog(), getLayoutData()])
  if (!post) notFound()

  const all = posts ?? []
  const i = Math.max(0, all.findIndex((p) => p._id === post._id || p.slug === slug))
  const n = all.length
  const related =
    n > 1
      ? Array.from(new Set([(i + 1) % n, (i + 3) % n, (i + 5) % n]))
          .filter((r) => r !== i)
          .slice(0, 3)
          .map((r) => all[r])
          .filter((p) => p?.slug)
      : []

  const topic = topicLabel(clean(post.topic), blog)
  const featured = !!post.featured
  const toneClass = featured ? styles.toneOrange : TONES[i % 3]
  const path = `/blog/${slug}`
  const url = absoluteUrl(path)
  const siteName = plainText(settings?.title) || 'Reel Good News'
  const authorTitle = post.author?.title
    ? plainText(post.author.title).includes(siteName)
      ? post.author.title
      : `${post.author.title}, ${siteName}`
    : siteName
  const sources = post.sources?.trim()

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          blogPostingLd({ title: post.title ?? '', description: post.excerpt, path, publishedAt: post.publishedAt, author: post.author?.name }),
          breadcrumbLd([
            { name: 'Blog', path: '/blog' },
            { name: post.title ?? '', path },
          ]),
        ]}
      />

      <section className="paper">
        <div className={`wrap narrow stack g20 ${styles.postHeader}`}>
          <nav className="crumb fade-up" aria-label="Breadcrumb">
            <Link href="/blog">Blog</Link> / <span className="here">{topic}</span>
          </nav>
          <span className="eyebrow fade-up">
            {topic} · {readTime(post.readingTime, blog)}
          </span>
          <h1 className={`h1 fade-up ${styles.postTitle}`}>{post.title}</h1>
          {post.author?.name ? (
            <div className={`row g12 fade-up ${styles.byline}`}>
              <SanityImage image={post.author.photo} fallback={{ file: 'jenna-square.jpg', alt: '' }} alt="" className={styles.bylineAvatar} sizes="52px" />
              <span className={styles.bylineText}>
                <strong>{post.author.name}</strong>
                <br />
                <span className={`muted ${styles.bylineMeta}`}>
                  {authorTitle} · {formatDate(post.publishedAt)}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="paper">
        <div className={`wrap ${styles.coverWrap}`}>
          <div className={`fade-up ${styles.cover} ${toneClass}`} aria-hidden="true">
            <SpinningReel
              disc={featured ? '#091527' : '#F23300'}
              hole={featured ? '#F23300' : '#FAF7F2'}
              seconds={60}
              className={styles.coverReel}
            />
            <span className={styles.coverText}>{post.coverLine ?? post.title}</span>
          </div>
        </div>
      </section>

      <section className={`band ${styles.bodyBand}`}>
        <div className={`wrap row g64 ${styles.bodyWrap}`}>
          <ShareButtons url={url} title={plainText(post.title)} label={blog?.shareLabel} />
          <article className="grow article">
            <RichText value={post.body} decisionRuleLabel={blog?.decisionRuleLabel ?? 'The decision rule'} />
            {sources ? <p className={styles.sources}>{/^sources?:/i.test(sources) ? sources : `Sources: ${sources}`}</p> : null}
          </article>
        </div>
      </section>

      <section className="band paper">
        <div className={`wrap stack g32 ${styles.afterWrap}`}>
          {blog?.assessmentCta?.text || blog?.assessmentCta?.cta ? (
            <div className={`row g24 lavb ${styles.ctaBand}`}>
              {blog.assessmentCta.text ? <span className={styles.ctaText}>{blog.assessmentCta.text}</span> : null}
              <CtaLink cta={blog.assessmentCta.cta} fallbackStyle="dark" arrow />
            </div>
          ) : null}
          {related.length ? (
            <>
              <AccentText as="h2" text={blog?.keepReadingHeadline ?? 'Keep reading.'} className="h3" />
              <div className="grid" style={{ ['--min' as string]: '260px', ['--gap' as string]: '20px' }}>
                {related.map((r) => (
                  <Link key={r._id} href={`/blog/${r.slug}`} className={`card lift ${styles.relCard}`}>
                    <span className={`eyebrow ${styles.cardEyebrow}`}>{topicLabel(clean(r.topic), blog)}</span>
                    <strong className={styles.relTitle}>{r.title}</strong>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}
