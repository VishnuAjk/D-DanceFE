'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { href: '/parent/dashboard', label: 'Dashboard' },
  { href: '/parent/children', label: 'My Children' },
  { href: '/parent/enrollments', label: 'Enrollments' },
  { href: '/parent/attendance', label: 'Attendance' },
  { href: '/parent/assessments', label: 'Assessments' },
  { href: '/parent/fees', label: 'Fees' }
];

export function ParentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedShell roles={['parent']}>
      <div className="family-shell">
        <aside className="family-sidebar">
          <div>
            <p className="dashboard__eyebrow">Parent</p>
            <h1 className="family-sidebar__title">Family hub for classes and enrollments.</h1>
            <p className="family-sidebar__text">
              Signed in as <strong>{user?.name ?? 'Parent'}</strong>.
            </p>
          </div>

          <nav className="admin-nav" aria-label="Parent navigation">
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

        <div className="family-content">{children}</div>
      </div>
    </ProtectedShell>
  );
}
