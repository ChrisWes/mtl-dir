import type { Member } from '../types';

interface Props {
  member: Member;
  onBack: () => void;
}

export default function MemberProfile({ member, onBack }: Props) {
  const initials = (member.name ?? member.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-400 self-start transition-colors -ml-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to directory
      </button>

      {/* Profile card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/40">
        {/* Header band */}
        <div className="h-24 bg-gradient-to-r from-violet-950/80 via-fuchsia-950/40 to-zinc-900 relative">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(to right,#8b5cf610 1px,transparent 1px),linear-gradient(to bottom,#8b5cf610 1px,transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-zinc-900 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-2xl font-bold ring-4 ring-zinc-900 shadow-lg">
                {initials}
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-zinc-100">{member.name ?? member.email}</h1>

          {member.company && (
            <p className="text-sm font-medium text-violet-400 mt-1">{member.company}</p>
          )}

          {member.location && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {member.location}
            </div>
          )}

          {member.bio && (
            <p className="mt-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-5">{member.bio}</p>
          )}
        </div>
      </div>

      {/* LinkedIn */}
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-violet-500/40 rounded-2xl px-5 py-4 shadow-sm transition-all group"
        >
          <span className="text-zinc-500 group-hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </span>
          <span className="text-sm font-medium text-zinc-300 flex-1">LinkedIn</span>
          <svg className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      )}
    </div>
  );
}
