import { ADMIN_ROLES, UserRole } from '@danceapp/shared';

export function resolveDashboardPath(role: string | undefined) {
  if (!role) {
    return '/login';
  }

  if (ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    return '/admin';
  }

  if (role === UserRole.INSTRUCTOR) {
    return '/instructor';
  }

  if (role === 'customer' || role === UserRole.PARENT) {
    return '/portal';
  }

  return '/unauthorized';
}
