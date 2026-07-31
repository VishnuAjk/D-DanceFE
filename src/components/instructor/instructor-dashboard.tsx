'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useInstructorBatches } from '@/hooks/use-instructor-batches';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import type { Batch } from '@/types/admin';

const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

function todaysBatches(batches: Batch[]) {
  const today = DAY_CODES[new Date().getDay()];
  return batches.filter((batch) => batch.schedule.days.includes(today));
}

function earliestBatch(batches: Batch[]) {
  return [...batches].sort((left, right) => left.schedule.startTime.localeCompare(right.schedule.startTime))[0];
}

export function InstructorDashboard() {
  const batchesQuery = useInstructorBatches();
  const batches = batchesQuery.data ?? [];
  const todays = useMemo(() => todaysBatches(batches), [batches]);
  const nextUp = useMemo(() => earliestBatch(todays), [todays]);
  const estimatedRoster = todays.reduce((total, batch) => total + batch.capacity, 0);

  return (
    <main className="family-page dashboard-home">
      <section className="dashboard__hero dashboard-home__hero">
        <div><p className="dashboard__eyebrow">Instructor overview</p>
        <h1 className="dashboard__title">Ready for today&apos;s classes.</h1>
        <p className="dashboard__text">
          Review assigned batches, open rosters, mark attendance, and record progress after class.
        </p></div>
        <Link className="button button--primary dashboard-home__hero-action" href="/instructor/batches">Open batches</Link>
      </section>

      <section className="dashboard__grid dashboard-stat-grid" aria-label="Teaching summary">
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">My batches</span><strong className="dashboard-stat__value">{batchesQuery.isLoading ? '—' : batches.length}</strong><p>Active assignments</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--attention">
          <span className="dashboard-stat__label">Today</span><strong className="dashboard-stat__value">{batchesQuery.isLoading ? '—' : todays.length}</strong><p>Scheduled classes</p>
        </article>
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Seats today</span><strong className="dashboard-stat__value">{batchesQuery.isLoading ? '—' : estimatedRoster}</strong><p>Planned capacity</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--wide">
          <span className="dashboard-stat__label">Next up</span><strong className="dashboard-stat__value dashboard-stat__value--text">{nextUp?.name ?? 'Schedule clear'}</strong><p>{nextUp ? `${nextUp.schedule.startTime} • ${readReferenceLabel(nextUp.branchId)}` : 'No batch remains today'}</p>
        </article>
      </section>

      {nextUp ? (
        <section className="admin-callout">
          <p className="dashboard__eyebrow">Immediate focus</p>
          <div className="family-summary-grid">
            <article className="admin-panel family-summary">
              <h2 className="metric-card__title">{nextUp.name}</h2>
              <p className="dashboard__text">{readReferenceLabel(nextUp.courseId)}</p>
              <p className="dashboard__text">{readReferenceLabel(nextUp.branchId)}</p>
              <p className="dashboard__text">{formatSchedule(nextUp)}</p>
              <p className="dashboard__text">{formatCurrency(nextUp.monthlyFee)}</p>
              <Link className="button button--primary" href={`/instructor/batches/${nextUp._id}`}>
                Open roster
              </Link>
            </article>
          </div>
        </section>
      ) : null}

      <section className="admin-callout">
        <div className="dashboard-section-heading"><div><p className="dashboard__eyebrow">Quick actions</p><h2>Teaching tools</h2></div></div>
        <div className="admin-callout__links dashboard-action-grid">
          <Link className="button button--primary" href="/instructor/batches">
            View all batches
          </Link>
          <Link className="button button--ghost" href="/instructor/dashboard">
            Refresh dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
