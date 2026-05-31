export interface Member {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  role: string | null;
  tech_stack: string[];
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
  status: 'pending' | 'approved';
}

export interface AuthState {
  phase: 'idle' | 'loading' | 'pending' | 'approved';
  sessionToken: string | null;
  user: Member | null;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const TECH_OPTIONS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Remix',
  'Node.js', 'Python', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift', 'TypeScript',
  'GraphQL', 'tRPC', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
] as const;

export const ROLE_OPTIONS = [
  'CTO', 'VP Engineering', 'Director of Engineering', 'Engineering Manager',
  'Staff Engineer', 'Principal Engineer', 'Senior Engineer', 'Architect',
  'Founder', 'Co-Founder', 'Other',
] as const;
