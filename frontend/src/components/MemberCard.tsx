import type { Member } from '../types';

interface Props {
  member: Member;
  onClick: () => void;
}

export default function MemberCard({ member, onClick }: Props) {
  const initials = (member.name ?? member.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group text-left bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 rounded-2xl p-5 flex flex-col gap-3 w-full transition-all hover:shadow-lg hover:shadow-violet-500/5"
    >
      <div className="flex items-start gap-3">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-zinc-700" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-violet-500/15 text-violet-400 flex items-center justify-center text-base font-semibold shrink-0 ring-1 ring-violet-500/20">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-100 truncate">{member.name ?? member.email}</p>
          {member.company && (
            <p className="text-sm text-violet-400 truncate mt-0.5">{member.company}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-zinc-700 group-hover:text-violet-500 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {member.bio && (
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{member.bio}</p>
      )}

      {member.location && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {member.location}
        </div>
      )}
    </button>
  );
}
