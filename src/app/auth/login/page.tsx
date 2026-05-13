'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/AuthCard';

interface FormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await loginWithEmail(values.username.trim().toLowerCase(), values.password);
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to join the rehearsal">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Username</label>
          <input
            type="text"
            autoComplete="username"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand py-2 font-semibold transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        New here?{' '}
        <Link href="/auth/signup" className="font-medium text-brand-light hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
