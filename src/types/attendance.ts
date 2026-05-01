export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceChildRef {
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
  childId: string | AttendanceChildRef;
  batchId: string | AttendanceBatchRef;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface ParentAttendanceRecord {
  _id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  batchId: string | AttendanceBatchRef;
}

