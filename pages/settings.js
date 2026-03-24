import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function UserEditIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
}
function BellIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
}
function MapPinIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
}
function CreditCardIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>);
}
function LockIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
}
function HelpCircleIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
}
function LogOutIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
}
function CalendarPlusIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="10" y1="17" x2="14" y2="17"/></svg>);
}

function SettingRow({ icon, label, sublabel, danger = false, onClick, href }) {
  const inner = (
    <div className={"flex items-center gap-3 py-3 border-b border-zinc-800/60 last:border-0 pressable" + (danger ? ' text-rose-500' : '')}>
      <div className={"w-8 h-8 rounded-lg flex items-center justify-center" + (danger ? ' bg-rose-900/30 text-rose-400' : ' bg-zinc-800 text-zinc-400')}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={"text-[13px] font-medium" + (danger ? ' text-rose-500' : ' text-zinc-200')}>{label}</p>
        {sublabel && <p className="text-xs text-zinc-600 mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <span className="text-zinc-700"><ChevronRightIcon /></span>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return inner;
}

export default function Settings() {
  const { user, loading, isHost, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Settings — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] max-w-lg mx-auto px-4 pb-16 anim-page">
        <div className="h-12" />

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </button>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Settings</h1>
        </div>

        {/* Host section */}
        {isHost && (
          <div className="mb-6 anim-fade-up">
            <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Host</p>
            <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 rounded-2xl border border-amber-700/30 px-4">
              <SettingRow
                icon={<CalendarPlusIcon />}
                label="Host an Event"
                sublabel="Create and manage your events"
                href="/host"
              />
              <SettingRow
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                label="View Participants"
                sublabel="See who registered for your events"
                href="/host"
              />
            </div>
          </div>
        )}

        {/* Account section */}
        <div className="mb-6">
          <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Account</p>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 px-4">
            <SettingRow icon={<UserEditIcon />} label="Edit Profile" sublabel="Name, photo, location" href="/edit-profile" />
            <SettingRow icon={<BellIcon />} label="Notifications" sublabel="Event reminders, ticket alerts" />
            <SettingRow icon={<MapPinIcon />} label="Location" sublabel="Bangalore, IN" />
            <SettingRow icon={<CreditCardIcon />} label="Payment Methods" sublabel="Add UPI, cards" />
            <SettingRow icon={<LockIcon />} label="Privacy and Security" sublabel="Password, account security" href="/privacy-security" />
            <SettingRow icon={<HelpCircleIcon />} label="Help and Support" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="mb-6">
          <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-3 px-1">Account Actions</p>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 px-4">
            <SettingRow icon={<LogOutIcon />} label="Sign Out" danger onClick={handleSignOut} />
          </div>
        </div>

        {/* User info */}
        <div className="text-center mt-8">
          <p className="text-zinc-600 text-xs">{user.email}</p>
          <p className="text-zinc-700 text-xs mt-1">Sneakout v1.0.0 · Made with love in Bangalore</p>
        </div>
      </div>
    </>
  );
}
