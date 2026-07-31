import { expect, test } from '@playwright/test';
import { adminUser, apiResponse, fulfillJson, mockAuth } from './helpers';

async function expectNoDocumentOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test('public navigation is compact and pages do not overflow', async ({ page }) => {
  await page.goto('/');
  await expectNoDocumentOverflow(page);

  if ((page.viewportSize()?.width ?? 1024) < 640) {
    const toggle = page.getByRole('button', { name: 'Toggle main menu' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('link', { name: 'About us' })).toBeVisible();
  }
});

test('admin mobile shell exposes primary tabs and accessible More sheet', async ({ page }) => {
  await mockAuth(page, adminUser);
  await page.route('**/api/admin/**', (route) => fulfillJson(route, apiResponse([])));
  await page.goto('/admin');

  if ((page.viewportSize()?.width ?? 1024) < 1024) {
    const nav = page.getByRole('navigation', { name: 'Admin primary navigation' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('button', { name: 'More destinations' }).click();
    const sheet = page.getByRole('dialog', { name: 'More and account' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Reports' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  }

  await expectNoDocumentOverflow(page);
});
