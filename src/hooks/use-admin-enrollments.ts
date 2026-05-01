'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminEnrollments } from '@/lib/admin-api';

export function useAdminEnrollments(filters?: {
  status?: string;
  branchId?: string;
  batchId?: string;
}) {
  return useQuery({
    queryKey: ['admin-enrollments', filters],
    queryFn: () => fetchAdminEnrollments(filters)
  });
}
