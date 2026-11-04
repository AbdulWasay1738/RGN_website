import type { JsonLdObject } from '@/lib/seo'

/** Structured data for search engines. Pass one object or several; nulls are skipped. */
export function JsonLd({ data }: { data: JsonLdObject | null | Array<JsonLdObject | null> }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean) as JsonLdObject[]
  if (!list.length) return null
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON; "<" is escaped so content cannot close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(list.length === 1 ? list[0] : list).replace(/</g, '\\u003c') }}
    />
  )
}
