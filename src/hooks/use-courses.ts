'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '@/lib/admin-api';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses
  });
}
