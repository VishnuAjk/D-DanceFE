import { expect, test } from '@playwright/test';
import {
  apiResponse,
  batch,
  branch,
  child,
  enrollment,
  fulfillJson,
  ids,
  mockAuth,
  parentUser
} from './helpers';

test('parent can add a child and submit a pending enrollment request', async ({ page }) => {
  await mockAuth(page, parentUser);
  const children = [child()];
  const enrollments = [enrollment('PENDING')];

  await page.route('**/api/student/children', async (route) => {
    if (route.request().method() === 'POST') {
      await fulfillJson(route, apiResponse(child()), 201);
      return;
    }

    await fulfillJson(route, apiResponse(children));
  });
  await page.route(`**/api/student/children/${ids.child}`, (route) =>
    fulfillJson(route, apiResponse(child()))
  );
  await page.route('**/api/student/catalog/branches', (route) =>
    fulfillJson(route, apiResponse([branch()]))
  );
  await page.route('**/api/student/catalog/batches**', (route) =>
    fulfillJson(route, apiResponse([batch()]))
  );
  await page.route('**/api/student/enroll', (route) =>
    fulfillJson(route, apiResponse(enrollment('PENDING')), 201)
  );
  await page.route('**/api/student/enrollments', (route) =>
    fulfillJson(route, apiResponse(enrollments))
  );

  await page.goto('/parent/children/add');
  await page.getByLabel('Child name').fill('Anaya Rao');
  await page.getByLabel('Date of birth').fill('2015-06-15');
  await page.getByRole('button', { name: 'Create child profile' }).click();
  await expect(page).toHaveURL(new RegExp(`/parent/children/${ids.child}$`));

  await page.goto('/parent/enrollments/new');
  await page.getByLabel('Select branch').selectOption(ids.branch);
  await page.getByRole('button', { name: 'Continue to batch selection' }).click();
  await page.getByRole('button', { name: /Bharatanatyam Beginners/ }).click();
  await page.getByRole('button', { name: 'Continue to child selection' }).click();
  await page.getByLabel('Choose child profile').selectOption(ids.child);
  await page.getByRole('button', { name: 'Submit enrollment request' }).click();

  await page.goto('/parent/enrollments');
  await expect(page.getByText('Anaya Rao')).toBeVisible();
  await expect(page.getByText('PENDING')).toBeVisible();
});
