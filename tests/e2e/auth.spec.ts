import { expect, test } from '@playwright/test';
import { apiResponse, fulfillJson, mockLoggedOut, parentUser } from './helpers';

test('OTP login and redirect by role', async ({ page }) => {
  await mockLoggedOut(page);
  await page.route('**/api/auth/otp-send', (route) =>
    fulfillJson(route, apiResponse({ txnId: 'txn-e2e', expiresIn: 60 }))
  );
  await page.route('**/api/auth/otp-verify', (route) =>
    fulfillJson(route, apiResponse({ accessToken: 'parent-token', user: parentUser }))
  );

  await page.goto('/login');
  await page.getByLabel('Mobile Number').fill('9999999999');
  await page.getByRole('button', { name: 'Send OTP' }).click();
  await page.getByLabel('One-Time Password').fill('123456');
  await page.getByRole('button', { name: 'Verify and continue' }).click();

  await expect(page).toHaveURL(/\/parent$/);
});
