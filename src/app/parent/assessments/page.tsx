'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchChildAssessments, fetchChildren } from '@/lib/parent-api';
import { calculateAge } from '@/lib/parent-format';
import type { ParentAssessmentRecord, ParentChild } from '@/types/parent';

function readChildRef(value: ParentAssessmentRecord['childId']) {
  return typeof value === 'string' ? null : value;
}

function readBatchRef(value: ParentAssessmentRecord['batchId']) {
  return typeof value === 'string' ? null : value;
}

export default function ParentAssessmentsPage() {
  const childrenQuery = useQuery({
    queryKey: ['parent-children'],
    queryFn: fetchChildren
  });

  const [childId, setChildId] = useState('');
  const childOptions = (childrenQuery.data ?? []) as ParentChild[];
  const selectedChildId = childId || childOptions[0]?._id || '';

  const assessmentsQuery = useQuery({
    queryKey: ['parent-assessments', selectedChildId],
    queryFn: () => fetchChildAssessments({ childId: selectedChildId }),
    enabled: Boolean(selectedChildId)
  });

  const records = (assessmentsQuery.data ?? []) as ParentAssessmentRecord[];
  const child = useMemo(() => childOptions.find((item) => item._id === selectedChildId) ?? null, [
    childOptions,
    selectedChildId
  ]);

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Assessments</p>
          <h1 className="admin-page__title">Progress notes shared by your instructor.</h1>
          <p className="dashboard__text">Only assessments explicitly shared by instructors are visible here.</p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href="/parent/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="child">
              Child
            </label>
            <select
              id="child"
              className="field__input"
              value={selectedChildId}
              onChange={(event) => setChildId(event.target.value)}
              disabled={childrenQuery.isLoading || !childOptions.length}
            >
              {childOptions.length ? (
                childOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option value="">No child profiles</option>
              )}
            </select>
          </div>
        </div>

        {child ? (
          <p className="dashboard__text">{`${calculateAge(child.dob)} years • ${child.gender}`}</p>
        ) : null}
      </section>

      <section className="family-grid">
        {assessmentsQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading assessments...</p>
          </article>
        ) : records.length ? (
          records.map((record) => {
            const batch = readBatchRef(record.batchId);
            const recordChild = readChildRef(record.childId);

            return (
              <article className="admin-panel" key={record._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{recordChild?.name ?? child?.name ?? 'Child'}</h2>
                    <p className="dashboard__text">
                      {record.assessedAt.slice(0, 10)} • {batch?.name ?? 'Batch'}
                    </p>
                  </div>
                </div>

                <p className="dashboard__text">
                  {typeof record.overallScore === 'number' ? `Score: ${record.overallScore}` : 'Score: -'}
                </p>
                {record.remarks ? <p className="dashboard__text">{record.remarks}</p> : null}

                {record.skillScores?.length ? (
                  <div className="stack">
                    {record.skillScores.map((score) => (
                      <div className="selection-card" key={`${record._id}-${score.skill}`}>
                        <p className="metric-card__title">{score.skill}</p>
                        <p className="dashboard__text">{`Score: ${score.score}`}</p>
                        {score.notes ? <p className="dashboard__text">{score.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">
              No shared assessments yet. Once an instructor shares progress notes, they will show up here.
            </p>
          </article>
        )}
      </section>
    </main>
  );
}

