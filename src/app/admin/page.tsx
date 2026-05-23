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
    <main className="admin-page">
      <section className="dashboard__hero">
        <p className="dashboard__eyebrow">Admin Dashboard</p>
        <h1 className="dashboard__title">Overview for branches, batches, enrollments, and fees.</h1>
        <p className="dashboard__text">
          Review the studio at a glance and jump into the areas that need your attention.
        </p>
      </section>

      <section className="dashboard__grid">
        <article className="metric-card">
          <h2>Total branches</h2>
          <p>
            {branchesQuery.isError
              ? 'Restricted for your role'
              : branchesQuery.isLoading
                ? 'Loading branch visibility...'
                : `${branches.length} branch records available`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Active batches</h2>
          <p>
            {batchesQuery.isLoading
              ? 'Loading batch data...'
              : `${activeBatches.length} active batches across the current admin scope`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Monthly fee potential</h2>
          <p>
            {batchesQuery.isLoading
              ? 'Calculating fee footprint...'
              : `${formatCurrency(monthlyPotential)} across active batches`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Pending enrollments</h2>
          <p>
            {enrollmentsQuery.isLoading
              ? 'Loading enrollment queue...'
              : `${enrollmentsQuery.data?.length ?? 0} requests are waiting for admin review`}
          </p>
        </article>
      </section>

      <section className="admin-callout">
        <p className="dashboard__eyebrow">Quick access</p>
        <div className="admin-callout__links">
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
