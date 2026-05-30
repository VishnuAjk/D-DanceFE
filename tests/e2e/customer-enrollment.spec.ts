import { expect, test } from '@playwright/test';
import {
  apiResponse,
  batch,
  branch,
  student,
  enrollment,
  fulfillJson,
  ids,
  mockAuth,
  customerUser
} from './helpers';

test('customer can add a student and submit a pending enrollment request', async ({ page }) => {
  await mockAuth(page, customerUser);
  const studentProfiles = [student()];
  const enrollments = [enrollment('PENDING')];

  await page.route('**/api/portal/student-profiles', async (route) => {
    if (route.request().method() === 'POST') {
      await fulfillJson(route, apiResponse(student()), 201);
      return;
    }

    await fulfillJson(route, apiResponse(studentProfiles));
  });
  await page.route(`**/api/portal/student-profiles/${ids.student}`, (route) =>
    fulfillJson(route, apiResponse(student()))
  );
  await page.route('**/api/portal/catalog/branches', (route) =>
    fulfillJson(route, apiResponse([branch()]))
  );
  await page.route('**/api/portal/catalog/batches**', (route) =>
    fulfillJson(route, apiResponse([batch()]))
  );
  await page.route('**/api/portal/enroll', (route) =>
    fulfillJson(route, apiResponse(enrollment('PENDING')), 201)
  );
  await page.route('**/api/portal/enrollments', (route) =>
    fulfillJson(route, apiResponse(enrollments))
  );

  await page.goto('/portal/student-profiles/add');
  await page.getByLabel('Student name').fill('Anaya Rao');
  await page.getByLabel('Date of birth').fill('2015-06-15');
  await page.getByRole('button', { name: 'Create student profile' }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/student-profiles/${ids.student}$`));

  await page.goto('/portal/enrollments/new');
  await page.getByLabel('Select branch').selectOption(ids.branch);
  await page.getByRole('button', { name: 'Continue to batch selection' }).click();
  await page.getByRole('button', { name: /Bharatanatyam Beginners/ }).click();
  await page.getByRole('button', { name: 'Continue to student selection' }).click();
  await page.getByLabel('Choose student profile').selectOption(ids.student);
  await page.getByRole('button', { name: 'Submit enrollment request' }).click();

  await page.goto('/portal/enrollments');
  await expect(page.getByText('Anaya Rao')).toBeVisible();
  await expect(page.getByText('PENDING')).toBeVisible();
});
