'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@danceapp/shared';
import type { Batch, EnrollmentRosterItem } from '@/types/admin';

function unwrapData<T>(response: { data: ApiResponse<T> }) {
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error('API returned an empty payload');
  }

  return response.data.data;
}

export function useInstructorBatches() {
  return useQuery({
    queryKey: ['instructor-batches'],
    queryFn: () =>
      apiClient.get<ApiResponse<Batch[]>>('/api/instructor/batches').then(unwrapData)
  });
}

export function useInstructorBatchRoster(batchId: string) {
  return useQuery({
    queryKey: ['instructor-batch-roster', batchId],
    queryFn: () =>
      apiClient
        .get<ApiResponse<{ batch: Batch; roster: EnrollmentRosterItem[] }>>(
          `/api/instructor/batches/${batchId}/roster`
        )
        .then(unwrapData),
    enabled: Boolean(batchId)
  });
}
