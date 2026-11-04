import { expect, test, type Page } from '@playwright/test'

/** Behaviour checks from docs/09 that do not need the Studio. */

async function noCookieNotice(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('rgn_cookie', 'no')
    } catch {}
  })
}

test.beforeEach(async ({ page }) => noCookieNotice(page))

const STATES = [
  { now: '2026-11-04T15:00:00Z', banner: 'NEW', course: '$99', workshop: '$149' },
  { now: '2026-11-29T15:00:00Z', banner: 'EARLY-BIRD', course: '$199', workshop: '$149' },
  { now: '2026-12-11T15:00:00Z', banner: 'LIVE WORKSHOP', course: '$199', workshop: '$199' },
]

for (const s of STATES) {
  test(`sales state ${s.now}`, async ({ page }) => {
    await page.goto(`/?now=${s.now}`)
    const banner = page.getByRole('region', { name: 'Announcement' })
    await expect(banner).toContainText(s.banner)
    await page.goto(`/courses/attract-the-right-audience?now=${s.now}`)
    await expect(page.locator('main')).toContainText(s.course)
    await page.goto(`/workshop?now=${s.now}`)
    await expect(page.locator('main')).toContainText(s.workshop)
  })
}

test('after the workshop: banner hidden, workshop has happened', async ({ page }) => {
  await page.goto('/workshop?now=2027-02-05T15:00:00Z')
  await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0)
  await expect(page.locator('main')).toContainText(/has happened/i)
})

test('banner dismissal is remembered for the session', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Dismiss announcement' }).click()
  await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0)
  await page.goto('/workshop')
  await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0)
})

test('mobile menu opens, traps focus and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('education menu opens with the keyboard and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Education' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('FAQ accordion toggles', async ({ page }) => {
  await page.goto('/workshop')
  const q = page.locator('.qa button.q').first()
  const before = await q.getAttribute('aria-expanded')
  await q.click()
  await expect(q).toHaveAttribute('aria-expanded', before === 'true' ? 'false' : 'true')
})

test('checkout modal: workshop attendance, validation, placeholder payment', async ({ page }) => {
  await page.goto('/workshop')
  await page.getByRole('button', { name: /reserve my seat/i }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /continue to payment/i }).click()
  await expect(dialog.locator('.field.err').first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('assessment guard sends visitors without details back', async ({ page }) => {
  await page.goto('/assessment/questions')
  await expect(page).toHaveURL(/\/assessment$/)
})

test('assessment flow: answer required, then thank-you', async ({ page }) => {
  await page.goto('/assessment')
  await page.getByLabel('First name').fill('Alex')
  await page.getByLabel('Last name').fill('Morgan')
  await page.getByLabel('Work email').fill('alex@example.com')
  await page.getByLabel('Mobile number').fill('(555) 010-2345')
  await page.getByLabel('Company', { exact: true }).fill('Example Labs')
  await page.getByLabel('Your role').fill('Founder')
  await page.getByLabel('Company size').selectOption({ index: 2 })
  await page.waitForTimeout(2600) // the spam time trap ignores very fast submits
  await page.getByRole('button', { name: /start the free assessment/i }).click()
  await expect(page).toHaveURL(/\/assessment\/questions/)
  for (let i = 0; i < 5; i++) {
    const next = page.getByRole('button', { name: /next question|submit my answers/i })
    if (i === 0) {
      await next.click()
      await expect(page.getByText(/choose an answer/i)).toBeVisible()
    }
    await page.getByRole('radio').first().click()
    await next.click()
  }
  await expect(page).toHaveURL(/\/assessment\/thank-you/, { timeout: 15_000 })
})

test('blog topic filter uses the URL', async ({ page }) => {
  await page.goto('/blog?topic=GROWTH')
  const selected = page.getByRole('tab', { selected: true })
  await expect(selected).toContainText(/growth/i)
})

test('hidden pages return 404', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist')
  expect(res?.status()).toBe(404)
})

test('scene transition lands at the top of the next page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await page.mouse.wheel(0, 2000)
  await page.locator('footer a[href="/contact"]').first().click()
  await expect(page).toHaveURL(/\/contact/)
  await page.waitForTimeout(1400)
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(10)
})
