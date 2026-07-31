'use client';

import Link from 'next/link';
import { useAdminEnrollments } from '@/hooks/use-admin-enrollments';
import { useBatches } from '@/hooks/use-batches';
import { useBranches } from '@/hooks/use-branches';
import { formatCurrency } from '@/lib/admin-format';

export default function AdminHomePage() {
  const branchesQuery = useBranches();
  const batchesQuery = useBatches();
  const enrollmentsQuery = useAdminEnrollments({ status: 'PENDING' });
  const branches = branchesQuery.data ?? [];
  const batches = batchesQuery.data ?? [];
  const activeBatches = batches.filter((batch) => batch.isActive);
  const monthlyPotential = activeBatches.reduce((total, batch) => total + batch.monthlyFee, 0);

  return (
    <main className="admin-page dashboard-home">
      <section className="dashboard__hero dashboard-home__hero">
        <div>
        <p className="dashboard__eyebrow">Admin overview</p>
        <h1 className="dashboard__title">Your studio today.</h1>
        <p className="dashboard__text">
          Review the studio at a glance and jump into the areas that need your attention.
        </p>
        </div>
        <Link className="button button--primary dashboard-home__hero-action" href="/admin/enrollments">Review requests</Link>
      </section>

      <section className="dashboard__grid dashboard-stat-grid" aria-label="Studio summary">
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Branches</span>
          <strong className="dashboard-stat__value">{branchesQuery.isLoading ? '—' : branchesQuery.isError ? '—' : branches.length}</strong>
          <p>{branchesQuery.isError ? 'Restricted for your role' : 'Visible locations'}</p>
        </article>
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Active batches</span>
          <strong className="dashboard-stat__value">{batchesQuery.isLoading ? '—' : activeBatches.length}</strong>
          <p>Current admin scope</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--wide">
          <span className="dashboard-stat__label">Monthly potential</span>
          <strong className="dashboard-stat__value dashboard-stat__value--currency">{batchesQuery.isLoading ? '—' : formatCurrency(monthlyPotential)}</strong>
          <p>Across active batches</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--attention">
          <span className="dashboard-stat__label">Needs review</span>
          <strong className="dashboard-stat__value">{enrollmentsQuery.isLoading ? '—' : enrollmentsQuery.data?.length ?? 0}</strong>
          <p>Enrollment requests</p>
        </article>
      </section>

      <section className="admin-callout">
        <div className="dashboard-section-heading"><div><p className="dashboard__eyebrow">Quick access</p><h2>Manage the studio</h2></div><span>Open a workspace</span></div>
        <div className="admin-callout__links dashboard-action-grid">
          <Link className="button button--primary" href="/admin/branches">
            Manage branches
          </Link>
          <Link className="button button--ghost" href="/admin/courses">
            Manage courses
          </Link>
          <Link className="button button--ghost" href="/admin/batches">
            View batches
          </Link>
          <Link className="button button--ghost" href="/admin/enrollments">
            Review enrollments
          </Link>
          <Link className="button button--ghost" href="/admin/fees">
            Review fees
          </Link>
        </div>
      </section>
    </main>
  );
}
