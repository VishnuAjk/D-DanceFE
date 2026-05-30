import type { ApiResponse } from '@danceapp/shared';
import apiClient from '@/lib/api-client';
import type {
  PortalBatchOption,
  PortalBranchOption,
  StudentProfile,
  PortalDashboardSummary,
  PortalEnrollment,
  PortalAttendanceRecord,
  PortalAssessmentRecord,
  PortalFeeLedger,
  PortalPaymentInitiation,
  PortalVideo
} from '@/types/portal';

function unwrapData<T>(response: { data: ApiResponse<T> }) {
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error('API returned an empty payload');
  }

  return response.data.data;
}

export function fetchStudentProfiles() {
  return apiClient.get<ApiResponse<StudentProfile[]>>('/api/portal/student-profiles').then(unwrapData);
}

export function fetchStudentProfile(studentProfileId: string) {
  return apiClient.get<ApiResponse<StudentProfile>>(`/api/portal/student-profiles/${studentProfileId}`).then(unwrapData);
}

export function createStudentProfile(payload: {
  name: string;
  dob: string;
  gender: string;
  relationshipToCustomer: 'self' | 'child' | 'family_member';
  photo?: string;
}) {
  return apiClient.post<ApiResponse<StudentProfile>>('/api/portal/student-profiles', payload).then(unwrapData);
}

export function updateStudentProfile(
  studentProfileId: string,
  payload: Partial<{
    name: string;
    dob: string;
    gender: string;
    relationshipToCustomer: 'self' | 'child' | 'family_member';
    photo?: string;
  }>
) {
  return apiClient.put<ApiResponse<StudentProfile>>(`/api/portal/student-profiles/${studentProfileId}`, payload).then(unwrapData);
}

export function deleteStudentProfile(studentProfileId: string) {
  return apiClient.delete<ApiResponse<StudentProfile>>(`/api/portal/student-profiles/${studentProfileId}`).then(unwrapData);
}

export function fetchEnrollmentBranches() {
  return apiClient
    .get<ApiResponse<PortalBranchOption[]>>('/api/portal/catalog/branches')
    .then(unwrapData);
}

export function fetchEnrollmentBatches(filters?: { branchId?: string; courseId?: string }) {
  return apiClient
    .get<ApiResponse<PortalBatchOption[]>>('/api/portal/catalog/batches', { params: filters })
    .then(unwrapData);
}

export function fetchEnrollments() {
  return apiClient
    .get<ApiResponse<PortalEnrollment[]>>('/api/portal/enrollments')
    .then(unwrapData);
}

export function createEnrollment(payload: { studentProfileId: string; batchId: string }) {
  return apiClient.post<ApiResponse<PortalEnrollment>>('/api/portal/enroll', payload).then(unwrapData);
}

export function fetchPortalDashboard() {
  return apiClient
    .get<ApiResponse<PortalDashboardSummary>>('/api/portal/dashboard')
    .then(unwrapData);
}

export function fetchStudentProfileAttendance(filters: { studentProfileId: string; month: string }) {
  return apiClient
    .get<ApiResponse<PortalAttendanceRecord[]>>('/api/portal/attendance', { params: filters })
    .then(unwrapData);
}

export function fetchStudentProfileAssessments(filters: { studentProfileId: string }) {
  return apiClient
    .get<ApiResponse<PortalAssessmentRecord[]>>('/api/portal/assessments', { params: filters })
    .then(unwrapData);
}

export function fetchPortalFees(filters?: { studentProfileId?: string; month?: string }) {
  return apiClient.get<ApiResponse<PortalFeeLedger[]>>('/api/portal/fees', { params: filters }).then(unwrapData);
}

export function initiatePortalFeePayment(payload: { ledgerIds: string[] }) {
  return apiClient
    .post<ApiResponse<PortalPaymentInitiation>>('/api/portal/fees/pay', payload)
    .then(unwrapData);
}

export function fetchVideos(filters?: { courseId?: string; levelId?: string; tags?: string }) {
  return apiClient.get<ApiResponse<PortalVideo[]>>('/api/videos', { params: filters }).then(unwrapData);
}
