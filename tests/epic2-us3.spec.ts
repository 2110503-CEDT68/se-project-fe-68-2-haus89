import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

test('us3-edit-review', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('label').filter({ hasText: /^5 Stars$/ })).toBeVisible();
  await expect(page.getByPlaceholder('Share your experience...')).toContainText('you are amazing!');
  // await page.locator('label').filter({ hasText: '4.5 Stars' }).click();
  await page.getByRole('textbox', { name: 'Share your experience...' }).click();
  await page.getByRole('textbox', { name: 'Share your experience...' }).fill('the dentist was professional');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('main')).toContainText('the dentist was professional');






});