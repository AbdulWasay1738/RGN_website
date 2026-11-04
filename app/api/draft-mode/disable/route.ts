/** Leaves draft mode and returns to the published site. */
import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  const back = request.nextUrl.searchParams.get('redirect')
  const target = back && back.startsWith('/') && !back.startsWith('//') ? back : '/'
  return NextResponse.redirect(new URL(target, request.url))
}
