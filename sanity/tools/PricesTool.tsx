import { AddIcon } from '@sanity/icons/Add'
import { TagIcon } from '@sanity/icons/Tag'
import { Badge, Box, Button, Card, Checkbox, Container, Flex, Grid, Heading, Spinner, Stack, Text, TextInput } from '@sanity/ui'
import { useToast } from '@sanity/ui/toast'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { easternLabel, fromEasternInput, toEasternInput } from '../../lib/eastern'
import { saleStatus } from '../schemaTypes/documents/sale'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

type Kind = 'money' | 'text' | 'date' | 'bool'
/** One editable value on the screen, bound to a field of a document. */
type Field = { key: string; base: string; path: string; label: string; kind: Kind; optional?: boolean; hint?: string }
type Versions = { published?: Any; draft?: Any }

const QUERY = `{
  "docs": *[_type in ["course", "workshop", "bundle", "book", "salesCalendar"]]{
    _id, _type, title, regularPrice, introPrice, inBundle, earlyBirdPrice, standardPrice, price, compareAt, compareAtIntro,
    introEndsAt, earlyBirdEndsAt, coursesOpenAt, workshopAt, orderRank, order
  },
  "sales": *[_type == "sale"] | order(startsAt desc){ _id, title, startsAt, endsAt, enabled, "count": count(items) }
}`

const baseId = (id: string) => id.replace(/^drafts\./, '')
const STATUS_TONE: Record<string, 'positive' | 'primary' | 'caution' | 'default'> = {
  'Live now': 'positive',
  Scheduled: 'primary',
  'Turned off': 'caution',
  'Dates missing': 'caution',
  Ended: 'default',
}

function toInput(kind: Kind, value: unknown) {
  if (kind === 'bool') return value === true ? 'true' : 'false'
  if (kind === 'date') return toEasternInput(value as string)
  return value === undefined || value === null ? '' : String(value)
}

/** The value to save, or an error message. */
function parse(field: Field, raw: string): { value?: unknown; unset?: true; error?: string } {
  const v = raw.trim()
  if (field.kind === 'bool') return { value: raw === 'true' }
  if (!v) return field.optional ? { unset: true } : { error: 'Required' }
  if (field.kind === 'money') {
    const n = Number(v.replace(/[$,]/g, ''))
    if (!Number.isFinite(n) || n < 0) return { error: 'Enter a price in dollars, for example 199' }
    return { value: Math.round(n * 100) / 100 }
  }
  if (field.kind === 'date') {
    const iso = fromEasternInput(v)
    return iso ? { value: iso } : { error: 'Pick a date and time' }
  }
  return { value: v }
}

/**
 * "Prices & sales": every price and every price-switch date on one screen,
 * saved and published in one go, plus the list of scheduled sales.
 */
export function PricesTool() {
  const client = useClient({ apiVersion: '2026-11-04' })
  const router = useRouter()
  const toast = useToast()
  const [docs, setDocs] = useState<Map<string, Versions> | null>(null)
  const [sales, setSales] = useState<Any[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  /** Puts freshly fetched documents on screen and clears unsaved edits. */
  const apply = useCallback((res: Any) => {
    const map = new Map<string, Versions>()
    for (const d of res.docs as Any[]) {
      const entry = map.get(baseId(d._id)) ?? {}
      if (d._id.startsWith('drafts.')) entry.draft = d
      else entry.published = d
      map.set(baseId(d._id), entry)
    }
    // A sale with unpublished changes shows its draft, flagged, because only published sales run.
    const byId = new Map<string, Versions>()
    for (const s of res.sales as Any[]) {
      const entry = byId.get(baseId(s._id)) ?? {}
      if (s._id.startsWith('drafts.')) entry.draft = s
      else entry.published = s
      byId.set(baseId(s._id), entry)
    }
    setSales([...byId.values()].map((v) => ({ ...(v.draft ?? v.published), published: !!v.published, hasDraft: !!v.draft && !!v.published })))
    setDocs(map)
    setValues({})
  }, [])

  useEffect(() => {
    client
      .fetch(QUERY)
      .then(apply)
      .catch((err: Error) => toast.push({ status: 'error', title: 'Could not load the prices', description: err.message }))
  }, [client, apply, toast])

  /** What the editor sees: the draft when there is one, otherwise the published version. */
  const current = useCallback((base: string) => {
    const v = docs?.get(base)
    return v?.draft ?? v?.published
  }, [docs])

  const courses = useMemo(() => {
    if (!docs) return []
    return [...docs.entries()]
      .filter(([, v]) => (v.draft ?? v.published)?._type === 'course')
      .map(([id, v]) => ({ id, doc: v.draft ?? v.published, published: !!v.published }))
      .sort((a, b) => String(a.doc.orderRank ?? a.doc.order ?? '').localeCompare(String(b.doc.orderRank ?? b.doc.order ?? '')))
  }, [docs])

  const fields = useMemo<Field[]>(() => {
    const out: Field[] = []
    for (const c of courses) {
      out.push({ key: `${c.id}.regularPrice`, base: c.id, path: 'regularPrice', label: 'Regular price', kind: 'money' })
      out.push({ key: `${c.id}.introPrice`, base: c.id, path: 'introPrice', label: 'Intro price', kind: 'money', optional: true, hint: 'Until intro prices end. Empty: none.' })
      out.push({ key: `${c.id}.inBundle`, base: c.id, path: 'inBundle', label: 'Part of the Content Machine bundle', kind: 'bool' })
    }
    if (current('workshop')) {
      out.push({ key: 'workshop.earlyBirdPrice', base: 'workshop', path: 'earlyBirdPrice', label: 'Early-bird price', kind: 'money' })
      out.push({ key: 'workshop.standardPrice', base: 'workshop', path: 'standardPrice', label: 'Standard price', kind: 'money' })
    }
    if (current('bundle')) {
      out.push({ key: 'bundle.price', base: 'bundle', path: 'price', label: 'Regular price', kind: 'money' })
      out.push({ key: 'bundle.introPrice', base: 'bundle', path: 'introPrice', label: 'Intro price', kind: 'money', optional: true, hint: 'Until intro prices end. Empty: none.' })
    }
    if (current('book')) out.push({ key: 'book.price', base: 'book', path: 'price', label: 'Price (as shown)', kind: 'text', optional: true, hint: 'For example "$24".' })
    if (current('salesCalendar')) {
      out.push({ key: 'salesCalendar.introEndsAt', base: 'salesCalendar', path: 'introEndsAt', label: 'Intro prices end', kind: 'date', hint: 'Courses and bundle switch to regular prices. "Through January 15" = January 16, 12:00 AM.' })
      out.push({ key: 'salesCalendar.coursesOpenAt', base: 'salesCalendar', path: 'coursesOpenAt', label: 'Courses open', kind: 'date', hint: '"Opens Dec 1" becomes "On demand now".' })
      out.push({ key: 'salesCalendar.earlyBirdEndsAt', base: 'salesCalendar', path: 'earlyBirdEndsAt', label: 'Workshop early-bird ends', kind: 'date', hint: 'The ticket switches to the standard price.' })
      out.push({ key: 'salesCalendar.workshopAt', base: 'salesCalendar', path: 'workshopAt', label: 'Workshop starts', kind: 'date', hint: 'Countdowns end here; afterwards the workshop shows as happened.' })
    }
    return out
  }, [courses, current])

  const original = useMemo(() => {
    const o: Record<string, string> = {}
    for (const f of fields) o[f.key] = toInput(f.kind, current(f.base)?.[f.path])
    return o
  }, [fields, current])

  const valueOf = (key: string) => values[key] ?? original[key] ?? ''
  const changed = fields.filter((f) => valueOf(f.key) !== original[f.key])
  const errors = Object.fromEntries(changed.map((f) => [f.key, parse(f, valueOf(f.key)).error]).filter(([, e]) => e))
  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }))

  // The bundle's "bought separately" totals follow the ticked courses.
  const bundleTotals = useMemo(() => {
    let regular = 0
    let intro = 0
    for (const c of courses) {
      if (valueOf(`${c.id}.inBundle`) !== 'true') continue
      const r = Number(valueOf(`${c.id}.regularPrice`)) || 0
      const i = valueOf(`${c.id}.introPrice`) === '' ? r : Number(valueOf(`${c.id}.introPrice`)) || 0
      regular += r
      intro += i
    }
    return { regular, intro }
    // valueOf reads `values` and `original`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, values, original])

  const save = async () => {
    if (!docs || Object.keys(errors).length) return
    const patches = new Map<string, { set: Record<string, unknown>; unset: string[] }>()
    const patchFor = (base: string) => patches.get(base) ?? patches.set(base, { set: {}, unset: [] }).get(base)!
    for (const f of changed) {
      const r = parse(f, valueOf(f.key))
      if (r.unset) patchFor(f.base).unset.push(f.path)
      else patchFor(f.base).set[f.path] = r.value
    }
    const bundle = current('bundle')
    if (bundle && bundleTotals.regular) {
      if (bundle.compareAt !== bundleTotals.regular) patchFor('bundle').set.compareAt = bundleTotals.regular
      if (bundle.compareAtIntro !== bundleTotals.intro) patchFor('bundle').set.compareAtIntro = bundleTotals.intro
    }
    setSaving(true)
    try {
      const tx = client.transaction()
      for (const [base, p] of patches) {
        const v = docs.get(base)
        // Patch the live version and any open draft, so publishing the draft later keeps the new price.
        for (const doc of [v?.published, v?.draft].filter(Boolean)) tx.patch(doc._id, { set: p.set, unset: p.unset })
      }
      await tx.commit({ visibility: 'sync' })
      toast.push({ status: 'success', title: 'Saved and published', description: 'The website shows the new prices within a few seconds.' })
      apply(await client.fetch(QUERY))
    } catch (err) {
      toast.push({ status: 'error', title: 'Not saved', description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  if (!docs) {
    return (
      <Flex align="center" justify="center" height="fill">
        <Spinner muted />
      </Flex>
    )
  }

  const money = (key: string) => {
    const f = fields.find((x) => x.key === key)
    if (!f) return null
    return (
      <Stack gap={2}>
        <Text size={1} weight="semibold">
          {f.label}
        </Text>
        <TextInput
          inputMode="decimal"
          prefix={<Box padding={2}><Text size={1} muted>$</Text></Box>}
          value={valueOf(key)}
          onChange={(e) => set(key, e.currentTarget.value)}
          customValidity={errors[key]}
          aria-label={f.label}
        />
        {errors[key] ? (
          <Text size={1} style={{ color: 'var(--card-badge-critical-fg-color, #c00)' }}>
            {errors[key]}
          </Text>
        ) : f.hint ? (
          <Text size={1} muted>
            {f.hint}
          </Text>
        ) : null}
      </Stack>
    )
  }

  const date = (key: string) => {
    const f = fields.find((x) => x.key === key)
    if (!f) return null
    return (
      <Stack gap={2}>
        <Text size={1} weight="semibold">
          {f.label} (Eastern Time)
        </Text>
        <TextInput type="datetime-local" value={valueOf(key)} onChange={(e) => set(key, e.currentTarget.value)} customValidity={errors[key]} aria-label={f.label} />
        <Text size={1} muted>
          {errors[key] ?? f.hint}
        </Text>
      </Stack>
    )
  }

  const section = (title: string, intro: ReactNode, body: ReactNode, action?: ReactNode) => (
    <Card padding={[3, 4]} radius={3} shadow={1}>
      <Stack gap={4}>
        <Flex align="center" gap={3} wrap="wrap">
          <Box flex={1}>
            <Stack gap={2}>
              <Heading size={1}>{title}</Heading>
              {intro ? (
                <Text size={1} muted>
                  {intro}
                </Text>
              ) : null}
            </Stack>
          </Box>
          {action}
        </Flex>
        {body}
      </Stack>
    </Card>
  )

  return (
    <Card height="fill" overflow="auto" tone="transparent">
      <Container width={2} padding={[3, 4, 5]} paddingBottom={[6, 7]}>
        <Stack gap={5}>
          <Stack gap={3}>
            <Heading size={3}>Prices and sales</Heading>
            <Text muted>
              Change any price or date, then select <strong>Save and publish</strong>. The website updates within a few seconds. For a limited-time offer like Black
              Friday, create a sale below instead of changing the prices.
            </Text>
          </Stack>

          {section(
            'Courses',
            'Each course has a regular price and an optional intro price. Tick the courses that belong to the Content Machine bundle.',
            <Stack gap={4}>
              {courses.map((c) => (
                <Card key={c.id} padding={3} radius={2} border>
                  <Stack gap={3}>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Text weight="semibold">{c.doc.title || 'Untitled course'}</Text>
                      {!c.published ? <Badge tone="caution">Not published yet</Badge> : null}
                    </Flex>
                    <Grid gridTemplateColumns={[1, 2]} gap={3}>
                      {money(`${c.id}.regularPrice`)}
                      {money(`${c.id}.introPrice`)}
                    </Grid>
                    <Flex as="label" align="center" gap={2}>
                      <Checkbox
                        checked={valueOf(`${c.id}.inBundle`) === 'true'}
                        onChange={(e) => set(`${c.id}.inBundle`, e.currentTarget.checked ? 'true' : 'false')}
                      />
                      <Text size={1}>Part of the Content Machine bundle</Text>
                    </Flex>
                  </Stack>
                </Card>
              ))}
            </Stack>,
            <Button icon={AddIcon} text="Add a course" mode="ghost" onClick={() => router.navigateIntent('create', { type: 'course' })} />,
          )}

          {current('bundle')
            ? section(
                'Content Machine bundle',
                `Bought separately, the ticked courses cost $${bundleTotals.regular} at regular prices and $${bundleTotals.intro} at intro prices. These totals are worked out for you.`,
                <Grid gridTemplateColumns={[1, 2]} gap={3}>
                  {money('bundle.price')}
                  {money('bundle.introPrice')}
                </Grid>,
              )
            : null}

          {current('workshop')
            ? section(
                'Live workshop tickets',
                'The early-bird price applies until the early-bird date below, then the standard price.',
                <Grid gridTemplateColumns={[1, 2]} gap={3}>
                  {money('workshop.earlyBirdPrice')}
                  {money('workshop.standardPrice')}
                </Grid>,
              )
            : null}

          {current('book')
            ? section(
                'Book',
                'Shown on the book page as typed.',
                <Stack gap={2}>
                  <TextInput value={valueOf('book.price')} onChange={(e) => set('book.price', e.currentTarget.value)} aria-label="Book price" />
                </Stack>,
              )
            : null}

          {current('salesCalendar')
            ? section(
                'When prices switch',
                'Prices change on the website by themselves at these moments.',
                <Grid gridTemplateColumns={[1, 2]} gap={4}>
                  {date('salesCalendar.introEndsAt')}
                  {date('salesCalendar.earlyBirdEndsAt')}
                  {date('salesCalendar.coursesOpenAt')}
                  {date('salesCalendar.workshopAt')}
                </Grid>,
              )
            : null}

          {section(
            'Sales',
            'A sale gives chosen courses, the workshop or the bundle a lower price between two dates, with its own banner. It starts and stops by itself once published.',
            sales.length ? (
              <Stack gap={2}>
                {sales.map((s) => {
                  const status = saleStatus(s.startsAt, s.endsAt, s.enabled)
                  return (
                    <Card key={s._id} padding={3} radius={2} border>
                      <Flex align="center" gap={3} wrap="wrap">
                        <Box flex={1}>
                          <Stack gap={2}>
                            <Flex align="center" gap={2} wrap="wrap">
                              <Text weight="semibold">{s.title || 'New sale'}</Text>
                              <Badge tone={STATUS_TONE[status] ?? 'default'}>{status}</Badge>
                              {!s.published ? <Badge tone="caution">Not published: it will not run</Badge> : s.hasDraft ? <Badge tone="caution">Unpublished changes</Badge> : null}
                            </Flex>
                            <Text size={1} muted>
                              {easternLabel(s.startsAt) || 'No start'} to {easternLabel(s.endsAt) || 'no end'} · {s.count ?? 0} price{s.count === 1 ? '' : 's'}
                            </Text>
                          </Stack>
                        </Box>
                        <Button text="Edit" mode="ghost" onClick={() => router.navigateIntent('edit', { id: baseId(s._id), type: 'sale' })} />
                      </Flex>
                    </Card>
                  )
                })}
              </Stack>
            ) : (
              <Text size={1} muted>
                No sales yet.
              </Text>
            ),
            <Button icon={TagIcon} text="Run a new sale" tone="primary" onClick={() => router.navigateIntent('create', { type: 'sale' })} />,
          )}
        </Stack>
      </Container>

      <Card padding={3} shadow={2} style={{ position: 'sticky', bottom: 0 }}>
        <Container width={2}>
          <Flex align="center" gap={3} wrap="wrap">
            <Box flex={1}>
              <Text size={1} muted>
                {Object.keys(errors).length
                  ? 'Fix the highlighted values to save.'
                  : changed.length
                    ? `${changed.length} unsaved change${changed.length === 1 ? '' : 's'}`
                    : 'All prices are saved and live.'}
              </Text>
            </Box>
            <Button text="Undo changes" mode="bleed" disabled={!changed.length || saving} onClick={() => setValues({})} />
            <Button
              text={saving ? 'Saving…' : 'Save and publish'}
              tone="positive"
              disabled={!changed.length || saving || Object.keys(errors).length > 0}
              onClick={save}
            />
          </Flex>
        </Container>
      </Card>
    </Card>
  )
}
