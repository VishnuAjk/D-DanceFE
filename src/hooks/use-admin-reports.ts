'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchAttendanceReport,
  fetchEnrollmentStatsReport,
  fetchRevenueReport
} from '@/lib/admin-api';

export function useRevenueReport(filters: { branchId?: string; fromMonth: string; toMonth: string }) {
  return useQuery({
    queryKey: ['admin-report-revenue', filters],
    queryFn: () => fetchRevenueReport(filters),
    enabled: Boolean(filters.fromMonth && filters.toMonth)
  });
}

export function useAttendanceReport(filters: { batchId?: string; month: string }) {
  return useQuery({
    queryKey: ['admin-report-attendance', filters],
    queryFn: () => fetchAttendanceReport({ batchId: filters.batchId ?? '', month: filters.month }),
    enabled: Boolean(filters.batchId && filters.month)
  });
}

export function useEnrollmentStatsReport(filters?: { branchId?: string }) {
  return useQuery({
    queryKey: ['admin-report-enrollments', filters],
    queryFn: () => fetchEnrollmentStatsReport(filters)
  });
}
