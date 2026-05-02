export interface Branch {
  _id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
  isActive: boolean;
}

export interface Level {
  _id: string;
  name: string;
  courseId?: string;
  order: number;
}

export interface Course {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  levels?: Level[];
}

export interface NamedRef {
  _id: string;
  name?: string;
  label?: string;
  city?: string;
  order?: number;
}

export interface Batch {
  _id: string;
  name: string;
  branchId: string | NamedRef;
  courseId: string | NamedRef;
  levelId?: string | NamedRef;
  ageGroupId?: string | NamedRef;
  instructorIds: Array<string | NamedRef>;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  capacity: number;
  monthlyFee: number;
  isActive: boolean;
}

export interface Child {
  _id: string;
  name: string;
  dob: string;
  gender: string;
  photo?: string;
}

export interface EnrollmentRosterItem {
  _id: string;
  status: string;
  childId: string | Child;
}

export interface AdminEnrollment {
  _id: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  childId: string | Child;
  batchId: string | Batch;
  branchId: string | Branch | NamedRef;
  createdAt?: string;
}

export interface FeeLinkedEnrollment {
  _id: string;
  status: string;
  batchId: string | Batch;
}

export interface AdminFeeLedger {
  _id: string;
  month: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: 'DUE' | 'PAID' | 'OVERDUE' | 'WAIVED';
  paidAt?: string;
  dueDate: string;
  childId: string | Child;
  branchId: string | Branch | NamedRef;
  enrollmentId: string | FeeLinkedEnrollment;
}
