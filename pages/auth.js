import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { mode } = router.query;

  const [tab, setTab] = useState('google'); // 'google' | 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/discover');
  }, [user, loading, router]);

  useEffect(() => {
    if (mode === 'signin') setIsSignUp(false);
    if (mode === 'signup') setIsSignUp(true);
  }, [mode]);

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Navigation handled by the useEffect above watching auth state
    } catch (err) {
      setError(getErrorMessage(err.code));
      setSubmitting(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Navigation handled by the useEffect above watching auth state
    } catch (err) {
      setError(getErrorMessage(err.code));
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail) { setResetError('Please enter your email.'); return; }
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      };
      setResetError(msgs[err.code] || 'Failed to send reset email.');
    } finally {
      setResetSending(false);
    }
  };

  function getErrorMessage(code) {
    const msgs = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account already exists with this email.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Sign-in cancelled.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential': 'Invalid email or password.',
    };
    return msgs[code] || 'Something went wrong. Please try again.';
  }

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In — Sneakout</title>
      </Head>

      <div className="min-h-screen bg-[#09090B] flex flex-col max-w-lg mx-auto px-6">
        {/* Header */}
        <div className="pt-12 pb-6 text-center anim-fade-up">
          <img src="/logo.png" alt="Sneakout" className="w-10 h-10 object-contain mx-auto mb-4" />
          <h1 className="text-[22px] font-extrabold text-white tracking-tight mb-1.5">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-zinc-500 text-[12px]">
            {isSignUp ? "Join the city's best event platform" : 'Sign in to access your tickets'}
          </p>
        </div>

        {/* Card */}
        <div className="flex-1 anim-fade-up" style={{ animationDelay: '0.1s' }}>

          {/* Google CTA */}
          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white text-zinc-900 font-semibold text-[13px] shadow-lg disabled:opacity-60 pressable mb-4"
          >
            {submitting && tab === 'google' ? <LoadingSpinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-[12px] font-medium">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">Your name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-500 text-[11px] font-medium">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setResetMode(true); setResetEmail(email); setResetSent(false); setResetError(''); }}
                    className="text-red-400 text-[11px] font-semibold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-900/20 border border-rose-700/30 rounded-xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-rose-400 text-[13px]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-red-600 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 disabled:opacity-60 pressable mt-1"
            >
              {submitting ? <LoadingSpinner /> : null}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6 pb-10">
            <p className="text-zinc-600 text-[13px]">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-red-400 font-semibold"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {resetMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm anim-fade-in" onClick={() => setResetMode(false)}>
          <div
            className="w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-3xl px-6 py-6 anim-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />

            <h3 className="text-white text-[16px] font-bold mb-1 text-center">Reset Password</h3>
            <p className="text-zinc-500 text-[12px] mb-5 text-center">We'll send a reset link to your email</p>

            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mx-auto mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-emerald-400 text-[13px] font-semibold mb-1">Reset email sent!</p>
                <p className="text-zinc-500 text-[11px] mb-4">Check your inbox and spam folder</p>
                <button
                  onClick={() => setResetMode(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-[13px] pressable"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors mb-3"
                />

                {resetError && (
                  <div className="flex items-center gap-2 bg-rose-900/20 border border-rose-700/30 rounded-xl px-3 py-2 mb-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-rose-400 text-[11px]">{resetError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetSending}
                  className="w-full py-2.5 rounded-xl bg-red-600 text-white font-semibold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 pressable mb-2"
                >
                  {resetSending ? <LoadingSpinner /> : null}
                  {resetSending ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold text-[12px] pressable"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
