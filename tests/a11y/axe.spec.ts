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

/** The growth call after step 1: her booking calendar (a third-party frame, so its own contents are not ours to test). */
test('axe: growth call, unlocked calendar', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('rgn_cookie', 'no')
    } catch {}
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/growth-strategy')
  const main = page.locator('main')
  await main.getByLabel(/mobile number/i).fill('(555) 010-2345')
  await main.getByLabel('First name').fill('Alex')
  await main.getByLabel('Last name').fill('Morgan')
  await main.getByLabel('Work email').fill('alex@example.com')
  await page.waitForTimeout(2600)
  await main.getByRole('button', { name: 'Continue' }).click()
  await expect(main.locator('iframe[title="Book your call"]')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze()
  const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }))
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([])
})
