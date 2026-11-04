/**
 * Publish webhook from Sanity. Verifies the signature, then expires the cached
 * content so the change is live on the next visit (well within a minute).
 * Setup: docs/editor-guide.md, "For developers".
 */
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { GLOBAL_TAG } from '@/lib/sanity/fetch'

type WebhookPayload = { _type?: string; _id?: string }

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 })
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(request, secret, true)
    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }

    // Every cached query carries the global tag, so one publish refreshes all
    // pages that might show the change. The type tag is kept for finer use later.
    const tags = [GLOBAL_TAG]
    if (body?._type && typeof body._type === 'string') tags.push(body._type)
    for (const tag of tags) revalidateTag(tag, { expire: 0 })

    return NextResponse.json({ revalidated: true, tags, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
