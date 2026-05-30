'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInstructorBatchRoster } from '@/hooks/use-instructor-batches';
import { formatCurrency, formatSchedule, readReferenceLabel } from '@/lib/admin-format';
import { calculateAge } from '@/lib/student-format';
import type { Student } from '@/types/admin';

function readStudent(value: string | Student) {
  return typeof value === 'string' ? null : value;
}

export default function InstructorBatchDetailPage() {
  const params = useParams<{ id: string }>();
  const rosterQuery = useInstructorBatchRoster(params.id);
  const batch = rosterQuery.data?.batch;
  const roster = rosterQuery.data?.roster ?? [];

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Roster</p>
          <h1 className="admin-page__title">{batch?.name ?? 'Batch roster'}</h1>
          <p className="dashboard__text">
            Review the active learners in this batch before marking attendance.
          </p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href={`/instructor/batches/${params.id}/attendance`}>
            Mark attendance
          </Link>
          <Link className="button button--ghost" href={`/instructor/batches/${params.id}/assessments`}>
            Assessments
          </Link>
          <Link className="button button--ghost" href="/instructor/batches">
            Back to batches
          </Link>
        </div>
      </section>

      {batch ? (
        <section className="dashboard__grid">
          <article className="metric-card">
            <h2>Schedule</h2>
            <p>{formatSchedule(batch)}</p>
          </article>
          <article className="metric-card">
            <h2>Branch</h2>
            <p>{readReferenceLabel(batch.branchId)}</p>
          </article>
          <article className="metric-card">
            <h2>Course</h2>
            <p>{readReferenceLabel(batch.courseId)}</p>
          </article>
          <article className="metric-card">
            <h2>Fee marker</h2>
            <p>{formatCurrency(batch.monthlyFee)}</p>
          </article>
        </section>
      ) : null}

      <section className="family-grid">
        {rosterQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading roster...</p>
          </article>
        ) : roster.length ? (
          roster.map((entry) => {
            const student = readStudent(entry.studentProfileId);

            return (
              <article className="admin-panel" key={entry._id}>
                <div className="admin-panel__header">
                  <div>
                    <h2 className="metric-card__title">{student?.name ?? 'Student profile'}</h2>
                    <p className="dashboard__text">{entry.status}</p>
                  </div>
                </div>
                <p className="dashboard__text">
                  {student ? `${calculateAge(student.dob)} years • ${student.gender}` : 'Student details unavailable'}
                </p>
              </article>
            );
          })
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No active enrollments are visible in this batch roster yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
