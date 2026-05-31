import { useState } from 'react';
import type { Member } from '../types';
import { ROLE_OPTIONS } from '../types';

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
    role: user.role ?? '',
    linkedin_url: user.linkedin_url ?? '',
    twitter_url: user.twitter_url ?? '',
    website_url: user.website_url ?? '',
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">
          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Bio">
            <textarea
              className="input resize-none"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A short intro about you (max 500 chars)"
              maxLength={500}
            />
            <span className="text-xs text-gray-400 text-right">{form.bio.length}/500</span>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input className="input" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
            </Field>
            <Field label="Location">
              <input className="input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
            </Field>
          </div>

          <Field label="Role">
            <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="">Select a role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          <Field label="LinkedIn URL">
            <input className="input" type="url" value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="Twitter / X URL">
            <input className="input" type="url" value={form.twitter_url} onChange={(e) => setForm((f) => ({ ...f, twitter_url: e.target.value }))} placeholder="https://x.com/..." />
          </Field>
          <Field label="Website">
            <input className="input" type="url" value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}
        </form>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 8px 12px;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          outline: none;
          background: white;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        select.input {
          appearance: auto;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
