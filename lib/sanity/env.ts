/** Sanity connection settings. Project and dataset come from env vars so the project can move to the client's account without a code change. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-11-04'
export const studioUrl = '/studio'

/** Local development and tests only: render from content-seed/ with no Sanity connection. */
export const isOffline =
  process.env.SANITY_OFFLINE === '1' && process.env.VERCEL_ENV !== 'production'

export const readToken = process.env.SANITY_API_READ_TOKEN || ''

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://reelgoodnews.com').replace(/\/$/, '')
