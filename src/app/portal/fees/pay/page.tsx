'use client';

import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePortalFees } from '@/hooks/use-portal-fees';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { formatApiError } from '@/lib/api-errors';
import { initiatePortalFeePayment } from '@/lib/portal-api';
import { formatBirthDate } from '@/lib/student-format';
import type { PortalBatchOption, StudentProfile, PortalFeeLedger } from '@/types/portal';

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: unknown) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

function readStudent(value: string | StudentProfile) {
  return typeof value === 'string' ? null : value;
}

function readBatch(value: PortalFeeLedger['enrollmentId']) {
  if (typeof value === 'string') {
    return null;
  }

  return typeof value.batchId === 'string' ? null : (value.batchId as PortalBatchOption);
}

function parseLedgerIds(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    throw new Error('Checkout is only available in the browser');
  }

  if ((window as Window & { Razorpay?: RazorpayConstructor }).Razorpay) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

export default function CustomerFeePaymentPage() {
  const searchParams = useSearchParams();
  const monthFilter = searchParams.get('month') || undefined;
  const studentProfileIdFilter = searchParams.get('studentProfileId') || undefined;
  const requestedLedgerIds = useMemo(() => parseLedgerIds(searchParams.get('ledgerIds')), [searchParams]);
  const feesQuery = usePortalFees({
    month: monthFilter,
    studentProfileId: studentProfileIdFilter
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eligibleEntries = useMemo(
    () => (feesQuery.data ?? []).filter((entry) => entry.status === 'DUE' || entry.status === 'OVERDUE'),
    [feesQuery.data]
  );

  useEffect(() => {
    if (!eligibleEntries.length) {
      setSelectedIds([]);
      return;
    }

    const eligibleIds = new Set(eligibleEntries.map((entry) => entry._id));
    const requested = requestedLedgerIds.filter((id) => eligibleIds.has(id));

    setSelectedIds(requested.length ? requested : eligibleEntries.map((entry) => entry._id));
  }, [eligibleEntries, requestedLedgerIds]);

  const selectedEntries = useMemo(
    () => eligibleEntries.filter((entry) => selectedIds.includes(entry._id)),
    [eligibleEntries, selectedIds]
  );
  const total = useMemo(
    () => selectedEntries.reduce((sum, entry) => sum + entry.finalAmount, 0),
    [selectedEntries]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedIds.length) {
        throw new Error('Select at least one due fee entry');
      }

      const payment = await initiatePortalFeePayment({ ledgerIds: selectedIds });
      await loadRazorpayScript();

      if (!payment.keyId) {
        throw new Error('Payment key is unavailable right now');
      }

      const keyId = payment.keyId;

      const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;

      if (!Razorpay) {
        throw new Error('Razorpay checkout did not load correctly');
      }

      await new Promise<void>((resolve) => {
        const checkout = new Razorpay({
          key: keyId,
          amount: payment.amount,
          currency: payment.currency,
          order_id: payment.orderId,
          name: 'Dance App',
          description: `Fee payment for ${selectedEntries.length} entr${selectedEntries.length === 1 ? 'y' : 'ies'}`,
          handler: () => {
            setMessage('Payment submitted. Ledger status will update after the Razorpay webhook confirms capture.');
            setError(null);
            resolve();
          },
          modal: {
            ondismiss: () => resolve()
          }
        });

        checkout.open();
      });
    },
    onError: (mutationError) => {
      setMessage(null);
      setError(formatApiError(mutationError));
    }
  });

  function toggleSelection(ledgerId: string) {
    setSelectedIds((current) =>
      current.includes(ledgerId) ? current.filter((item) => item !== ledgerId) : [...current, ledgerId]
    );
  }

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Payments</p>
          <h1 className="admin-page__title">Choose due entries and open checkout.</h1>
          <p className="dashboard__text">
            The checkout creates a Razorpay order first. Fee status remains unchanged here until the webhook confirms payment capture.
          </p>
        </div>
        <Link className="button button--ghost" href="/portal/fees">
          Back to fees
        </Link>
      </section>

      <section className="admin-toolbar">
        <article className="admin-panel">
          <h2 className="metric-card__title">Selected entries</h2>
          <p className="dashboard__text">{selectedEntries.length}</p>
        </article>
        <article className="admin-panel">
          <h2 className="metric-card__title">Total payable</h2>
          <p className="dashboard__text">{formatCurrency(total)}</p>
        </article>
      </section>

      {message ? <div className="auth-inline-note">{message}</div> : null}
      {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

      <section className="family-grid">
        {feesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading due entries...</p>
          </article>
        ) : eligibleEntries.length ? (
          eligibleEntries.map((entry) => {
            const student = readStudent(entry.studentProfileId);
            const batch = readBatch(entry.enrollmentId);
            const isSelected = selectedIds.includes(entry._id);

            return (
              <button
                key={entry._id}
                className={`selection-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => toggleSelection(entry._id)}
                type="button"
              >
                <strong>{student?.name ?? 'Student profile'}</strong>
                <span>
                  {entry.month} • {batch?.name ?? 'Batch'} • {readReferenceLabel(entry.branchId)}
                </span>
                <span>
                  {student ? `DOB ${formatBirthDate(student.dob)} • ${student.gender}` : 'Student profile unavailable'}
                </span>
                <span>
                  {batch ? `${formatSchedule(batch)} • Due ${new Date(entry.dueDate).toLocaleDateString('en-IN')}` : 'Batch details unavailable'}
                </span>
                <span>
                  {formatCurrency(entry.finalAmount)}
                  {entry.discount ? ` after ${formatCurrency(entry.discount)} discount` : ''}
                </span>
                <span className={`status-badge status-badge--${entry.status.toLowerCase()}`}>{entry.status}</span>
              </button>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No due or overdue entries are available for the current filter.</p>
          </article>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href="/portal/fees">
            Cancel
          </Link>
          <button
            className="button button--primary"
            disabled={!selectedIds.length || mutation.isPending}
            onClick={() => void mutation.mutateAsync()}
            type="button"
          >
            {mutation.isPending ? 'Opening checkout...' : `Pay ${formatCurrency(total)}`}
          </button>
        </div>
      </section>
    </main>
  );
}
