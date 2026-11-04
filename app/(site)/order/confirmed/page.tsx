import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OrderFromSearch, OrderView } from '@/components/features/order/OrderView'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getLayoutData } from '@/lib/sanity/layout'
import { ORDER_QUERY } from '@/lib/sanity/queries'
import type { OrderConfirmation } from '@/lib/sanity/types'
import { buildMetadata } from '@/lib/seo'

const getOrderCopy = () => sanityFetch<OrderConfirmation | null>({ query: ORDER_QUERY, tags: ['orderConfirmation', 'course'] })

export async function generateMetadata(): Promise<Metadata> {
  const [data, layout] = await Promise.all([getOrderCopy(), getLayoutData()])
  return buildMetadata({
    seo: { ...data?.seo, noIndex: true },
    title: data?.seo?.metaTitle ?? 'Order confirmed',
    path: '/order/confirmed',
    settings: layout.settings,
  })
}

/**
 * Order confirmation. The shell is static; the order details come from the
 * query string in the browser. Phase 6: Stripe's success URL lands here with
 * ?session_id=..., read server-side to show the real order.
 */
export default async function OrderConfirmedPage() {
  const data = await getOrderCopy()
  return (
    <Suspense fallback={<OrderView data={data} params={null} />}>
      <OrderFromSearch data={data} />
    </Suspense>
  )
}
