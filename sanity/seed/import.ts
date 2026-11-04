/**
 * Imports the seed content into the Sanity dataset.
 *
 *   npm run seed                     (sanity exec ... --with-user-token, after `npx sanity login`)
 *   SANITY_API_WRITE_TOKEN in .env.local also works (an Editor token)
 *   npm run seed -- --dry-run        (build and count, write nothing)
 *
 * Idempotent: documents have fixed IDs and are written with createOrReplace;
 * Sanity stores identical image files once. Published documents are replaced
 * with the seed version, so run it on an empty or throwaway dataset after the
 * client starts editing.
 */
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient, type SanityClient } from '@sanity/client'
import { buildDocuments, SEED_IMAGE_FILES, type ImageRef } from './documents'

/** Project root. `sanity exec` runs scripts as ESM (no __dirname) and sets SANITY_BASE_PATH. */
const ROOT = process.env.SANITY_BASE_PATH || (typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../..') : process.cwd())
const API_VERSION = '2026-11-04'

/** Loads .env.local and .env without overriding variables already set. Values are never printed. */
function loadEnvFiles() {
  for (const file of ['.env.local', '.env']) {
    const full = path.join(ROOT, file)
    if (!existsSync(full)) continue
    for (const line of readFileSync(full, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (!m || m[1] in process.env) continue
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
}

async function getClient(): Promise<SanityClient> {
  const token = process.env.SANITY_API_WRITE_TOKEN
  const dataset = process.env.SANITY_SEED_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (token) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is missing from .env.local')
    console.log(`Using the Editor token from the environment. Project ${projectId}, dataset "${dataset}".`)
    return createClient({ projectId, dataset, apiVersion: API_VERSION, token, useCdn: false })
  }
  // Run through `sanity exec --with-user-token`: the CLI login supplies the token,
  // sanity.cli.ts supplies the project.
  const { getCliClient } = await import('sanity/cli')
  const client = getCliClient({ apiVersion: API_VERSION, useCdn: false, ...(process.env.SANITY_SEED_DATASET ? { dataset } : {}) })
  const cfg = client.config()
  if (!cfg.token) {
    throw new Error(
      'No write access. Either add SANITY_API_WRITE_TOKEN (an Editor token) to .env.local, or run `npx sanity login` and then `npm run seed`.',
    )
  }
  console.log(`Using your Sanity login. Project ${cfg.projectId}, dataset "${cfg.dataset}".`)
  return client
}

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

  const client = await getClient()
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
