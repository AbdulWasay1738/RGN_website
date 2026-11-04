import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BlogIndex, BlogIndexView } from '@/components/features/blog/BlogIndex'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { BLOG_SETTINGS_QUERY, POSTS_QUERY } from '@/lib/sanity/queries'
import type { BlogSettings, PostSummary } from '@/lib/sanity/types'
import { buildMetadata } from '@/lib/seo'
import { plainText } from '@/lib/text'

const getSettings = () => sanityFetch<BlogSettings | null>({ query: BLOG_SETTINGS_QUERY, tags: ['blogSettings'] })
const getPosts = () => sanityFetch<PostSummary[] | null>({ query: POSTS_QUERY, tags: ['post', 'teamMember'] })

export async function generateMetadata(): Promise<Metadata> {
  const [blog, { settings }] = await Promise.all([getSettings(), getLayoutData()])
  return buildMetadata({ seo: blog?.seo, title: plainText(blog?.headline) || 'Blog', path: '/blog', settings })
}

/**
 * Blog index. The page stays static: the topic filter (?topic=) runs in the
 * browser, and the static HTML lists every post.
 */
export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()])
  const props = { settings, posts: posts ?? [] }
  return (
    <Suspense fallback={<BlogIndexView {...props} topic="ALL" />}>
      <BlogIndex {...props} />
    </Suspense>
  )
}
