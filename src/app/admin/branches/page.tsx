'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { EntityModal } from '@/components/admin/entity-modal';
import { useBranches } from '@/hooks/use-branches';
import { createBranch, updateBranch } from '@/lib/admin-api';
import { formatApiError, isForbiddenError } from '@/lib/api-errors';
import type { Branch } from '@/types/admin';

const emptyBranchForm = { name: '', address: '', city: '', phone: '' };

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const branchesQuery = useBranches();
  const [editor, setEditor] = useState<null | { mode: 'create' | 'edit'; branch?: Branch }>(null);
  const [form, setForm] = useState(emptyBranchForm);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editor?.mode === 'edit' && editor.branch) {
        return updateBranch(editor.branch._id, form);
      }

      return createBranch(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branches'] });
      setEditor(null);
      setForm(emptyBranchForm);
      setError(null);
    },
    onError: (mutationError) => {
      setError(formatApiError(mutationError));
    }
  });

  function openCreate() {
    setEditor({ mode: 'create' });
    setForm(emptyBranchForm);
    setError(null);
  }

  function openEdit(branch: Branch) {
    setEditor({ mode: 'edit', branch });
    setForm({
      name: branch.name,
      address: branch.address,
      city: branch.city ?? '',
      phone: branch.phone ?? ''
    });
    setError(null);
  }

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Branches</p>
          <h1 className="admin-page__title">Manage physical studio locations.</h1>
          <p className="dashboard__text">
            Super admins can create and edit branch records. Branch admins may have restricted
            visibility depending on their assigned scope.
          </p>
        </div>
        <button className="button button--primary" onClick={openCreate} type="button">
          New branch
        </button>
      </section>

      {branchesQuery.isError ? (
        <section className="admin-panel">
          <p className="dashboard__eyebrow">Access</p>
          <h2 className="metric-card__title">Branch list is unavailable.</h2>
          <p className="dashboard__text">
            {isForbiddenError(branchesQuery.error)
              ? 'Your current role does not have access to the branch directory endpoint.'
              : formatApiError(branchesQuery.error)}
          </p>
        </section>
      ) : (
        <section className="admin-grid">
          {branchesQuery.isLoading ? (
            <article className="admin-panel">
              <p className="dashboard__text">Loading branches...</p>
            </article>
          ) : branchesQuery.data?.length ? (
            branchesQuery.data.map((branch) => (
              <article className="admin-panel" key={branch._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{branch.name}</h2>
                    <p className="dashboard__text">
                      {branch.city ?? 'City not set'} • {branch.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <button className="button button--ghost" onClick={() => openEdit(branch)} type="button">
                    Edit
                  </button>
                </div>
                <p className="dashboard__text">{branch.address}</p>
                <p className="dashboard__text">{branch.phone ?? 'Phone not configured'}</p>
              </article>
            ))
          ) : (
            <article className="admin-panel">
              <p className="dashboard__text">No branches exist yet. Create the first one to begin operations.</p>
            </article>
          )}
        </section>
      )}

      {editor ? (
        <EntityModal
          title={editor.mode === 'edit' ? 'Edit branch' : 'Create branch'}
          description="Keep branch information complete so later admin workflows have a reliable operating context."
          onClose={() => setEditor(null)}
        >
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void saveMutation.mutateAsync();
            }}
          >
            <label className="field">
              <span className="field__label">Branch name</span>
              <input
                className="field__input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Address</span>
              <input
                className="field__input"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">City</span>
              <input
                className="field__input"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Phone</span>
              <input
                className="field__input"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <button className="button button--primary" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? 'Saving...' : 'Save branch'}
            </button>
          </form>
        </EntityModal>
      ) : null}
    </main>
  );
}
