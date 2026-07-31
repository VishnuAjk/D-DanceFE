import { describe, expect, it } from 'vitest';
import { adminNavigation, instructorNavigation, isNavigationActive, portalNavigation } from './navigation';

describe('application navigation', () => {
  it('keeps a parent destination active on nested screens', () => {
    const batches = adminNavigation.primary.find((item) => item.href === '/admin/batches');
    expect(batches).toBeDefined();
    expect(isNavigationActive('/admin/batches/123/roster', batches!)).toBe(true);
  });

  it('does not let the exact admin dashboard match every admin route', () => {
    expect(isNavigationActive('/admin/reports', adminNavigation.primary[0])).toBe(false);
  });

  it('provides the intended primary destinations for each role', () => {
    expect(adminNavigation.primary.map((item) => item.label)).toEqual(['Dashboard', 'Batches', 'Enrollments', 'Fees']);
    expect(portalNavigation.primary.map((item) => item.label)).toEqual(['Home', 'Students', 'Enrollments', 'Fees']);
    expect(instructorNavigation.primary.map((item) => item.label)).toEqual(['Home', 'Batches']);
  });
});
