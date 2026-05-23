'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

type ProtectedShellProps = {
  children: React.ReactNode;
  roles?: string[];
};

export function ProtectedShell({ children, roles }: ProtectedShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [isLoading, roles, router, user]);

  if (isLoading) {
    return (
      <main className="status-screen">
        <section className="status-card">
          <p className="status-card__eyebrow">Loading</p>
          <h1 className="status-card__title">Opening your workspace.</h1>
          <p className="status-card__text">Please wait while we confirm your access.</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
