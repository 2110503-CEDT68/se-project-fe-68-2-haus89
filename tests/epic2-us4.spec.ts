import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

test('us4', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
});