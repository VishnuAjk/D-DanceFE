'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/hooks/use-parent-dashboard';
import { formatCurrency, formatSchedule } from '@/lib/admin-format';
import { formatBirthDateTime } from '@/lib/parent-format';

export function ParentDashboard() {
  const summaryQuery = useParentDashboard();
  const summary = summaryQuery.data;

  return (
    <main className="family-page">
      <section className="dashboard__hero">
        <p className="dashboard__eyebrow">Parent Dashboard</p>
        <h1 className="dashboard__title">Your children, classes, fees, and progress.</h1>
        <p className="dashboard__text">
          Add child profiles, request classes, and follow updates from the studio in one place.
        </p>
      </section>

      {!summaryQuery.isLoading && (summary?.childrenCount ?? 0) === 0 ? (
        <section className="admin-callout">
          <p className="dashboard__eyebrow">Get started</p>
          <h2 className="metric-card__title">Add your first child profile.</h2>
          <p className="dashboard__text">
            Once a child is added, you can choose a branch and batch to request enrollment.
          </p>
          <div className="admin-callout__links">
            <Link className="button button--primary" href="/parent/children/add">
              Add child
            </Link>
            <Link className="button button--ghost" href="/parent/enrollments/new">
              Request enrollment
            </Link>
          </div>
        </section>
      ) : null}

      <section className="dashboard__grid">
        <article className="metric-card">
          <h2>Children count</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Loading profile summary...'
              : `${summary?.childrenCount ?? 0} child profiles in your account`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Active enrollments</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Checking active enrollments...'
              : `${summary?.activeEnrollmentsCount ?? 0} approved or active enrollments`}
          </p>
        </article>
        <article className="metric-card">
          <h2>Upcoming fee due</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Checking fee ledger...'
              : summary?.upcomingFee
                ? `${formatCurrency(summary.upcomingFee.amount)} for ${summary.upcomingFee.childName} on ${new Date(summary.upcomingFee.dueDate).toLocaleDateString('en-IN')}`
                : 'No due fee entry is currently visible'}
          </p>
        </article>
        <article className="metric-card">
          <h2>Next class schedule</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Checking class schedule...'
              : summary?.nextClass
                ? `${summary.nextClass.childName} • ${summary.nextClass.batchName} • ${formatBirthDateTime(summary.nextClass.startsAt)}`
                : 'No upcoming approved class is currently visible'}
          </p>
        </article>
        <article className="metric-card">
          <h2>Attendance summary</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Checking recent attendance...'
              : summary && summary.recentAttendanceSummary.percentage !== null
                ? `${summary.recentAttendanceSummary.percentage}% over the last ${summary.recentAttendanceSummary.totalClasses} classes`
                : 'Attendance summary will appear once classes are marked'}
          </p>
        </article>
        <article className="metric-card">
          <h2>Next action</h2>
          <p>
            {(summary?.childrenCount ?? 0) === 0
              ? 'Start by adding your first child profile.'
              : 'Keep enrollments moving and monitor approvals from the status page.'}
          </p>
        </article>
      </section>

      {summary?.nextClass ? (
        <section className="admin-callout">
          <p className="dashboard__eyebrow">Next class</p>
          <div className="family-summary-grid">
            <article className="admin-panel family-summary">
              <h2 className="metric-card__title">{summary.nextClass.batchName}</h2>
              <p className="dashboard__text">{summary.nextClass.childName}</p>
              <p className="dashboard__text">{summary.nextClass.branchName}</p>
              <p className="dashboard__text">
                {formatSchedule({ schedule: summary.nextClass.schedule })}
              </p>
              <p className="dashboard__text">{formatBirthDateTime(summary.nextClass.startsAt)}</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="admin-callout">
        <p className="dashboard__eyebrow">Quick actions</p>
        <div className="admin-callout__links">
          <Link className="button button--primary" href="/parent/children">
            Manage children
          </Link>
          <Link className="button button--ghost" href="/parent/enrollments">
            View enrollments
          </Link>
          <Link className="button button--ghost" href="/parent/enrollments/new">
            Start enrollment
          </Link>
        </div>
      </section>
    </main>
  );
}
