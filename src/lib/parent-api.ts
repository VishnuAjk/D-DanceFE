import type { ApiResponse } from '@danceapp/shared';
import apiClient from '@/lib/api-client';
import type {
  ParentBatchOption,
  ParentBranchOption,
  ParentChild,
  ParentDashboardSummary,
  ParentEnrollment,
  ParentAttendanceRecord,
  ParentAssessmentRecord
} from '@/types/parent';

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

export function fetchEnrollmentBranches() {
  return apiClient
    .get<ApiResponse<ParentBranchOption[]>>('/api/student/catalog/branches')
    .then(unwrapData);
}

export function fetchEnrollmentBatches(filters?: { branchId?: string; courseId?: string }) {
  return apiClient
    .get<ApiResponse<ParentBatchOption[]>>('/api/student/catalog/batches', { params: filters })
    .then(unwrapData);
}

export function fetchEnrollments() {
  return apiClient
    .get<ApiResponse<ParentEnrollment[]>>('/api/student/enrollments')
    .then(unwrapData);
}

export function createEnrollment(payload: { childId: string; batchId: string }) {
  return apiClient.post<ApiResponse<ParentEnrollment>>('/api/student/enroll', payload).then(unwrapData);
}

export function fetchParentDashboard() {
  return apiClient
    .get<ApiResponse<ParentDashboardSummary>>('/api/student/dashboard')
    .then(unwrapData);
}

export function fetchChildAttendance(filters: { childId: string; month: string }) {
  return apiClient
    .get<ApiResponse<ParentAttendanceRecord[]>>('/api/student/attendance', { params: filters })
    .then(unwrapData);
}

export function fetchChildAssessments(filters: { childId: string }) {
  return apiClient
    .get<ApiResponse<ParentAssessmentRecord[]>>('/api/student/assessments', { params: filters })
    .then(unwrapData);
}
