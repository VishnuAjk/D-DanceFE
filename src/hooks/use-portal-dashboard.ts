'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPortalDashboard } from '@/lib/portal-api';

export function usePortalDashboard() {
  return useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: fetchPortalDashboard
  });
}
