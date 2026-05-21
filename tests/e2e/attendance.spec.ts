import { expect, test } from '@playwright/test';
import { apiResponse, batch, child, fulfillJson, ids, instructorUser, mockAuth } from './helpers';

test('instructor can mark attendance idempotently for a batch roster', async ({ page }) => {
  await mockAuth(page, instructorUser);
  let markCalls = 0;
  const secondChild = {
    ...child(),
    _id: '64f000000000000000000007',
    name: 'Vihaan Mehta',
    gender: 'male'
  };

  await page.route(`**/api/instructor/batches/${ids.batch}/roster`, (route) =>
    fulfillJson(
      route,
      apiResponse({
        batch: batch(),
        roster: [
          { _id: '64f000000000000000000201', childId: child(), batchId: ids.batch, status: 'ACTIVE' },
          { _id: '64f000000000000000000202', childId: secondChild, batchId: ids.batch, status: 'ACTIVE' }
        ]
      })
    )
  );
  await page.route('**/api/instructor/attendance/mark', async (route) => {
    markCalls += 1;
    const payload = route.request().postDataJSON() as {
      records: Array<{ childId: string; status: string }>;
    };

    expect(payload.records.map((record) => record.childId).sort()).toEqual(
      [ids.child, secondChild._id].sort()
    );

    await fulfillJson(
      route,
      apiResponse(
        payload.records.map((record) => ({
          _id: `${record.childId}-${payload.records.length}`,
          batchId: ids.batch,
          childId: record.childId,
          date: '2026-05-17T00:00:00.000Z',
          status: record.status
        }))
      )
    );
  });

  await page.goto(`/instructor/batches/${ids.batch}/attendance`);
  await page.getByRole('button', { name: 'Present' }).nth(0).click();
  await page.getByRole('button', { name: 'Present' }).nth(1).click();
  await page.getByRole('button', { name: 'Save attendance' }).click();
  await expect.poll(() => markCalls).toBe(1);

  await page.getByRole('button', { name: 'Save attendance' }).click();
  await expect.poll(() => markCalls).toBe(2);
});
