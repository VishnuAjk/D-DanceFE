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
    <main className="family-page">
      <section className="dashboard__hero">
        <p className="dashboard__eyebrow">Instructor Dashboard</p>
        <h1 className="dashboard__title">See today&apos;s teaching load and jump into rosters fast.</h1>
        <p className="dashboard__text">
          Review assigned batches, open rosters, mark attendance, and record progress after class.
        </p>
      </section>

      <section className="dashboard__grid">
        <article className="metric-card">
          <h2>My active batches</h2>
          <p>
            {batchesQuery.isLoading
              ? 'Loading assignments...'
              : `${batches.length} assigned batches are currently visible`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Today&apos;s batches</h2>
          <p>
            {batchesQuery.isLoading
              ? 'Checking today&apos;s schedule...'
              : `${todays.length} batches are scheduled for today`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Estimated seats today</h2>
          <p>
            {batchesQuery.isLoading
              ? 'Calculating roster load...'
              : `${estimatedRoster} planned seats across today&apos;s batches`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Next up</h2>
          <p>
            {nextUp
              ? `${nextUp.name} • ${nextUp.schedule.startTime} • ${readReferenceLabel(nextUp.branchId)}`
              : 'No batch remains on today&apos;s schedule'}
          </p>
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
        <p className="dashboard__eyebrow">Quick actions</p>
        <div className="admin-callout__links">
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
