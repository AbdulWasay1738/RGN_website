import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * Production is indexable (except the Studio and API routes).
 * Preview deployments and local builds block every crawler.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== 'production') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
