import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function LockIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
}
function KeyIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>);
}
function MailIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
}
function ShieldIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
}
function CheckIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function EyeIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
}
function EyeOffIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
}
function LoadingSpinner() {
  return (<svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>);
}

export default function PrivacySecurity() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  // Reset password state
  const [resetSent, setResetSent] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetError, setResetError] = useState('');

  // Is the user signed in with email/password?
  const isEmailUser = user?.providerData?.some((p) => p.providerId === 'password');
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === 'google.com');

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess(false);

    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('Passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setChangeError('New password must be different from current password.');
      return;
    }

    setChanging(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Then update
      await updatePassword(user, newPassword);
      setChangeSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Auto-dismiss success after 3s
      setTimeout(() => setChangeSuccess(false), 3000);
    } catch (err) {
      const msgs = {
        'auth/wrong-password': 'Current password is incorrect.',
        'auth/invalid-credential': 'Current password is incorrect.',
        'auth/weak-password': 'New password is too weak. Use at least 6 characters.',
        'auth/requires-recent-login': 'Please sign out and sign in again, then retry.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      };
      setChangeError(msgs[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setChanging(false);
    }
  };

  const handleSendResetEmail = async () => {
    setResetError('');
    setResetSending(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
    } catch (err) {
      const msgs = {
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/user-not-found': 'No account found for this email.',
      };
      setResetError(msgs[err.code] || 'Failed to send reset email.');
    } finally {
      setResetSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Password strength indicator
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength(newPassword);

  return (
    <>
      <Head><title>Privacy & Security — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] max-w-lg mx-auto px-4 pb-16 anim-page">
        <div className="h-14" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Privacy & Security</h1>
            <p className="text-zinc-600 text-xs mt-0.5">Manage your account security</p>
          </div>
        </div>

        {/* Account info card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-6 anim-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
              <ShieldIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.email}</p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Signed in with {isGoogleUser ? 'Google' : 'Email & Password'}
                {isGoogleUser && isEmailUser ? ' + Email' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 text-[10px] font-semibold">Secure</span>
            </div>
          </div>
        </div>

        {/* Change Password Section — only for email/password users */}
        {isEmailUser && (
          <div className="mb-6 anim-fade-up" style={{ animationDelay: '0.05s' }}>
            <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Change Password</p>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <KeyIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Update your password</p>
                  <p className="text-xs text-zinc-600">Use a strong password you don&apos;t use elsewhere</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                {/* Current password */}
                <div className="relative">
                  <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl py-3 px-4 pr-11 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">New password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl py-3 px-4 pr-11 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={'h-1 flex-1 rounded-full transition-colors duration-300 ' +
                              (i <= strength.level ? strength.color : 'bg-zinc-800')}
                          />
                        ))}
                      </div>
                      <p className={'text-[10px] font-medium ' +
                        (strength.level <= 1 ? 'text-rose-400' :
                         strength.level <= 2 ? 'text-amber-400' :
                         strength.level <= 3 ? 'text-yellow-400' : 'text-emerald-400')}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="text-zinc-500 text-[11px] font-medium mb-1.5 block">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className={'w-full bg-zinc-800/80 border rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors ' +
                      (confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-600/50'
                        : confirmPassword && confirmPassword === newPassword && newPassword.length >= 6
                        ? 'border-emerald-600/50'
                        : 'border-zinc-700')}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-rose-400 text-[10px] mt-1">Passwords don&apos;t match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
                    <p className="text-emerald-400 text-[10px] mt-1 flex items-center gap-1"><CheckIcon /> Passwords match</p>
                  )}
                </div>

                {/* Error */}
                {changeError && (
                  <div className="flex items-center gap-2 bg-rose-900/20 border border-rose-700/30 rounded-xl px-3 py-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-rose-400 text-[12px]">{changeError}</p>
                  </div>
                )}

                {/* Success */}
                {changeSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-3 py-2.5">
                    <CheckIcon />
                    <p className="text-emerald-400 text-[12px] font-medium">Password updated successfully!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changing || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 pressable mt-1"
                >
                  {changing ? <LoadingSpinner /> : <LockIcon />}
                  {changing ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Forgot / Reset Password Section */}
        <div className="mb-6 anim-fade-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Reset Password</p>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <MailIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-200">Forgot your password?</p>
                <p className="text-xs text-zinc-600">We&apos;ll send a reset link to your email</p>
              </div>
            </div>

            {/* Email display */}
            <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 mb-3">
              <p className="text-xs text-zinc-500 mb-0.5">Reset link will be sent to</p>
              <p className="text-sm text-white font-medium">{user.email}</p>
            </div>

            {resetError && (
              <div className="flex items-center gap-2 bg-rose-900/20 border border-rose-700/30 rounded-xl px-3 py-2.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-rose-400 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-rose-400 text-[12px]">{resetError}</p>
              </div>
            )}

            {resetSent ? (
              <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-3 py-3">
                <CheckIcon />
                <div>
                  <p className="text-emerald-400 text-[12px] font-medium">Reset email sent!</p>
                  <p className="text-emerald-600 text-[11px] mt-0.5">Check your inbox and spam folder</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSendResetEmail}
                disabled={resetSending}
                className="w-full py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 pressable hover:border-zinc-600 transition-colors"
              >
                {resetSending ? <LoadingSpinner /> : <MailIcon />}
                {resetSending ? 'Sending...' : 'Send Reset Email'}
              </button>
            )}
          </div>
        </div>

        {/* Google-only user info */}
        {isGoogleUser && !isEmailUser && (
          <div className="mb-6 anim-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="bg-blue-900/15 border border-blue-700/25 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-900/30 border border-blue-700/30 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-300">Google Account</p>
                  <p className="text-xs text-blue-400/60 mt-1 leading-relaxed">
                    Your account is managed through Google. To change your password, visit your{' '}
                    <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2">
                      Google Account settings
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security tips */}
        <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Security Tips</p>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            {[
              { text: 'Use a unique password for Sneakout', done: true },
              { text: 'Include numbers and special characters', done: true },
              { text: 'Never share your password with anyone', done: true },
              { text: 'Change your password regularly', done: false },
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ' +
                  (tip.done ? 'bg-emerald-900/40 text-emerald-400' : 'bg-zinc-800 text-zinc-600')}>
                  {tip.done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/></svg>
                  )}
                </div>
                <p className={'text-xs ' + (tip.done ? 'text-zinc-400' : 'text-zinc-600')}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </>
  );
}
