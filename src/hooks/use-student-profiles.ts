'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStudentProfile, fetchStudentProfiles } from '@/lib/portal-api';

export function useStudentProfiles() {
  return useQuery({
    queryKey: ['student profiles'],
    queryFn: fetchStudentProfiles
  });
}

export function useStudentProfile(studentProfileId: string) {
  return useQuery({
    queryKey: ['student', studentProfileId],
    queryFn: () => fetchStudentProfile(studentProfileId),
    enabled: Boolean(studentProfileId)
  });
}
