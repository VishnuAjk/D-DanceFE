'use client';

import Link from 'next/link';
import { usePortalDashboard } from '@/hooks/use-portal-dashboard';
import { formatCurrency, formatSchedule } from '@/lib/admin-format';
import { formatBirthDateTime } from '@/lib/student-format';

export function PortalDashboard() {
  const summaryQuery = usePortalDashboard();
  const summary = summaryQuery.data;

  return (
    <main className="family-page">
      <section className="dashboard__hero">
        <p className="dashboard__eyebrow">Student Portal</p>
        <h1 className="dashboard__title">Your student profiles, classes, fees, and progress.</h1>
        <p className="dashboard__text">
          Add student profiles, request classes, and follow updates from the studio in one place.
        </p>
      </section>

      {!summaryQuery.isLoading && (summary?.studentProfilesCount ?? 0) === 0 ? (
        <section className="admin-callout">
          <p className="dashboard__eyebrow">Get started</p>
          <h2 className="metric-card__title">Add your first student profile.</h2>
          <p className="dashboard__text">
            Once a student is added, you can choose a branch and batch to request enrollment.
          </p>
          <div className="admin-callout__links">
            <Link className="button button--primary" href="/portal/student-profiles/add">
              Add student
            </Link>
            <Link className="button button--ghost" href="/portal/enrollments/new">
              Request enrollment
            </Link>
          </div>
        </section>
      ) : null}

      <section className="dashboard__grid">
        <article className="metric-card">
          <h2>Student Profiles count</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Loading profile summary...'
              : `${summary?.studentProfilesCount ?? 0} student profiles in your account`}
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
                ? `${formatCurrency(summary.upcomingFee.amount)} for ${summary.upcomingFee.studentProfileName} on ${new Date(summary.upcomingFee.dueDate).toLocaleDateString('en-IN')}`
                : 'No due fee entry is currently visible'}
          </p>
        </article>
        <article className="metric-card">
          <h2>Next class schedule</h2>
          <p>
            {summaryQuery.isLoading
              ? 'Checking class schedule...'
              : summary?.nextClass
                ? `${summary.nextClass.studentProfileName} • ${summary.nextClass.batchName} • ${formatBirthDateTime(summary.nextClass.startsAt)}`
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
            {(summary?.studentProfilesCount ?? 0) === 0
              ? 'Start by adding your first student profile.'
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
              <p className="dashboard__text">{summary.nextClass.studentProfileName}</p>
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
          <Link className="button button--primary" href="/portal/student-profiles">
            Manage student profiles
          </Link>
          <Link className="button button--ghost" href="/portal/enrollments">
            View enrollments
          </Link>
          <Link className="button button--ghost" href="/portal/enrollments/new">
            Start enrollment
          </Link>
        </div>
      </section>
    </main>
  );
}
