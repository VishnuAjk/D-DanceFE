import { expect, test } from '@playwright/test';
import { apiResponse, fulfillJson, mockLoggedOut } from './helpers';

const demoAccounts = [
  { name: 'Super Admin', role: 'super_admin', phone: '9990000001', path: '/admin' },
  { name: 'Branch Admin', role: 'branch_admin', phone: '9990000002', path: '/admin' },
  { name: 'Instructor', role: 'instructor', phone: '9990000003', path: '/instructor' },
  { name: 'Customer / Family', role: 'customer', phone: '9990000004', path: '/portal' }
];

for (const account of demoAccounts) {
  test(`demo role card signs in as ${account.name}`, async ({ page }) => {
    await mockLoggedOut(page);
    await page.route('**/api/auth/demo-config', (route) =>
      fulfillJson(
        route,
        apiResponse({
          enabled: true,
          otpCode: '123456',
          accounts: demoAccounts.map(({ name, role, phone }) => ({
            name,
            role,
            phone,
            description: `Explore as ${name}`
          }))
        })
      )
    );
    await page.route('**/api/auth/otp-send', (route) =>
      fulfillJson(route, apiResponse({ txnId: 'demo-transaction', expiresIn: 300 }))
    );
    await page.route('**/api/auth/otp-verify', (route) =>
      fulfillJson(
        route,
        apiResponse({
          accessToken: `demo-${account.role}`,
          user: {
            _id: `demo-${account.role}`,
            name: account.name,
            role: account.role,
            phone: account.phone,
            isDemo: true
          }
        })
      )
    );

    await page.goto('/login');
    await page.getByRole('button', { name: new RegExp(`^${account.name}`) }).click();
    await expect(page.getByLabel('Mobile Number')).toHaveValue(account.phone);
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await page.getByRole('button', { name: /Use demo OTP/ }).click();
    await expect(page.getByLabel('One-Time Password')).toHaveValue('123456');
    await page.getByRole('button', { name: 'Verify and continue' }).click();

    await expect(page).toHaveURL(new RegExp(`${account.path}$`));
  });
}
