'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/AuthCard';
import { InstrumentSelect } from '@/components/InstrumentSelect';
import { Instrument } from '@/types';

interface FormValues {
  username: string;
  password: string;
  instrument: Instrument | '';
  adminSecret: string;
}

export default function AdminSignupPage() {
  const router = useRouter();
  const { registerAdmin } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { instrument: '' },
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    if (!values.instrument) {
      setError('Please pick your instrument');
      return;
    }
    try {
      await registerAdmin(
        values.username.trim().toLowerCase(),
        values.password,
        values.instrument,
        values.adminSecret
      );
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Admin signup failed');
    }
  };

  return (
    <AuthCard title="Admin signup" subtitle="Restricted area — secret required">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Username</label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('username', { required: 'Username is required', minLength: 3 })}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">Username must be at least 3 characters</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('password', { required: 'Password is required', minLength: 6 })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Instrument</label>
          <Controller
            control={control}
            name="instrument"
            render={({ field }) => (
              <InstrumentSelect value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Admin secret</label>
          <input
            type="password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('adminSecret', { required: 'Admin secret is required' })}
          />
          {errors.adminSecret && (
            <p className="mt-1 text-xs text-red-400">{errors.adminSecret.message}</p>
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
          {isSubmitting ? 'Creating...' : 'Create admin account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-brand-light hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-neutral-500">
        Not an admin?{' '}
        <Link href="/auth/signup" className="underline hover:text-neutral-300">
          Regular signup
        </Link>
      </p>
    </AuthCard>
  );
}
