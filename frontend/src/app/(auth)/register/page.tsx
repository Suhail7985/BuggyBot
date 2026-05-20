'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const passwordStrength = (pass: string) => {
  let strength = 0;
  if (pass.length >= 6) strength++;
  if (pass.length >= 10) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;
  if (/[^A-Za-z0-9]/.test(pass)) strength++;
  return strength;
};

const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.name.length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Logo & Headline */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center animate-pulse-glow shadow-lg shadow-blue-500/25">
            <Bot size={26} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">BuggyBot</span>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Start mastering DSA with your AI mentor
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8 shadow-2xl border border-white/8">
        {/* Top gradient line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-transparent rounded-full mb-7 -mt-1 opacity-60" />

        <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
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
              Full Name
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
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Email address
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
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPass ? 'text' : 'password'}
                className="input-field pr-12"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength ? strengthColors[strength] : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Password strength:{' '}
                  <span className={`font-semibold ${strength >= 4 ? 'text-green-400' : strength >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {strengthLabels[strength]}
                  </span>
                </p>
              </motion.div>
            )}
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-2.5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl px-4">
            {['Free forever plan', 'Grokking Algorithms pre-loaded', 'Unlimited chat history'].map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating account...</>
            ) : (
              <>Create Free Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign in
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
  );
}
