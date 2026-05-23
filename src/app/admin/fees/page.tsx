'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EntityModal } from '@/components/admin/entity-modal';
import { useBranches } from '@/hooks/use-branches';
import { useFeeLedger } from '@/hooks/use-fee-ledger';
import { discountFeeLedger, waiveFeeLedger } from '@/lib/admin-api';
import { formatCurrency, readReferenceLabel } from '@/lib/admin-format';
import { formatApiError } from '@/lib/api-errors';
import { formatBirthDate } from '@/lib/parent-format';
import type { AdminFeeLedger, Child, FeeLinkedEnrollment } from '@/types/admin';

function readChild(value: string | Child) {
  return typeof value === 'string' ? null : value;
}

function readEnrollment(value: string | FeeLinkedEnrollment) {
  return typeof value === 'string' ? null : value;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function AdminFeesPage() {
  const queryClient = useQueryClient();
  const branchesQuery = useBranches();
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLedger, setSelectedLedger] = useState<AdminFeeLedger | null>(null);
  const [discountValue, setDiscountValue] = useState('');
  const feesQuery = useFeeLedger({
    month: month || undefined,
    status: status || undefined,
    branchId: branchId || undefined
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      ledgerId,
      action,
      discount
    }: {
      ledgerId: string;
      action: 'waive' | 'discount';
      discount?: number;
    }) => {
      if (action === 'waive') {
        return waiveFeeLedger(ledgerId);
      }

      return discountFeeLedger(ledgerId, { discount: discount ?? 0 });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-fee-ledger'] });
      await queryClient.invalidateQueries({ queryKey: ['parent-fees'] });
      setSelectedLedger(null);
      setDiscountValue('');
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const dueTotal = useMemo(
    () =>
      (feesQuery.data ?? [])
        .filter((entry) => entry.status === 'DUE' || entry.status === 'OVERDUE')
        .reduce((sum, entry) => sum + entry.finalAmount, 0),
    [feesQuery.data]
  );

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Fees</p>
          <h1 className="admin-page__title">Review ledger status, discounts, and waivers.</h1>
          <p className="dashboard__text">
            Track monthly dues, apply approved discounts, and confirm fee status for each child.
          </p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--primary" href="/admin/fees/generate">
            Generate fees
          </Link>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Month</span>
          <input className="field__input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Status</span>
          <select className="field__input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All</option>
            <option value="DUE">Due</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">Branch</span>
          <select className="field__input" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            <option value="">All visible branches</option>
            {(branchesQuery.data ?? []).map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <article className="admin-panel">
          <h2 className="metric-card__title">Current due</h2>
          <p className="dashboard__text">{formatCurrency(dueTotal)}</p>
        </article>
      </section>

      {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

      <section className="admin-grid">
        {feesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading fee ledger...</p>
          </article>
        ) : feesQuery.data?.length ? (
          feesQuery.data.map((entry) => {
            const child = readChild(entry.childId);
            const enrollment = readEnrollment(entry.enrollmentId);
            const batch = enrollment && typeof enrollment.batchId !== 'string' ? enrollment.batchId : null;

            return (
              <article className="admin-panel" key={entry._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{child?.name ?? 'Child'}</h2>
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
                  Amount: {formatCurrency(entry.amount)} • Discount: {formatCurrency(entry.discount)}
                </p>
                <p className="dashboard__text">
                  Final: {formatCurrency(entry.finalAmount)} • Due: {new Date(entry.dueDate).toLocaleDateString('en-IN')}
                </p>

                <div className="admin-panel__actions">
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => setSelectedLedger(entry)}
                    disabled={entry.status === 'PAID' || entry.status === 'WAIVED'}
                  >
                    Discount
                  </button>
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => void actionMutation.mutateAsync({ ledgerId: entry._id, action: 'waive' })}
                    disabled={entry.status === 'PAID' || entry.status === 'WAIVED'}
                  >
                    Waive
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No fee ledger entries match the current filters.</p>
          </article>
        )}
      </section>

      {selectedLedger ? (
        <EntityModal
          title="Apply discount"
          description="Set a partial discount for this ledger entry. Use waive for a full write-off."
          onClose={() => {
            setSelectedLedger(null);
            setDiscountValue('');
          }}
        >
          <div className="stack entity-modal__body">
            <label className="field">
              <span className="field__label">Discount amount</span>
              <input
                className="field__input"
                inputMode="decimal"
                placeholder="Enter discount amount"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value.replace(/[^\d.]/g, ''))}
              />
            </label>
            <button
              className="button button--primary"
              type="button"
              disabled={!discountValue || actionMutation.isPending}
              onClick={() =>
                void actionMutation.mutateAsync({
                  ledgerId: selectedLedger._id,
                  action: 'discount',
                  discount: Number(discountValue)
                })
              }
            >
              {actionMutation.isPending ? 'Applying...' : 'Apply discount'}
            </button>
          </div>
        </EntityModal>
      ) : null}
    </main>
  );
}
