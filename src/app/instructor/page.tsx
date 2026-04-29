'use client';

import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';

export default function InstructorHomePage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedShell roles={['instructor', 'super_admin']}>
      <main className="dashboard">
        <section className="dashboard__hero">
          <p className="dashboard__eyebrow">Instructor Shell</p>
          <h1 className="dashboard__title">Attendance, rosters, and assessments start here.</h1>
          <p className="dashboard__text">
            Signed in as <strong>{user?.name ?? 'Unknown user'}</strong>.
          </p>
        </section>

        <section className="dashboard__grid">
          <article className="metric-card">
            <h2>My Batches</h2>
            <p>Instructor-specific screens can now mount under a protected route boundary.</p>
          </article>
          <article className="metric-card">
            <h2>Today&apos;s View</h2>
            <p>Designed mobile-first for quick in-class usage on smaller screens.</p>
          </article>
        </section>

        <button className="button button--ghost" onClick={() => void logout()} type="button">
          Logout
        </button>
      </main>
    </ProtectedShell>
  );
}
