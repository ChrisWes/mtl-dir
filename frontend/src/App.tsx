import { useEffect, useReducer, useCallback } from 'react';
import type { AuthState, Member } from './types';
import LoginPage from './components/LoginPage';
import ConsentPage from './components/ConsentPage';
import PendingPage from './components/PendingPage';
import Directory from './components/Directory';

const SESSION_KEY = 'tld_session';

type Action =
  | { type: 'SET_LOADING' }
  | { type: 'SET_AUTH'; user: Member; sessionToken: string }
  | { type: 'CONSENT_GIVEN' }
  | { type: 'SET_IDLE' }
  | { type: 'UPDATE_USER'; user: Member };

function resolvePhase(user: Member): AuthState['phase'] {
  if (!user.consent_given) return 'consent';
  return user.status;
}

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, phase: 'loading' };
    case 'SET_AUTH':
      return { phase: resolvePhase(action.user), sessionToken: action.sessionToken, user: action.user };
    case 'CONSENT_GIVEN':
      return { ...state, phase: state.user!.status };
    case 'UPDATE_USER':
      return { ...state, user: action.user, phase: resolvePhase(action.user) };
    case 'SET_IDLE':
      return { phase: 'idle', sessionToken: null, user: null };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    phase: 'idle',
    sessionToken: null,
    user: null,
  });

  const handleSignIn = useCallback(async (credential: string) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json() as { sessionToken?: string; user?: Member; error?: string };
      if (!res.ok || !data.sessionToken || !data.user) throw new Error(data.error ?? 'Auth failed');
      localStorage.setItem(SESSION_KEY, data.sessionToken);
      dispatch({ type: 'SET_AUTH', user: data.user, sessionToken: data.sessionToken });
    } catch {
      dispatch({ type: 'SET_IDLE' });
    }
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    window.google?.accounts.id.disableAutoSelect();
    dispatch({ type: 'SET_IDLE' });
  }, []);

  // Resume session on mount
  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    dispatch({ type: 'SET_LOADING' });
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { user?: Member }) => {
        if (data.user) {
          dispatch({ type: 'SET_AUTH', user: data.user, sessionToken: token });
        } else {
          localStorage.removeItem(SESSION_KEY);
          dispatch({ type: 'SET_IDLE' });
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        dispatch({ type: 'SET_IDLE' });
      });
  }, []);

  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.phase === 'idle') return <LoginPage onCredential={handleSignIn} />;

  if (state.phase === 'consent') {
    return (
      <ConsentPage
        user={state.user!}
        sessionToken={state.sessionToken!}
        onConsent={() => dispatch({ type: 'CONSENT_GIVEN' })}
        onSignOut={handleSignOut}
      />
    );
  }

  if (state.phase === 'pending') {
    return <PendingPage onSignOut={handleSignOut} user={state.user!} />;
  }

  return (
    <Directory
      sessionToken={state.sessionToken!}
      currentUser={state.user!}
      onUserUpdate={(user) => dispatch({ type: 'UPDATE_USER', user })}
      onSignOut={handleSignOut}
    />
  );
}
