import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import { Instrument, Role } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface BackendJwtClaims {
  userId: string;
  username: string;
  role: Role;
  instrument: Instrument;
  exp: number;
}

interface AuthSuccessResponse {
  success: true;
  token: string;
  user: { id: string; username: string; role: Role; instrument: Instrument };
}

interface AuthFailureResponse {
  success: false;
  message: string;
}

const decodeExpiry = (token: string): number => {
  try {
    return jwtDecode<BackendJwtClaims>(token).exp * 1000;
  } catch {
    return Date.now() + 60 * 60 * 1000;
  }
};

const refreshBackendToken = async (expiredToken: string): Promise<string | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiredToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success: boolean; token?: string };
    return data.success && data.token ? data.token : null;
  } catch {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [
    // Standard username/password login
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });
        const data = (await res.json()) as AuthSuccessResponse | AuthFailureResponse;
        if (!data.success) {
          throw new Error(data.message || 'Login failed');
        }
        return {
          id: data.user.id,
          token: data.token,
          username: data.user.username,
          role: data.user.role,
          instrument: data.user.instrument,
        };
      },
    }),
    // Used right after /auth/signup so we don't have to re-prompt for the password.
    // Mirrors the reference monorepo's signup-token credentials provider.
    CredentialsProvider({
      id: 'signup-token',
      name: 'Signup Token',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          const claims = jwtDecode<BackendJwtClaims>(credentials.token);
          return {
            id: claims.userId,
            token: credentials.token,
            username: claims.username,
            role: claims.role,
            instrument: claims.instrument,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: copy backend token + claims into the NextAuth JWT
      if (user) {
        token.backendToken = user.token;
        token.backendExpiresAt = decodeExpiry(user.token);
        token.userId = user.id;
        token.username = user.username;
        token.role = user.role;
        token.instrument = user.instrument;
        delete token.error;
        return token;
      }

      // If the backend access token is still fresh (>60s remaining), keep it
      if (token.backendExpiresAt && Date.now() < token.backendExpiresAt - 60_000) {
        return token;
      }

      // Refresh the expiring backend token
      const newToken = token.backendToken ? await refreshBackendToken(token.backendToken) : null;
      if (!newToken) {
        token.error = 'RefreshAccessTokenError';
        return token;
      }

      token.backendToken = newToken;
      token.backendExpiresAt = decodeExpiry(newToken);
      delete token.error;
      return token;
    },
    async session({ session, token }) {
      session.token = token.backendToken;
      session.userId = token.userId;
      session.username = token.username;
      session.role = token.role;
      session.instrument = token.instrument;
      session.error = token.error;
      return session;
    },
  },
};
