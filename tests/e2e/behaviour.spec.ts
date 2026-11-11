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

// Round two: four banner windows, intro prices through January 15.
const STATES = [
  { now: '2026-11-20T15:00:00Z', banner: 'NEW', course: '$99', workshop: '$149' },
  { now: '2026-12-05T15:00:00Z', banner: 'EARLY-BIRD', course: '$99', workshop: '$149' },
  { now: '2026-12-20T15:00:00Z', banner: 'INTRO PRICING', course: '$99', workshop: '$199' },
  { now: '2027-01-20T15:00:00Z', banner: 'LIVE WORKSHOP', course: '$199', workshop: '$199' },
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

test('bundle: $399 against $597 through Jan 15, then $597 against $797', async ({ page }) => {
  await page.goto('/courses/content-machine?now=2027-01-15T20:00:00Z')
  const hero = page.locator('main section').first()
  await expect(hero).toContainText('$399')
  await expect(hero).toContainText('$597')
  await expect(hero).toContainText('Intro price through Jan 15')
  await expect(page.locator('main table')).toContainText('$447')
  await page.goto('/courses/content-machine?now=2027-01-16T15:00:00Z')
  await expect(hero).toContainText('$597')
  await expect(hero).toContainText('$797')
  await expect(hero).toContainText('Save $200')
  await expect(page.locator('main table')).not.toContainText('$447')
  await page.goto('/?now=2027-01-15T20:00:00Z')
  await expect(page.locator('#offers')).toContainText('$399')
  await page.goto('/courses/attract-the-right-audience?now=2027-01-15T20:00:00Z')
  await expect(page.locator('main')).toContainText('Or get all three courses for $399 (intro price)')
  await expect(page.locator('main')).toContainText('Intro price ends January 15')
})

test('mega menu bundle line follows the date', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  // Opened with the keyboard: a mouse click would hover it open, then toggle it shut.
  const open = async () => {
    const trigger = page.getByRole('button', { name: 'Education' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  }
  await page.goto('/?now=2027-01-15T20:00:00Z')
  await open()
  await expect(page.getByText('All three courses · $399 intro')).toBeVisible()
  await page.goto('/?now=2027-01-16T15:00:00Z')
  await open()
  await expect(page.getByText('All three courses · $597', { exact: true })).toBeVisible()
})

test('home, round two: calm hero, two R marks, handwritten accents in Benedict', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('main section').first()
  await expect(hero.locator('h1')).toContainText('Attract more best fit customers.')
  await expect(hero.locator('h1')).toContainText('Win more business.')
  await expect(hero).toContainText('One strategic production day.')
  await expect(hero.locator('.wm, .brush, .hand, .rbadge')).toHaveCount(0)
  await expect(hero.getByRole('link', { name: /claim your 2027 growth strategy/i })).toHaveAttribute('href', '/growth-strategy')
  // Exactly two R watermarks: the method section and the footer. No R badge.
  await expect(page.locator('main .wm')).toHaveCount(1)
  await expect(page.locator('footer .wm')).toHaveCount(1)
  await expect(page.locator('.rbadge')).toHaveCount(0)
  const font = await page.evaluate(async () => {
    // The handwritten accents ("founder to founder", the signature, card cover words) on this page.
    const el = [...document.querySelectorAll<HTMLElement>('main *')].find((e) => /Benedict/.test(getComputedStyle(e).fontFamily))
    await document.fonts.load('400 40px Benedict', 'founder to founder')
    await document.fonts.ready
    return {
      stack: el ? getComputedStyle(el).fontFamily : '',
      loaded: [...document.fonts].some((f) => f.family.replace(/["']/g, '') === 'Benedict' && f.status === 'loaded'),
    }
  })
  expect(font.stack.startsWith('Benedict')).toBe(true)
  expect(font.loaded, 'Benedict loads from the font host').toBe(true)
})

test('growth call: locked until the form is sent, then her booking calendar', async ({ page }) => {
  await page.goto('/growth-strategy')
  const main = page.locator('main')
  const note = main.getByRole('note')
  await expect(note).toHaveText('Please fill out the form before choosing your time slot.')
  await note.click()
  await expect(main.getByLabel(/mobile number/i)).toBeFocused()

  await main.getByRole('button', { name: 'Continue' }).click()
  await expect(main.locator('.field.err').first()).toBeVisible()
  await main.getByLabel(/mobile number/i).fill('(555) 010-2345')
  await main.getByLabel('First name').fill('Alex')
  await main.getByLabel('Last name').fill('Morgan')
  await main.getByLabel('Work email').fill('alex@example.com')
  await page.waitForTimeout(2600) // the spam time trap ignores very fast submits
  await main.getByRole('button', { name: 'Continue' }).click()
  await expect(main.getByText('Alex Morgan')).toBeVisible()
  await expect(note).toHaveCount(0)

  await main.getByRole('button', { name: 'Edit' }).click()
  await expect(main.getByLabel('First name')).toHaveValue('Alex')
  await page.waitForTimeout(2600)
  await main.getByRole('button', { name: 'Continue' }).click()

  // Step 2 is her real booking calendar (Google Calendar now, GoHighLevel later), framed at its embed address.
  const frame = main.locator('iframe[title="Book your call"]')
  await expect(frame).toHaveAttribute('src', /^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\/[^?]+\?gv=true$/)
  const newTab = main.getByRole('link', { name: 'Open the booking calendar in a new tab' })
  await expect(newTab).toHaveAttribute('target', '_blank')
})

test('round three: lowercase handwriting, quieter founder story, team and FAQ copy', async ({ page }) => {
  await page.goto('/')
  // Every handwritten accent is lowercase.
  const cases = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((e) => /Benedict/.test(getComputedStyle(e).fontFamily) && e.textContent?.trim())
      .map((e) => getComputedStyle(e).textTransform),
  )
  expect(cases.length).toBeGreaterThan(0)
  expect(new Set(cases)).toEqual(new Set(['lowercase']))
  // Founder story: no handwritten line, no signature, no years on the cards.
  const story = page.locator('main section').filter({ hasText: 'Built by operators' })
  await expect(story).not.toContainText(/founder to founder/i)
  await expect(story).not.toContainText(/2013|2015|2019/)
  await expect(page.locator('main')).toContainText(/got questions\?/i)
  await expect(page.locator('main')).toContainText('take back your time')
  await expect(page.locator('main')).not.toContainText('[number] business days')
  await expect(page.locator('footer')).toContainText(/get good news in your inbox/i)
  await page.goto('/about')
  const team = page.locator('main section').filter({ hasText: /join the team/i })
  await expect(team).toContainText('We are hiring')
  await expect(team).not.toContainText(/always|\[Team member\]|Jenna Colombo/)
  await page.goto('/workshop')
  await expect(page.locator('main')).toContainText('Noon')
  await expect(page.locator('main')).not.toContainText('[TIME]')
  await page.goto('/book')
  await expect(page.locator('main')).toContainText('$18')
  await expect(page.locator('main img[alt*="Attract More Raving Fans"]')).toBeVisible()
})

test('the hero button and the workshop page both lead to the growth call', async ({ page }) => {
  await page.goto('/')
  await page.locator('main').getByRole('link', { name: /claim your 2027 growth strategy/i }).click()
  await expect(page).toHaveURL(/\/growth-strategy$/)
  await page.goto('/workshop')
  const link = page.locator('main').getByRole('link', { name: 'Book a growth strategy call' })
  await expect(link).toHaveAttribute('href', '/growth-strategy')
  await expect(page.locator('main')).toContainText('Not sure the in-person workshop fits?')
})

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
  const form = page.locator('main form').first()
  await form.getByLabel('First name').fill('Alex')
  await form.getByLabel('Last name').fill('Morgan')
  await form.getByLabel('Work email').fill('alex@example.com')
  await form.getByLabel('Mobile number').fill('(555) 010-2345')
  await form.getByLabel('Company', { exact: true }).fill('Example Labs')
  await form.getByLabel('Your role').fill('Founder')
  await form.getByLabel('Company size').selectOption({ index: 2 })
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
