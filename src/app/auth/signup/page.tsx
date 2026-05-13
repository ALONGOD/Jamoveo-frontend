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
}

export default function SignupPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
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
      await registerUser(values.username.trim().toLowerCase(), values.password, values.instrument);
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    }
  };

  return (
    <AuthCard title="Join the band" subtitle="Pick your instrument and get on stage">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Username</label>
          <input
            type="text"
            autoComplete="username"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'At least 3 characters' },
            })}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 outline-none focus:border-brand"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must have at least 6 characters' },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
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

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand py-2 font-semibold transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-brand-light hover:underline">
          Sign in
        </Link>
      </p>

      {/* Admin signup is a separate flow gated by a shared secret (see README). */}
      <p className="mt-2 text-center text-xs text-neutral-500">
        Band admin?{' '}
        <Link href="/auth/admin-signup" className="underline hover:text-neutral-300">
          Register here
        </Link>
      </p>
    </AuthCard>
  );
}
