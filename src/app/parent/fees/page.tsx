'use client';

import { useState } from 'react';
import { useParentFees } from '@/hooks/use-parent-fees';
import { useChildren } from '@/hooks/use-children';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatBirthDate } from '@/lib/parent-format';
import type { ParentBatchOption, ParentChild, ParentFeeLedger } from '@/types/parent';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function readChild(value: string | ParentChild) {
  return typeof value === 'string' ? null : value;
}

function readBatch(value: ParentFeeLedger['enrollmentId']) {
  if (typeof value === 'string') {
    return null;
  }

  return typeof value.batchId === 'string' ? null : (value.batchId as ParentBatchOption);
}

export default function ParentFeesPage() {
  const childrenQuery = useChildren();
  const [month, setMonth] = useState(currentMonth());
  const [childId, setChildId] = useState('');
  const feesQuery = useParentFees({
    month: month || undefined,
    childId: childId || undefined
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Fees</p>
          <h1 className="admin-page__title">Review dues for each child profile.</h1>
          <p className="dashboard__text">
            Payment checkout arrives in the next ticket. This page already shows the ledger and what is due now.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Month</span>
          <input className="field__input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Child</span>
          <select className="field__input" value={childId} onChange={(event) => setChildId(event.target.value)}>
            <option value="">All children</option>
            {(childrenQuery.data ?? []).map((child) => (
              <option key={child._id} value={child._id}>
                {child.name}
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
            const child = readChild(entry.childId);
            const batch = readBatch(entry.enrollmentId);

            return (
              <article className="admin-panel" key={entry._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{child?.name ?? 'Child profile'}</h2>
                    <p className="dashboard__text">
                      {entry.month} • {batch?.name ?? 'Batch'} • {readReferenceLabel(entry.branchId)}
                    </p>
                  </div>
                  <span className={`status-badge status-badge--${entry.status.toLowerCase()}`}>{entry.status}</span>
                </div>

                <p className="dashboard__text">
                  {child ? `Child DOB: ${formatBirthDate(child.dob)} • ${child.gender}` : 'Child profile unavailable'}
                </p>
                <p className="dashboard__text">
                  {batch ? `${formatSchedule(batch)} • Due ${new Date(entry.dueDate).toLocaleDateString('en-IN')}` : 'Batch details unavailable'}
                </p>
                <p className="dashboard__text">
                  Payable: {formatCurrency(entry.finalAmount)}
                  {entry.discount ? ` after ${formatCurrency(entry.discount)} discount` : ''}
                </p>

                <div className="admin-panel__actions">
                  <button className="button button--primary" type="button" disabled={entry.status !== 'DUE' && entry.status !== 'OVERDUE'}>
                    Pay Now (PAY-02)
                  </button>
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

