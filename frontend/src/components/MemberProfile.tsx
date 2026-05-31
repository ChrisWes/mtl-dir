import type { Member } from '../types';

interface Props {
  member: Member;
  onBack: () => void;
}

export default function MemberProfile({ member, onBack }: Props) {
  const initials = (member.name ?? member.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
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
        <div className="h-20 bg-gradient-to-r from-violet-950/80 via-fuchsia-950/40 to-zinc-900 relative">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(to right,#8b5cf610 1px,transparent 1px),linear-gradient(to bottom,#8b5cf610 1px,transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-10 mb-5">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-zinc-900 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-2xl font-bold ring-4 ring-zinc-900 shadow-lg">
                {initials}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="font-display text-2xl font-bold text-zinc-100 tracking-wide">{member.name ?? member.email}</h1>

          {/* Key facts */}
          <div className="mt-4 flex flex-col gap-2.5">
            {member.company && (
              <Fact icon={<BuildingIcon />} value={member.company} />
            )}
            {member.location && (
              <Fact icon={<PinIcon />} value={member.location} />
            )}
            {member.contact_email && (
              <a
                href={`mailto:${member.contact_email}`}
                className="flex items-center gap-3 group"
              >
                <span className="text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0"><MailIcon /></span>
                <span className="text-sm text-zinc-400 group-hover:text-violet-300 transition-colors">{member.contact_email}</span>
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0"><LinkedInIcon /></span>
                <span className="text-sm text-zinc-400 group-hover:text-violet-300 transition-colors">LinkedIn profile</span>
                <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-violet-400 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="mt-5 pt-5 border-t border-zinc-800 text-sm text-zinc-400 leading-relaxed">
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-600 shrink-0">{icon}</span>
      <span className="text-sm text-zinc-400">{value}</span>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
