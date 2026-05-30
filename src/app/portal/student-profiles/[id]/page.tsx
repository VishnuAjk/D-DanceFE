'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStudentProfile } from '@/hooks/use-student-profiles';
import { formatApiError } from '@/lib/api-errors';
import { deleteStudentProfile, updateStudentProfile } from '@/lib/portal-api';
import { calculateAge, formatBirthDate } from '@/lib/student-format';

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentQuery = useStudentProfile(params.id);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'female', photo: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentQuery.data) {
      return;
    }

    setForm({
      name: studentQuery.data.name,
      dob: studentQuery.data.dob.slice(0, 10),
      gender: studentQuery.data.gender,
      photo: studentQuery.data.photo ?? ''
    });
  }, [studentQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () =>
      updateStudentProfile(params.id, {
        ...form,
        photo: form.photo || undefined,
        dob: new Date(form.dob).toISOString()
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student profiles'] });
      await queryClient.invalidateQueries({ queryKey: ['student', params.id] });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteStudentProfile(params.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student profiles'] });
      router.push('/portal/student-profiles');
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Student profile</p>
          <h1 className="admin-page__title">
            {studentQuery.data ? studentQuery.data.name : 'Student profile'}
          </h1>
          <p className="dashboard__text">
            {studentQuery.data
              ? `${calculateAge(studentQuery.data.dob)} years old • Born ${formatBirthDate(studentQuery.data.dob)}`
              : 'Load and maintain student details here.'}
          </p>
        </div>
        <Link className="button button--ghost" href="/portal/student-profiles">
          Back to student profiles
        </Link>
      </section>

      <section className="admin-panel">
        {studentQuery.isLoading ? (
          <p className="dashboard__text">Loading student profile...</p>
        ) : studentQuery.data ? (
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void updateMutation.mutateAsync();
            }}
          >
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
                {deleteMutation.isPending ? 'Removing...' : 'Remove student'}
              </button>
            </div>
          </form>
        ) : (
          <p className="dashboard__text">Student profile not found.</p>
        )}
      </section>
    </main>
  );
}
