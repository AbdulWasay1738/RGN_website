/**
 * Client feedback round three: brings the live dataset up to date without
 * losing edits made in the Studio.
 *
 *   npm run migrate:round-3 -- -- --dry-run   (lists the changes, writes nothing)
 *   npm run migrate:round-3
 *
 * A text changes only while it still holds the earlier text (or is empty); an
 * edited one is left alone and listed. The book price is the exception: the
 * client set it to $18 against what she saw on the site, so it is always set.
 * Uploads the book photo. Open drafts get the same patch. Safe to run twice.
 */
import { createReadStream } from 'node:fs'
import path from 'node:path'
import type { SanityClient } from '@sanity/client'
import { getWriteClient, loadEnvFiles, ROOT } from '../seed/client'
import { buildDocuments } from '../seed/documents'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any
type Plan = { set: Record<string, unknown>; unset: string[]; kept: string[]; needsPhoto?: boolean }

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const empty = (v: unknown) => v === undefined || v === null || v === ''
const key = (k: string) => `[_key=="${k}"]`
const newPlan = (): Plan => ({ set: {}, unset: [], kept: [] })

function replaceOld(p: Plan, at: string, current: unknown, old: unknown, next: unknown) {
  if (same(current, next)) return
  if (empty(current) || same(current, old)) p.set[at] = next
  else p.kept.push(at)
}

/** Removes a field while it still holds the old value. */
function removeOld(p: Plan, at: string, current: unknown, old: unknown) {
  if (empty(current)) return
  if (same(current, old)) p.unset.push(at)
  else p.kept.push(at)
}

const seed = new Map(buildDocuments({ mode: 'offline' }).map((d) => [d._id, d as Any]))
const seedSection = (pageId: string, type: string) => (seed.get(pageId)?.sections as Any[]).find((s) => s._type === type)

const PLANNERS: Record<string, (doc: Any) => Plan> = {
  book: (doc) => {
    const p = newPlan()
    if (doc.price !== '$18') p.set.price = '$18'
    if (!doc.photo?.asset) p.needsPhoto = true
    return p
  },
  workshop: (doc) => {
    const p = newPlan()
    const s = seed.get('workshop')
    replaceOld(p, 'agenda.eyebrow', doc.agenda?.eyebrow, 'The agenda · times to confirm', s.agenda.eyebrow)
    ;(doc.agenda?.items ?? []).forEach((item: Any, i: number) => {
      const next = s.agenda.items[i]?.time
      if (next) replaceOld(p, `agenda.items${key(item._key)}.time`, item.time, '[TIME]', next)
    })
    replaceOld(p, 'hostSection.eyebrow', doc.hostSection?.eyebrow, 'Your hosts', s.hostSection.eyebrow)
    replaceOld(p, 'hostSection.headline', doc.hostSection?.headline, 'Led by our team *and our founder*', s.hostSection.headline)
    return p
  },
  'course-create': (doc) => {
    const p = newPlan()
    replaceOld(p, 'headline', doc.headline, 'A year of content starts weeks before the cameras turn on.', seed.get('course-create').headline)
    return p
  },
  siteSettings: (doc) => {
    const p = newPlan()
    replaceOld(p, 'footer.newsletterHeadline', doc.footer?.newsletterHeadline, 'Get the *good news* in your inbox.', seed.get('siteSettings').footer.newsletterHeadline)
    return p
  },
  'page-home': (doc) => {
    const p = newPlan()
    for (const s of doc.sections ?? []) {
      const at = `sections${key(s._key)}`
      if (s._type === 'founderStory') {
        removeOld(p, `${at}.handLine`, s.handLine, 'founder to founder')
        removeOld(p, `${at}.signature`, s.signature, 'Jenna')
        if (s.showYears === undefined || s.showYears === null) p.set[`${at}.showYears`] = false
      }
      if (s._type === 'faqBlock') {
        const next = seedSection('page-home', 'faqBlock')
        replaceOld(p, `${at}.headline`, s.headline, 'Good questions. *Straight answers.*', next.headline)
        replaceOld(p, `${at}.note`, s.note, 'Another question? Send a note. Our team replies within [number] business days.', next.note)
      }
    }
    return p
  },
  'page-about': (doc) => {
    const p = newPlan()
    for (const s of doc.sections ?? []) {
      if (s._type !== 'teamGrid') continue
      const at = `sections${key(s._key)}`
      replaceOld(p, `${at}.headline`, s.headline, 'Meet the team.', 'Join the team.')
      replaceOld(p, `${at}.hiringCard.eyebrow`, s.hiringCard?.eyebrow, 'We are hiring, always', 'We are hiring')
      // Jenna's card and the placeholder card come off (the client crossed both out).
      const refs = (s.members ?? []).map((m: Any) => m._ref)
      if (same(refs, ['team-jenna', 'team-placeholder'])) p.set[`${at}.members`] = []
      else if (refs.length) p.kept.push(`${at}.members`)
    }
    return p
  },
  growthCall: (doc) => {
    const p = newPlan()
    const s = seed.get('growthCall')
    replaceOld(p, 'bookingUrl', doc.bookingUrl, undefined, s.bookingUrl)
    replaceOld(p, 'bookingLinkLabel', doc.bookingLinkLabel, undefined, s.bookingLinkLabel)
    replaceOld(p, 'callMinutes', doc.callMinutes, 30, s.callMinutes)
    replaceOld(p, 'callLengthNote', doc.callLengthNote, '[Call length and format to confirm.]', s.callLengthNote)
    return p
  },
}

function describe(id: string, p: Plan) {
  const lines: string[] = []
  for (const [at, v] of Object.entries(p.set)) lines.push(`  set    ${id} ${at} = ${JSON.stringify(v)?.slice(0, 90)}`)
  for (const at of p.unset) lines.push(`  unset  ${id} ${at}`)
  if (p.needsPhoto) lines.push(`  photo  ${id} photo = book-reader.webp`)
  for (const at of p.kept) lines.push(`  kept   ${id} ${at} (edited in the Studio, left as is: check it by hand)`)
  return lines
}

async function main() {
  loadEnvFiles()
  const dryRun = process.argv.includes('--dry-run')
  const client: SanityClient = await getWriteClient('npm run migrate:round-3')
  const ids = Object.keys(PLANNERS)
  const docs: Any[] = await client.fetch('*[_id in $ids]', { ids: [...ids, ...ids.map((id) => `drafts.${id}`)] })

  const plans = docs.map((doc) => ({ doc, plan: PLANNERS[String(doc._id).replace(/^drafts\./, '')](doc) }))
  const report = plans.flatMap(({ doc, plan }) => describe(doc._id, plan))
  const count = plans.reduce((n, { plan }) => n + Object.keys(plan.set).length + plan.unset.length + (plan.needsPhoto ? 1 : 0), 0)
  console.log(report.length ? report.join('\n') : '  Nothing to change: the dataset already has the round-three content.')
  if (dryRun) {
    console.log(`Dry run: ${count} change(s) listed, nothing written.`)
    return
  }
  if (!count) return

  let photo: Any = null
  if (plans.some(({ plan }) => plan.needsPhoto)) {
    const asset = await client.assets.upload('image', createReadStream(path.join(ROOT, 'public/img/book-reader.webp')), { filename: 'book-reader.webp' })
    const seeded = seed.get('book').photo
    photo = { _type: 'imageWithAlt', alt: seeded.alt, asset: { _type: 'reference', _ref: asset._id } }
  }

  const tx = client.transaction()
  for (const { doc, plan } of plans) {
    const set = { ...plan.set, ...(plan.needsPhoto && photo ? { photo } : {}) }
    if (!Object.keys(set).length && !plan.unset.length) continue
    tx.patch(doc._id, { set, unset: plan.unset })
  }
  await tx.commit({ visibility: 'sync' })
  console.log(`Done: ${count} change(s) written.`)
}

main().catch((err: Error) => {
  // Never print tokens: only the message.
  console.error(`Migration failed: ${err.message}`)
  process.exit(1)
})
