'use client';

import type { ApiResponse } from '@danceapp/shared';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { clearAccessToken, setAccessToken } from '@/lib/api-client';

export interface AuthUser {
  _id: string;
  name: string;
  role: string;
  phone: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, authUser: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const refreshResponse =
          await apiClient.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
        const token = refreshResponse.data.data?.accessToken ?? null;

        if (!token) {
          return;
        }

        setAccessToken(token);

        if (isMounted) {
          setToken(token);
        }

        const meResponse = await apiClient.get<ApiResponse<AuthUser>>('/api/auth/me');

        if (isMounted) {
          setUser(meResponse.data.data);
        }
      } catch {
        clearAccessToken();

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      login: (token: string, authUser: AuthUser) => {
        setAccessToken(token);
        setToken(token);
        setUser(authUser);
      },
      logout: async () => {
        await apiClient.post('/api/auth/logout').catch(() => undefined);
        clearAccessToken();
        setToken(null);
        setUser(null);
        router.push('/login');
      }
    }),
    [accessToken, isLoading, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
