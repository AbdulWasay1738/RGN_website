import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'
import { client } from './client'
import { isOffline, readToken } from './env'
import { buildLinkMap, LINK_TARGETS_QUERY, resolveLinks, type LinkTarget } from './links'

/** Every cached Sanity fetch carries this tag, so the publish webhook can refresh the whole site at once. */
export const GLOBAL_TAG = 'sanity'

/** Time-based fallback: content refreshes within a minute even if the webhook is missing. */
export const REVALIDATE_SECONDS = 60

type FetchArgs = {
  query: string
  params?: Record<string, unknown>
  /** Document types this query reads, for example ['course', 'faq']. */
  tags?: string[]
}

export const isDraftMode = cache(async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    // Outside a request (for example generateStaticParams or sitemap at build time).
    return false
  }
})

/* ---------------- offline mode (local development and tests) ---------------- */

let offlineDocs: Promise<unknown[]> | null = null
function getOfflineDocs() {
  if (!offlineDocs) {
    offlineDocs = import('@/sanity/seed/documents').then((m) => m.buildDocuments({ mode: 'offline' }))
  }
  return offlineDocs
}

async function offlineFetch<T>(query: string, params: Record<string, unknown>): Promise<T> {
  const { parse, evaluate } = await import('groq-js')
  const dataset = await getOfflineDocs()
  const tree = parse(query, { params })
  const value = await evaluate(tree, { dataset, params })
  return (await value.get()) as T
}

/* ---------------- fetch ---------------- */

async function rawFetch<T>({ query, params = {}, tags = [] }: FetchArgs): Promise<T> {
  if (isOffline) return offlineFetch<T>(query, params)

  if (await isDraftMode()) {
    if (!readToken) {
      throw new Error('SANITY_API_READ_TOKEN is missing. Draft mode needs a Viewer token.')
    }
    return client
      .withConfig({ token: readToken, perspective: 'drafts', useCdn: false, stega: { enabled: true } })
      .fetch<T>(query, params, { cache: 'no-store' })
  }

  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [GLOBAL_TAG, ...tags] },
  })
}

const getLinkMap = cache(async () => {
  const targets = await rawFetch<LinkTarget[]>({ query: LINK_TARGETS_QUERY, tags: ['links'] })
  return buildLinkMap(targets ?? [])
})

/**
 * The single way the site reads content.
 * - Published content is cached and tagged; the publish webhook revalidates it.
 * - In draft mode (Studio preview) it reads drafts with click-to-edit markers.
 * - Every `link` object in the result gets a resolved `href`.
 */
export async function sanityFetch<T>(args: FetchArgs): Promise<T> {
  const [data, linkMap] = await Promise.all([rawFetch<T>(args), getLinkMap()])
  return resolveLinks(data, linkMap)
}
