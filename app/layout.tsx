import type { Metadata, Viewport } from 'next'
import { siteUrl } from '@/lib/sanity/env'
import { fontVariables } from './fonts'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Reel Good News', template: '%s · Reel Good News' },
  applicationName: 'Reel Good News',
  icons: { icon: '/favicon.png', apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#091527',
}

/** Root layout: fonts only. Global CSS loads in app/(site)/layout.tsx so it never touches the Studio. The public site layout lives in app/(site)/layout.tsx; the Studio has its own. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
