export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceStudentRef {
  _id: string;
  name: string;
  dob?: string;
  gender?: string;
  photo?: string;
}

export interface AttendanceBatchRef {
  _id: string;
  name: string;
}

export interface InstructorAttendanceRecord {
  _id: string;
  studentProfileId: string | AttendanceStudentRef;
  batchId: string | AttendanceBatchRef;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface PortalAttendanceRecord {
  _id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  batchId: string | AttendanceBatchRef;
}

