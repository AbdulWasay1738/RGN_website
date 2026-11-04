import type { NextConfig } from 'next'

const isProductionDeploy = process.env.VERCEL_ENV === 'production'

type RedirectDoc = { from?: string; to?: string; permanent?: boolean }

/**
 * Redirects live in the Studio ("Redirects") so the old site's URLs can be
 * mapped at launch without a code change. They load at build time; publishing
 * a redirect triggers a redeploy through the Vercel deploy hook (see README).
 */
async function sanityRedirects() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-11-04'
  if (!projectId || process.env.SANITY_OFFLINE === '1') return []
  const query = encodeURIComponent('*[_type == "redirect" && defined(from) && defined(to)]{from, to, permanent}')
  try {
    const res = await fetch(
      `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`,
    )
    if (!res.ok) return []
    const { result } = (await res.json()) as { result: RedirectDoc[] }
    return result
      .filter((r) => r.from?.startsWith('/') && r.from !== r.to)
      .map((r) => ({
        source: r.from as string,
        destination: r.to as string,
        permanent: r.permanent !== false,
      }))
  } catch {
    return []
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async redirects() {
    return sanityRedirects()
  },
  async headers() {
    const headers = [
      {
        source: '/studio/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
    if (!isProductionDeploy) {
      headers.push({
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })
    }
    return headers
  },
}

export default nextConfig
