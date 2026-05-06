'use client';

import { useMemo, useState } from 'react';
import { useVideos } from '@/hooks/use-videos';
import { readReferenceId, readReferenceLabel } from '@/lib/admin-format';

export default function ParentVideosPage() {
  const videosQuery = useVideos();
  const [courseId, setCourseId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [tag, setTag] = useState('');

  const videos = videosQuery.data ?? [];
  const courseOptions = useMemo(() => {
    const map = new Map<string, { _id: string; name: string }>();

    videos.forEach((video) => {
      if (!video.courseId) {
        return;
      }

      const id = readReferenceId(video.courseId);
      if (!map.has(id)) {
        map.set(id, { _id: id, name: readReferenceLabel(video.courseId, 'Course') });
      }
    });

    return Array.from(map.values());
  }, [videos]);

  const levelOptions = useMemo(() => {
    const map = new Map<string, { _id: string; name: string }>();

    videos
      .filter((video) => !courseId || readReferenceId(video.courseId) === courseId)
      .forEach((video) => {
        if (!video.levelId) {
          return;
        }

        const id = readReferenceId(video.levelId);
        if (!map.has(id)) {
          map.set(id, { _id: id, name: readReferenceLabel(video.levelId, 'Level') });
        }
      });

    return Array.from(map.values());
  }, [courseId, videos]);

  const tagOptions = useMemo(
    () => Array.from(new Set(videos.flatMap((video) => video.tags))).sort(),
    [videos]
  );

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => {
        const courseMatch = !courseId || readReferenceId(video.courseId) === courseId;
        const levelMatch = !levelId || readReferenceId(video.levelId) === levelId;
        const tagMatch = !tag || video.tags.includes(tag);
        return courseMatch && levelMatch && tagMatch;
      }),
    [courseId, levelId, tag, videos]
  );

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Videos</p>
          <h1 className="admin-page__title">Practice videos for home revision.</h1>
          <p className="dashboard__text">
            Browse published class references by course, level, or tag.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <label className="field">
          <span className="field__label">Course</span>
          <select className="field__input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">All courses</option>
            {courseOptions.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Level</span>
          <select className="field__input" value={levelId} onChange={(event) => setLevelId(event.target.value)}>
            <option value="">All levels</option>
            {levelOptions.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Tag</span>
          <select className="field__input" value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="">All tags</option>
            {tagOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="family-grid">
        {videosQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading video library...</p>
          </article>
        ) : filteredVideos.length ? (
          filteredVideos.map((video) => (
            <article className="admin-panel" key={video._id}>
              {video.thumbnailUrl ? (
                <img className="video-card__thumb" src={video.thumbnailUrl} alt={video.title} />
              ) : null}
              <h2 className="metric-card__title">{video.title}</h2>
              <p className="dashboard__text">
                {readReferenceLabel(video.courseId, 'General')} • {readReferenceLabel(video.levelId, 'All levels')}
              </p>
              <p className="dashboard__text">{video.description ?? 'No description provided.'}</p>
              {video.tags.length ? (
                <div className="chip-row">
                  {video.tags.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="admin-panel__actions">
                <a className="button button--primary" href={video.videoUrl} rel="noreferrer" target="_blank">
                  Watch video
                </a>
              </div>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No videos match the current filters.</p>
          </article>
        )}
      </section>
    </main>
  );
}
