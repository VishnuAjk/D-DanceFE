'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentProfileAssessments, fetchStudentProfiles } from '@/lib/portal-api';
import { calculateAge } from '@/lib/student-format';
import type { PortalAssessmentRecord, StudentProfile } from '@/types/portal';

function readStudentRef(value: PortalAssessmentRecord['studentProfileId']) {
  return typeof value === 'string' ? null : value;
}

function readBatchRef(value: PortalAssessmentRecord['batchId']) {
  return typeof value === 'string' ? null : value;
}

export default function CustomerAssessmentsPage() {
  const studentProfilesQuery = useQuery({
    queryKey: ['portal-student-profiles'],
    queryFn: fetchStudentProfiles
  });

  const [studentProfileId, setStudentId] = useState('');
  const studentProfileOptions = (studentProfilesQuery.data ?? []) as StudentProfile[];
  const selectedStudentId = studentProfileId || studentProfileOptions[0]?._id || '';

  const assessmentsQuery = useQuery({
    queryKey: ['portal-assessments', selectedStudentId],
    queryFn: () => fetchStudentProfileAssessments({ studentProfileId: selectedStudentId }),
    enabled: Boolean(selectedStudentId)
  });

  const records = (assessmentsQuery.data ?? []) as PortalAssessmentRecord[];
  const student = useMemo(() => studentProfileOptions.find((item) => item._id === selectedStudentId) ?? null, [
    studentProfileOptions,
    selectedStudentId
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
          <Link className="button button--ghost" href="/portal/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="student">
              Student
            </label>
            <select
              id="student"
              className="field__input"
              value={selectedStudentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={studentProfilesQuery.isLoading || !studentProfileOptions.length}
            >
              {studentProfileOptions.length ? (
                studentProfileOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option value="">No student profiles</option>
              )}
            </select>
          </div>
        </div>

        {student ? (
          <p className="dashboard__text">{`${calculateAge(student.dob)} years • ${student.gender}`}</p>
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
            const recordStudent = readStudentRef(record.studentProfileId);

            return (
              <article className="admin-panel" key={record._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{recordStudent?.name ?? student?.name ?? 'Student'}</h2>
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

