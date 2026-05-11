import { PropsWithChildren } from 'react';
import { Logo } from './Logo';

interface AuthCardProps {
  title: string;
  subtitle?: string;
}

export const AuthCard = ({ title, subtitle, children }: PropsWithChildren<AuthCardProps>) => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={64} className="mb-3" />
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
};
