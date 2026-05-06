'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedShell } from '@/components/protected-shell';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/branches', label: 'Branches' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/batches', label: 'Batches' },
  { href: '/admin/enrollments', label: 'Enrollments' },
  { href: '/admin/fees', label: 'Fees' },
  { href: '/admin/videos', label: 'Videos' }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedShell roles={['super_admin', 'branch_admin']}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__hero">
            <p className="dashboard__eyebrow">Admin</p>
            <h1 className="admin-sidebar__title">Studio control room.</h1>
            <p className="admin-sidebar__text">
              Signed in as <strong>{user?.name ?? 'Admin'}</strong>.
            </p>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">
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

        <div className="admin-content">{children}</div>
      </div>
    </ProtectedShell>
  );
}
