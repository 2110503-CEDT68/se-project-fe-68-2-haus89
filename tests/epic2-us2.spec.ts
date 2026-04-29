import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

// TC_US2-2_01: Click Reviews on a dentist with existing reviews -> list shown
test('TC_US2-2_01 read reviews for dentist with reviews', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await expect(page.getByRole('main')).toBeVisible();

  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.waitForTimeout(1000);

  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText('No reviews yet.');
});

// TC_US2-2_02: Click Reviews on a dentist with no reviews -> placeholder
test('TC_US2-2_02 read reviews for dentist with no reviews', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await expect(page.getByRole('main')).toBeVisible();

  const reviewButtons = page.getByRole('button', { name: '★ Reviews' });
  await reviewButtons.first().waitFor({ state: 'visible' });
  const count = await reviewButtons.count();

  let foundNoReview = false;
  for (let i = 0; i < count; i++) {
    await reviewButtons.nth(i).click();
    await page.waitForTimeout(800);
    if (await page.getByText('No reviews yet.').isVisible().catch(() => false)) {
      foundNoReview = true;
      break;
    }
    await page.getByRole('button', { name: '✕' }).click();
  }

  expect(foundNoReview).toBeTruthy();
  await expect(page.getByText('No reviews yet.')).toBeVisible();
});
