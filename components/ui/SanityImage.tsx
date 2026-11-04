'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'
import { resolveImage, sanityLoader, type ResolvedImage } from '@/lib/sanity/image'
import type { SanityImageData } from '@/lib/sanity/types'

type Props = {
  image?: SanityImageData | null
  /** Bundled default used when the editor has not set an image (file name in public/img) */
  fallback?: { file: string; alt: string }
  /** Overrides the stored alt text (pass "" for decorative images) */
  alt?: string
  sizes?: string
  priority?: boolean
  className?: string
  style?: CSSProperties
  /** Fill the parent box (parent must be positioned) instead of intrinsic size */
  fill?: boolean
}

/**
 * Every image an editor can change goes through here: Sanity CDN images get
 * the Sanity loader (crop, hotspot, modern formats), bundled defaults use the
 * Next.js optimiser.
 */
export function SanityImage({ image, fallback, alt, sizes, priority, className, style, fill }: Props) {
  const img = resolveImage(image, fallback)
  if (!img) return null
  return <ResolvedImg img={img} alt={alt} sizes={sizes} priority={priority} className={className} style={style} fill={fill} />
}

function ResolvedImg({ img, alt, sizes, priority, className, style, fill }: Omit<Props, 'image' | 'fallback'> & { img: ResolvedImage }) {
  const common = {
    src: img.src,
    alt: alt ?? img.alt,
    sizes,
    priority,
    className,
    style: img.objectPosition ? { objectPosition: img.objectPosition, ...style } : style,
    ...(img.isSanity ? { loader: sanityLoader } : {}),
  }
  if (fill) return <Image {...common} fill alt={common.alt} />
  return <Image {...common} width={img.width} height={img.height} alt={common.alt} />
}
