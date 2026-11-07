/**
 * Client feedback round two (CHANGES-ROUND-2.md): brings a dataset that was
 * already seeded up to date without losing edits made in the Studio.
 *
 *   npm run migrate:round-2 -- -- --dry-run   (lists the changes, writes nothing)
 *   npm run migrate:round-2
 *
 * Unlike `npm run seed`, it never replaces a whole document. A field changes
 * only while it still holds the round-one seed value (or is empty); a field
 * someone has edited is left alone and listed, so a person can check it. The
 * growth call page is created only if it is missing. Open drafts get the same
 * patch, so publishing a draft later does not undo it. Safe to run twice.
 */
import type { SanityClient } from '@sanity/client'
import { getWriteClient, loadEnvFiles } from '../seed/client'
import { buildDocuments, type SeedDocument } from '../seed/documents'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

/** Round-one seed values that round two replaced. */
const OLD = {
  introEndsAt: '2026-11-28T05:00:00Z',
  banner: {
    NEW: {
      message: 'Our courses are on sale now at introductory prices through Black Friday.',
      showFrom: '2026-10-01T00:00:00Z',
      showUntil: '2026-11-28T05:00:00Z',
      countdownTo: 'introEndsAt',
    },
    'EARLY-BIRD': {
      message: 'Live workshop, Thursday, February 4, 2027, noon ET. Early-bird pricing ends December 10.',
      showFrom: '2026-11-28T05:00:00Z',
      showUntil: '2026-12-11T05:00:00Z',
      countdownTo: 'earlyBirdEndsAt',
    },
    'LIVE WORKSHOP': {
      message: 'Thursday, February 4, 2027, noon ET, in person and on Zoom.',
      showFrom: '2026-12-11T05:00:00Z',
      showUntil: '2027-02-04T17:00:00Z',
      countdownTo: 'workshopAt',
    },
  } as Record<string, Record<string, string>>,
  menuBundleLine: 'All three courses · $597',
  checkoutBundleSubline: 'All three online courses · lessons open Dec 1, 2026',
  introEndsLabel: 'Intro price ends Black Friday, November 27',
  bundleLinkLabel: 'Or get all three courses for $597',
  upsellBody: 'One path from strategy to distribution. All three for $597, a $200 saving.',
  saveLabel: 'Save $200',
  mathsBody: 'Bought separately, the three courses total $797. The bundle saves $200.',
  priceColumn: 'Regular price',
  bundleSeo: 'All three Reel Good News courses in one path from strategy to distribution. $597, a $200 saving on the regular prices.',
  orderIntroNote: 'introductory price through Black Friday.',
  heroHeadline: 'Is your expertise doing the _selling_ for you?',
  heroLead:
    'Our team at Reel Good News turns expertise, customer results and reputation into a year of strategic content, all from one planned production day.',
  heroPrimaryLabel: 'Reserve my seat',
  /** Home sections that lose their R watermark (client feedback #4), with the round-one value */
  watermarks: { howItWorks: 'bottom-left', offerGrid: 'bottom-right', assessmentCta: 'top-right', statsBlock: 'top-left', faqBlock: 'bottom-right', finalCta: 'center-right' } as Record<string, string>,
}

type Plan = { set: Record<string, unknown>; unset: string[]; inserts: Array<{ where: 'before' | 'after'; at: string; items: unknown[] }>; kept: string[] }

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const empty = (v: unknown) => v === undefined || v === null || v === ''

function newPlan(): Plan {
  return { set: {}, unset: [], inserts: [], kept: [] }
}

/** Sets `path` when it still holds the old seed value or is empty; otherwise records that it was kept. */
function replaceOld(p: Plan, path: string, current: unknown, old: unknown, next: unknown) {
  if (same(current, next)) return
  if (empty(current) || same(current, old)) p.set[path] = next
  else p.kept.push(path)
}

function addIfMissing(p: Plan, path: string, current: unknown, next: unknown) {
  if (empty(current) && !empty(next)) p.set[path] = next
}

const key = (k: string) => `[_key=="${k}"]`

function planSalesCalendar(doc: Any, seed: Any) {
  const p = newPlan()
  replaceOld(p, 'introEndsAt', doc.introEndsAt, OLD.introEndsAt, seed.introEndsAt)
  return p
}

function planBanner(doc: Any, seed: Any) {
  const p = newPlan()
  const current: Any[] = doc.variants ?? []
  const byLabel = (label: string) => current.find((v) => String(v.label ?? '').trim().toUpperCase() === label)
  for (const sv of seed.variants as Any[]) {
    const ev = byLabel(sv.label)
    if (ev) {
      const old = OLD.banner[sv.label] ?? {}
      for (const f of ['message', 'showFrom', 'showUntil', 'countdownTo']) replaceOld(p, `variants${key(ev._key)}.${f}`, ev[f], old[f], sv[f])
      continue
    }
    // New window (round two): goes before the live workshop window, or at the end.
    const item = { ...sv, _key: `variant-${String(sv.label).toLowerCase().replace(/[^a-z]+/g, '-')}` }
    const live = byLabel('LIVE WORKSHOP')
    if (live) p.inserts.push({ where: 'before', at: `variants${key(live._key)}`, items: [item] })
    else p.inserts.push({ where: 'after', at: 'variants[-1]', items: [item] })
  }
  return p
}

function planSiteSettings(doc: Any, seed: Any) {
  const p = newPlan()
  for (const nav of doc.headerNav ?? []) {
    for (const child of nav.dropdown?.items ?? []) {
      if (child.link?.internal?._ref !== 'bundle') continue
      const seedLine = 'All three courses · {bundlePrice}'
      replaceOld(p, `headerNav${key(nav._key)}.dropdown.items${key(child._key)}.description`, child.description, OLD.menuBundleLine, seedLine)
    }
  }
  replaceOld(p, 'checkout.bundleSubline', doc.checkout?.bundleSubline, OLD.checkoutBundleSubline, seed.checkout.bundleSubline)
  addIfMissing(p, 'checkout.bundleIntroPriceLabel', doc.checkout?.bundleIntroPriceLabel, seed.checkout.bundleIntroPriceLabel)

  const columns: Any[] = doc.footer?.columns ?? []
  const linked = columns.some((c) => (c.links ?? []).some((l: Any) => l.link?.internal?._ref === 'growthCall'))
  if (!linked) {
    const seedCol = (seed.footer.columns as Any[]).find((c) => c.links.some((l: Any) => l.link?.internal?._ref === 'growthCall'))
    const seedLink = seedCol?.links.find((l: Any) => l.link?.internal?._ref === 'growthCall')
    const col = columns.find((c) => c.title === seedCol?.title) ?? columns[0]
    if (col && seedLink) {
      const taken = new Set((col.links ?? []).map((l: Any) => l._key))
      const item = { ...seedLink, _key: taken.has(seedLink._key) ? 'growth-call' : seedLink._key }
      if ((col.links ?? []).length) p.inserts.push({ where: 'after', at: `footer.columns${key(col._key)}.links[-1]`, items: [item] })
      else p.set[`footer.columns${key(col._key)}.links`] = [item]
    }
  }
  return p
}

function planCourseTemplate(doc: Any, seed: Any) {
  const p = newPlan()
  replaceOld(p, 'introEndsLabel', doc.introEndsLabel, OLD.introEndsLabel, seed.introEndsLabel)
  replaceOld(p, 'bundleLinkLabel', doc.bundleLinkLabel, OLD.bundleLinkLabel, seed.bundleLinkLabel)
  addIfMissing(p, 'bundleLinkIntroLabel', doc.bundleLinkIntroLabel, seed.bundleLinkIntroLabel)
  if (doc.bundleUpsell) {
    replaceOld(p, 'bundleUpsell.body', doc.bundleUpsell.body, OLD.upsellBody, seed.bundleUpsell.body)
    addIfMissing(p, 'bundleUpsell.bodyIntro', doc.bundleUpsell.bodyIntro, seed.bundleUpsell.bodyIntro)
  }
  return p
}

function planBundle(doc: Any, seed: Any) {
  const p = newPlan()
  addIfMissing(p, 'introPrice', doc.introPrice, seed.introPrice)
  addIfMissing(p, 'compareAtIntro', doc.compareAtIntro, seed.compareAtIntro)
  addIfMissing(p, 'introLabel', doc.introLabel, seed.introLabel)
  replaceOld(p, 'saveLabel', doc.saveLabel, OLD.saveLabel, seed.saveLabel)
  if (doc.maths) {
    replaceOld(p, 'maths.body', doc.maths.body, OLD.mathsBody, seed.maths.body)
    addIfMissing(p, 'maths.bodyIntro', doc.maths.bodyIntro, seed.maths.bodyIntro)
    replaceOld(p, 'maths.priceColumn', doc.maths.priceColumn, OLD.priceColumn, seed.maths.priceColumn)
    addIfMissing(p, 'maths.introColumn', doc.maths.introColumn, seed.maths.introColumn)
    addIfMissing(p, 'maths.totalNoteIntro', doc.maths.totalNoteIntro, seed.maths.totalNoteIntro)
  }
  if (doc.seo) replaceOld(p, 'seo.metaDescription', doc.seo.metaDescription, OLD.bundleSeo, seed.seo.metaDescription)
  return p
}

function planOrder(doc: Any, seed: Any) {
  const p = newPlan()
  const seedNote = (seed.upsells as Any[]).find((u) => u.introNote)?.introNote
  for (const u of doc.upsells ?? []) {
    if (u.introNote !== undefined) replaceOld(p, `upsells${key(u._key)}.introNote`, u.introNote, OLD.orderIntroNote, seedNote)
  }
  return p
}

function planHome(doc: Any, seed: Any) {
  const p = newPlan()
  const sections: Any[] = doc.sections ?? []
  const seedHero = (seed.sections as Any[]).find((s) => s._type === 'heroFounder')
  const hero = sections.find((s) => s._type === 'heroFounder')
  if (hero && seedHero) {
    const at = `sections${key(hero._key)}`
    addIfMissing(p, `${at}.eyebrow`, hero.eyebrow, seedHero.eyebrow)
    replaceOld(p, `${at}.headline`, hero.headline, OLD.heroHeadline, seedHero.headline)
    replaceOld(p, `${at}.lead`, hero.lead, OLD.heroLead, seedHero.lead)
    if (empty(hero.primaryCta?.label) || hero.primaryCta?.label === OLD.heroPrimaryLabel) {
      if (!same(hero.primaryCta, seedHero.primaryCta)) p.set[`${at}.primaryCta`] = seedHero.primaryCta
    } else if (!same(hero.primaryCta, seedHero.primaryCta)) p.kept.push(`${at}.primaryCta`)
    addIfMissing(p, `${at}.supportLine`, hero.supportLine, seedHero.supportLine)
    // Removed from the hero in round two (and from the schema).
    for (const f of ['handLine', 'workshopCard', 'statCard']) if (hero[f] !== undefined) p.unset.push(`${at}.${f}`)
    if (hero.watermark && hero.watermark !== 'none') p.set[`${at}.watermark`] = 'none'
  }
  for (const s of sections) {
    const old = OLD.watermarks[s._type]
    if (old) replaceOld(p, `sections${key(s._key)}.watermark`, s.watermark, old, 'none')
    if (s._type === 'statsBlock' && s.showBadge === true) p.set[`sections${key(s._key)}.showBadge`] = false
  }
  if (doc.seo) replaceOld(p, 'seo.metaDescription', doc.seo.metaDescription, OLD.heroLead, seed.seo.metaDescription)
  return p
}

const PLANNERS: Record<string, (doc: Any, seed: Any) => Plan> = {
  salesCalendar: planSalesCalendar,
  announcementBanner: planBanner,
  siteSettings: planSiteSettings,
  courseTemplate: planCourseTemplate,
  bundle: planBundle,
  orderConfirmation: planOrder,
  'page-home': planHome,
}

function describe(id: string, p: Plan) {
  const lines: string[] = []
  for (const [path, value] of Object.entries(p.set)) {
    const shown = typeof value === 'string' ? JSON.stringify(value.length > 70 ? `${value.slice(0, 67)}...` : value) : JSON.stringify(value)?.slice(0, 70)
    lines.push(`  set    ${id} ${path} = ${shown}`)
  }
  for (const path of p.unset) lines.push(`  unset  ${id} ${path}`)
  for (const ins of p.inserts) lines.push(`  insert ${id} ${ins.where} ${ins.at}: ${(ins.items as Any[]).map((i) => i.label ?? i._key).join(', ')}`)
  for (const path of p.kept) lines.push(`  kept   ${id} ${path} (edited in the Studio, left as is: check it by hand)`)
  return lines
}

async function main() {
  loadEnvFiles()
  const dryRun = process.argv.includes('--dry-run')
  const seedDocs = new Map<string, SeedDocument>(buildDocuments({ mode: 'offline' }).map((d) => [d._id, d]))
  const client: SanityClient = await getWriteClient('npm run migrate:round-2')

  const ids = Object.keys(PLANNERS)
  const docs: Any[] = await client.fetch('*[_id in $ids]', { ids: [...ids, ...ids.map((id) => `drafts.${id}`), 'growthCall', 'drafts.growthCall'] })
  if (!docs.some((d) => d._id === 'siteSettings')) {
    throw new Error('This dataset has not been seeded yet. Run `npm run seed` instead.')
  }

  const tx = client.transaction()
  const report: string[] = []
  let changes = 0
  // First, so the hero button's link to the new page never points at a missing document.
  const growthCall = seedDocs.get('growthCall')
  if (growthCall && !docs.some((d) => d._id === 'growthCall')) {
    report.push('  create growthCall (the growth strategy call page)')
    tx.createIfNotExists(growthCall)
    changes++
  }
  for (const doc of docs) {
    const baseId = String(doc._id).replace(/^drafts\./, '')
    const planner = PLANNERS[baseId]
    if (!planner) continue
    const plan = planner(doc, seedDocs.get(baseId))
    const n = Object.keys(plan.set).length + plan.unset.length + plan.inserts.length
    report.push(...describe(doc._id, plan))
    if (!n) continue
    changes += n
    let patch = client.patch(doc._id)
    if (Object.keys(plan.set).length) patch = patch.set(plan.set)
    if (plan.unset.length) patch = patch.unset(plan.unset)
    for (const ins of plan.inserts) patch = patch.insert(ins.where, ins.at, ins.items)
    tx.patch(patch)
  }

  console.log(report.length ? report.join('\n') : '  Nothing to change: the dataset already has the round-two content.')
  if (dryRun) {
    console.log(`Dry run: ${changes} change(s) listed, nothing written.`)
    return
  }
  if (!changes) return
  await tx.commit({ visibility: 'sync' })
  console.log(`Done: ${changes} change(s) written.`)
}

main().catch((err: Error) => {
  // Never print tokens: only the message.
  console.error(`Migration failed: ${err.message}`)
  process.exit(1)
})
