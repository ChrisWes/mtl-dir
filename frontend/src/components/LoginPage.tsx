import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = '840076504590-v7tdndm1grlulv3sofeku0ns9m4rokeo.apps.googleusercontent.com';

interface Props {
  onCredential: (credential: string) => void;
}

export default function LoginPage({ onCredential }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => onCredential(res.credential),
      auto_select: false,
      use_fedcm_for_prompt: false,
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280,
    });
  }, [onCredential]);

  // Retry rendering once the GIS script loads
  useEffect(() => {
    if (window.google) return;
    const interval = setInterval(() => {
      if (window.google && btnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => onCredential(res.credential),
          auto_select: false,
          use_fedcm_for_prompt: false,
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280,
        });
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [onCredential]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold select-none">
            TL
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Tech Leaders</h1>
          <p className="text-sm text-gray-500">Sign in to access the member directory</p>
        </div>

        <div ref={btnRef} className="flex justify-center w-full min-h-[44px]" />

        <p className="text-xs text-gray-400 text-center">
          Access is restricted to approved members. New accounts require admin approval.
        </p>
      </div>
    </div>
  );
}
