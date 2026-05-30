'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAdminEnrollments } from '@/hooks/use-admin-enrollments';
import { approveEnrollment, rejectEnrollment, suspendEnrollment } from '@/lib/admin-api';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatApiError } from '@/lib/api-errors';
import { formatBirthDate } from '@/lib/student-format';
import type { AdminEnrollment, Student } from '@/types/admin';

function getStudent(value: string | Student) {
  return typeof value === 'string' ? null : value;
}

export default function AdminEnrollmentsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState<string | null>(null);
  const enrollmentsQuery = useAdminEnrollments(status ? { status } : undefined);

  const actionMutation = useMutation({
    mutationFn: async ({ enrollmentId, action }: { enrollmentId: string; action: 'approve' | 'reject' | 'suspend' }) => {
      if (action === 'approve') {
        return approveEnrollment(enrollmentId);
      }

      if (action === 'reject') {
        return rejectEnrollment(enrollmentId);
      }

      return suspendEnrollment(enrollmentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-enrollments'] });
      await queryClient.invalidateQueries({ queryKey: ['portal-enrollments'] });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const pendingCount = useMemo(
    () => (enrollmentsQuery.data ?? []).filter((entry) => entry.status === 'PENDING').length,
    [enrollmentsQuery.data]
  );

  function renderActions(enrollment: AdminEnrollment) {
    switch (enrollment.status) {
      case 'PENDING':
        return (
          <>
            <button
              className="button button--primary"
              type="button"
              onClick={() => void actionMutation.mutateAsync({ enrollmentId: enrollment._id, action: 'approve' })}
            >
              Approve
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => void actionMutation.mutateAsync({ enrollmentId: enrollment._id, action: 'reject' })}
            >
              Reject
            </button>
          </>
        );
      case 'APPROVED':
      case 'ACTIVE':
        return (
          <button
            className="button button--ghost"
            type="button"
            onClick={() => void actionMutation.mutateAsync({ enrollmentId: enrollment._id, action: 'suspend' })}
          >
            Suspend
          </button>
        );
      default:
        return null;
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Enrollments</p>
          <h1 className="admin-page__title">Review student profile enrollment requests.</h1>
          <p className="dashboard__text">
            Pending requests are shown first so approvals stay operationally visible on smaller screens.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Status filter</span>
          <select className="field__input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <article className="admin-panel">
          <h2 className="metric-card__title">Pending now</h2>
          <p className="dashboard__text">{pendingCount} requests in the current filter set</p>
        </article>
      </section>

      {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

      <section className="admin-grid">
        {enrollmentsQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading enrollment queue...</p>
          </article>
        ) : enrollmentsQuery.data?.length ? (
          enrollmentsQuery.data.map((enrollment) => {
            const student = getStudent(enrollment.studentProfileId);
            const batch = typeof enrollment.batchId === 'string' ? null : enrollment.batchId;

            return (
              <article className="admin-panel" key={enrollment._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{student?.name ?? 'Student profile'}</h2>
                    <p className="dashboard__text">
                      {batch?.name ?? 'Batch'} • {readReferenceLabel(enrollment.branchId, 'Branch')}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${enrollment.status.toLowerCase()}`}>
                    {enrollment.status}
                  </span>
                </div>
                <p className="dashboard__text">
                  {batch ? `${formatSchedule(batch)} • ${formatCurrency(batch.monthlyFee)}` : 'Batch details unavailable'}
                </p>
                <p className="dashboard__text">
                  {student ? `Student DOB: ${formatBirthDate(student.dob)} • ${student.gender}` : 'Student profile unavailable'}
                </p>
                <div className="admin-panel__actions">{renderActions(enrollment)}</div>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No enrollments found for this status filter.</p>
          </article>
        )}
      </section>
    </main>
  );
}
