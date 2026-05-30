'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createStudentProfile } from '@/lib/portal-api';
import { formatApiError } from '@/lib/api-errors';
import { useAuth } from '@/providers/auth-provider';

type RelationshipToCustomer = 'self' | 'child' | 'family_member';

const emptyForm: {
  name: string;
  dob: string;
  gender: string;
  relationshipToCustomer: RelationshipToCustomer;
  photo: string;
} = {
  name: '',
  dob: '',
  gender: 'female',
  relationshipToCustomer: 'self' as const,
  photo: ''
};

export default function AddStudentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () =>
      createStudentProfile({
        ...form,
        photo: form.photo || undefined,
        dob: new Date(form.dob).toISOString()
      }),
    onSuccess: async (student) => {
      await queryClient.invalidateQueries({ queryKey: ['student profiles'] });
      router.push(`/portal/student-profiles/${student._id}`);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Add student</p>
          <h1 className="admin-page__title">Create a student profile for yourself or someone else.</h1>
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
          <div className="chip-row" role="group" aria-label="Student profile owner">
            <button
              className={`chip${form.relationshipToCustomer === 'self' ? ' is-selected' : ''}`}
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  relationshipToCustomer: 'self',
                  name: current.name || user?.name || ''
                }))
              }
            >
              Myself
            </button>
            <button
              className={`chip${form.relationshipToCustomer === 'child' ? ' is-selected' : ''}`}
              type="button"
              onClick={() => setForm((current) => ({ ...current, relationshipToCustomer: 'child' }))}
            >
              My child
            </button>
            <button
              className={`chip${form.relationshipToCustomer === 'family_member' ? ' is-selected' : ''}`}
              type="button"
              onClick={() => setForm((current) => ({ ...current, relationshipToCustomer: 'family_member' }))}
            >
              Family member
            </button>
          </div>

          <label className="field">
            <span className="field__label">Student name</span>
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
            {mutation.isPending ? 'Saving...' : 'Create student profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
