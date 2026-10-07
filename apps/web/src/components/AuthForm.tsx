'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Icon } from './Icon';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (isSignup ? signup(email, password) : login(email, password));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card-surface p-8">
        <div className="text-center">
          <span className="flex mx-auto h-11 w-11 items-center justify-center rounded-md bg-accent text-text-primary">
            <Icon name="layers" size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-headline">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isSignup
              ? 'Optional — tools work without an account. Signing up just saves your job history.'
              : 'Log in to see your job history.'}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2.5 focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="mt-1 block w-full rounded-md border border-border bg-page px-3 py-2.5 focus:border-accent focus:outline-none"
            />
            {isSignup && (
              <span className="mt-1 block text-xs text-text-muted">At least 8 characters.</span>
            )}
          </label>

          {error && (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <button type="submit" className="btn-cta w-full" disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-secondary">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-accent">
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        Core tools work without an account. Signing up only adds job history.
      </p>
    </div>
  );
}
