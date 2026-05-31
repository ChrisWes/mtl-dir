import { useState } from 'react';
import type { Member } from '../types';
import mtlLogo from '../assets/mtl.png';
import Footer from './Footer';

interface Props {
  user: Member;
  sessionToken: string;
  onConsent: () => void;
  onSignOut: () => void;
}

export default function ConsentPage({ user, sessionToken, onConsent, onSignOut }: Props) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAgree = async () => {
    if (!checked) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) throw new Error('Could not save consent — please try again.');
      onConsent();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-xl shadow-black/40">
              <img src={mtlLogo} alt="Midlands Tech Leaders" className="h-12 w-auto" />
            </div>
          </div>

          {/* Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60">
            <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
              <h1 className="font-display text-lg font-bold text-zinc-100 tracking-wide">Before you continue</h1>
              <p className="text-xs text-zinc-500 mt-1">
                Hi {user.name ?? user.email.split('@')[0]} — please read and accept our data policy to access the directory.
              </p>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/40 p-4">
                <p className="font-display text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Data Privacy Notice</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  By joining this directory, you consent to Midlands Tech Leaders holding your data securely
                  in our private directory. Your information will only be visible to other approved members
                  of this group for networking and professional collaboration. We will never sell, share, or
                  use your data for external marketing. You can edit your details or request complete deletion
                  at any time by messaging the group admin.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-0.5 shrink-0 w-4 h-4 rounded border-zinc-600 bg-zinc-700 accent-violet-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 leading-relaxed">
                  I consent to my data being held and shared with approved group members as outlined above.
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}
            </div>

            <div className="px-6 pb-6 flex flex-col gap-2">
              <button
                onClick={handleAgree}
                disabled={!checked || saving}
                className="w-full py-3 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {saving ? 'Saving…' : 'I agree — continue to the directory'}
              </button>
              <button
                onClick={onSignOut}
                className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Sign out instead
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
