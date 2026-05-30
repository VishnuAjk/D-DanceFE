import type { ApiResponse } from '@danceapp/shared';
import apiClient from '@/lib/api-client';
import type { AttendanceStatus, InstructorAttendanceRecord } from '@/types/attendance';
import type { InstructorAssessmentRecord, SkillScoreInput } from '@/types/assessment';

function unwrapData<T>(response: { data: ApiResponse<T> }) {
  if (response.data.data === null || response.data.data === undefined) {
    throw new Error('API returned an empty payload');
  }

  return response.data.data;
}

export function markAttendance(payload: {
  batchId: string;
  date: string;
  records: Array<{ studentProfileId: string; status: AttendanceStatus; notes?: string }>;
}) {
  return apiClient
    .post<ApiResponse<InstructorAttendanceRecord[]>>('/api/instructor/attendance/mark', payload)
    .then(unwrapData);
}

export function fetchInstructorAttendance(filters?: {
  batchId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return apiClient
    .get<ApiResponse<InstructorAttendanceRecord[]>>('/api/instructor/attendance', { params: filters })
    .then(unwrapData);
}

export function createAssessment(payload: {
  studentProfileId: string;
  batchId: string;
  assessedAt?: string;
  overallScore?: number;
  remarks?: string;
  skillScores?: SkillScoreInput[];
}) {
  return apiClient
    .post<ApiResponse<InstructorAssessmentRecord>>('/api/instructor/assessments', payload)
    .then(unwrapData);
}

export function updateAssessment(
  assessmentId: string,
  payload: Partial<{
    assessedAt: string;
    overallScore: number;
    remarks: string;
    skillScores: SkillScoreInput[];
  }>
) {
  return apiClient
    .put<ApiResponse<InstructorAssessmentRecord>>(`/api/instructor/assessments/${assessmentId}`, payload)
    .then(unwrapData);
}

export function fetchInstructorAssessments(filters?: { batchId?: string; month?: string }) {
  return apiClient
    .get<ApiResponse<InstructorAssessmentRecord[]>>('/api/instructor/assessments', { params: filters })
    .then(unwrapData);
}

export function shareAssessment(assessmentId: string) {
  return apiClient
    .put<ApiResponse<InstructorAssessmentRecord>>(`/api/instructor/assessments/${assessmentId}/share`)
    .then(unwrapData);
}
