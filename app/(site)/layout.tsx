import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/brand.css'
import { preload } from 'react-dom'
import { BrandFilters } from '@/components/brand'
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner'
import { CookieNotice } from '@/components/layout/CookieNotice'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { PreviewBridge } from '@/components/layout/PreviewBridge'
import { SceneTransition } from '@/components/layout/SceneTransition'
import { CheckoutProvider } from '@/components/providers/CheckoutProvider'
import { SalesCalendarProvider } from '@/components/providers/SalesCalendarProvider'
import { SiteProvider } from '@/components/providers/SiteProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { JsonLd } from '@/components/ui/JsonLd'
import { isDraftMode } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { organizationLd } from '@/lib/seo'

/**
 * The public site: announcement banner, sticky header, main content, footer,
 * cookie notice and the scene-change transition between routes.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [data, draft] = await Promise.all([getLayoutData(), isDraftMode()])
  // ?now= date simulation works on previews and in draft mode, never in production for visitors.
  const allowSimulation = draft || process.env.VERCEL_ENV !== 'production'
  // The street texture backs every navy band (often the largest paint): fetch it early.
  preload('/img/texture-street.webp', { as: 'image', fetchPriority: 'high' })

  return (
    <SiteProvider value={data}>
      <SalesCalendarProvider serverNow={new Date().toISOString()} calendar={data.calendar} allowSimulation={allowSimulation}>
        <ToastProvider>
          <CheckoutProvider>
            <BrandFilters />
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <AnnouncementBanner />
            <Header />
            <SceneTransition />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <CookieNotice />
            <JsonLd data={organizationLd(data.settings)} />
            {draft ? <PreviewBridge /> : null}
          </CheckoutProvider>
        </ToastProvider>
      </SalesCalendarProvider>
    </SiteProvider>
  )
}
