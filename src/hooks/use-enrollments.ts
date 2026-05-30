'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchEnrollmentBatches,
  fetchEnrollmentBranches,
  fetchEnrollments
} from '@/lib/portal-api';

export function useEnrollments() {
  return useQuery({
    queryKey: ['portal-enrollments'],
    queryFn: fetchEnrollments
  });
}

export function useEnrollmentBranches() {
  return useQuery({
    queryKey: ['portal-enrollment-branches'],
    queryFn: fetchEnrollmentBranches
  });
}

export function useEnrollmentBatches(filters?: { branchId?: string; courseId?: string }) {
  return useQuery({
    queryKey: ['portal-enrollment-batches', filters],
    queryFn: () => fetchEnrollmentBatches(filters),
    enabled: Boolean(filters?.branchId)
  });
}
