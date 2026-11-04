/**
 * Turns on draft mode for the Presentation tool. Sanity checks a short-lived
 * secret before the preview cookie is set, so only Studio users can see drafts.
 */
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/lib/sanity/client'
import { readToken } from '@/lib/sanity/env'

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: readToken }),
})
