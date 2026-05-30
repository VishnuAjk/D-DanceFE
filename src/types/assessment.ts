export interface SkillScoreInput {
  skill: string;
  score: number;
  notes?: string;
}

export interface AssessmentStudentRef {
  _id: string;
  name: string;
  dob?: string;
  gender?: string;
  photo?: string;
}

export interface AssessmentBatchRef {
  _id: string;
  name: string;
}

export interface InstructorAssessmentRecord {
  _id: string;
  studentProfileId: string | AssessmentStudentRef;
  batchId: string | AssessmentBatchRef;
  assessedAt: string;
  overallScore?: number;
  remarks?: string;
  skillScores?: SkillScoreInput[];
  sharedWithCustomer?: boolean;
  sharedAt?: string;
}

export type PortalAssessmentRecord = InstructorAssessmentRecord;

