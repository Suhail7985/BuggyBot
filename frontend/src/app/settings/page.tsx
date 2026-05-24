'use client';

import { useState } from 'react';
import { User, Save, Loader2, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import api from '@/services/api';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { setSidebarOpen } = useChatStore();
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
      setSuccess('Profile updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="content-container app-header-inner">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost btn-icon md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-medium">Settings</h1>
          </div>
        </div>
      </header>

      <div className="chat-scroll">
        <div className="content-container py-8 max-w-md">
          <div className="surface-card mb-4 flex items-center gap-4">
            <div className="message-avatar assistant w-12 h-12 text-base font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">{user?.email}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">{user?.role} account</p>
            </div>
          </div>

          <div className="surface-card">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <User size={16} className="text-[var(--text-muted)]" />
              Profile
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4" id="settings-profile-form">
              {success && (
                <p className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
                  {success}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Name</label>
                <input
                  id="settings-name"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Email</label>
                <input
                  id="settings-email"
                  className="input-field opacity-60"
                  value={form.email}
                  disabled
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary" id="save-profile-btn">
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save changes
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="surface-card mt-4">
            <h2 className="text-sm font-medium mb-4">AI</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Model</span>
              <span className="text-xs px-2 py-1 rounded-md bg-[var(--bg-secondary)] border border-[var(--border)]">
                gpt-4o-mini
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
