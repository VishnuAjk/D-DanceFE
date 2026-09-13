'use client';

import type { ButtonHTMLAttributes } from 'react';
import { useAuth } from '@/providers/auth-provider';

export function DemoMutationButton({ disabled, title, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { user } = useAuth();
  const isDemo = user?.isDemo === true;

  return (
    <button
      {...props}
      disabled={disabled || isDemo}
      title={isDemo ? 'Read-only demo: changes are disabled' : title}
    />
  );
}
