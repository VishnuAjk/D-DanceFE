'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePortalFees } from '@/hooks/use-portal-fees';
import { useStudentProfiles } from '@/hooks/use-student-profiles';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatBirthDate } from '@/lib/student-format';
import type { PortalBatchOption, StudentProfile, PortalFeeLedger } from '@/types/portal';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function readStudent(value: string | StudentProfile) {
  return typeof value === 'string' ? null : value;
}

function readBatch(value: PortalFeeLedger['enrollmentId']) {
  if (typeof value === 'string') {
    return null;
  }

  return typeof value.batchId === 'string' ? null : (value.batchId as PortalBatchOption);
}

export default function CustomerFeesPage() {
  const studentProfilesQuery = useStudentProfiles();
  const [month, setMonth] = useState(currentMonth());
  const [studentProfileId, setStudentId] = useState('');
  const feesQuery = usePortalFees({
    month: month || undefined,
    studentProfileId: studentProfileId || undefined
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Fees</p>
          <h1 className="admin-page__title">Review dues for each student profile.</h1>
          <p className="dashboard__text">
            Select any due month and continue into checkout. Multi-month payment is handled on the next screen.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Month</span>
          <input className="field__input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Student</span>
          <select className="field__input" value={studentProfileId} onChange={(event) => setStudentId(event.target.value)}>
            <option value="">All student profiles</option>
            {(studentProfilesQuery.data ?? []).map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="family-grid">
        {feesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading fee ledger...</p>
          </article>
        ) : feesQuery.data?.length ? (
          feesQuery.data.map((entry) => {
            const student = readStudent(entry.studentProfileId);
            const batch = readBatch(entry.enrollmentId);

            return (
              <article className="admin-panel" key={entry._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{student?.name ?? 'Student profile'}</h2>
                    <p className="dashboard__text">
                      {entry.month} • {batch?.name ?? 'Batch'} • {readReferenceLabel(entry.branchId)}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${entry.status.toLowerCase()}`}>{entry.status}</span>
                </div>

                <p className="dashboard__text">
                  {student ? `Student DOB: ${formatBirthDate(student.dob)} • ${student.gender}` : 'Student profile unavailable'}
                </p>
                <p className="dashboard__text">
                  {batch ? `${formatSchedule(batch)} • Due ${new Date(entry.dueDate).toLocaleDateString('en-IN')}` : 'Batch details unavailable'}
                </p>
                <p className="dashboard__text">
                  Payable: {formatCurrency(entry.finalAmount)}
                  {entry.discount ? ` after ${formatCurrency(entry.discount)} discount` : ''}
                </p>

                <div className="admin-panel__actions">
                  {entry.status === 'DUE' || entry.status === 'OVERDUE' ? (
                    <Link
                      className="button button--primary"
                      href={`/portal/fees/pay?month=${encodeURIComponent(month)}&studentProfileId=${encodeURIComponent(
                        studentProfileId
                      )}&ledgerIds=${encodeURIComponent(entry._id)}`}
                    >
                      Pay now
                    </Link>
                  ) : (
                    <button className="button button--primary" type="button" disabled>
                      Pay now
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No fee entries found for the current filter.</p>
          </article>
        )}
      </section>
    </main>
  );
}
