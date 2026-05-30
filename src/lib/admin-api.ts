import type { ApiResponse } from '@danceapp/shared';
import apiClient from '@/lib/api-client';
import type {
  AdminEnrollment,
  AdminFeeLedger,
  AdminVideo,
  AttendanceReport,
  Batch,
  Branch,
  Course,
  EnrollmentRosterItem,
  EnrollmentStatsReport,
  RevenueReport
} from '@/types/admin';

function unwrapData<T>(response: { data: ApiResponse<T> }) {
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error('API returned an empty payload');
  }

  return response.data.data;
}

export function fetchBranches() {
  return apiClient.get<ApiResponse<Branch[]>>('/api/admin/branches').then(unwrapData);
}

export function createBranch(payload: Partial<Branch>) {
  return apiClient.post<ApiResponse<Branch>>('/api/admin/branches', payload).then(unwrapData);
}

export function updateBranch(id: string, payload: Partial<Branch>) {
  return apiClient.put<ApiResponse<Branch>>(`/api/admin/branches/${id}`, payload).then(unwrapData);
}

export function fetchCourses() {
  return apiClient.get<ApiResponse<Course[]>>('/api/admin/courses').then(unwrapData);
}

export function createCourse(payload: Partial<Course>) {
  return apiClient.post<ApiResponse<Course>>('/api/admin/courses', payload).then(unwrapData);
}

export function updateCourse(id: string, payload: Partial<Course>) {
  return apiClient.put<ApiResponse<Course>>(`/api/admin/courses/${id}`, payload).then(unwrapData);
}

export function createLevel(courseId: string, payload: { name: string; order: number }) {
  return apiClient
    .post<ApiResponse<unknown>>(`/api/admin/courses/${courseId}/levels`, payload)
    .then(unwrapData);
}

export function updateLevel(levelId: string, payload: { name?: string; order?: number }) {
  return apiClient.put<ApiResponse<unknown>>(`/api/admin/levels/${levelId}`, payload).then(unwrapData);
}

export function fetchBatches(filters?: { branchId?: string }) {
  return apiClient
    .get<ApiResponse<Batch[]>>('/api/admin/batches', { params: filters })
    .then(unwrapData);
}

export function fetchBatch(batchId: string) {
  return fetchBatches().then((batches) => {
    const batch = batches.find((entry) => entry._id === batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    return batch;
  });
}

export function createBatch(payload: Record<string, unknown>) {
  return apiClient.post<ApiResponse<Batch>>('/api/admin/batches', payload).then(unwrapData);
}

export function updateBatch(batchId: string, payload: Record<string, unknown>) {
  return apiClient.put<ApiResponse<Batch>>(`/api/admin/batches/${batchId}`, payload).then(unwrapData);
}

export function fetchBatchRoster(batchId: string) {
  return apiClient
    .get<ApiResponse<EnrollmentRosterItem[]>>(`/api/admin/batches/${batchId}/roster`)
    .then(unwrapData);
}

export function fetchAdminEnrollments(filters?: {
  status?: string;
  branchId?: string;
  batchId?: string;
}) {
  return apiClient
    .get<ApiResponse<AdminEnrollment[]>>('/api/admin/enrollments', { params: filters })
    .then(unwrapData);
}

export function approveEnrollment(enrollmentId: string) {
  return apiClient
    .put<ApiResponse<AdminEnrollment>>(`/api/admin/enrollments/${enrollmentId}/approve`)
    .then(unwrapData);
}

export function rejectEnrollment(enrollmentId: string) {
  return apiClient
    .put<ApiResponse<AdminEnrollment>>(`/api/admin/enrollments/${enrollmentId}/reject`)
    .then(unwrapData);
}

export function suspendEnrollment(enrollmentId: string) {
  return apiClient
    .put<ApiResponse<AdminEnrollment>>(`/api/admin/enrollments/${enrollmentId}/suspend`)
    .then(unwrapData);
}

export function generateFeeLedger(payload: { month: string; branchId?: string; batchId?: string }) {
  return apiClient
    .post<ApiResponse<{ month: string; enrollmentCount: number; insertedCount: number; matchedCount: number }>>(
      '/api/admin/fees/generate',
      payload
    )
    .then(unwrapData);
}

export function fetchFeeLedger(filters?: {
  branchId?: string;
  month?: string;
  status?: string;
  childId?: string;
}) {
  return apiClient
    .get<ApiResponse<AdminFeeLedger[]>>('/api/admin/fees/ledger', { params: filters })
    .then(unwrapData);
}

export function waiveFeeLedger(ledgerId: string) {
  return apiClient
    .put<ApiResponse<AdminFeeLedger>>(`/api/admin/fees/ledger/${ledgerId}/waive`)
    .then(unwrapData);
}

export function discountFeeLedger(ledgerId: string, payload: { discount: number; notes?: string }) {
  return apiClient
    .put<ApiResponse<AdminFeeLedger>>(`/api/admin/fees/ledger/${ledgerId}/discount`, payload)
    .then(unwrapData);
}

export function fetchAdminVideos() {
  return apiClient.get<ApiResponse<AdminVideo[]>>('/api/admin/videos').then(unwrapData);
}

export function createAdminVideo(payload: Record<string, unknown>) {
  return apiClient.post<ApiResponse<AdminVideo>>('/api/admin/videos', payload).then(unwrapData);
}

export function updateAdminVideo(videoId: string, payload: Record<string, unknown>) {
  return apiClient.put<ApiResponse<AdminVideo>>(`/api/admin/videos/${videoId}`, payload).then(unwrapData);
}

export function deleteAdminVideo(videoId: string) {
  return apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/videos/${videoId}`).then(unwrapData);
}

export function fetchRevenueReport(filters: { branchId?: string; fromMonth: string; toMonth: string }) {
  return apiClient
    .get<ApiResponse<RevenueReport>>('/api/admin/reports/revenue', { params: filters })
    .then(unwrapData);
}

export function fetchAttendanceReport(filters: { batchId: string; month: string }) {
  return apiClient
    .get<ApiResponse<AttendanceReport>>('/api/admin/reports/attendance', { params: filters })
    .then(unwrapData);
}

export function fetchEnrollmentStatsReport(filters?: { branchId?: string }) {
  return apiClient
    .get<ApiResponse<EnrollmentStatsReport>>('/api/admin/reports/enrollment-stats', { params: filters })
    .then(unwrapData);
}
