'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login(form);
      setUser(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Logo & headline */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
          <div className="w-13 h-13 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-white/10">
            <Bot size={26} className="text-blue-300" />
          </div>
          <span className="font-black text-xl tracking-tight">BuggyBot</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Continue your DSA learning journey
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8 shadow-2xl border border-white/8">
        {/* Top gradient line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-transparent rounded-full mb-7 -mt-1 opacity-60" />

        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Email address
            </label>
            <input
              id="login-email"
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
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                id="toggle-password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Create one free
          </Link>
        </div>

        {/* Feature hints */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <Sparkles size={12} className="text-blue-400" />
          Powered by Gemini AI · Grokking Algorithms · RAG
        </div>
      </div>
    </motion.div>
  );
}
