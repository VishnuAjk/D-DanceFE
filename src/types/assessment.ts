export interface SkillScoreInput {
  skill: string;
  score: number;
  notes?: string;
}

export interface AssessmentChildRef {
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
  childId: string | AssessmentChildRef;
  batchId: string | AssessmentBatchRef;
  assessedAt: string;
  overallScore?: number;
  remarks?: string;
  skillScores?: SkillScoreInput[];
  sharedWithParent?: boolean;
  sharedAt?: string;
}

export type ParentAssessmentRecord = InstructorAssessmentRecord;

