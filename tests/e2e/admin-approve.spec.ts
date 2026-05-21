import { expect, test } from '@playwright/test';
import { adminUser, apiResponse, enrollment, fulfillJson, ids, mockAuth } from './helpers';

test('admin can approve a pending enrollment request', async ({ page }) => {
  await mockAuth(page, adminUser);
  let status = 'PENDING';

  await page.route('**/api/admin/enrollments**', async (route) => {
    const url = new URL(route.request().url());

    if (route.request().method() === 'PUT' && url.pathname.endsWith(`/approve`)) {
      status = 'APPROVED';
      await fulfillJson(route, apiResponse(enrollment(status)));
      return;
    }

    const requestedStatus = url.searchParams.get('status');
    const rows = !requestedStatus || requestedStatus === status ? [enrollment(status)] : [];
    await fulfillJson(route, apiResponse(rows));
  });
  await page.route(`**/api/admin/enrollments/${ids.enrollment}/approve`, async (route) => {
    status = 'APPROVED';
    await fulfillJson(route, apiResponse(enrollment(status)));
  });

  await page.goto('/admin/enrollments');
  await expect(page.getByText('PENDING')).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByLabel('Status filter').selectOption('APPROVED');

  await expect(page.getByText('APPROVED')).toBeVisible();
});
