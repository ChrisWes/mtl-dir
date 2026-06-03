import type { Member } from '../types';
import mtlLogo from '../assets/mtl.png';
import Footer from './Footer';

interface Props {
  user: Member;
  onSignOut: () => void;
}

export default function PendingPage({ user, onSignOut }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-6 text-center shadow-2xl shadow-black/60">
        {/* MTL logo */}
        <img src={mtlLogo} alt="Midlands Tech Leaders" className="w-16 h-16" />

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <div>
          <h1 className="font-display text-xl font-bold text-zinc-100 tracking-wide">Access Restricted pending first-time approval</h1>
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Please message Chris Weston or post on the main group to speed up the approval process…
          </p>
        </div>

        {/* User info */}
        <div className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2.5">Signed in as</p>
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full ring-1 ring-zinc-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-semibold ring-1 ring-violet-500/30">
                {(user.name ?? user.email)[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user.name ?? 'No name'}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full py-2.5 px-4 text-sm font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 rounded-xl transition-colors"
        >
          Sign out
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}
