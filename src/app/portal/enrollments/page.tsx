'use client';

import Link from 'next/link';
import { useEnrollments } from '@/hooks/use-enrollments';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatBirthDate } from '@/lib/student-format';
import type { StudentProfile } from '@/types/portal';

function getStudent(value: string | StudentProfile) {
  return typeof value === 'string' ? null : value;
}

export default function EnrollmentsPage() {
  const enrollmentsQuery = useEnrollments();

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Enrollments</p>
          <h1 className="admin-page__title">Track requests for each student profile.</h1>
          <p className="dashboard__text">
            Every new enrollment starts in pending status until an admin reviews and approves it.
          </p>
        </div>
        <Link className="button button--primary" href="/portal/enrollments/new">
          New enrollment
        </Link>
      </section>

      <section className="family-grid">
        {enrollmentsQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading enrollments...</p>
          </article>
        ) : enrollmentsQuery.data?.length ? (
          enrollmentsQuery.data.map((enrollment) => {
            const student = getStudent(enrollment.studentProfileId);
            const batch = typeof enrollment.batchId === 'string' ? null : enrollment.batchId;

            return (
              <article className="admin-panel" key={enrollment._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{student?.name ?? 'Student'}</h2>
                    <p className="dashboard__text">{batch?.name ?? 'Batch'} enrollment</p>
                  </div>
                  <span className={`status-badge status-badge--${enrollment.status.toLowerCase()}`}>
                    {enrollment.status}
                  </span>
                </div>
                <p className="dashboard__text">
                  Branch: {readReferenceLabel(enrollment.branchId, 'Branch unavailable')}
                </p>
                <p className="dashboard__text">
                  {batch ? `${formatSchedule(batch)} • ${formatCurrency(batch.monthlyFee)}` : 'Batch schedule unavailable'}
                </p>
                <p className="dashboard__text">
                  {student ? `Student DOB: ${formatBirthDate(student.dob)}` : 'Student profile unavailable'}
                </p>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">
              No enrollment requests yet. Start one after selecting a branch, batch, and student.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
