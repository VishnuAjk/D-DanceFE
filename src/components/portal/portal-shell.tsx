'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { href: '/portal/dashboard', label: 'Dashboard' },
  { href: '/portal/student-profiles', label: 'Student Profiles' },
  { href: '/portal/enrollments', label: 'Enrollments' },
  { href: '/portal/attendance', label: 'Attendance' },
  { href: '/portal/assessments', label: 'Assessments' },
  { href: '/portal/fees', label: 'Fees' },
  { href: '/portal/videos', label: 'Videos' }
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedShell roles={['customer', 'parent']}>
      <div className="family-shell">
        <aside className="family-sidebar">
          <div>
            <p className="dashboard__eyebrow">Portal</p>
            <h1 className="family-sidebar__title">Student hub for classes and enrollments.</h1>
            <p className="family-sidebar__text">
              Signed in as <strong>{user?.name ?? 'Account'}</strong>.
            </p>
          </div>

          <nav className="admin-nav" aria-label="Portal navigation">
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
