import { useState } from 'react';
import type { Member } from '../types';

interface Props {
  user: Member;
  sessionToken: string;
  onSave: (updated: Member) => void;
  onClose: () => void;
}

export default function EditProfile({ user, sessionToken, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    company: user.company ?? '',
    contact_email: user.contact_email ?? '',
    linkedin_url: user.linkedin_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { user?: Member; error?: string };
      if (!res.ok || !data.user) throw new Error(data.error ?? 'Save failed');
      onSave(data.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="font-display text-base font-bold text-zinc-100 tracking-wide">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">
          <Field label="Name">
            <input className="dkinput" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
          </Field>

          <Field label="Bio">
            <textarea
              className="dkinput resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A short intro about you (max 500 chars)"
              maxLength={500}
            />
            <span className="text-xs text-zinc-600 text-right">{form.bio.length}/500</span>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input className="dkinput" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
            </Field>
            <Field label="Location">
              <input className="dkinput" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
            </Field>
          </div>

          <Field label="Contact Email">
            <input className="dkinput" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} placeholder="you@company.com" />
          </Field>

          <Field label="LinkedIn URL">
            <input className="dkinput" type="url" value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
          </Field>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
        </form>

        <div className="px-5 py-4 border-t border-zinc-800 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <style>{`
        .dkinput {
          width: 100%;
          padding: 9px 13px;
          font-size: 0.875rem;
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 0.75rem;
          color: #f4f4f5;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .dkinput::placeholder { color: #52525b; }
        .dkinput:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
