import type { ApiResponse } from '@danceapp/shared';
import axios, { type AxiosInstance } from 'axios';

const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

let accessToken: string | null = null;
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { _retry?: boolean; headers: Record<string, string> };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse =
          await client.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
        const token = refreshResponse.data.data?.accessToken ?? null;

        if (!token) {
          throw new Error('No refreshed access token returned');
        }

        setAccessToken(token);
        queue.forEach((callback) => callback(token));
        queue = [];
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return client(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        queue.forEach((callback) => callback(null));
        queue = [];

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
