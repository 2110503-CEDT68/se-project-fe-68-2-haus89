import { test, expect } from '@playwright/test';

const authFile = 'tests/user.json';

test('auth', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('navigation').getByRole('link', { name: 'Log In' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('boss@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Login' }).click();
  // await page.goto('http://localhost:3000/');
  await expect(page.getByText('user', { exact: true })).toBeVisible();

  await page.context().storageState({ path: authFile });
});