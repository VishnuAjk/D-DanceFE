'use client';

import Link from 'next/link';
import { useChildren } from '@/hooks/use-children';

export default function ParentHomePage() {
  const childrenQuery = useChildren();
  const children = childrenQuery.data ?? [];

  return (
    <main className="family-page">
      <section className="dashboard__hero">
        <p className="dashboard__eyebrow">Parent Dashboard</p>
        <h1 className="dashboard__title">Manage your children before starting enrollments.</h1>
        <p className="dashboard__text">
          This flow is now live end to end. Add your children, keep profiles current, and prepare
          for the next enrollment step.
        </p>
      </section>

      <section className="dashboard__grid">
        <article className="metric-card">
          <h2>Children on profile</h2>
          <p>
            {childrenQuery.isLoading
              ? 'Loading children...'
              : `${children.length} child profiles are available in your account`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Enrollment readiness</h2>
          <p>
            {children.length
              ? 'Your family profile is ready for the enrollment request flow.'
              : 'Add at least one child profile to unlock the upcoming enrollment journey.'}
          </p>
        </article>
      </section>

      <section className="admin-callout">
        <p className="dashboard__eyebrow">Next step</p>
        <div className="admin-callout__links">
          <Link className="button button--primary" href="/parent/children">
            View children
          </Link>
          <Link className="button button--ghost" href="/parent/children/add">
            Add a child
          </Link>
        </div>
      </section>
    </main>
  );
}
