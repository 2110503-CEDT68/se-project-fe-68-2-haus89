import { test, expect, Page } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

async function openOwnReviewModal(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.waitForTimeout(1000);
}

async function ensureExistingReview(page: Page) {
  if (!(await page.getByText('You have already reviewed').isVisible().catch(() => false))) {
    await page.locator('label').filter({ hasText: /^4 Stars$/ }).click();
    await page.getByRole('textbox', { name: 'Share your experience…' }).fill('initial review for editing');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('You have already reviewed')).toBeVisible();
  }
}

// TC_US2-3_01: Click "Edit" -> edit form opens with pre-filled data
test('TC_US2-3_01 edit form opens with pre-filled data', async ({ page }) => {
  await openOwnReviewModal(page);
  await ensureExistingReview(page);

  await page.getByRole('button', { name: 'Edit' }).click();

  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  await expect(page.getByPlaceholder('Share your experience...')).not.toBeEmpty();
});

// TC_US2-3_02: Change rating/text and Save -> updated content shown
test('TC_US2-3_02 change rating and text then save', async ({ page }) => {
  await openOwnReviewModal(page);
  await ensureExistingReview(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.locator('label').filter({ hasText: /^3 Stars$/ }).click();
  await page.getByRole('textbox', { name: 'Share your experience...' }).fill('the dentist was professional');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('button', { name: 'Save' })).not.toBeVisible();
  await expect(page.getByText('the dentist was professional', { exact: true })).toBeVisible();
});

// TC_US2-3_03: Submit with empty text -> "Please write a review."
test('TC_US2-3_03 save with empty text shows error', async ({ page }) => {
  await openOwnReviewModal(page);
  await ensureExistingReview(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox', { name: 'Share your experience...' }).fill('');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Please write a review.')).toBeVisible();
});

// TC_US2-3_04: Try to deselect rating to 0 -> "Please select a rating."
test('TC_US2-3_04 deselect rating shows error', async ({ page }) => {
  await openOwnReviewModal(page);
  await ensureExistingReview(page);

  await page.getByRole('button', { name: 'Edit' }).click();

  // Click the currently active star to deselect (MUI Rating sets value to null)
  const checkedId = await page.locator('.MuiRating-root input[type="radio"]:checked').first().getAttribute('id');
  await page.locator(`label[for="${checkedId}"]`).click({ force: true });

  await page.getByRole('textbox', { name: 'Share your experience...' }).fill('attempting deselect');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Please select a rating.')).toBeVisible();
});
