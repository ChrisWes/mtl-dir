import { useState, useRef } from 'react';
import type { Member } from '../types';

interface Props {
  user: Member;
  sessionToken: string;
  onSave: (updated: Member) => void;
  onClose: () => void;
}

const LINKEDIN_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\//i;

function resizeToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      // Centre-crop to square
      const shorter = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - shorter) / 2;
      const sy = (img.naturalHeight - shorter) / 2;
      ctx.drawImage(img, sx, sy, shorter, shorter, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not load image')); };
    img.src = objectUrl;
  });
}

export default function EditProfile({ user, sessionToken, onSave, onClose }: Props) {
  const initials = (user.name ?? user.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const [form, setForm] = useState({
    name: user.name ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    company: user.company ?? '',
    ask_me_about: user.ask_me_about ?? [],
    contact_email: user.contact_email ?? '',
    linkedin_url: user.linkedin_url ?? '',
    avatar_url: user.avatar_url ?? null as string | null,
  });
  const [tagInput, setTagInput] = useState('');
  const [avatarProcessing, setAvatarProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, '').trim();
    if (!tag || tag.length > 60) return;
    if (form.ask_me_about.includes(tag)) return;
    if (form.ask_me_about.length >= 20) return;
    setForm((f) => ({ ...f, ask_me_about: [...f.ask_me_about, tag] }));
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, ask_me_about: f.ask_me_about.filter((t) => t !== tag) }));

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && form.ask_me_about.length > 0) {
      removeTag(form.ask_me_about[form.ask_me_about.length - 1]);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setAvatarProcessing(true);
    setError('');
    try {
      const dataUrl = await resizeToSquare(file);
      setForm((f) => ({ ...f, avatar_url: dataUrl }));
    } catch {
      setError('Could not process the image — please try another file');
    } finally {
      setAvatarProcessing(false);
      // Reset input so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.linkedin_url && !LINKEDIN_RE.test(form.linkedin_url)) {
      setError('LinkedIn URL must start with linkedin.com/in/your-name');
      setSaving(false);
      return;
    }

    const finalTags = tagInput.trim()
      ? [...new Set([...form.ask_me_about, tagInput.trim().replace(/,+$/, '').trim()])]
      : form.ask_me_about;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ ...form, ask_me_about: finalTags }),
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

        <form id="edit-profile-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4">

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarProcessing}
              className="relative group focus:outline-none"
              aria-label="Change profile photo"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-zinc-700 group-hover:ring-violet-500 transition-colors">
                {avatarProcessing ? (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
            </button>
            <p className="text-xs text-zinc-600">Click to change photo</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </div>

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

          {/* Ask me about tags */}
          <Field label="Ask me about">
            <div
              className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-zinc-800 border border-zinc-700 rounded-xl cursor-text focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-colors"
              onClick={() => tagRef.current?.focus()}
            >
              {form.ask_me_about.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs rounded-lg pl-2.5 pr-1.5 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                ref={tagRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                onBlur={() => addTag(tagInput)}
                placeholder={form.ask_me_about.length === 0 ? 'e.g. AI strategy, team scaling… press Enter to add' : ''}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none py-0.5"
              />
            </div>
            <p className="text-xs text-zinc-600">Press Enter or comma to add a tag · max 20</p>
          </Field>

          <Field label="Contact Email">
            <input className="dkinput" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} placeholder="you@company.com" />
          </Field>

          <Field label="LinkedIn URL">
            <input
              className="dkinput"
              type="url"
              value={form.linkedin_url}
              onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
              placeholder="https://linkedin.com/in/your-name"
            />
            <p className="text-xs text-zinc-600">Must be a linkedin.com/in/ URL</p>
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
            type="submit"
            form="edit-profile-form"
            disabled={saving || avatarProcessing || !form.name.trim()}
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
