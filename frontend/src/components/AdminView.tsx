import { useState, useEffect, useCallback } from 'react';
import type { AdminUser } from '../types';

interface Props {
  sessionToken: string;
  onBack: () => void;
}

export default function AdminView({ sessionToken, onBack }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [restrictingId, setRestrictingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  const headers = { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${sessionToken}` } });
      const data = await res.json() as { users?: AdminUser[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setUsers(data.users ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (user: AdminUser) => {
    const next = user.status === 'approved' ? 'pending' : 'approved';
    setTogglingId(user.id);
    setActionError('');
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: next } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH', headers, body: JSON.stringify({ id: user.id, status: next }),
      });
      if (!res.ok) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: user.status } : u));
        setActionError('Failed to update status — please try again.');
      }
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: user.status } : u));
      setActionError('Network error — please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  const toggleRestriction = async (user: AdminUser) => {
    const next = !user.access_restricted;
    setRestrictingId(user.id);
    setActionError('');
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, access_restricted: next } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH', headers, body: JSON.stringify({ id: user.id, access_restricted: next }),
      });
      if (!res.ok) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, access_restricted: user.access_restricted } : u));
        setActionError('Failed to update restriction — please try again.');
      }
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, access_restricted: user.access_restricted } : u));
      setActionError('Network error — please try again.');
    } finally {
      setRestrictingId(null);
    }
  };

  const deleteUser = async (id: number) => {
    setDeletingId(id);
    setActionError('');
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setActionError('Failed to delete user — please try again.');
      }
    } catch {
      setActionError('Network error — please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const pending = users.filter((u) => u.status === 'pending').length;
  const approved = users.filter((u) => u.status === 'approved').length;

  const BackLink = () => (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-400 transition-colors self-start"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back to directory
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
      <BackLink />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total" value={users.length} />
        <Stat label="Approved" value={approved} valueClass="text-emerald-400" />
        <Stat label="Pending" value={pending} valueClass="text-amber-400" />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center justify-between gap-3">
          {actionError}
          <button onClick={() => setActionError('')} className="text-red-400/60 hover:text-red-400 shrink-0">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-16 text-sm text-zinc-600">No users yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Column labels */}
          <div className="flex items-center px-4">
            <div className="flex-1" />
            <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-600 uppercase tracking-widest">
              <span className="w-[88px] text-center">Approved</span>
              <span className="w-[88px] text-center">Restricted</span>
              <span className="w-7" />
            </div>
          </div>

          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              toggling={togglingId === user.id}
              restricting={restrictingId === user.id}
              deleting={deletingId === user.id}
              confirming={confirmDelete === user.id}
              onToggle={() => toggleStatus(user)}
              onToggleRestriction={() => toggleRestriction(user)}
              onDeleteClick={() => setConfirmDelete(user.id)}
              onDeleteConfirm={() => deleteUser(user.id)}
              onDeleteCancel={() => setConfirmDelete(null)}
            />
          ))}
        </div>
      )}

      <BackLink />
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-zinc-100' }: {
  label: string; value: number; valueClass?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
      <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function UserRow({
  user, toggling, restricting, deleting, confirming,
  onToggle, onToggleRestriction, onDeleteClick, onDeleteConfirm, onDeleteCancel,
}: {
  user: AdminUser;
  toggling: boolean;
  restricting: boolean;
  deleting: boolean;
  confirming: boolean;
  onToggle: () => void;
  onToggleRestriction: () => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}) {
  const initials = (user.name ?? user.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const joined = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-zinc-700" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{user.name ?? '—'}</p>
        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        <p className="text-xs text-zinc-700 mt-0.5">Joined {joined}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Status toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-xs hidden sm:block ${user.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {user.status === 'approved' ? 'Approved' : 'Pending'}
          </span>
          <button
            role="switch"
            aria-checked={user.status === 'approved'}
            onClick={onToggle}
            disabled={toggling}
            className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-40 ${
              user.status === 'approved' ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              user.status === 'approved' ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Restriction toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-xs hidden sm:block ${user.access_restricted ? 'text-amber-400' : 'text-zinc-600'}`}>
            {user.access_restricted ? 'Restricted' : 'Restricted'}
          </span>
          <button
            role="switch"
            aria-checked={!!user.access_restricted}
            onClick={onToggleRestriction}
            disabled={restricting}
            title={user.access_restricted ? 'Remove restriction' : 'Restrict access'}
            className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-40 ${
              user.access_restricted ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              user.access_restricted ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Delete */}
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onDeleteConfirm}
              disabled={deleting}
              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? '…' : 'Yes'}
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-2.5 py-1 text-xs font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={onDeleteClick}
            className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete user"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
