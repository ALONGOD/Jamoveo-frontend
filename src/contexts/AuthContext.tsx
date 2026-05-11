'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { rawApi } from '@/lib/api';
import { AppUser, Instrument } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string, instrument: Instrument) => Promise<void>;
  registerAdmin: (
    username: string,
    password: string,
    instrument: Instrument,
    adminSecret: string
  ) => Promise<void>;
  logout: (callbackUrl?: string) => Promise<void>;
}

const initial: AuthContextValue = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  loginWithEmail: async () => {},
  registerUser: async () => {},
  registerAdmin: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextValue>(initial);

const extractError = (e: unknown): string => {
  if (typeof e === 'object' && e !== null) {
    const maybe = e as { response?: { data?: { message?: string } }; message?: string };
    return maybe.response?.data?.message ?? maybe.message ?? 'Request failed';
  }
  return 'Request failed';
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { data: session, status } = useSession();

  // If the refresh flow failed, force a logout — same pattern as the reference monorepo.
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/auth/login' });
    }
  }, [session?.error]);

  const loginWithEmail = useCallback(async (username: string, password: string) => {
    const result = await signIn('credentials', { username, password, redirect: false });
    if (result?.error) throw new Error(result.error);
  }, []);

  const registerUser = useCallback(
    async (username: string, password: string, instrument: Instrument) => {
      try {
        const { data } = await rawApi.post<{ success: boolean; token: string }>('/auth/signup', {
          username,
          password,
          instrument,
        });
        const result = await signIn('signup-token', { token: data.token, redirect: false });
        if (result?.error) throw new Error(result.error);
      } catch (e) {
        throw new Error(extractError(e));
      }
    },
    []
  );

  const registerAdmin = useCallback(
    async (username: string, password: string, instrument: Instrument, adminSecret: string) => {
      try {
        const { data } = await rawApi.post<{ success: boolean; token: string }>(
          '/auth/admin-signup',
          { username, password, instrument, adminSecret }
        );
        const result = await signIn('signup-token', { token: data.token, redirect: false });
        if (result?.error) throw new Error(result.error);
      } catch (e) {
        throw new Error(extractError(e));
      }
    },
    []
  );

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl ?? '/auth/login' });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = status === 'authenticated' && !!session?.token;
    const user: AppUser | null = isAuthenticated && session
      ? {
          id: session.userId,
          username: session.username,
          role: session.role,
          instrument: session.instrument,
        }
      : null;

    return {
      user,
      token: session?.token ?? null,
      isLoading: status === 'loading',
      isAuthenticated,
      loginWithEmail,
      registerUser,
      registerAdmin,
      logout,
    };
  }, [session, status, loginWithEmail, registerUser, registerAdmin, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
