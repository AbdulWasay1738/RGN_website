/**
 * Writes the seed as NDJSON for the Sanity CLI importer, an alternative to
 * `npm run seed`:
 *
 *   npm run seed:ndjson
 *   npx sanity dataset import sanity/seed/out/production.ndjson production --replace
 *
 * Images use `_sanityAsset` file paths, which the importer uploads.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildDocuments } from './documents'

/** Project root. `sanity exec` runs scripts as ESM (no __dirname) and sets SANITY_BASE_PATH. */
const ROOT = process.env.SANITY_BASE_PATH || (typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../..') : process.cwd())
const OUT_DIR = path.join(ROOT, 'sanity/seed/out')

/** Swaps `asset: {_ref: 'local:<file>'}` for the importer's `_sanityAsset: 'image@file://...'`. */
function toImportImages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toImportImages)
  if (!value || typeof value !== 'object') return value
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'asset' && v && typeof v === 'object') {
      const ref = String((v as Record<string, unknown>)._ref ?? '')
      if (ref.startsWith('local:')) {
        out._sanityAsset = `image@${pathToFileURL(path.join(ROOT, 'public/img', ref.slice('local:'.length))).href}`
        continue
      }
    }
    out[k] = toImportImages(v)
  }
  return out
}

const docs = buildDocuments({ mode: 'offline' }).map(toImportImages)
mkdirSync(OUT_DIR, { recursive: true })
const file = path.join(OUT_DIR, 'production.ndjson')
writeFileSync(file, docs.map((d) => JSON.stringify(d)).join('\n') + '\n', 'utf8')
console.log(`Wrote ${docs.length} documents to ${path.relative(ROOT, file)}`)
