'use client';

import { PropsWithChildren } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </SessionProvider>
  );
};
