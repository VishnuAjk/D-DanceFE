'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { EntityModal } from '@/components/admin/entity-modal';
import { useBranches } from '@/hooks/use-branches';
import { useCourses } from '@/hooks/use-courses';
import { useAdminVideos } from '@/hooks/use-videos';
import {
  createAdminVideo,
  deleteAdminVideo,
  updateAdminVideo
} from '@/lib/admin-api';
import { formatApiError } from '@/lib/api-errors';
import { readReferenceId, readReferenceLabel } from '@/lib/admin-format';
import type { AdminVideo } from '@/types/admin';

type VideoEditor = { mode: 'create' | 'edit'; video?: AdminVideo } | null;

function readTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminVideosPage() {
  const queryClient = useQueryClient();
  const videosQuery = useAdminVideos();
  const coursesQuery = useCourses();
  const branchesQuery = useBranches();
  const [editor, setEditor] = useState<VideoEditor>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    courseId: '',
    levelId: '',
    branchIds: [] as string[],
    tags: '',
    isPublished: true
  });

  const levels = useMemo(
    () => coursesQuery.data?.find((course) => course._id === form.courseId)?.levels ?? [],
    [coursesQuery.data, form.courseId]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        videoUrl: form.videoUrl,
        courseId: form.courseId || undefined,
        levelId: form.levelId || undefined,
        branchIds: form.branchIds,
        tags: readTags(form.tags),
        isPublished: form.isPublished
      };

      if (editor?.mode === 'edit' && editor.video) {
        return updateAdminVideo(editor.video._id, payload);
      }

      return createAdminVideo(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setEditor(null);
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => deleteAdminVideo(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setError(null);
    },
    onError: (mutationError) => setError(formatApiError(mutationError))
  });

  function openCreate() {
    setEditor({ mode: 'create' });
    setForm({
      title: '',
      description: '',
      videoUrl: '',
      courseId: '',
      levelId: '',
      branchIds: [],
      tags: '',
      isPublished: true
    });
    setError(null);
  }

  function openEdit(video: AdminVideo) {
    setEditor({ mode: 'edit', video });
    setForm({
      title: video.title,
      description: video.description ?? '',
      videoUrl: video.videoUrl,
      courseId: readReferenceId(video.courseId),
      levelId: readReferenceId(video.levelId),
      branchIds: video.branchIds.map((branch) => readReferenceId(branch)),
      tags: video.tags.join(', '),
      isPublished: video.isPublished
    });
    setError(null);
  }

  function toggleBranch(branchId: string) {
    setForm((current) => ({
      ...current,
      branchIds: current.branchIds.includes(branchId)
        ? current.branchIds.filter((item) => item !== branchId)
        : [...current.branchIds, branchId]
    }));
  }

  return (
    <main className="admin-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Videos</p>
          <h1 className="admin-page__title">Curate the studio video library.</h1>
          <p className="dashboard__text">
            Publish YouTube-based practice references with course, level, branch, and tag metadata.
          </p>
        </div>
        <button className="button button--primary" onClick={openCreate} type="button">
          New video
        </button>
      </section>

      {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}

      <section className="admin-grid">
        {videosQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading videos...</p>
          </article>
        ) : videosQuery.data?.length ? (
          videosQuery.data.map((video) => (
            <article className="admin-panel" key={video._id}>
              {video.thumbnailUrl ? (
                <img className="video-card__thumb" src={video.thumbnailUrl} alt={video.title} />
              ) : null}
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{video.title}</h2>
                  <p className="dashboard__text">
                    {readReferenceLabel(video.courseId, 'General')} • {readReferenceLabel(video.levelId, 'All levels')}
                  </p>
                </div>
                <span className={`status-badge status-badge--${video.isPublished ? 'paid' : 'pending'}`}>
                  {video.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="dashboard__text">{video.description ?? 'No description provided.'}</p>
              {video.tags.length ? (
                <div className="chip-row">
                  {video.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="dashboard__text">
                Branches: {video.branchIds.length ? video.branchIds.map((branch) => readReferenceLabel(branch)).join(', ') : 'All branches'}
              </p>
              <div className="admin-panel__actions">
                <button className="button button--ghost" onClick={() => openEdit(video)} type="button">
                  Edit
                </button>
                <button
                  className="button button--ghost"
                  onClick={() => void deleteMutation.mutateAsync(video._id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No videos are in the library yet.</p>
          </article>
        )}
      </section>

      {editor ? (
        <EntityModal
          title={editor.mode === 'edit' ? 'Edit video' : 'Create video'}
          description="Paste a YouTube URL and assign metadata for cleaner discovery."
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
              <span className="field__label">Title</span>
              <input
                className="field__input"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Description</span>
              <input
                className="field__input"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">YouTube URL</span>
              <input
                className="field__input"
                value={form.videoUrl}
                onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Course</span>
              <select
                className="field__input"
                value={form.courseId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, courseId: event.target.value, levelId: '' }))
                }
              >
                <option value="">General library</option>
                {(coursesQuery.data ?? []).map((course) => (
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
                <option value="">All levels</option>
                {levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Tags</span>
              <input
                className="field__input"
                placeholder="adavus, warmup, theory"
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              />
            </label>
            <div className="field">
              <span className="field__label">Branches</span>
              <div className="chip-row">
                {(branchesQuery.data ?? []).map((branch) => (
                  <button
                    key={branch._id}
                    className={`chip${form.branchIds.includes(branch._id) ? ' is-selected' : ''}`}
                    onClick={(event) => {
                      event.preventDefault();
                      toggleBranch(branch._id);
                    }}
                    type="button"
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="field__label">Visibility</span>
              <select
                className="field__input"
                value={form.isPublished ? 'published' : 'draft'}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isPublished: event.target.value === 'published' }))
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            {error ? <div className="auth-feedback auth-feedback--error">{error}</div> : null}
            <button className="button button--primary" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? 'Saving...' : 'Save video'}
            </button>
          </form>
        </EntityModal>
      ) : null}
    </main>
  );
}
