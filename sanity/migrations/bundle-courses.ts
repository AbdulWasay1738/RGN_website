/**
 * The simpler Studio: bundle membership moved onto each course ("Part of the
 * Content Machine bundle"). This ticks it on the courses already listed in the
 * bundle's path, where it is not set yet, so the bundle page keeps its three
 * courses. Leaves any course someone already ticked or unticked alone.
 *
 *   npm run migrate:bundle-courses -- -- --dry-run
 *   npm run migrate:bundle-courses
 */
import { getWriteClient, loadEnvFiles } from '../seed/client'

async function main() {
  loadEnvFiles()
  const dryRun = process.argv.includes('--dry-run')
  const client = await getWriteClient('npm run migrate:bundle-courses')
  const ids: string[] = await client.fetch(`*[_id == "bundle"][0].path.items[].course._ref`)
  const courses: Array<{ _id: string; title?: string; inBundle?: boolean | null }> = await client.fetch(
    `*[_type == "course" && (_id in $ids || _id in $draftIds)]{ _id, title, inBundle }`,
    { ids: ids ?? [], draftIds: (ids ?? []).map((id) => `drafts.${id}`) },
  )
  // A field that was never set comes back as null.
  const todo = courses.filter((c) => c.inBundle === undefined || c.inBundle === null)
  for (const c of todo) console.log(`  tick "Part of the Content Machine bundle" on ${c._id} (${c.title ?? 'course'})`)
  if (!todo.length) console.log('  Nothing to change.')
  if (dryRun || !todo.length) {
    if (dryRun) console.log(`Dry run: ${todo.length} change(s) listed, nothing written.`)
    return
  }
  const tx = client.transaction()
  for (const c of todo) tx.patch(c._id, { set: { inBundle: true } })
  await tx.commit({ visibility: 'sync' })
  console.log(`Done: ${todo.length} change(s) written.`)
}

main().catch((err: Error) => {
  console.error(`Migration failed: ${err.message}`)
  process.exit(1)
})
