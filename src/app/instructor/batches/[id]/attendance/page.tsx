'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useInstructorBatchRoster } from '@/hooks/use-instructor-batches';
import { markAttendance } from '@/lib/instructor-api';
import { calculateAge } from '@/lib/student-format';
import type { Student } from '@/types/admin';
import type { AttendanceStatus } from '@/types/attendance';

function readStudent(value: string | Student) {
  return typeof value === 'string' ? null : value;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function formatApiError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'object' &&
    error.response.data.error !== null &&
    'message' in error.response.data.error &&
    typeof error.response.data.error.message === 'string'
  ) {
    return error.response.data.error.message;
  }

  return 'Attendance submission failed. Please try again.';
}

export default function InstructorBatchAttendancePage() {
  const params = useParams<{ id: string }>();
  const rosterQuery = useInstructorBatchRoster(params.id);
  const roster = rosterQuery.data?.roster ?? [];
  const batch = rosterQuery.data?.batch;
  const [date, setDate] = useState(todayUtc());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [error, setError] = useState<string | null>(null);

  const records = useMemo(() => {
    return roster
      .map((entry) => readStudent(entry.studentProfileId))
      .filter((student): student is Student => Boolean(student?._id))
      .map((student) => ({
        student,
        status: statuses[student._id] ?? null
      }));
  }, [roster, statuses]);

  const mutation = useMutation({
    mutationFn: () =>
      markAttendance({
        batchId: params.id,
        date,
        records: records
          .filter((record) => record.status)
          .map((record) => ({
            studentProfileId: record.student._id,
            status: record.status as AttendanceStatus,
            notes: notes[record.student._id] || undefined
          }))
      }),
    onMutate: () => setError(null),
    onError: (err) => setError(formatApiError(err))
  });

  const canSubmit = records.some((record) => record.status) && !mutation.isPending;

  function updateStatus(studentProfileId: string, status: AttendanceStatus) {
    setStatuses((current) => ({ ...current, [studentProfileId]: status }));
  }

  function updateNotes(studentProfileId: string, value: string) {
    setNotes((current) => ({ ...current, [studentProfileId]: value.slice(0, 200) }));
  }

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Attendance</p>
          <h1 className="admin-page__title">{batch?.name ?? 'Mark attendance'}</h1>
          <p className="dashboard__text">Pick a date, then mark each student as present, absent, or late.</p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href={`/instructor/batches/${params.id}`}>
            Back to roster
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="field">
          <label className="field__label" htmlFor="attendanceDate">
            Date
          </label>
          <input
            id="attendanceDate"
            className="field__input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            max={todayUtc()}
          />
        </div>

        {error ? (
          <div className="auth-feedback auth-feedback--error" role="alert">
            {error}
          </div>
        ) : null}

        <button
          className="button button--primary"
          disabled={!canSubmit}
          type="button"
          onClick={() => void mutation.mutateAsync()}
        >
          {mutation.isPending ? 'Saving attendance...' : 'Save attendance'}
        </button>
      </section>

      <section className="family-grid">
        {rosterQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading roster...</p>
          </article>
        ) : records.length ? (
          records.map(({ student, status }) => (
            <article className="admin-panel" key={student._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{student.name}</h2>
                  <p className="dashboard__text">{`${calculateAge(student.dob)} years • ${student.gender}`}</p>
                </div>
              </div>

              <div className="chip-row" role="group" aria-label={`Attendance status for ${student.name}`}>
                <button
                  type="button"
                  className={`chip${status === 'PRESENT' ? ' is-selected' : ''}`}
                  onClick={() => updateStatus(student._id, 'PRESENT')}
                >
                  Present
                </button>
                <button
                  type="button"
                  className={`chip${status === 'ABSENT' ? ' is-selected' : ''}`}
                  onClick={() => updateStatus(student._id, 'ABSENT')}
                >
                  Absent
                </button>
                <button
                  type="button"
                  className={`chip${status === 'LATE' ? ' is-selected' : ''}`}
                  onClick={() => updateStatus(student._id, 'LATE')}
                >
                  Late
                </button>
              </div>

              <div className="field">
                <label className="field__label" htmlFor={`notes-${student._id}`}>
                  Notes (optional)
                </label>
                <textarea
                  id={`notes-${student._id}`}
                  className="field__input"
                  rows={2}
                  value={notes[student._id] ?? ''}
                  onChange={(event) => updateNotes(student._id, event.target.value)}
                  placeholder="Short note for this student"
                />
              </div>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">No roster entries are available to mark attendance yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}

