export interface ParentChild {
  _id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  isActive?: boolean;
}

export interface ParentBranchOption {
  _id: string;
  name: string;
  city?: string;
}

export interface ParentBatchOption {
  _id: string;
  name: string;
  branchId: string | ParentBranchOption;
  courseId: string | { _id: string; name: string };
  levelId?: string | { _id: string; name: string; order?: number };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  monthlyFee: number;
}

export interface ParentEnrollment {
  _id: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  childId: string | ParentChild;
  batchId: string | ParentBatchOption;
  branchId: string | ParentBranchOption;
  createdAt?: string;
}

export interface ParentDashboardSummary {
  childrenCount: number;
  activeEnrollmentsCount: number;
  upcomingFee: {
    childName: string;
    amount: number;
    dueDate: string;
    month: string;
    status: string;
  } | null;
  nextClass: {
    childName: string;
    batchName: string;
    branchName: string;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    startsAt: string;
  } | null;
  recentAttendanceSummary: {
    percentage: number | null;
    totalClasses: number;
  };
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface ParentAttendanceRecord {
  _id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  batchId: string | { _id: string; name: string };
}

export interface ParentAssessmentRecord {
  _id: string;
  childId: string | ParentChild;
  batchId: string | { _id: string; name: string };
  assessedAt: string;
  overallScore?: number;
  remarks?: string;
  skillScores?: Array<{ skill: string; score: number; notes?: string }>;
  sharedWithParent?: boolean;
  sharedAt?: string;
}

export interface ParentFeeLedger {
  _id: string;
  month: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: 'DUE' | 'PAID' | 'OVERDUE' | 'WAIVED';
  paidAt?: string;
  dueDate: string;
  childId: string | ParentChild;
  branchId: string | ParentBranchOption;
  enrollmentId:
    | string
    | {
        _id: string;
        status: string;
        batchId: string | ParentBatchOption;
      };
}
