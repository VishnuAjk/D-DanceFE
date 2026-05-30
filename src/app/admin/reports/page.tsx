'use client';

import { useMemo, useState } from 'react';
import { useRevenueReport, useAttendanceReport, useEnrollmentStatsReport } from '@/hooks/use-admin-reports';
import { useBatches } from '@/hooks/use-batches';
import { useBranches } from '@/hooks/use-branches';
import { formatCurrency, readReferenceLabel } from '@/lib/admin-format';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthOffset(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AdminReportsPage() {
  const [branchId, setBranchId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [fromMonth, setFromMonth] = useState(monthOffset(-5));
  const [toMonth, setToMonth] = useState(currentMonth());
  const [attendanceMonth, setAttendanceMonth] = useState(currentMonth());
  const branchesQuery = useBranches();
  const batchesQuery = useBatches(branchId ? { branchId } : undefined);
  const revenueQuery = useRevenueReport({
    branchId: branchId || undefined,
    fromMonth,
    toMonth
  });
  const attendanceQuery = useAttendanceReport({ batchId: batchId || undefined, month: attendanceMonth });
  const enrollmentStatsQuery = useEnrollmentStatsReport({ branchId: branchId || undefined });

  const maxRevenue = useMemo(
    () => Math.max(...(revenueQuery.data?.rows.map((row) => row.total) ?? [0]), 1),
    [revenueQuery.data]
  );
  const enrollmentTotal = enrollmentStatsQuery.data?.total ?? 0;

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Reports</p>
          <h1 className="admin-page__title">Track revenue, attendance, and enrollment health.</h1>
          <p className="dashboard__text">
            Reporting is scoped by branch for branch admins and can be narrowed by batch where needed.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Branch</span>
          <select
            className="field__input"
            value={branchId}
            onChange={(event) => {
              setBranchId(event.target.value);
              setBatchId('');
            }}
          >
            <option value="">All visible branches</option>
            {(branchesQuery.data ?? []).map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Revenue from</span>
          <input
            className="field__input"
            type="month"
            value={fromMonth}
            onChange={(event) => setFromMonth(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Revenue to</span>
          <input
            className="field__input"
            type="month"
            value={toMonth}
            onChange={(event) => setToMonth(event.target.value)}
          />
        </label>
      </section>

      <section className="report-grid">
        <article className="admin-panel report-panel report-panel--wide">
          <div className="admin-panel__header">
            <div>
              <h2 className="metric-card__title">Revenue</h2>
              <p className="dashboard__text">{formatCurrency(revenueQuery.data?.total ?? 0)} collected</p>
            </div>
          </div>
          {revenueQuery.isLoading ? (
            <p className="dashboard__text">Loading revenue...</p>
          ) : revenueQuery.data?.rows.length ? (
            <div className="bar-chart" aria-label="Monthly revenue">
              {revenueQuery.data.rows.map((row) => (
                <div className="bar-chart__row" key={row.month}>
                  <span className="bar-chart__label">{row.month}</span>
                  <span className="bar-chart__track">
                    <span className="bar-chart__bar" style={{ width: `${Math.max((row.total / maxRevenue) * 100, 3)}%` }} />
                  </span>
                  <span className="bar-chart__value">{formatCurrency(row.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard__text">No paid fee records match this range.</p>
          )}
        </article>

        <article className="admin-panel report-panel">
          <h2 className="metric-card__title">Enrollment status</h2>
          {enrollmentStatsQuery.isLoading ? (
            <p className="dashboard__text">Loading enrollment stats...</p>
          ) : enrollmentStatsQuery.data?.rows.some((row) => row.count > 0) ? (
            <div className="donut-list">
              {enrollmentStatsQuery.data.rows.map((row) => {
                const percent = enrollmentTotal ? Math.round((row.count / enrollmentTotal) * 100) : 0;

                return (
                  <div className="donut-list__row" key={row.status}>
                    <span className={`status-dot status-dot--${row.status.toLowerCase()}`} />
                    <span>{statusLabel(row.status)}</span>
                    <strong>{row.count}</strong>
                    <span className="dashboard__text">{percent}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="dashboard__text">No enrollments found for this scope.</p>
          )}
        </article>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Batch</span>
          <select className="field__input" value={batchId} onChange={(event) => setBatchId(event.target.value)}>
            <option value="">Select a batch</option>
            {(batchesQuery.data ?? []).map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name} - {readReferenceLabel(batch.branchId)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Attendance month</span>
          <input
            className="field__input"
            type="month"
            value={attendanceMonth}
            onChange={(event) => setAttendanceMonth(event.target.value)}
          />
        </label>
      </section>

      <section className="admin-panel report-panel">
        <div className="admin-panel__header">
          <div>
            <h2 className="metric-card__title">Attendance</h2>
            <p className="dashboard__text">
              {attendanceQuery.data
                ? `${attendanceQuery.data.batch.name} • ${attendanceQuery.data.month}`
                : 'Select a batch to view marked attendance.'}
            </p>
          </div>
        </div>

        {batchId && attendanceQuery.isLoading ? <p className="dashboard__text">Loading attendance...</p> : null}

        {attendanceQuery.data ? (
          <>
            <div className="report-summary">
              <span>Present: {attendanceQuery.data.summary.PRESENT}</span>
              <span>Late: {attendanceQuery.data.summary.LATE}</span>
              <span>Absent: {attendanceQuery.data.summary.ABSENT}</span>
              <span>Total: {attendanceQuery.data.summary.total}</span>
            </div>
            <div className="report-table" role="table" aria-label="Attendance records">
              <div className="report-table__row report-table__row--head" role="row">
                <span role="columnheader">Date</span>
                <span role="columnheader">Student</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Notes</span>
              </div>
              {attendanceQuery.data.rows.length ? (
                attendanceQuery.data.rows.map((row) => (
                  <div className="report-table__row" key={row._id} role="row">
                    <span role="cell">{new Date(row.date).toLocaleDateString('en-IN')}</span>
                    <span role="cell">{row.studentProfileName}</span>
                    <span role="cell" className={`status-badge status-badge--${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                    <span role="cell">{row.notes ?? '-'}</span>
                  </div>
                ))
              ) : (
                <div className="report-table__row" role="row">
                  <span role="cell">No attendance records found for this month.</span>
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
