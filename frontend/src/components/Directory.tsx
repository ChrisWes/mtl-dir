import { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';
import { ROLE_OPTIONS, ADMIN_EMAIL } from '../types';
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
  const [roleFilter, setRoleFilter] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (roleFilter) params.set('role', roleFilter);

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
  }, [sessionToken, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchMembers, search]);

  const activeFilters = [roleFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
            TL
          </div>
          <span className="font-semibold text-gray-900 text-sm">Tech Leaders</span>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 flex-1">
            <button
              onClick={() => setView('members')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                view === 'members'
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Directory
            </button>
            {isAdmin && (
              <button
                onClick={() => setView('admin')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  view === 'admin'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                {(currentUser.name ?? currentUser.email)[0].toUpperCase()}
              </div>
            )}
            <span className="hidden sm:block max-w-[120px] truncate">{currentUser.name ?? 'Profile'}</span>
          </button>

          <button
            onClick={onSignOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        {/* Search + filter bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              showFilters || activeFilters > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Role</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => setRoleFilter('')}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Count */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Grid */}
        {!loading && members.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400">
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
