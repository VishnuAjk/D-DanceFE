'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { EntityModal } from '@/components/admin/entity-modal';
import { useBatches } from '@/hooks/use-batches';
import { useBranches } from '@/hooks/use-branches';
import { useCourses } from '@/hooks/use-courses';
import { createBatch, updateBatch } from '@/lib/admin-api';
import { formatCurrency, formatSchedule, readReferenceId, readReferenceLabel } from '@/lib/admin-format';
import { formatApiError } from '@/lib/api-errors';
import type { Batch } from '@/types/admin';

const emptyBatchForm = {
  name: '',
  branchId: '',
  courseId: '',
  levelId: '',
  capacity: '30',
  monthlyFee: '2500',
  startTime: '18:00',
  endTime: '19:00',
  days: ['MON', 'WED', 'FRI']
};

export default function BatchesPage() {
  const queryClient = useQueryClient();
  const [branchFilter, setBranchFilter] = useState('');
  const branchesQuery = useBranches();
  const coursesQuery = useCourses();
  const batchesQuery = useBatches(branchFilter ? { branchId: branchFilter } : undefined);
  const [editor, setEditor] = useState<null | { mode: 'create' | 'edit'; batch?: Batch }>(null);
  const [form, setForm] = useState(emptyBatchForm);
  const [error, setError] = useState<string | null>(null);

  const branchOptions = branchesQuery.data ?? [];
  const courseOptions = coursesQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        branchId: form.branchId,
        courseId: form.courseId,
        levelId: form.levelId || undefined,
        schedule: {
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime
        },
        instructorIds: [],
        capacity: Number(form.capacity),
        monthlyFee: Number(form.monthlyFee)
      };

      if (editor?.mode === 'edit' && editor.batch) {
        return updateBatch(editor.batch._id, payload);
      }

      return createBatch(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['batches'] });
      setEditor(null);
      setForm(emptyBatchForm);
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const selectedCourseLevels = useMemo(() => {
    return courseOptions.find((course) => course._id === form.courseId)?.levels ?? [];
  }, [courseOptions, form.courseId]);

  function openCreate() {
    setEditor({ mode: 'create' });
    setForm({
      ...emptyBatchForm,
      branchId: branchOptions[0]?._id ?? '',
      courseId: courseOptions[0]?._id ?? ''
    });
    setError(null);
  }

  function openEdit(batch: Batch) {
    setEditor({ mode: 'edit', batch });
    setForm({
      name: batch.name,
      branchId: readReferenceId(batch.branchId),
      courseId: readReferenceId(batch.courseId),
      levelId: readReferenceId(batch.levelId),
      capacity: String(batch.capacity),
      monthlyFee: String(batch.monthlyFee),
      startTime: batch.schedule.startTime,
      endTime: batch.schedule.endTime,
      days: batch.schedule.days
    });
    setError(null);
  }

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Batches</p>
          <h1 className="admin-page__title">Plan schedules, fees, and capacity.</h1>
          <p className="dashboard__text">
            Batch operations are shown in a mobile-first list so admins can scan and act without a
            desktop-only table layout.
          </p>
        </div>
        <button className="button button--primary" onClick={openCreate} type="button">
          New batch
        </button>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Filter by branch</span>
          <select
            className="field__input"
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
          >
            <option value="">All visible branches</option>
            {branchOptions.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="admin-grid">
        {batchesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading batches...</p>
          </article>
        ) : batchesQuery.data?.length ? (
          batchesQuery.data.map((batch) => (
            <article className="admin-panel" key={batch._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{batch.name}</h2>
                  <p className="dashboard__text">
                    {readReferenceLabel(batch.branchId)} • {readReferenceLabel(batch.courseId)}
                  </p>
                </div>
                <button className="button button--ghost" type="button" onClick={() => openEdit(batch)}>
                  Edit
                </button>
              </div>
              <div className="admin-meta">
                <span>{formatSchedule(batch)}</span>
                <span>{formatCurrency(batch.monthlyFee)}</span>
                <span>{batch.capacity} seats</span>
              </div>
              <div className="admin-panel__actions">
                <Link className="button button--ghost" href={`/admin/batches/${batch._id}`}>
                  View detail
                </Link>
                <Link className="button button--ghost" href={`/admin/batches/${batch._id}/roster`}>
                  View roster
                </Link>
              </div>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No batches exist yet. Create one once branches and courses are ready.</p>
          </article>
        )}
      </section>

      {editor ? (
        <EntityModal
          title={editor.mode === 'edit' ? 'Edit batch' : 'Create batch'}
          description="Batch setup drives schedule visibility, roster operations, and fee expectations."
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
              <span className="field__label">Batch name</span>
              <input
                className="field__input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Branch</span>
              <select
                className="field__input"
                value={form.branchId}
                onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))}
              >
                <option value="">Select branch</option>
                {branchOptions.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Course</span>
              <select
                className="field__input"
                value={form.courseId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    courseId: event.target.value,
                    levelId: ''
                  }))
                }
              >
                <option value="">Select course</option>
                {courseOptions.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Level</span>
              <select
                className="field__input"
                value={form.levelId}
                onChange={(event) => setForm((current) => ({ ...current, levelId: event.target.value }))}
              >
                <option value="">Optional level</option>
                {selectedCourseLevels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field__label">Capacity</span>
                <input
                  className="field__input"
                  inputMode="numeric"
                  value={form.capacity}
                  onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field__label">Monthly fee</span>
                <input
                  className="field__input"
                  inputMode="numeric"
                  value={form.monthlyFee}
                  onChange={(event) => setForm((current) => ({ ...current, monthlyFee: event.target.value }))}
                />
              </label>
            </div>
            <div className="admin-form-grid">
              <label className="field">
                <span className="field__label">Start time</span>
                <input
                  className="field__input"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                />
              </label>
              <label className="field">
                <span className="field__label">End time</span>
                <input
                  className="field__input"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                />
              </label>
            </div>
            <label className="field">
              <span className="field__label">Schedule days</span>
              <input
                className="field__input"
                value={form.days.join(', ')}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    days: event.target.value
                      .split(',')
                      .map((value) => value.trim().toUpperCase())
                      .filter(Boolean)
                  }))
                }
              />
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <button className="button button--primary" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? 'Saving...' : 'Save batch'}
            </button>
          </form>
        </EntityModal>
      ) : null}
    </main>
  );
}
