'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useStudentProfiles } from '@/hooks/use-student-profiles';
import { useEnrollmentBatches, useEnrollmentBranches } from '@/hooks/use-enrollments';
import { readReferenceId, readReferenceLabel, formatCurrency, formatSchedule } from '@/lib/admin-format';
import { formatApiError } from '@/lib/api-errors';
import { createEnrollment } from '@/lib/portal-api';

export default function NewEnrollmentPage() {
  const queryClient = useQueryClient();
  const branchesQuery = useEnrollmentBranches();
  const studentProfilesQuery = useStudentProfiles();
  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [studentProfileId, setStudentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const batchesQuery = useEnrollmentBatches({ branchId, courseId: courseId || undefined });
  const branches = branchesQuery.data ?? [];
  const batches = batchesQuery.data ?? [];
  const studentProfiles = studentProfilesQuery.data ?? [];

  const courseOptions = useMemo(() => {
    const deduped = new Map<string, { _id: string; name: string }>();

    batches.forEach((batch) => {
      const ref = batch.courseId;
      const id = readReferenceId(ref);
      const name = readReferenceLabel(ref, 'Course');

      if (!deduped.has(id)) {
        deduped.set(id, { _id: id, name });
      }
    });

    return Array.from(deduped.values());
  }, [batches]);

  const selectedBatch = batches.find((batch) => batch._id === batchId);
  const selectedStudent = studentProfiles.find((student) => student._id === studentProfileId);

  const mutation = useMutation({
    mutationFn: async () => createEnrollment({ studentProfileId, batchId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portal-enrollments'] });
      setError(null);
      setStep(3);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">New enrollment</p>
          <h1 className="admin-page__title">Choose a branch, batch, and student profile.</h1>
          <p className="dashboard__text">
            This flow is intentionally step-based for mobile usage, so each decision stays clear on
            smaller screens.
          </p>
        </div>
        <Link className="button button--ghost" href="/portal/enrollments">
          Back to enrollments
        </Link>
      </section>

      <section className="auth-stepper" aria-label="Enrollment progress">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`auth-stepper__item${step === item ? ' is-active' : step > item ? ' is-complete' : ''}`}
          >
            <span className="auth-stepper__index">{item}</span>
            <span>
              {item === 1 ? 'Branch' : item === 2 ? 'Batch' : 'Student'}
            </span>
          </div>
        ))}
      </section>

      {step === 1 ? (
        <section className="admin-panel">
          <label className="field">
            <span className="field__label">Select branch</span>
            <select
              className="field__input"
              value={branchId}
              onChange={(event) => {
                setBranchId(event.target.value);
                setCourseId('');
                setBatchId('');
              }}
            >
              <option value="">Choose branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button--primary"
            disabled={!branchId}
            onClick={() => setStep(2)}
            type="button"
          >
            Continue to batch selection
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="admin-panel stack">
          <label className="field">
            <span className="field__label">Filter by course</span>
            <select
              className="field__input"
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value);
                setBatchId('');
              }}
            >
              <option value="">All courses in this branch</option>
              {courseOptions.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <div className="family-grid">
            {batchesQuery.isLoading ? (
              <article className="admin-panel">
                <p className="dashboard__text">Loading available batches...</p>
              </article>
            ) : batches.length ? (
              batches.map((batch) => (
                <button
                  key={batch._id}
                  className={`selection-card${batchId === batch._id ? ' is-selected' : ''}`}
                  type="button"
                  onClick={() => setBatchId(batch._id)}
                >
                  <strong>{batch.name}</strong>
                  <span>{readReferenceLabel(batch.courseId)}</span>
                  <span>{formatSchedule(batch)}</span>
                  <span>{formatCurrency(batch.monthlyFee)}</span>
                </button>
              ))
            ) : (
              <article className="admin-panel">
                <p className="dashboard__text">No active batches are available for this branch and course filter.</p>
              </article>
            )}
          </div>

          <div className="admin-panel__actions">
            <button className="button button--ghost" onClick={() => setStep(1)} type="button">
              Back
            </button>
            <button
              className="button button--primary"
              disabled={!batchId}
              onClick={() => setStep(3)}
              type="button"
            >
              Continue to student selection
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="admin-panel stack">
          <label className="field">
            <span className="field__label">Choose student profile</span>
            <select
              className="field__input"
              value={studentProfileId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              <option value="">Select student</option>
              {studentProfiles.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>

          {selectedBatch ? (
            <article className="admin-panel family-summary">
              <h2 className="metric-card__title">Confirmation</h2>
              <p className="dashboard__text">Branch: {readReferenceLabel(selectedBatch.branchId)}</p>
              <p className="dashboard__text">Batch: {selectedBatch.name}</p>
              <p className="dashboard__text">Course: {readReferenceLabel(selectedBatch.courseId)}</p>
              <p className="dashboard__text">Schedule: {formatSchedule(selectedBatch)}</p>
              <p className="dashboard__text">
                Student: {selectedStudent ? selectedStudent.name : 'Select a student profile'}
              </p>
            </article>
          ) : null}

          {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

          <div className="admin-panel__actions">
            <button className="button button--ghost" onClick={() => setStep(2)} type="button">
              Back
            </button>
            <button
              className="button button--primary"
              disabled={!studentProfileId || !batchId || mutation.isPending}
              onClick={() => void mutation.mutateAsync()}
              type="button"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit enrollment request'}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
