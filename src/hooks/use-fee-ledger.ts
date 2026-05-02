'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFeeLedger } from '@/lib/admin-api';

export function useFeeLedger(filters?: {
  branchId?: string;
  month?: string;
  status?: string;
  childId?: string;
}) {
  return useQuery({
    queryKey: ['admin-fee-ledger', filters],
    queryFn: () => fetchFeeLedger(filters)
  });
}

