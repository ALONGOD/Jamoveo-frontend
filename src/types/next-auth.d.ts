import 'next-auth';
import 'next-auth/jwt';
import { Instrument, Role } from './index';

declare module 'next-auth' {
  interface User {
    id: string;
    token: string;
    username: string;
    role: Role;
    instrument: Instrument;
  }

  interface Session {
    token: string;
    userId: string;
    username: string;
    role: Role;
    instrument: Instrument;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    backendToken: string;
    backendExpiresAt: number;
    userId: string;
    username: string;
    role: Role;
    instrument: Instrument;
    error?: 'RefreshAccessTokenError';
  }
}
