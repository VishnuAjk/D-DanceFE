import type { ApiResponse } from '@danceapp/shared';
import apiClient from '@/lib/api-client';
import type { ParentChild } from '@/types/parent';

function unwrapData<T>(response: { data: ApiResponse<T> }) {
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error('API returned an empty payload');
  }

  return response.data.data;
}

export function fetchChildren() {
  return apiClient.get<ApiResponse<ParentChild[]>>('/api/student/children').then(unwrapData);
}

export function fetchChild(childId: string) {
  return apiClient.get<ApiResponse<ParentChild>>(`/api/student/children/${childId}`).then(unwrapData);
}

export function createChild(payload: {
  name: string;
  dob: string;
  gender: string;
  photo?: string;
}) {
  return apiClient.post<ApiResponse<ParentChild>>('/api/student/children', payload).then(unwrapData);
}

export function updateChild(
  childId: string,
  payload: Partial<{
    name: string;
    dob: string;
    gender: string;
    photo?: string;
  }>
) {
  return apiClient.put<ApiResponse<ParentChild>>(`/api/student/children/${childId}`, payload).then(unwrapData);
}

export function deleteChild(childId: string) {
  return apiClient.delete<ApiResponse<ParentChild>>(`/api/student/children/${childId}`).then(unwrapData);
}
