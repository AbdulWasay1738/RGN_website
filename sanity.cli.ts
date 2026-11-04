/**
 * Sanity CLI settings (schema extract, typegen, `sanity exec` for the seed).
 * Reads the same .env.local as Next.js, so the project ID lives in one place.
 */
import { loadEnvConfig } from '@next/env'
import { defineCliConfig } from 'sanity/cli'

loadEnvConfig(process.cwd())

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-project-id'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  typegen: {
    path: ['./lib/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
    schema: 'sanity/extract.json',
    generates: 'sanity.types.ts',
  },
})
