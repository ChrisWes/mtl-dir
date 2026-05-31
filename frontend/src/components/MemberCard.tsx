import type { Member } from '../types';

interface Props {
  member: Member;
}

export default function MemberCard({ member }: Props) {
  const initials = (member.name ?? member.email)
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{member.name ?? member.email}</p>
          {member.role && (
            <p className="text-sm text-gray-500 truncate">{member.role}</p>
          )}
          {member.company && (
            <p className="text-sm text-blue-600 truncate">{member.company}</p>
          )}
        </div>
      </div>

      {member.bio && (
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{member.bio}</p>
      )}

      {member.location && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {member.location}
        </div>
      )}

      {member.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {member.tech_stack.slice(0, 6).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
              {tech}
            </span>
          ))}
          {member.tech_stack.length > 6 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
              +{member.tech_stack.length - 6}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        {member.linkedin_url && (
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
            LinkedIn
          </a>
        )}
        {member.twitter_url && (
          <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
            Twitter/X
          </a>
        )}
        {member.website_url && (
          <a href={member.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate">
            Website
          </a>
        )}
      </div>
    </div>
  );
}
