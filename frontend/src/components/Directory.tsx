import { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';
import { ADMIN_EMAIL } from '../types';
import mtlLogo from '../assets/mtl.png';
import Footer from './Footer';
import MemberCard from './MemberCard';
import MemberProfile from './MemberProfile';
import EditProfile from './EditProfile';
import AdminView from './AdminView';

interface Props {
  sessionToken: string;
  currentUser: Member;
  onUserUpdate: (user: Member) => void;
  onSignOut: () => void;
}

export default function Directory({ sessionToken, currentUser, onUserUpdate, onSignOut }: Props) {
  const isAdmin = currentUser.email === ADMIN_EMAIL;
  const [view, setView] = useState<'members' | 'admin' | 'profile'>('members');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);

      const res = await fetch(`/api/members?${params}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json() as { members?: Member[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setMembers(data.members ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionToken, search]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMembers, search]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-950/90 border-b border-zinc-800/80 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={mtlLogo} alt="Midlands Tech Leaders" className="w-9 h-9 shrink-0" />

          {/* Nav tabs */}
          <div className="flex items-center gap-1 flex-1">
            <button
              onClick={() => setView('members')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                view === 'members'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              Directory
            </button>
            {isAdmin && (
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  view === 'admin'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-6 h-6 rounded-full ring-1 ring-zinc-700" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-semibold flex items-center justify-center">
                {(currentUser.name ?? currentUser.email)[0].toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block max-w-[120px] truncate">{currentUser.name ?? 'Profile'}</span>
          </button>

          <button
            onClick={onSignOut}
            className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      {view === 'admin' && <AdminView sessionToken={sessionToken} />}

      {view === 'profile' && selectedMember && (
        <MemberProfile member={selectedMember} onBack={() => setView('members')} />
      )}

      <main className={`max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5 ${view !== 'members' ? 'hidden' : ''}`}>
        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-100 tracking-widest uppercase">Midlands Tech Leaders</h1>
          <p className="text-xs text-zinc-500 mt-1 tracking-wide">
            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''} · approved`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Grid */}
        {!loading && members.length === 0 && !error && (
          <div className="text-center py-20 text-zinc-700">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
            <p className="text-sm">No members found</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} onClick={() => { setSelectedMember(m); setView('profile'); }} />
          ))}
        </div>
      </main>

      <Footer />

      {showEdit && (
        <EditProfile
          user={currentUser}
          sessionToken={sessionToken}
          onSave={(updated) => { onUserUpdate(updated); setShowEdit(false); }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
