'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchChild, fetchChildren } from '@/lib/parent-api';

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: fetchChildren
  });
}

export function useChild(childId: string) {
  return useQuery({
    queryKey: ['child', childId],
    queryFn: () => fetchChild(childId),
    enabled: Boolean(childId)
  });
}
