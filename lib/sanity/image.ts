import { createImageUrlBuilder } from '@sanity/image-url'
import { dataset, projectId } from './env'
import type { SanityImageData } from './types'

const builder = createImageUrlBuilder({ projectId, dataset })

/** Static files bundled with the site (public/img). Offline mode stores refs as `local:<file>`. */
export const LOCAL_IMAGES: Record<string, { width: number; height: number }> = {
  'jenna-cutout.webp': { width: 640, height: 1337 },
  'jenna-portrait.jpg': { width: 1000, height: 1400 },
  'jenna-square.jpg': { width: 800, height: 800 },
  'logo.png': { width: 1200, height: 296 },
  'logo-invert.png': { width: 1200, height: 296 },
  'logo-stack.png': { width: 900, height: 484 },
  'promo-hooked.webp': { width: 900, height: 900 },
  'promo-acceleration.webp': { width: 900, height: 900 },
  'r-badge.png': { width: 300, height: 300 },
  'texture-street.jpg': { width: 1024, height: 1024 },
}

export type ResolvedImage = {
  src: string
  width: number
  height: number
  alt: string
  /** True for Sanity CDN images, which use the Sanity loader */
  isSanity: boolean
  /** CSS object-position from the editor's hotspot */
  objectPosition?: string
}

function dimensionsFromRef(ref: string) {
  // image-<hash>-<w>x<h>-<ext>
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref)
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null
}

/**
 * Turns a stored image into something next/image can render.
 * Falls back to a bundled default (for example the founder cutout) when the
 * editor has not set an image, so the design never shows a hole.
 */
export function resolveImage(
  image: SanityImageData | undefined | null,
  fallback?: { file: keyof typeof LOCAL_IMAGES | string; alt: string },
): ResolvedImage | null {
  const ref = image?.asset?._ref
  if (ref?.startsWith('local:')) {
    const file = ref.slice('local:'.length)
    const dims = LOCAL_IMAGES[file] ?? { width: 1000, height: 1000 }
    return { src: `/img/${file}`, ...dims, alt: image?.alt ?? fallback?.alt ?? '', isSanity: false }
  }
  if (ref) {
    const dims = dimensionsFromRef(ref) ?? { width: 1200, height: 1200 }
    const hotspot = image?.hotspot
    return {
      src: builder.image(image).auto('format').url(),
      ...dims,
      alt: image?.alt ?? '',
      isSanity: true,
      objectPosition: hotspot ? `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%` : undefined,
    }
  }
  if (fallback) {
    const dims = LOCAL_IMAGES[fallback.file] ?? { width: 1000, height: 1000 }
    return { src: `/img/${fallback.file}`, ...dims, alt: fallback.alt, isSanity: false }
  }
  return null
}

/** Absolute URL for Open Graph and JSON-LD. */
export function imageUrlFor(image: SanityImageData | undefined | null, width = 1200, height?: number) {
  const ref = image?.asset?._ref
  if (!ref) return undefined
  if (ref.startsWith('local:')) return `/img/${ref.slice('local:'.length)}`
  let b = builder.image(image).width(width).fit('crop').auto('format')
  if (height) b = b.height(height)
  return b.url()
}

/** next/image loader for Sanity CDN images: crops and hotspots are already in the URL. */
export function sanityLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('fit', 'max')
  url.searchParams.set('auto', 'format')
  return url.toString()
}
