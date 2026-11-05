import { expect, test, type Page } from '@playwright/test'
import { ROUTES, SCREENSHOT_CSS, VIEWPORTS } from '../routes'

/**
 * Captures the prototype and the site side by side for review by eye
 * (tests/visual/__screenshots__/<route>-<width>-{prototype,site}.png), and
 * checks automatically: no horizontal scroll, no broken images.
 */
const PROTOTYPE = 'http://localhost:8765/index.html'
const OUT = 'tests/visual/__screenshots__'

async function settle(page: Page) {
  await page.addStyleTag({ content: SCREENSHOT_CSS })
  // Scroll once so IntersectionObserver animations (calendar, counters, bars) run.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    // Wait for lazy images to finish loading before capturing.
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? null
          : new Promise((r) => {
              img.addEventListener('load', r, { once: true })
              img.addEventListener('error', r, { once: true })
            }),
      ),
    )
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1500)
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.label}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    for (const route of ROUTES) {
      test(`${route.name}`, async ({ page }) => {
        await page.addInitScript(() => {
          try {
            localStorage.setItem('rgn_cookie', 'no')
            sessionStorage.setItem('rgn_cookie', 'no')
          } catch {}
        })

        // Prototype
        await page.goto(`${PROTOTYPE}#${route.hash}`)
        await page.waitForTimeout(1600)
        await settle(page)
        await page.screenshot({ path: `${OUT}/${route.name}-${vp.label}-prototype.png`, fullPage: true })

        // Site
        await page.goto(route.path)
        await page.waitForLoadState('networkidle')
        await settle(page)
        await page.screenshot({ path: `${OUT}/${route.name}-${vp.label}-site.png`, fullPage: true })

        // No element wider than the viewport.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0)

        // No broken images.
        const broken = await page.evaluate(() =>
          Array.from(document.images)
            .filter((img) => img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:'))
            .map((img) => img.src),
        )
        expect(broken, 'broken images').toEqual([])
      })
    }
  })
}
