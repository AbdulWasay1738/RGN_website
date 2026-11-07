/**
 * Imports the seed content into the Sanity dataset.
 *
 *   npm run seed                     (sanity exec ... --with-user-token, after `npx sanity login`)
 *   SANITY_API_WRITE_TOKEN in .env.local also works (an Editor token)
 *   npm run seed -- -- --dry-run     (build and count, write nothing; the second -- passes it past `sanity exec`)
 *
 * Idempotent: documents have fixed IDs and are written with createOrReplace;
 * Sanity stores identical image files once. Published documents are replaced
 * with the seed version, so run it on an empty or throwaway dataset after the
 * client starts editing. To bring a dataset that is already in use up to date
 * after a feedback round, use the matching script in sanity/migrations.
 */
import { createReadStream, existsSync } from 'node:fs'
import path from 'node:path'
import type { SanityClient } from '@sanity/client'
import { getWriteClient, loadEnvFiles, ROOT } from './client'
import { buildDocuments, SEED_IMAGE_FILES, type ImageRef } from './documents'

async function uploadImages(client: SanityClient) {
  const refs = new Map<string, ImageRef>()
  for (const file of SEED_IMAGE_FILES) {
    const full = path.join(ROOT, 'public/img', file)
    if (!existsSync(full)) throw new Error(`Missing image public/img/${file}`)
    const asset = await client.assets.upload('image', createReadStream(full), { filename: file })
    refs.set(file, { _type: 'reference', _ref: asset._id })
    console.log(`  image ${file} -> ${asset._id}`)
  }
  return refs
}

async function main() {
  loadEnvFiles()
  const dryRun = process.argv.includes('--dry-run')

  if (dryRun) {
    const docs = buildDocuments({ mode: 'offline' })
    console.log(`Dry run: ${docs.length} documents built, nothing written.`)
    return
  }

  const client = await getWriteClient('npm run seed')
  console.log('Uploading images...')
  const refs = await uploadImages(client)

  const docs = buildDocuments({
    mode: 'import',
    imageRef: (file) => {
      const r = refs.get(file)
      if (!r) throw new Error(`Image ${file} was not uploaded (add it to SEED_IMAGE_FILES)`)
      return r
    },
  })

  // One transaction, so documents that link to each other (cycles included)
  // land together and strong references always point at existing documents.
  const tx = client.transaction()
  for (const doc of docs) tx.createOrReplace(doc)
  const size = Buffer.byteLength(JSON.stringify(docs))
  console.log(`Writing ${docs.length} documents (${Math.round(size / 1024)} KB) in one transaction...`)
  await tx.commit({ visibility: 'sync' })

  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d._type] = (acc[d._type] ?? 0) + 1
    return acc
  }, {})
  console.log('Done.')
  for (const [type, n] of Object.entries(counts)) console.log(`  ${type}: ${n}`)
}

main().catch((err: Error) => {
  // Never print tokens: only the message.
  console.error(`Seed failed: ${err.message}`)
  process.exit(1)
})
