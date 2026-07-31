'use client';

import Link from 'next/link';
import { usePortalDashboard } from '@/hooks/use-portal-dashboard';
import { formatCurrency, formatSchedule } from '@/lib/admin-format';
import { formatBirthDateTime } from '@/lib/student-format';

export function PortalDashboard() {
  const summaryQuery = usePortalDashboard();
  const summary = summaryQuery.data;

  return (
    <main className="family-page dashboard-home">
      <section className="dashboard__hero dashboard-home__hero">
        <div><p className="dashboard__eyebrow">Student portal</p>
        <h1 className="dashboard__title">Everything for your dance journey.</h1>
        <p className="dashboard__text">
          Add student profiles, request classes, and follow updates from the studio in one place.
        </p></div>
        <Link className="button button--primary dashboard-home__hero-action" href="/portal/enrollments/new">Find a class</Link>
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

      <section className="dashboard__grid dashboard-stat-grid" aria-label="Account summary">
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Students</span><strong className="dashboard-stat__value">{summaryQuery.isLoading ? '—' : summary?.studentProfilesCount ?? 0}</strong><p>Profiles in account</p>
        </article>
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Enrollments</span><strong className="dashboard-stat__value">{summaryQuery.isLoading ? '—' : summary?.activeEnrollmentsCount ?? 0}</strong><p>Approved or active</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--wide">
          <span className="dashboard-stat__label">Upcoming fee</span><strong className="dashboard-stat__value dashboard-stat__value--currency">{summaryQuery.isLoading ? '—' : summary?.upcomingFee ? formatCurrency(summary.upcomingFee.amount) : 'All clear'}</strong><p>{summary?.upcomingFee ? `${summary.upcomingFee.studentProfileName} • ${new Date(summary.upcomingFee.dueDate).toLocaleDateString('en-IN')}` : 'Nothing currently due'}</p>
        </article>
        <article className="metric-card dashboard-stat dashboard-stat--wide">
          <span className="dashboard-stat__label">Next class</span><strong className="dashboard-stat__value dashboard-stat__value--text">{summaryQuery.isLoading ? 'Loading…' : summary?.nextClass?.batchName ?? 'No class scheduled'}</strong><p>{summary?.nextClass ? `${summary.nextClass.studentProfileName} • ${formatBirthDateTime(summary.nextClass.startsAt)}` : 'Approved classes appear here'}</p>
        </article>
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Attendance</span><strong className="dashboard-stat__value">{summaryQuery.isLoading ? '—' : summary?.recentAttendanceSummary.percentage !== null && summary?.recentAttendanceSummary.percentage !== undefined ? `${summary.recentAttendanceSummary.percentage}%` : '—'}</strong><p>Recent classes</p>
        </article>
        <article className="metric-card dashboard-stat">
          <span className="dashboard-stat__label">Next step</span><strong className="dashboard-stat__value dashboard-stat__value--text">{(summary?.studentProfilesCount ?? 0) === 0 ? 'Add student' : 'Stay updated'}</strong><p>{(summary?.studentProfilesCount ?? 0) === 0 ? 'Create a profile' : 'Monitor approvals'}</p>
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
        <div className="dashboard-section-heading"><div><p className="dashboard__eyebrow">Quick actions</p><h2>What would you like to do?</h2></div></div>
        <div className="admin-callout__links dashboard-action-grid">
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
