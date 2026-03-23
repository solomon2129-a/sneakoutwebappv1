import { useState, useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1600);
    const t2 = setTimeout(onDone, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#09090B] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: fade ? 0 : 1, pointerEvents: fade ? 'none' : 'auto' }}
    >
      <div className="absolute w-64 h-64 bg-red-600/15 rounded-full blur-[100px] splash-glow-pulse" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-red-900/60 splash-logo-pop">
          S
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight splash-text-up">
          Sneak<span className="text-red-500">out</span>
        </h1>
        <p className="text-zinc-600 text-[12px] font-medium splash-text-up" style={{ animationDelay: '0.15s' }}>
          Find your night out.
        </p>
      </div>

      <div className="absolute bottom-24 w-32 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 rounded-full splash-loading-bar" />
      </div>
    </div>
  );
}
