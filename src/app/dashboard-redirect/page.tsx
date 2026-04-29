'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveDashboardPath } from '@/lib/auth-routing';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(resolveDashboardPath(user?.role));
  }, [isLoading, router, user?.role]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, router, user]);

  return (
    <main className="status-screen">
      <section className="status-card">
        <p className="status-card__eyebrow">Redirecting</p>
        <h1 className="status-card__title">Taking you to the right dashboard.</h1>
        <p className="status-card__text">Your role-specific destination is being resolved.</p>
      </section>
    </main>
  );
}
