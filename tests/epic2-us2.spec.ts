import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

test('us2-view-reviews', async ({ page }) => {
      await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText('★').first()).toBeVisible();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await expect(page.getByText('★', { exact: true }).nth(2)).toBeVisible();
  await page.getByRole('button', { name: '✕' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).nth(2).click();
  await expect(page.getByRole('main')).toContainText('No reviews yet.');
});