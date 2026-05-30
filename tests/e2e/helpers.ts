import type { Page, Route } from '@playwright/test';

type AuthUser = {
  _id: string;
  name: string;
  role: string;
  phone: string;
};

export const ids = {
  branch: '64f000000000000000000001',
  course: '64f000000000000000000002',
  level: '64f000000000000000000003',
  batch: '64f000000000000000000004',
  student: '64f000000000000000000005',
  enrollment: '64f000000000000000000006'
};

export const customerUser: AuthUser = {
  _id: '64f000000000000000000101',
  name: 'Customer User',
  role: 'customer',
  phone: '9999999999'
};

export const adminUser: AuthUser = {
  _id: '64f000000000000000000102',
  name: 'Admin User',
  role: 'super_admin',
  phone: '9888888888'
};

export const instructorUser: AuthUser = {
  _id: '64f000000000000000000103',
  name: 'Instructor User',
  role: 'instructor',
  phone: '9777777777'
};

export function apiResponse<T>(data: T) {
  return {
    success: true,
    data,
    error: null,
    meta: {
      requestId: 'e2e',
      timestamp: '2026-05-17T00:00:00.000Z'
    }
  };
}

export async function fulfillJson(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  });
}

export async function mockLoggedOut(page: Page) {
  await page.route('**/api/auth/refresh', (route) =>
    fulfillJson(
      route,
      {
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' },
        meta: { requestId: 'e2e', timestamp: '2026-05-17T00:00:00.000Z' }
      },
      401
    )
  );
}

export async function mockAuth(page: Page, user: AuthUser) {
  await page.route('**/api/auth/refresh', (route) =>
    fulfillJson(route, apiResponse({ accessToken: `token-${user.role}` }))
  );
  await page.route('**/api/auth/me', (route) => fulfillJson(route, apiResponse(user)));
}

export function branch() {
  return {
    _id: ids.branch,
    name: 'Indiranagar Studio',
    city: 'Bengaluru',
    address: '100 Dance Street',
    phone: '9876543210',
    isActive: true
  };
}

export function batch() {
  return {
    _id: ids.batch,
    name: 'Bharatanatyam Beginners',
    branchId: branch(),
    courseId: { _id: ids.course, name: 'Bharatanatyam' },
    levelId: { _id: ids.level, name: 'Level 1', order: 1 },
    schedule: { days: ['MON', 'WED'], startTime: '17:00', endTime: '18:00' },
    capacity: 20,
    monthlyFee: 1200,
    isActive: true,
    instructorIds: []
  };
}

export function student() {
  return {
    _id: ids.student,
    name: 'Anaya Rao',
    dob: '2015-06-15T00:00:00.000Z',
    gender: 'female',
    photo: '',
    isActive: true
  };
}

export function enrollment(status = 'PENDING') {
  return {
    _id: ids.enrollment,
    studentProfileId: student(),
    batchId: batch(),
    branchId: branch(),
    status,
    requestedAt: '2026-05-17T00:00:00.000Z'
  };
}
