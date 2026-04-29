'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createChild } from '@/lib/parent-api';
import { formatApiError } from '@/lib/api-errors';

const emptyForm = {
  name: '',
  dob: '',
  gender: 'female',
  photo: ''
};

export default function AddChildPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () =>
      createChild({
        ...form,
        photo: form.photo || undefined,
        dob: new Date(form.dob).toISOString()
      }),
    onSuccess: async (child) => {
      await queryClient.invalidateQueries({ queryKey: ['children'] });
      router.push(`/parent/children/${child._id}`);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Add child</p>
          <h1 className="admin-page__title">Create a child profile for your family account.</h1>
        </div>
      </section>

      <section className="admin-panel">
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            void mutation.mutateAsync();
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
          <button className="button button--primary" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Saving...' : 'Create child profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
