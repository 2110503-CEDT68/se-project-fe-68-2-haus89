import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/user.json' });

test('us1-create-review', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Dentists' }).click();
     await expect(page.getByRole('button', { name: '★ Reviews' }).first()).toBeVisible();
    await page.getByRole('button', { name: '★ Reviews' }).first().click();

    await page.waitForTimeout(1000);

    // await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page.getByText('You have already reviewed')).not.toBeVisible();

    await page.locator('label').filter({ hasText: /^5 Stars$/ }).click();
    await page.getByRole('textbox', { name: 'Share your experience…' }).click();
    await page.getByRole('textbox', { name: 'Share your experience…' }).fill('you are amazing!');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Your review')).toBeVisible();
    await page.getByRole('button', { name: '✕' }).click();
    await page.getByRole('button', { name: '★ Reviews' }).first().click();
    await expect(page.getByText('You have already reviewed')).toBeVisible();
        
});