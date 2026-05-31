import type { Member } from '../types';

interface Props {
  member: Member;
  onBack: () => void;
}

export default function MemberProfile({ member, onBack }: Props) {
  const initials = (member.name ?? member.email)
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 self-start transition-colors -ml-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to directory
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header band */}
        <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-700" />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold border-4 border-white shadow-sm">
                {initials}
              </div>
            )}
          </div>

          <h1 className="text-xl font-semibold text-gray-900">{member.name ?? member.email}</h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {member.role && (
              <span className="text-sm text-gray-500">{member.role}</span>
            )}
            {member.role && member.company && (
              <span className="text-gray-300 text-sm">·</span>
            )}
            {member.company && (
              <span className="text-sm font-medium text-blue-600">{member.company}</span>
            )}
          </div>

          {member.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {member.location}
            </div>
          )}

          {member.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{member.bio}</p>
          )}
        </div>
      </div>

      {/* Links */}
      {(member.linkedin_url || member.twitter_url || member.website_url) && (
        <div className="flex flex-col gap-2">
          {member.linkedin_url && (
            <LinkRow
              href={member.linkedin_url}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              }
              label="LinkedIn"
            />
          )}
          {member.twitter_url && (
            <LinkRow
              href={member.twitter_url}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
              label="Twitter / X"
            />
          )}
          {member.website_url && (
            <LinkRow
              href={member.website_url}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              }
              label={formatHostname(member.website_url)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function LinkRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:border-blue-200 hover:shadow transition-all group"
    >
      <span className="text-gray-400 group-hover:text-blue-500 transition-colors">{icon}</span>
      <span className="text-sm font-medium text-gray-700 flex-1 truncate">{label}</span>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </a>
  );
}

function formatHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
