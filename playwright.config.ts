import { defineConfig, devices } from '@playwright/test'

/**
 * Visual parity, accessibility and behaviour checks (docs/09-qa-checklist.md).
 *
 * By default this starts the site in offline mode (content from content-seed/,
 * no Sanity connection) plus the prototype on :8765. Point BASE_URL at a
 * running server or a Vercel preview to test that instead.
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3000'
const useLocalServer = !process.env.BASE_URL

export default defineConfig({
  testDir: './tests',
  testIgnore: ['unit/**'],
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    ...(useLocalServer
      ? [
          {
            command: 'npm run start',
            url: 'http://localhost:3000',
            reuseExistingServer: true,
            timeout: 180_000,
            env: { SANITY_OFFLINE: '1' },
          },
        ]
      : []),
    {
      command: 'python -m http.server 8765 --directory reference/prototype',
      url: 'http://localhost:8765/index.html',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
