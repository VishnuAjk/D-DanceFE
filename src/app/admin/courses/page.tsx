'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { EntityModal } from '@/components/admin/entity-modal';
import { useCourses } from '@/hooks/use-courses';
import { createCourse, createLevel, updateCourse, updateLevel } from '@/lib/admin-api';
import { formatApiError } from '@/lib/api-errors';
import type { Course, Level } from '@/types/admin';

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const coursesQuery = useCourses();
  const [courseEditor, setCourseEditor] = useState<null | { mode: 'create' | 'edit'; course?: Course }>(null);
  const [levelEditor, setLevelEditor] = useState<null | { courseId: string; level?: Level }>(null);
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });
  const [levelForm, setLevelForm] = useState({ name: '', order: '0' });
  const [error, setError] = useState<string | null>(null);

  const courseMutation = useMutation({
    mutationFn: async () => {
      if (courseEditor?.mode === 'edit' && courseEditor.course) {
        return updateCourse(courseEditor.course._id, courseForm);
      }

      return createCourse(courseForm);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      setCourseEditor(null);
      setCourseForm({ name: '', description: '' });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const levelMutation = useMutation({
    mutationFn: async () => {
      if (!levelEditor) {
        throw new Error('Level editor is not active');
      }

      if (levelEditor.level) {
        return updateLevel(levelEditor.level._id, {
          name: levelForm.name,
          order: Number(levelForm.order)
        });
      }

      return createLevel(levelEditor.courseId, {
        name: levelForm.name,
        order: Number(levelForm.order)
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      setLevelEditor(null);
      setLevelForm({ name: '', order: '0' });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Courses</p>
          <h1 className="admin-page__title">Shape the learning catalog.</h1>
          <p className="dashboard__text">
            Courses and levels define the academic backbone for batch planning and student
            progression.
          </p>
        </div>
        <button
          className="button button--primary"
          onClick={() => {
            setCourseEditor({ mode: 'create' });
            setCourseForm({ name: '', description: '' });
            setError(null);
          }}
          type="button"
        >
          New course
        </button>
      </section>

      <section className="admin-grid">
        {coursesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading courses...</p>
          </article>
        ) : coursesQuery.data?.length ? (
          coursesQuery.data.map((course) => (
            <article className="admin-panel" key={course._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{course.name}</h2>
                  <p className="dashboard__text">
                    {course.description ?? 'No course description yet.'}
                  </p>
                </div>
                <div className="admin-panel__actions">
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={() => {
                      setCourseEditor({ mode: 'edit', course });
                      setCourseForm({
                        name: course.name,
                        description: course.description ?? ''
                      });
                      setError(null);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={() => {
                      setLevelEditor({ courseId: course._id });
                      setLevelForm({ name: '', order: String(course.levels?.length ?? 0) });
                      setError(null);
                    }}
                  >
                    Add level
                  </button>
                </div>
              </div>
              <div className="level-list">
                {(course.levels ?? []).length ? (
                  course.levels?.map((level) => (
                    <div className="level-list__item" key={level._id}>
                      <div>
                        <strong>{level.name}</strong>
                        <p className="dashboard__text">Order {level.order}</p>
                      </div>
                      <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => {
                          setLevelEditor({ courseId: course._id, level });
                          setLevelForm({ name: level.name, order: String(level.order) });
                          setError(null);
                        }}
                      >
                        Edit level
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="dashboard__text">No levels yet. Add the first progression step.</p>
                )}
              </div>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No courses exist yet. Add one to structure the catalog.</p>
          </article>
        )}
      </section>

      {courseEditor ? (
        <EntityModal
          title={courseEditor.mode === 'edit' ? 'Edit course' : 'Create course'}
          description="A strong course catalog keeps batches and level planning clean."
          onClose={() => setCourseEditor(null)}
        >
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void courseMutation.mutateAsync();
            }}
          >
            <label className="field">
              <span className="field__label">Course name</span>
              <input
                className="field__input"
                value={courseForm.name}
                onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Description</span>
              <input
                className="field__input"
                value={courseForm.description}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <button className="button button--primary" disabled={courseMutation.isPending} type="submit">
              {courseMutation.isPending ? 'Saving...' : 'Save course'}
            </button>
          </form>
        </EntityModal>
      ) : null}

      {levelEditor ? (
        <EntityModal
          title={levelEditor.level ? 'Edit level' : 'Create level'}
          description="Use level order to keep progression consistent inside each course."
          onClose={() => setLevelEditor(null)}
        >
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void levelMutation.mutateAsync();
            }}
          >
            <label className="field">
              <span className="field__label">Level name</span>
              <input
                className="field__input"
                value={levelForm.name}
                onChange={(event) => setLevelForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Display order</span>
              <input
                className="field__input"
                inputMode="numeric"
                value={levelForm.order}
                onChange={(event) => setLevelForm((current) => ({ ...current, order: event.target.value }))}
              />
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <button className="button button--primary" disabled={levelMutation.isPending} type="submit">
              {levelMutation.isPending ? 'Saving...' : 'Save level'}
            </button>
          </form>
        </EntityModal>
      ) : null}
    </main>
  );
}
