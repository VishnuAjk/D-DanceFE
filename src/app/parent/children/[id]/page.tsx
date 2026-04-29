'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChild } from '@/hooks/use-children';
import { formatApiError } from '@/lib/api-errors';
import { deleteChild, updateChild } from '@/lib/parent-api';
import { calculateAge, formatBirthDate } from '@/lib/parent-format';

export default function ChildDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const childQuery = useChild(params.id);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'female', photo: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childQuery.data) {
      return;
    }

    setForm({
      name: childQuery.data.name,
      dob: childQuery.data.dob.slice(0, 10),
      gender: childQuery.data.gender,
      photo: childQuery.data.photo ?? ''
    });
  }, [childQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () =>
      updateChild(params.id, {
        ...form,
        photo: form.photo || undefined,
        dob: new Date(form.dob).toISOString()
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['children'] });
      await queryClient.invalidateQueries({ queryKey: ['child', params.id] });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteChild(params.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['children'] });
      router.push('/parent/children');
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Child profile</p>
          <h1 className="admin-page__title">
            {childQuery.data ? childQuery.data.name : 'Child profile'}
          </h1>
          <p className="dashboard__text">
            {childQuery.data
              ? `${calculateAge(childQuery.data.dob)} years old • Born ${formatBirthDate(childQuery.data.dob)}`
              : 'Load and maintain child details here.'}
          </p>
        </div>
        <Link className="button button--ghost" href="/parent/children">
          Back to children
        </Link>
      </section>

      <section className="admin-panel">
        {childQuery.isLoading ? (
          <p className="dashboard__text">Loading child profile...</p>
        ) : childQuery.data ? (
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void updateMutation.mutateAsync();
            }}
          >
            <label className="field">
              <span className="field__label">Child name</span>
              <input
                className="field__input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field__label">Date of birth</span>
                <input
                  className="field__input"
                  type="date"
                  value={form.dob}
                  onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field__label">Gender</span>
                <select
                  className="field__input"
                  value={form.gender}
                  onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">Photo URL</span>
              <input
                className="field__input"
                value={form.photo}
                onChange={(event) => setForm((current) => ({ ...current, photo: event.target.value }))}
              />
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <div className="admin-panel__actions">
              <button className="button button--primary" disabled={updateMutation.isPending} type="submit">
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
              <button
                className="button button--ghost"
                disabled={deleteMutation.isPending}
                onClick={() => void deleteMutation.mutateAsync()}
                type="button"
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove child'}
              </button>
            </div>
          </form>
        ) : (
          <p className="dashboard__text">Child profile not found.</p>
        )}
      </section>
    </main>
  );
}
