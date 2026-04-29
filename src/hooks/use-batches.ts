'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBatch, fetchBatchRoster, fetchBatches } from '@/lib/admin-api';

export function useBatches(filters?: { branchId?: string }) {
  return useQuery({
    queryKey: ['batches', filters],
    queryFn: () => fetchBatches(filters)
  });
}

export function useBatch(batchId: string) {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => fetchBatch(batchId),
    enabled: Boolean(batchId)
  });
}

export function useBatchRoster(batchId: string) {
  return useQuery({
    queryKey: ['batch-roster', batchId],
    queryFn: () => fetchBatchRoster(batchId),
    enabled: Boolean(batchId)
  });
}
