'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBranches } from '@/hooks/use-branches';
import { generateFeeLedger } from '@/lib/admin-api';
import { formatApiError } from '@/lib/api-errors';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function GenerateFeesPage() {
  const router = useRouter();
  const branchesQuery = useBranches();
  const [month, setMonth] = useState(currentMonth());
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => generateFeeLedger({ month, branchId: branchId || undefined }),
    onSuccess: () => {
      setError(null);
      router.push('/admin/fees');
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Generate fees</p>
          <h1 className="admin-page__title">Create monthly fee ledger entries.</h1>
          <p className="dashboard__text">
            Generation is idempotent, so re-running the same month safely fills only missing entries.
          </p>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <label className="field">
            <span className="field__label">Month</span>
            <input className="field__input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
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
        </div>

        {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

        <div className="admin-panel__actions">
          <button className="button button--primary" type="button" disabled={mutation.isPending} onClick={() => void mutation.mutateAsync()}>
            {mutation.isPending ? 'Generating...' : 'Generate fee ledger'}
          </button>
        </div>
      </section>
    </main>
  );
}

