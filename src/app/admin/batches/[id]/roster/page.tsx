'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBatch, useBatchRoster } from '@/hooks/use-batches';

export default function BatchRosterPage() {
  const params = useParams<{ id: string }>();
  const batchQuery = useBatch(params.id);
  const rosterQuery = useBatchRoster(params.id);

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Roster</p>
          <h1 className="admin-page__title">Enrolled learners for this batch.</h1>
          <p className="dashboard__text">{batchQuery.data?.name ?? 'Batch roster'}.</p>
        </div>
        <Link className="button button--ghost" href={`/admin/batches/${params.id}`}>
          Back to detail
        </Link>
      </section>

      <section className="admin-grid">
        {rosterQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading roster...</p>
          </article>
        ) : rosterQuery.data?.length ? (
          rosterQuery.data.map((item) => {
            const student = typeof item.studentProfileId === 'string' ? null : item.studentProfileId;

            return (
              <article className="admin-panel" key={item._id}>
                <h2 className="metric-card__title">{student?.name ?? 'Student record unavailable'}</h2>
                <div className="admin-meta">
                  <span>{student?.gender ?? 'Unknown gender'}</span>
                  <span>{item.status}</span>
                </div>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No enrolled student profiles are currently visible for this batch.</p>
          </article>
        )}
      </section>
    </main>
  );
}
