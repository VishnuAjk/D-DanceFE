'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchParentFees } from '@/lib/parent-api';

export function useParentFees(filters?: { childId?: string; month?: string }) {
  return useQuery({
    queryKey: ['parent-fees', filters],
    queryFn: () => fetchParentFees(filters)
  });
}

