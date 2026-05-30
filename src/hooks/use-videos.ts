'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminVideos } from '@/lib/admin-api';
import { fetchVideos } from '@/lib/portal-api';

export function useVideos(filters?: { courseId?: string; levelId?: string; tags?: string }) {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => fetchVideos(filters)
  });
}

export function useAdminVideos() {
  return useQuery({
    queryKey: ['admin-videos'],
    queryFn: fetchAdminVideos
  });
}
