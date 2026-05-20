'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.patch('/auth/profile', { name: form.name });
      setUser({ ...user!, name: res.data.user.name });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-1">Settings</h1>
            <p className="text-[var(--text-secondary)] mb-8">Manage your account preferences</p>

            {/* Avatar */}
            <div className="glass-card p-6 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-white/10 flex items-center justify-center text-2xl font-bold text-blue-300">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 capitalize">{user?.role} account</p>
              </div>
            </div>

            {/* Profile form */}
            <div className="glass-card p-6 mb-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-400" /> Profile Information
              </h2>
              <form onSubmit={handleProfileSave} className="space-y-4" id="settings-profile-form">
                {success && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Full Name</label>
                  <input
                    id="settings-name"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
                  <input
                    id="settings-email"
                    className="input-field opacity-60"
                    value={form.email}
                    disabled
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed</p>
                </div>
                <button type="submit" disabled={saving} id="save-profile-btn" className="btn-primary">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                </button>
              </form>
            </div>

            {/* AI Preferences */}
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span>🤖</span> AI Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Default Chat Mode</p>
                    <p className="text-xs text-[var(--text-muted)]">Mode used when starting a new chat</p>
                  </div>
                  <select className="input-field w-auto text-sm">
                    <option value="chat">💬 Chat</option>
                    <option value="quiz">🧠 Quiz</option>
                    <option value="complexity">⚡ Complexity</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <div>
                    <p className="text-sm font-medium">AI Model</p>
                    <p className="text-xs text-[var(--text-muted)]">Powered by Google Gemini</p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    gemini-1.5-flash
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
