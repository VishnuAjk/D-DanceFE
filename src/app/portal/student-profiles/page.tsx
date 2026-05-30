'use client';

import Link from 'next/link';
import { useStudentProfiles } from '@/hooks/use-student-profiles';
import { calculateAge, formatBirthDate } from '@/lib/student-format';

export default function StudentProfilesPage() {
  const studentProfilesQuery = useStudentProfiles();

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Student Profiles</p>
          <h1 className="admin-page__title">Profiles used for attendance, fees, and enrollments.</h1>
          <p className="dashboard__text">
            Keep each student profile accurate so future enrollment and batch assignment steps stay
            clean.
          </p>
        </div>
        <Link className="button button--primary" href="/portal/student-profiles/add">
          Add student
        </Link>
      </section>

      <section className="family-grid">
        {studentProfilesQuery.isLoading ? (
          <article className="admin-panel">
            <p className="dashboard__text">Loading student profiles...</p>
          </article>
        ) : studentProfilesQuery.data?.length ? (
          studentProfilesQuery.data.map((student) => (
            <article className="admin-panel" key={student._id}>
              <div className="admin-panel__header">
                <div>
                  <h2 className="metric-card__title">{student.name}</h2>
                  <p className="dashboard__text">
                    {calculateAge(student.dob)} years • {student.gender}
                  </p>
                </div>
                <Link className="button button--ghost" href={`/portal/student-profiles/${student._id}`}>
                  Open profile
                </Link>
              </div>
              <p className="dashboard__text">Born {formatBirthDate(student.dob)}</p>
              <p className="dashboard__text">
                {student.photo ? 'Photo URL saved for this student profile.' : 'No photo URL added yet.'}
              </p>
            </article>
          ))
        ) : (
          <article className="admin-panel">
            <p className="dashboard__text">
              No student profiles have been added yet. Start with one student profile to request classes and
              follow studio updates.
            </p>
          </article>
        )}
      </section>

      <section className="admin-callout">
        <p className="dashboard__eyebrow">After profile setup</p>
        <div className="admin-callout__links">
          <Link className="button button--primary" href="/portal/enrollments/new">
            Create enrollment request
          </Link>
          <Link className="button button--ghost" href="/portal/enrollments">
            View enrollment statuses
          </Link>
        </div>
      </section>
    </main>
  );
}
