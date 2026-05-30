'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useInstructorBatchRoster } from '@/hooks/use-instructor-batches';
import { calculateAge } from '@/lib/student-format';
import { createAssessment, fetchInstructorAssessments, shareAssessment } from '@/lib/instructor-api';
import type { Student } from '@/types/admin';
import type { InstructorAssessmentRecord } from '@/types/assessment';

function readStudent(value: string | Student) {
  return typeof value === 'string' ? null : value;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function monthUtc() {
  return new Date().toISOString().slice(0, 7);
}

function formatApiError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'object' &&
    error.response.data.error !== null &&
    'message' in error.response.data.error &&
    typeof error.response.data.error.message === 'string'
  ) {
    return error.response.data.error.message;
  }

  return 'Assessment action failed. Please try again.';
}

function readNumber(value: string) {
  if (!value.trim()) return undefined;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return undefined;
  return numeric;
}

export default function InstructorAssessmentsPage() {
  const params = useParams<{ id: string }>();
  const rosterQuery = useInstructorBatchRoster(params.id);
  const batch = rosterQuery.data?.batch;
  const roster = rosterQuery.data?.roster ?? [];
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assessedAt, setAssessedAt] = useState(todayUtc());
  const [overallScore, setOverallScore] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  const month = useMemo(() => monthUtc(), []);
  const assessmentsQuery = useQuery({
    queryKey: ['instructor-assessments', params.id, month],
    queryFn: () => fetchInstructorAssessments({ batchId: params.id, month }),
    enabled: Boolean(params.id)
  });

  const studentProfileOptions = roster
    .map((entry) => readStudent(entry.studentProfileId))
    .filter((student): student is Student => Boolean(student?._id));

  const selected = selectedStudentId || studentProfileOptions[0]?._id || '';

  const createMutation = useMutation({
    mutationFn: () =>
      createAssessment({
        studentProfileId: selected,
        batchId: params.id,
        assessedAt,
        overallScore: readNumber(overallScore),
        remarks: remarks.trim() ? remarks.trim() : undefined
      }),
    onMutate: () => setError(null),
    onError: (err) => setError(formatApiError(err)),
    onSuccess: () => {
      void assessmentsQuery.refetch();
      setOverallScore('');
      setRemarks('');
    }
  });

  const shareMutation = useMutation({
    mutationFn: (assessmentId: string) => shareAssessment(assessmentId),
    onMutate: () => setError(null),
    onError: (err) => setError(formatApiError(err)),
    onSuccess: () => void assessmentsQuery.refetch()
  });

  const records = (assessmentsQuery.data ?? []) as InstructorAssessmentRecord[];

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Assessments</p>
          <h1 className="admin-page__title">{batch?.name ?? 'Batch assessments'}</h1>
          <p className="dashboard__text">Capture progress notes and optionally share them with the account.</p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href={`/instructor/batches/${params.id}`}>
            Back to roster
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="student">
              Student
            </label>
            <select
              id="student"
              className="field__input"
              value={selected}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              disabled={rosterQuery.isLoading || !studentProfileOptions.length}
            >
              {studentProfileOptions.length ? (
                studentProfileOptions.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))
              ) : (
                <option value="">No roster entries</option>
              )}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="assessedAt">
              Assessed date
            </label>
            <input
              id="assessedAt"
              className="field__input"
              type="date"
              value={assessedAt}
              onChange={(event) => setAssessedAt(event.target.value)}
              max={todayUtc()}
            />
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="overallScore">
              Overall score (0-100)
            </label>
            <input
              id="overallScore"
              className="field__input"
              inputMode="numeric"
              placeholder="Optional"
              value={overallScore}
              onChange={(event) => setOverallScore(event.target.value.replace(/[^\d.]/g, '').slice(0, 3))}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="remarks">
              Remarks
            </label>
            <textarea
              id="remarks"
              className="field__input"
              rows={2}
              placeholder="Key progress notes for this learner"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value.slice(0, 500))}
            />
          </div>
        </div>

        {error ? (
          <div className="auth-feedback auth-feedback--error" role="alert">
            {error}
          </div>
        ) : null}

        <button
          className="button button--primary"
          type="button"
          disabled={!selected || createMutation.isPending}
          onClick={() => void createMutation.mutateAsync()}
        >
          {createMutation.isPending ? 'Saving assessment...' : 'Save assessment'}
        </button>
      </section>

      <section className="family-grid">
        {assessmentsQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading assessments...</p>
          </article>
        ) : records.length ? (
          records.map((record) => {
            const student = typeof record.studentProfileId === 'string' ? null : record.studentProfileId;
            const batchRef = typeof record.batchId === 'string' ? null : record.batchId;
            const shareDisabled = Boolean(record.sharedWithCustomer) || shareMutation.isPending;

            return (
              <article className="admin-panel" key={record._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{student?.name ?? 'Student'}</h2>
                    <p className="dashboard__text">
                      {record.assessedAt.slice(0, 10)} • {batchRef?.name ?? 'Batch'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost"
                    disabled={shareDisabled}
                    onClick={() => void shareMutation.mutateAsync(record._id)}
                  >
                    {record.sharedWithCustomer ? 'Shared' : shareMutation.isPending ? 'Sharing...' : 'Share'}
                  </button>
                </div>

                {student ? (
                  <p className="dashboard__text">
                    {student.dob ? `${calculateAge(student.dob)} years • ${student.gender}` : `${student.gender ?? 'Learner'}`}
                  </p>
                ) : null}

                <p className="dashboard__text">
                  {typeof record.overallScore === 'number' ? `Score: ${record.overallScore}` : 'Score: -'}
                </p>
                {record.remarks ? <p className="dashboard__text">{record.remarks}</p> : null}
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No assessments have been captured for this month yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
