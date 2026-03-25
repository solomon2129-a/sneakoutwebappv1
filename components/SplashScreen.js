import { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=hold, 2=fade-out

  useEffect(() => {
    // Phase 1: hold after animations settle (~1.8s)
    const t1 = setTimeout(() => setPhase(1), 1800);
    // Phase 2: start fade out (~2.6s)
    const t2 = setTimeout(() => setPhase(2), 2600);
    // Phase 3: done (~3.1s)
    const t3 = setTimeout(onDone, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#09090B] flex flex-col items-center transition-opacity duration-500"
      style={{ opacity: phase === 2 ? 0 : 1, pointerEvents: phase === 2 ? 'none' : 'auto' }}
    >
      {/* Subtle ambient glow behind logo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full splash-glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)' }}
      />

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Logo icon */}
        <div className="splash-logo-pop mb-5">
          <img src="/logo.png" alt="Sneakout" className="w-12 h-12 object-contain" />
        </div>

        {/* Wordmark */}
        <div className="splash-text-up mb-2">
          <img src="/wordmark.png" alt="Sneakout" className="h-6 object-contain" />
        </div>

        {/* Tagline */}
        <p className="splash-tagline text-zinc-500 text-[12px] font-medium tracking-wide">
          find out the underground.
        </p>
      </div>

      {/* Loading bar — pinned near bottom with lots of space above */}
      <div className="pb-16 w-full flex justify-center relative z-10">
        <div className="w-32 h-[3px] bg-zinc-800/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full splash-loading-bar"
            style={{ background: 'linear-gradient(90deg, #DC2626, #EF4444, #DC2626)' }}
          />
        </div>
      </div>
    </div>
  );
}
