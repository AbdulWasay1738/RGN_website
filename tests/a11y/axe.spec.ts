import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTES } from '../routes'

/** axe on every route (WCAG 2.2 AA). Scroll-reveal animations are disabled so contrast is measured on final colours. */
for (const route of ROUTES) {
  test(`axe: ${route.name}`, async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('rgn_cookie', 'no')
      } catch {}
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(route.path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
    }))
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([])
  })
}
