/**
 * Write access for the scripts that change the dataset (seed and migrations).
 * Uses SANITY_API_WRITE_TOKEN (an Editor token) from .env.local when set,
 * otherwise the Sanity CLI login (`npx sanity login`, run through
 * `sanity exec ... --with-user-token`). Tokens are never printed.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient, type SanityClient } from '@sanity/client'

/** Project root. `sanity exec` runs scripts as ESM (no __dirname) and sets SANITY_BASE_PATH. */
export const ROOT = process.env.SANITY_BASE_PATH || (typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../..') : process.cwd())
export const API_VERSION = '2026-11-04'

/** Loads .env.local and .env without overriding variables already set. Values are never printed. */
export function loadEnvFiles() {
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

/** `command` is the npm script to suggest in the error message, for example "npm run seed". */
export async function getWriteClient(command: string): Promise<SanityClient> {
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
    throw new Error(`No write access. Either add SANITY_API_WRITE_TOKEN (an Editor token) to .env.local, or run \`npx sanity login\` and then \`${command}\`.`)
  }
  console.log(`Using your Sanity login. Project ${cfg.projectId}, dataset "${cfg.dataset}".`)
  return client
}
