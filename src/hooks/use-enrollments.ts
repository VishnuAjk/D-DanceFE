'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchEnrollmentBatches,
  fetchEnrollmentBranches,
  fetchEnrollments
} from '@/lib/parent-api';

export function useEnrollments() {
  return useQuery({
    queryKey: ['parent-enrollments'],
    queryFn: fetchEnrollments
  });
}

export function useEnrollmentBranches() {
  return useQuery({
    queryKey: ['parent-enrollment-branches'],
    queryFn: fetchEnrollmentBranches
  });
}

export function useEnrollmentBatches(filters?: { branchId?: string; courseId?: string }) {
  return useQuery({
    queryKey: ['parent-enrollment-batches', filters],
    queryFn: () => fetchEnrollmentBatches(filters),
    enabled: Boolean(filters?.branchId)
  });
}
