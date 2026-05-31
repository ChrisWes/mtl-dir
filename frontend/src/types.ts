export interface Member {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  role: string | null;
  tech_stack: string[];
  ask_me_about: string[];
  contact_email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
  status: 'pending' | 'approved';
  updated_at: string | null;
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

export const ADMIN_EMAIL = 'chris.weston@gmail.com';

export interface AdminUser extends Member {
  created_at: string;
}

