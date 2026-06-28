import { expect, test } from '@playwright/test'

test('homepage loads and shows curriculum overview', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/AI Learning Path/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('phase deep link loads', async ({ page }) => {
  await page.goto('/phase/llm-fundamentals')
  await expect(page.getByRole('heading', { name: /LLM Fundamentals/i })).toBeVisible()
})

test('progress persists after reload', async ({ page }) => {
  await page.goto('/phase/llm-fundamentals')
  const toggle = page.getByRole('button', { name: /LLM Introduction/i })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
})

test('news radar route loads', async ({ page }) => {
  await page.goto('/news-radar')
  await expect(page.getByRole('heading', { name: /AI News Radar/i })).toBeVisible()
})
