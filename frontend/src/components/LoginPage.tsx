import { useEffect, useRef } from 'react';
import mtlLogo from '../assets/mtl.png';
import Footer from './Footer';

const GOOGLE_CLIENT_ID = '840076504590-v7tdndm1grlulv3sofeku0ns9m4rokeo.apps.googleusercontent.com';

interface Props {
  onCredential: (credential: string) => void;
}

export default function LoginPage({ onCredential }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);

  const initGIS = (cb: (credential: string) => void) => {
    if (!window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => cb(res.credential),
      auto_select: false,
      use_fedcm_for_prompt: false,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280,
    });
  };

  useEffect(() => { initGIS(onCredential); }, [onCredential]);

  useEffect(() => {
    if (window.google) return;
    const t = setInterval(() => {
      if (window.google) { initGIS(onCredential); clearInterval(t); }
    }, 200);
    return () => clearInterval(t);
  }, [onCredential]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-fuchsia-700/8 rounded-full blur-3xl pointer-events-none" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right,#8b5cf608 1px,transparent 1px),linear-gradient(to bottom,#8b5cf608 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-white rounded-2xl px-7 py-4 shadow-2xl shadow-black/40">
              <img src={mtlLogo} alt="Midlands Tech Leaders" className="h-16 w-auto" />
            </div>
            <p className="font-display text-sm tracking-wide text-violet-400/80 italic font-semibold">
              Run by the community, for the community
            </p>
          </div>

          {/* Sign-in card */}
          <div className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl shadow-black/60 backdrop-blur-sm">
            <div className="text-center">
              <p className="font-display text-base font-bold text-zinc-200 tracking-wide">Member sign-in</p>
              <p className="text-xs text-zinc-500 mt-1">Access is restricted to approved members</p>
            </div>

            <div ref={btnRef} className="flex justify-center w-full min-h-[44px]" />

            <p className="text-xs text-zinc-600 text-center leading-relaxed">
              New account? You'll be reviewed by the admin before gaining access.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
