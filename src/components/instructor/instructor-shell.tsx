'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { href: '/instructor/dashboard', label: 'Dashboard' },
  { href: '/instructor/batches', label: 'My Batches' }
];

export function InstructorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedShell roles={['instructor', 'super_admin']}>
      <div className="coach-shell">
        <aside className="coach-sidebar">
          <div>
            <p className="dashboard__eyebrow">Instructor</p>
            <h1 className="family-sidebar__title">Teaching flow for live class operations.</h1>
            <p className="family-sidebar__text">
              Signed in as <strong>{user?.name ?? 'Instructor'}</strong>.
            </p>
          </div>

          <nav className="admin-nav" aria-label="Instructor navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__link${pathname === item.href ? ' is-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button className="button button--ghost" onClick={() => void logout()} type="button">
            Logout
          </button>
        </aside>

        <div className="coach-content">{children}</div>
      </div>
    </ProtectedShell>
  );
}
