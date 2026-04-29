'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBatch } from '@/hooks/use-batches';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const batchQuery = useBatch(params.id);

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Batch detail</p>
          <h1 className="admin-page__title">Review batch structure and delivery footprint.</h1>
        </div>
        <Link className="button button--ghost" href="/admin/batches">
          Back to batches
        </Link>
      </section>

      <section className="admin-grid">
        {batchQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading batch detail...</p>
          </article>
        ) : batchQuery.data ? (
          <>
            <article className="admin-panel">
              <h2 className="metric-card__title">{batchQuery.data.name}</h2>
              <div className="admin-meta">
                <span>{readReferenceLabel(batchQuery.data.branchId)}</span>
                <span>{readReferenceLabel(batchQuery.data.courseId)}</span>
                <span>{readReferenceLabel(batchQuery.data.levelId)}</span>
              </div>
              <p className="dashboard__text">{formatSchedule(batchQuery.data)}</p>
            </article>
            <article className="admin-panel">
              <h2 className="metric-card__title">Capacity and fee</h2>
              <div className="admin-meta">
                <span>{batchQuery.data.capacity} seats</span>
                <span>{formatCurrency(batchQuery.data.monthlyFee)}</span>
                <span>{batchQuery.data.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </article>
            <article className="admin-panel">
              <h2 className="metric-card__title">Instructor coverage</h2>
              <p className="dashboard__text">
                {batchQuery.data.instructorIds.length
                  ? `${batchQuery.data.instructorIds.length} instructor assignments in this batch`
                  : 'No instructors assigned yet'}
              </p>
              <Link className="button button--ghost" href={`/admin/batches/${params.id}/roster`}>
                Open roster
              </Link>
            </article>
          </>
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">Batch not found.</p>
          </article>
        )}
      </section>
    </main>
  );
}
