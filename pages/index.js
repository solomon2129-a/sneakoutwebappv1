import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useInstallPrompt } from '../context/InstallContext';

const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80',
];

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const install = useInstallPrompt();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/discover');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(ios);
    }
  }, []);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#09090B]" />
    );
  }

  const canInstall = install?.installPrompt && !install?.isInstalled;
  const showInstallButton = canInstall || (isIOS && !install?.isInstalled);

  const handleInstallClick = () => {
    if (canInstall) {
      install.triggerInstall();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <Head>
        <title>Sneakout — Find Your Night Out</title>
      </Head>

      <div className="relative min-h-screen bg-[#09090B] overflow-hidden flex flex-col">

        {/* ── Mosaic background ── */}
        <div className="absolute inset-0 z-0">
          <div className="grid grid-cols-3 grid-rows-2 w-full h-full gap-0.5 opacity-30">
            {EVENT_IMAGES.map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/60 via-[#09090B]/70 to-[#09090B]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(circle, #DC2626, transparent 70%)' }}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col min-h-screen max-w-lg mx-auto w-full px-6">

          {/* Top spacer + badge */}
          <div className="pt-14 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-[11px] font-semibold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Bangalore · Events happening now
            </span>
          </div>

          {/* Main hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-8">
            {/* Logo mark */}
            <div className="mb-3 anim-fade-pop">
              <img src="/logo.png" alt="Sneakout" className="w-10 h-10 object-contain mx-auto mb-3" />
            </div>

            <div className="anim-fade-up">
              <div className="mb-2 flex justify-center">
                <img src="/wordmark.png" alt="Sneakout" className="h-7 object-contain" />
              </div>
              <p className="text-zinc-300 text-[15px] font-medium leading-snug mb-1">
                Find your night out.
              </p>
              <p className="text-zinc-500 text-[12px] max-w-xs mx-auto leading-relaxed">
                Discover underground raves, indie gigs, rooftop sessions & more — all in one place.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 mb-6 anim-fade-in" style={{ animationDelay: '0.2s' }}>
              {['Techno', 'Live Music', 'Rooftop', 'Networking', 'Raves'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-zinc-900/70 border border-zinc-800 text-zinc-500 text-[11px] font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="w-full max-w-[280px] space-y-3 anim-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/auth"
                className="w-full py-3 rounded-2xl bg-red-600 text-white font-bold text-[14px] tracking-wide flex items-center justify-center shadow-xl shadow-red-900/40 pressable"
              >
                Get Started
              </Link>
              <Link
                href="/auth?mode=signin"
                className="w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold text-[13px] flex items-center justify-center pressable"
              >
                Sign in
              </Link>

              {/* Add to Home Screen */}
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-semibold text-[12px] flex items-center justify-center gap-2 pressable hover:border-zinc-700 transition-colors mt-2"
                >
                  <DownloadIcon />
                  Add to Home Screen
                </button>
              )}

              {/* Already installed badge */}
              {install?.isInstalled && (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-500 text-[12px] font-semibold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  App installed
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="pb-10 flex flex-col items-center gap-3 anim-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-zinc-700 text-[11px]">
              By continuing you agree to our{' '}
              <span className="text-zinc-500 underline underline-offset-2">Terms</span> &{' '}
              <span className="text-zinc-500 underline underline-offset-2">Privacy Policy</span>
            </p>
          </div>
        </div>

        {/* ── iOS Install Guide Modal ── */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm anim-fade-in" onClick={() => setShowIOSGuide(false)}>
            <div
              className="w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-3xl px-6 py-8 anim-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />

              <h3 className="text-white text-lg font-bold mb-1 text-center">Install Sneakout</h3>
              <p className="text-zinc-500 text-sm mb-6 text-center">Add to your home screen for the best experience</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <ShareIcon />
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-semibold">1. Tap the Share button</p>
                    <p className="text-zinc-600 text-[12px]">At the bottom of Safari</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-semibold">2. Tap &ldquo;Add to Home Screen&rdquo;</p>
                    <p className="text-zinc-600 text-[12px]">Scroll down in the share sheet</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-semibold">3. Tap &ldquo;Add&rdquo;</p>
                    <p className="text-zinc-600 text-[12px]">Sneakout will appear on your home screen</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-[14px] pressable"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
