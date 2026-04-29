import { test, expect, Page } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

async function openFirstReviewModal(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await expect(page.getByRole('button', { name: '★ Reviews' }).first()).toBeVisible();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.waitForTimeout(1000);
}

async function ensureNoExistingReview(page: Page) {
  const already = page.getByText('You have already reviewed');
  if (await already.isVisible().catch(() => false)) {
    page.once('dialog', d => d.accept().catch(() => {}));
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  }
}

// TC_US2-1_01: Rating=4, Review="Excellent service and friendly dentist" -> review submitted
test('TC_US2-1_01 submit valid rating and review', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureNoExistingReview(page);

  await page.locator('label').filter({ hasText: /^4 Stars$/ }).click();
  await page.getByRole('textbox', { name: 'Share your experience…' }).fill('Excellent service and friendly dentist');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('You have already reviewed')).toBeVisible();
  await expect(page.getByText('Excellent service and friendly dentist')).toBeVisible();
});

// TC_US2-1_02: Rating not selected -> "Please select a rating."
test('TC_US2-1_02 rating not selected shows error', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureNoExistingReview(page);

  await page.getByRole('textbox', { name: 'Share your experience…' }).fill('Excellent service and friendly dentist');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Please select a rating.')).toBeVisible();
});

// TC_US2-1_03: Rating=5, Review empty -> "Please write a review."
test('TC_US2-1_03 empty review shows error', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureNoExistingReview(page);

  await page.locator('label').filter({ hasText: /^5 Stars$/ }).click();
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Please write a review.')).toBeVisible();
});
