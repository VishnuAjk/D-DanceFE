'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPortalFees } from '@/lib/portal-api';

export function usePortalFees(filters?: { studentProfileId?: string; month?: string }) {
  return useQuery({
    queryKey: ['portal-fees', filters],
    queryFn: () => fetchPortalFees(filters)
  });
}

