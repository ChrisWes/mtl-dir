import { useState, useEffect, useCallback } from 'react';
import type { AdminUser } from '../types';

interface Props {
  sessionToken: string;
}

export default function AdminView({ sessionToken }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    // Optimistic update
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: next } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: user.id, status: next }),
      });
      if (!res.ok) {
        // Revert on failure
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: user.status } : u));
      }
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: user.status } : u));
    } finally {
      setTogglingId(null);
    }
  };

  const deleteUser = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const pending = users.filter((u) => u.status === 'pending').length;
  const approved = users.filter((u) => u.status === 'approved').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Total" value={users.length} />
        <Stat label="Approved" value={approved} color="text-green-600" />
        <Stat label="Pending" value={pending} color="text-amber-500" className="col-span-2 sm:col-span-1" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center py-16 text-sm text-gray-400">No users yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              toggling={togglingId === user.id}
              deleting={deletingId === user.id}
              confirming={confirmDelete === user.id}
              onToggle={() => toggleStatus(user)}
              onDeleteClick={() => setConfirmDelete(user.id)}
              onDeleteConfirm={() => deleteUser(user.id)}
              onDeleteCancel={() => setConfirmDelete(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = 'text-gray-900', className = '' }: {
  label: string; value: number; color?: string; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 ${className}`}>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function UserRow({
  user, toggling, deleting, confirming,
  onToggle, onDeleteClick, onDeleteConfirm, onDeleteCancel,
}: {
  user: AdminUser;
  toggling: boolean;
  deleting: boolean;
  confirming: boolean;
  onToggle: () => void;
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      {/* Avatar */}
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? '—'}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        <p className="text-xs text-gray-300 mt-0.5">Joined {joined}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Approved toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-gray-500 hidden sm:block">
            {user.status === 'approved' ? 'Approved' : 'Pending'}
          </span>
          <button
            role="switch"
            aria-checked={user.status === 'approved'}
            onClick={onToggle}
            disabled={toggling}
            className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 ${
              user.status === 'approved' ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                user.status === 'approved' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>

        {/* Delete */}
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onDeleteConfirm}
              disabled={deleting}
              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? '…' : 'Yes'}
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={onDeleteClick}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
