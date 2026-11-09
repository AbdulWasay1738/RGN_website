/**
 * Checks the seed against the content contract and every site query, with no
 * Sanity connection: `npx tsx sanity/seed/verify-offline.ts`.
 *
 * - static checks on the documents (_keys, _types, references, images, em dashes)
 * - evaluates every query in lib/sanity/queries.ts with groq-js
 * - resolves links the way the site does and lists any that do not resolve
 * Exits non-zero on failure.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { evaluate, parse } from 'groq-js'
import * as Q from '@/lib/sanity/queries'
import { buildLinkMap, LINK_TARGETS_QUERY, resolveLinks, type LinkTarget } from '@/lib/sanity/links'
import { buildDocuments } from './documents'

const ROOT = path.resolve(__dirname, '../..')
const errors: string[] = []
const warnings: string[] = []
const fail = (msg: string) => errors.push(msg)
const warn = (msg: string) => warnings.push(msg)
const ok = (cond: unknown, msg: string) => {
  if (!cond) fail(msg)
}

type Json = Record<string, unknown>

/* ---------------- contract: known _type values from types.ts ---------------- */

const typesSource = readFileSync(path.join(ROOT, 'lib/sanity/types.ts'), 'utf8')
const contractTypes = new Set([...typesSource.matchAll(/_type: '([A-Za-z]+)'/g)].map((m) => m[1]))
const SINGLETON_TYPES = [
  'siteSettings',
  'announcementBanner',
  'salesCalendar',
  'courseTemplate',
  'orderConfirmation',
  'blogSettings',
  'growthCall',
]
SINGLETON_TYPES.forEach((t) => contractTypes.add(t))
/** Section `_type`s declared by the members of the `Section` union in types.ts. */
const sectionUnion = /export type Section =([\s\S]*?)\r?\n\r?\n/.exec(typesSource)?.[1] ?? ''
const SECTION_TYPES = [...sectionUnion.matchAll(/\| (\w+)/g)]
  .map((m) => new RegExp(`export type ${m[1]} = SectionBase & \\{\\s*_type: '(\\w+)'`).exec(typesSource)?.[1])
  .filter((t): t is string => !!t)
if (SECTION_TYPES.length < 20) fail(`could not read the Section union from types.ts (found ${SECTION_TYPES.length})`)

/* ---------------- static checks ---------------- */

const docs = buildDocuments({ mode: 'offline' })
const ids = new Set<string>()
for (const d of docs) {
  if (ids.has(d._id)) fail(`duplicate _id ${d._id}`)
  ids.add(d._id)
  if (!contractTypes.has(d._type)) fail(`${d._id}: unknown document _type "${d._type}"`)
}

const imagesDir = path.join(ROOT, 'public/img')
let imageCount = 0
let refCount = 0

function walkStatic(value: unknown, where: string, parentKey: string) {
  if (Array.isArray(value)) {
    const keys = new Set<string>()
    value.forEach((item, i) => {
      if (item && typeof item === 'object') {
        const o = item as Json
        if (typeof o._key !== 'string' || !o._key) fail(`${where}.${parentKey}[${i}]: missing _key`)
        else if (keys.has(o._key)) fail(`${where}.${parentKey}[${i}]: duplicate _key ${o._key}`)
        else keys.add(o._key)
        if (typeof o._type !== 'string') fail(`${where}.${parentKey}[${i}]: missing _type`)
      }
      walkStatic(item, `${where}.${parentKey}[${i}]`, String(i))
    })
    return
  }
  if (!value || typeof value !== 'object') return
  const o = value as Json
  if (parentKey === 'sections' && typeof o._type === 'string' && !contractTypes.has(o._type)) {
    fail(`${where}: unknown section _type "${o._type}"`)
  }
  if (o._type === 'reference') {
    refCount++
    const r = String(o._ref)
    if (r.startsWith('local:')) {
      imageCount++
      const file = r.slice('local:'.length)
      if (!existsSync(path.join(imagesDir, file))) fail(`${where}: image file missing public/img/${file}`)
    } else if (!ids.has(r)) {
      fail(`${where}: reference to missing document "${r}"`)
    }
  }
  if (o.asset && typeof o.asset === 'object') {
    const ar = String((o.asset as Json)._ref ?? '')
    if (!ar.startsWith('local:')) fail(`${where}: image asset ref is not local:<file> (${ar})`)
    if (o._type === 'imageWithAlt' && !o.alt) fail(`${where}: image without alt text`)
  }
  for (const [k, v] of Object.entries(o)) walkStatic(v, `${where}.${k}`, k)
}
for (const d of docs) walkStatic(d, d._id, '')

const serialized = JSON.stringify(docs)
if (serialized.includes('—')) fail('an em dash appears in the seed')
for (const d of docs.filter((x) => x._type === 'page' && x._id === 'page-careers')) {
  if (/\btrust\b/i.test(JSON.stringify(d))) fail('the word "trust" appears on the Careers page')
}
if (/bonus video/i.test(serialized)) fail('the seed mentions the bonus video')

/* ---------------- query evaluation ---------------- */

async function run<T = unknown>(name: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  try {
    const tree = parse(query, { params })
    const value = await evaluate(tree, { dataset: docs as unknown as Json[], params })
    return (await value.get()) as T
  } catch (e) {
    fail(`${name}: query failed (${(e as Error).message})`)
    return null as T
  }
}

function collectLinks(value: unknown, where: string, out: Array<{ where: string; link: Json; inMarkDefs: boolean }>, inMarkDefs = false) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectLinks(v, `${where}[${i}]`, out, inMarkDefs))
    return
  }
  if (!value || typeof value !== 'object') return
  const o = value as Json
  if (o._type === 'link') out.push({ where, link: o, inMarkDefs })
  for (const [k, v] of Object.entries(o)) collectLinks(v, `${where}.${k}`, out, inMarkDefs || k === 'markDefs')
}

const unresolved: string[] = []
const lostMarkDefs: string[] = []
let resolvedCount = 0

async function check<T>(name: string, query: string, params: Record<string, unknown>, linkMap: Map<string, string | undefined>, assert: (r: T) => void) {
  const raw = await run<T>(name, query, params)
  if (raw === null || raw === undefined) {
    fail(`${name} ${JSON.stringify(params)}: returned null`)
    return null
  }
  // mark-def links carry their own href; remember them before resolveLinks runs
  const before: Array<{ where: string; link: Json; inMarkDefs: boolean }> = []
  collectLinks(raw, name, before)
  const markDefHrefs = new Map(before.filter((l) => l.inMarkDefs).map((l) => [l.link, l.link.href]))
  const result = resolveLinks(raw, linkMap)
  const after: Array<{ where: string; link: Json; inMarkDefs: boolean }> = []
  collectLinks(result, name, after)
  for (const l of after) {
    if (l.link.href) {
      resolvedCount++
      continue
    }
    if (l.inMarkDefs) {
      if (markDefHrefs.get(l.link)) lostMarkDefs.push(`${l.where} (had href "${markDefHrefs.get(l.link)}")`)
      continue
    }
    const placeholder = l.link.kind === 'external' && !l.link.external
    unresolved.push(`${l.where}${placeholder ? ' (placeholder: external URL not set yet)' : ''}`)
  }
  try {
    assert(result)
  } catch (e) {
    fail(`${name} ${JSON.stringify(params)}: ${(e as Error).message}`)
  }
  return result
}

function expect(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg)
}

const HOME_ORDER = [
  'heroFounder',
  'ticker',
  'methodCalendar',
  'howItWorks',
  'offerGrid',
  'assessmentCta',
  'statsBlock',
  'testimonials',
  'founderStory',
  'faqBlock',
  'finalCta',
]

async function main() {
  const targets = await run<LinkTarget[]>('LINK_TARGETS_QUERY', LINK_TARGETS_QUERY)
  ok(Array.isArray(targets) && targets.length > 20, 'LINK_TARGETS_QUERY returned too few targets')
  const linkMap = buildLinkMap(targets ?? [])

  type Any = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

  await check<Any>('LAYOUT_QUERY', Q.LAYOUT_QUERY, {}, linkMap, (r) => {
    expect(r.settings?.title, 'settings missing')
    expect(r.banner?.variants?.length === 4, 'banner variants')
    expect(r.calendar?.introEndsAt === '2027-01-16T05:00:00Z', 'intro period ends with Jan 15 ET')
    expect(r.calendar?.workshopAt, 'calendar missing')
    expect(r.courses?.length === 3, 'courses != 3')
    expect(r.courses.map((c: Any) => c.slug).join() === 'attract-the-right-audience,build-a-year-of-content,reach-the-right-audience', 'course order')
    expect(r.workshop?.earlyBirdPrice === 149, 'workshop price')
    expect(r.bundle?.price === 597 && r.bundle?.introPrice === 399, 'bundle prices')
    expect(r.book?.title, 'book missing')
    const learn = r.settings.footer?.columns?.find((c: Any) => c.title === 'Learn')
    expect(learn?.links?.some((l: Any) => l.link?.href === '/growth-strategy'), 'footer links the growth call')
    expect(Array.isArray(r.hiddenHrefs), 'hiddenHrefs not an array')
    expect(Array.isArray(r.sales), 'sales not an array')
    expect(r.courses.every((c: Any) => c._id), 'layout courses carry ids (sale prices match on them)')
    const edu = r.settings.headerNav.find((n: Any) => n.label === 'Education')
    expect(edu?.dropdown?.items?.[0]?.priceFromCourse?.shortLine, 'priceFromCourse not expanded')
    const machine = edu?.dropdown?.items?.find((i: Any) => i.label === 'The Content Machine')
    expect(machine?.description?.includes('{bundlePrice}'), 'bundle menu line uses {bundlePrice}')
  })

  const pageSlugs = ['home', 'about', 'about/jenna-colombo', 'partner', 'contact', 'careers', 'speaking', 'podcast', 'socials']
  for (const slug of pageSlugs) {
    await check<Any>('PAGE_QUERY', Q.PAGE_QUERY, { slug }, linkMap, (r) => {
      expect(r.sections?.length > 0, 'no sections')
      for (const s of r.sections) expect(SECTION_TYPES.includes(s._type), `section type ${s._type} not in contract`)
      if (slug === 'home') {
        expect(r.sections.map((s: Any) => s._type).join() === HOME_ORDER.join(), `home order is ${r.sections.map((s: Any) => s._type).join()}`)
        const offers = r.sections.find((s: Any) => s._type === 'offerGrid')
        expect(offers.items.length === 6 && offers.items.every((i: Any) => i._type && i.title), 'offerGrid items not expanded')
        const a = r.sections.find((s: Any) => s._type === 'assessmentCta')
        expect(a.areas?.length === 5 && a.reportMock?.title, 'assessmentCta areas/reportMock')
        expect(r.sections.find((s: Any) => s._type === 'statsBlock').stats.every((s: Any) => typeof s.value === 'number'), 'stats not expanded')
        expect(r.sections.find((s: Any) => s._type === 'testimonials').items.every((t: Any) => t.quote), 'testimonials not expanded')
        expect(r.sections.find((s: Any) => s._type === 'founderStory').timeline.every((t: Any) => t.organisation), 'timeline not expanded')
        expect(r.sections.find((s: Any) => s._type === 'faqBlock').faqs.length === 6, 'home faqs')
        const hero = r.sections[0]
        expect(hero.primaryCta?.link?.href === '/growth-strategy', 'hero main button goes to the growth call')
        expect(hero.supportLine && hero.eyebrow && !hero.handLine && !hero.workshopCard && !hero.statCard, 'round-two hero fields')
        const marks = r.sections.filter((s: Any) => s.watermark && s.watermark !== 'none').map((s: Any) => s._type)
        expect(marks.join() === 'methodCalendar', `home R watermarks: ${marks.join() || 'none'} (only the method section, plus the footer)`)
        expect(!r.sections.find((s: Any) => s._type === 'statsBlock').showBadge, 'no R badge on the home page')
      }
      if (slug === 'about') {
        expect(r.sections.find((s: Any) => s._type === 'teamGrid').members.every((m: Any) => m.name), 'team not expanded')
        expect(r.sections.find((s: Any) => s._type === 'timeline').entries.length === 3, 'about timeline')
      }
      if (slug === 'partner') {
        expect(r.sections.find((s: Any) => s._type === 'formSection').side.quote?.name === 'Marley Hughes', 'partner side quote not expanded')
      }
      if (slug === 'about/jenna-colombo') {
        expect(r.sections.find((s: Any) => s._type === 'testimonials').items.length === 4, 'founder testimonials')
        expect(r.sections.find((s: Any) => s._type === 'statsBlock').stats.length === 4, 'founder stats')
      }
    })
  }

  await check<string[]>('PAGE_SLUGS_QUERY', Q.PAGE_SLUGS_QUERY, {}, linkMap, (r) => {
    expect(r.length === 8 && !r.includes('home'), `page slugs ${r}`)
  })

  await check<Any>('WORKSHOP_QUERY', Q.WORKSHOP_QUERY, {}, linkMap, (r) => {
    expect(r.slug === 'workshop', 'workshop slug')
    expect(r.faqs?.length === 4 && r.faqs.every((f: Any) => f.question), 'workshop faqs')
    expect(r.archive?.images?.length === 2, 'archive images')
    expect(r.growthCallLink?.workshopLinkLabel, 'growth call line under the tickets')
  })

  await check<Any>('GROWTH_CALL_QUERY', Q.GROWTH_CALL_QUERY, {}, linkMap, (r) => {
    expect(r.headline && r.lockedMessage && r.continueLabel, 'growth call copy')
    expect(r.steps?.length === 3 && r.slotLabels?.length === 5, 'growth call steps and slots')
    expect(r.availableWeekdays?.join() === 'Tue,Wed,Thu' && r.bookingWindowDays === 30, 'growth call days')
    expect(r.successCta?.link?.href === '/workshop', 'growth call success button')
  })

  const courseSlugs = await check<string[]>('COURSE_SLUGS_QUERY', Q.COURSE_SLUGS_QUERY, {}, linkMap, (r) => {
    expect(r.length === 3, 'course slugs')
  })
  for (const slug of courseSlugs ?? []) {
    await check<Any>('COURSE_PAGE_QUERY', Q.COURSE_PAGE_QUERY, { slug }, linkMap, (r) => {
      expect(r.course?.slug === slug, 'course')
      expect(r.course.faqs?.length === 3, 'course faqs')
      expect(r.courses?.length === 3, 'courses')
      expect(r.template?.enrollLabel, 'template')
      expect(r.bundle?.price === 597 && r.bundle?.introPrice === 399, 'bundle prices')
      expect(!/Black Friday|November 27/.test(JSON.stringify(r.template)), 'no Black Friday left in the course labels')
    })
  }

  await check<Any>('BUNDLE_PAGE_QUERY', Q.BUNDLE_PAGE_QUERY, {}, linkMap, (r) => {
    expect(r.bundle?.path?.items?.every((i: Any) => i.course?.regularPrice), 'bundle path courses not expanded')
    expect(r.bundle.faqs?.length === 3, 'bundle faqs')
    expect(r.bundle.introPrice === 399 && r.bundle.compareAtIntro === 447 && r.bundle.maths?.introColumn, 'bundle intro price and math table')
    expect(r.bundle.path.items.every((i: Any) => typeof i.course?.introPrice === 'number'), 'bundle path intro prices')
    expect(r.bundleCourses?.length === 3, 'three courses ticked "Part of the Content Machine bundle"')
    expect(r.courses?.length === 3, 'courses')
  })

  await check<Any>('BOOK_QUERY', Q.BOOK_QUERY, {}, linkMap, (r) => expect(r.title, 'book'))
  await check<Any>('ASSESSMENT_QUERY', Q.ASSESSMENT_QUERY, {}, linkMap, (r) => {
    expect(r.questions?.length === 5 && r.areas?.length === 5, 'assessment questions/areas')
    expect(r.thankYou?.cards?.length === 3, 'thank-you cards')
  })
  await check<Any>('ORDER_QUERY', Q.ORDER_QUERY, {}, linkMap, (r) => {
    expect(r.upsells?.[0]?.course?.introPrice === 99, 'order upsell course not expanded')
  })
  await check<Any>('BLOG_SETTINGS_QUERY', Q.BLOG_SETTINGS_QUERY, {}, linkMap, (r) => expect(r.headline, 'blog settings'))

  const posts = await check<Any[]>('POSTS_QUERY', Q.POSTS_QUERY, {}, linkMap, (r) => {
    expect(r.length === 10, 'posts != 10')
    expect(r.filter((p) => p.featured).length === 1, 'exactly one featured post')
    for (const p of r) {
      expect(typeof p.readingTime === 'number' && p.readingTime >= 1, `readingTime for ${p.slug}: ${p.readingTime}`)
      expect(typeof p.excerpt === 'string' && p.excerpt.length > 10, `excerpt for ${p.slug}`)
      expect(p.author?.name === 'Jenna Colombo', `author for ${p.slug}`)
    }
  })
  for (const p of posts ?? []) {
    await check<Any>('POST_QUERY', Q.POST_QUERY, { slug: p.slug }, linkMap, (r) => {
      expect(r.body?.length > 3, 'post body')
      expect(r.body.some((b: Any) => b._type === 'decisionRule'), 'post has a decision rule')
      expect(r.sources, 'post sources')
    })
  }
  await check<string[]>('POST_SLUGS_QUERY', Q.POST_SLUGS_QUERY, {}, linkMap, (r) => expect(r.length === 10, 'post slugs'))

  for (const slug of ['privacy', 'terms', 'dmca', 'do-not-sell']) {
    await check<Any>('LEGAL_QUERY', Q.LEGAL_QUERY, { slug }, linkMap, (r) => {
      expect(r.slug === slug && r.body?.length > 2 && r.templateBanner === true, 'legal page')
    })
  }
  await check<Any[]>('LEGAL_NAV_QUERY', Q.LEGAL_NAV_QUERY, {}, linkMap, (r) => {
    expect(r.map((l) => l.slug).join() === 'privacy,terms,dmca,do-not-sell', 'legal nav order')
  })
  await check<Any>('SITEMAP_QUERY', Q.SITEMAP_QUERY, {}, linkMap, (r) => {
    expect(r.pages?.length === 9 && r.courses?.length === 3 && r.posts?.length === 10 && r.legal?.length === 4, 'sitemap lists')
    expect(r.workshop && r.bundle && r.book && r.assessment && r.growthCall && r.blog, 'sitemap singletons')
  })

  // Every exported query was evaluated above
  const exported = Object.keys(Q).filter((k) => k.endsWith('_QUERY'))
  const covered = [
    'LAYOUT_QUERY', 'PAGE_QUERY', 'PAGE_SLUGS_QUERY', 'WORKSHOP_QUERY', 'COURSE_PAGE_QUERY', 'COURSE_SLUGS_QUERY',
    'BUNDLE_PAGE_QUERY', 'BOOK_QUERY', 'ASSESSMENT_QUERY', 'ORDER_QUERY', 'BLOG_SETTINGS_QUERY', 'POSTS_QUERY',
    'POST_QUERY', 'POST_SLUGS_QUERY', 'LEGAL_QUERY', 'LEGAL_NAV_QUERY', 'SITEMAP_QUERY', 'GROWTH_CALL_QUERY',
  ]
  for (const k of exported) if (!covered.includes(k)) fail(`query ${k} is not covered by this script`)

  /* ---------------- summary ---------------- */
  const placeholders = unresolved.filter((u) => u.includes('placeholder'))
  const broken = unresolved.filter((u) => !u.includes('placeholder'))
  broken.forEach((b) => fail(`link did not resolve: ${b}`))
  if (lostMarkDefs.length) {
    warn(
      `${lostMarkDefs.length} portable-text link annotation(s) lose their href in resolveLinks (shared bug in lib/sanity/links.ts), e.g. ${lostMarkDefs[0]}`,
    )
  }

  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d._type] = (acc[d._type] ?? 0) + 1
    return acc
  }, {})
  console.log(`\nSeed documents: ${docs.length}`)
  console.log(Object.entries(counts).map(([t, n]) => `  ${t}: ${n}`).join('\n'))
  console.log(`References: ${refCount} (${imageCount} images). Links resolved: ${resolvedCount}.`)
  if (placeholders.length) {
    console.log(`Placeholder links (no URL yet, expected): ${placeholders.length}`)
    placeholders.forEach((p) => console.log(`  - ${p}`))
  }
  warnings.forEach((w) => console.log(`WARN ${w}`))
  if (errors.length) {
    console.error(`\nFAILED with ${errors.length} problem(s):`)
    errors.forEach((e) => console.error(`  x ${e}`))
    process.exit(1)
  }
  console.log('\nAll checks passed.')
}

void main()
