'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchParentDashboard } from '@/lib/parent-api';

export function useParentDashboard() {
  return useQuery({
    queryKey: ['parent-dashboard'],
    queryFn: fetchParentDashboard
  });
}
