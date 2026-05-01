'use client';

import Link from 'next/link';
import { useEnrollments } from '@/hooks/use-enrollments';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatBirthDate } from '@/lib/parent-format';
import type { ParentChild } from '@/types/parent';

function getChild(value: string | ParentChild) {
  return typeof value === 'string' ? null : value;
}

export default function EnrollmentsPage() {
  const enrollmentsQuery = useEnrollments();

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Enrollments</p>
          <h1 className="admin-page__title">Track requests for each child profile.</h1>
          <p className="dashboard__text">
            Every new enrollment starts in pending status until an admin reviews and approves it.
          </p>
        </div>
        <Link className="button button--primary" href="/parent/enrollments/new">
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
            const child = getChild(enrollment.childId);
            const batch = typeof enrollment.batchId === 'string' ? null : enrollment.batchId;

            return (
              <article className="admin-panel" key={enrollment._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{child?.name ?? 'Child'}</h2>
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
                  {child ? `Child DOB: ${formatBirthDate(child.dob)}` : 'Child profile unavailable'}
                </p>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">
              No enrollment requests yet. Start one after selecting a branch, batch, and child.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
