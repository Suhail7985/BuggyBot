'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.register(form);
      setUser(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="message-avatar assistant w-9 h-9">
            <Bot size={18} />
          </div>
          <span className="font-semibold">BuggyBot</span>
        </Link>
        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-[var(--text-secondary)]">Start learning with structured AI tutoring</p>
      </div>

      <div className="surface-card">
        <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="register-name" className="block text-xs text-[var(--text-muted)] mb-1.5">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              className="input-field"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-xs text-[var(--text-muted)] mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs text-[var(--text-muted)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPass ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2" id="register-submit">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating account…
              </>
            ) : (
              <>
                Create account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--brand-400)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
