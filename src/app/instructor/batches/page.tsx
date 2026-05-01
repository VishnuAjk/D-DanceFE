'use client';

import Link from 'next/link';
import { useInstructorBatches } from '@/hooks/use-instructor-batches';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';

export default function InstructorBatchesPage() {
  const batchesQuery = useInstructorBatches();

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">My Batches</p>
          <h1 className="admin-page__title">Assigned classes and roster entry points.</h1>
          <p className="dashboard__text">
            Use this list to move into the correct batch roster before attendance and assessment
            flows are added.
          </p>
        </div>
      </section>

      <section className="family-grid">
        {batchesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading instructor batches...</p>
          </article>
        ) : batchesQuery.data?.length ? (
          batchesQuery.data.map((batch) => (
            <article className="admin-panel" key={batch._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{batch.name}</h2>
                  <p className="dashboard__text">
                    {readReferenceLabel(batch.courseId)} • {readReferenceLabel(batch.branchId)}
                  </p>
                </div>
                <Link className="button button--ghost" href={`/instructor/batches/${batch._id}`}>
                  Open roster
                </Link>
              </div>
              <p className="dashboard__text">{formatSchedule(batch)}</p>
              <p className="dashboard__text">{formatCurrency(batch.monthlyFee)}</p>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No batches are assigned to this instructor account yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
