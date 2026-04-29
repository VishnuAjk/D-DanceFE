'use client';

import Link from 'next/link';
import { useChildren } from '@/hooks/use-children';
import { calculateAge, formatBirthDate } from '@/lib/parent-format';

export default function ChildrenPage() {
  const childrenQuery = useChildren();

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">My Children</p>
          <h1 className="admin-page__title">Profiles used for attendance, fees, and enrollments.</h1>
          <p className="dashboard__text">
            Keep each child profile accurate so future enrollment and batch assignment steps stay
            clean.
          </p>
        </div>
        <Link className="button button--primary" href="/parent/children/add">
          Add child
        </Link>
      </section>

      <section className="family-grid">
        {childrenQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading children...</p>
          </article>
        ) : childrenQuery.data?.length ? (
          childrenQuery.data.map((child) => (
            <article className="admin-panel" key={child._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{child.name}</h2>
                  <p className="dashboard__text">
                    {calculateAge(child.dob)} years • {child.gender}
                  </p>
                </div>
                <Link className="button button--ghost" href={`/parent/children/${child._id}`}>
                  Open profile
                </Link>
              </div>
              <p className="dashboard__text">Born {formatBirthDate(child.dob)}</p>
              <p className="dashboard__text">
                {child.photo ? 'Photo URL saved for this child profile.' : 'No photo URL added yet.'}
              </p>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">
              No children have been added yet. Start with one child profile to unlock the next
              parent workflows.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
