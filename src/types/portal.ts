export interface StudentProfile {
  _id: string;
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  relationshipToCustomer?: 'self' | 'child' | 'family_member';
  photo?: string;
  isActive?: boolean;
}

export interface PortalBranchOption {
  _id: string;
  name: string;
  city?: string;
}

export interface PortalBatchOption {
  _id: string;
  name: string;
  branchId: string | PortalBranchOption;
  courseId: string | { _id: string; name: string };
  levelId?: string | { _id: string; name: string; order?: number };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  monthlyFee: number;
}

export interface PortalEnrollment {
  _id: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  studentProfileId: string | StudentProfile;
  batchId: string | PortalBatchOption;
  branchId: string | PortalBranchOption;
  createdAt?: string;
}

export interface PortalDashboardSummary {
  studentProfilesCount: number;
  activeEnrollmentsCount: number;
  upcomingFee: {
    studentProfileName: string;
    amount: number;
    dueDate: string;
    month: string;
    status: string;
  } | null;
  nextClass: {
    studentProfileName: string;
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

export interface PortalAttendanceRecord {
  _id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  batchId: string | { _id: string; name: string };
}

export interface PortalAssessmentRecord {
  _id: string;
  studentProfileId: string | StudentProfile;
  batchId: string | { _id: string; name: string };
  assessedAt: string;
  overallScore?: number;
  remarks?: string;
  skillScores?: Array<{ skill: string; score: number; notes?: string }>;
  sharedWithCustomer?: boolean;
  sharedAt?: string;
}

export interface PortalFeeLedger {
  _id: string;
  month: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: 'DUE' | 'PAID' | 'OVERDUE' | 'WAIVED';
  paidAt?: string;
  dueDate: string;
  studentProfileId: string | StudentProfile;
  branchId: string | PortalBranchOption;
  enrollmentId:
    | string
    | {
        _id: string;
        status: string;
        batchId: string | PortalBatchOption;
      };
}

export interface PortalPaymentInitiation {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
}

export interface PortalVideo {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  courseId?: string | { _id: string; name: string };
  levelId?: string | { _id: string; name: string; order?: number };
  branchIds: Array<string | PortalBranchOption>;
  isPublished: boolean;
  publishedAt?: string;
}
