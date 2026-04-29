import { test, expect, Page } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

async function openFirstReviewModal(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dentists' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.waitForTimeout(1000);
}

async function ensureExistingReview(page: Page) {
  if (!(await page.getByText('You have already reviewed').isVisible().catch(() => false))) {
    await page.locator('label').filter({ hasText: /^4 Stars$/ }).click();
    await page.getByRole('textbox', { name: 'Share your experience…' }).fill('review to be deleted');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('You have already reviewed')).toBeVisible();
  }
}

// TC_US2-4_01: Click Delete then OK on confirm -> review removed, submit form returns
test('TC_US2-4_01 confirm delete removes review', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureExistingReview(page);

  page.once('dialog', d => d.accept().catch(() => {}));
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('You have already reviewed')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
});

// TC_US2-4_02: Click Delete then Cancel on confirm -> review remains
test('TC_US2-4_02 cancel delete keeps review', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureExistingReview(page);

  page.once('dialog', d => d.dismiss().catch(() => {}));
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('You have already reviewed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
});

// TC_US2-4_03: After delete, return to dentist's profile -> can submit a new review
test('TC_US2-4_03 after delete submit form returns on revisit', async ({ page }) => {
  await openFirstReviewModal(page);
  await ensureExistingReview(page);

  page.once('dialog', d => d.accept().catch(() => {}));
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

  // close modal and reopen to confirm submit form is still available
  await page.getByRole('button', { name: '✕' }).click();
  await page.getByRole('button', { name: '★ Reviews' }).first().click();
  await page.waitForTimeout(1000);

  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  await expect(page.getByText('You have already reviewed')).not.toBeVisible();
});
