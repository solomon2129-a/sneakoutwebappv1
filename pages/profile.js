import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { getFirestoreEvent } from '../lib/tickets';

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function TicketItem({ ticket, index, eventStatus }) {
  const isCancelled = eventStatus === 'cancelled';

  return (
    <div
      className="anim-slide-in"
      style={{ animationDelay: (0.05 + index * 0.06) + "s" }}
    >
      <Link
        href={"/ticket/" + ticket.id}
        className={`flex items-center gap-3 p-3 rounded-2xl border pressable ${
          isCancelled
            ? 'bg-zinc-900/50 border-zinc-800/50 opacity-70'
            : 'bg-zinc-900 border-zinc-800'
        }`}
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
          <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${isCancelled ? 'bg-black/60' : 'bg-black/20'}`} />
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400">
              <AlertIcon />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`font-semibold text-[14px] truncate ${isCancelled ? 'text-zinc-500' : 'text-white'}`}>{ticket.title}</p>
          </div>
          <p className="text-zinc-500 text-[12px] mt-0.5">{ticket.date} · {ticket.time}</p>
          {isCancelled ? (
            <p className="text-red-400/80 text-[11px] mt-0.5 font-semibold">Event cancelled or removed</p>
          ) : (
            <p className="text-zinc-600 text-[11px] mt-0.5 font-mono">{ticket.ticketId}</p>
          )}
        </div>
        <div className="text-zinc-600 flex-shrink-0">
          <ChevronRightIcon />
        </div>
      </Link>
    </div>
  );
}

export default function Profile() {
  const { tickets, hydrated } = useTickets();
  const { user, loading, isHost } = useAuth();
  const router = useRouter();
  const [eventStatuses, setEventStatuses] = useState({});

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  // Validate tickets: check if their events still exist in Firestore
  useEffect(() => {
    if (!hydrated || tickets.length === 0) return;
    const check = async () => {
      const statuses = {};
      await Promise.all(
        tickets.map(async (t) => {
          try {
            const ev = await getFirestoreEvent(t.id);
            statuses[t.id] = ev ? 'active' : 'cancelled';
          } catch {
            statuses[t.id] = 'active'; // assume active if offline
          }
        })
      );
      setEventStatuses(statuses);
    };
    check();
  }, [hydrated, tickets]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Sneakout User';
  const initials = displayName.charAt(0).toUpperCase();
  const memberSince = user.metadata && user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    : 'Recently';

  return (
    <>
      <Head>
        <title>Sneakout — Profile</title>
      </Head>

      <Layout>
        <div className="pb-36">
          <div className="h-14" />

          <div className="px-4 mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile</h1>
            <Link
              href="/settings"
              className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable"
            >
              <SettingsIcon />
            </Link>
          </div>

          <div className="px-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={displayName} className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-700" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-red-900/30">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#09090B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h2 className="text-xl font-bold text-white truncate">{displayName}</h2>
                  {isHost && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                      <StarIcon /> Host
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-sm truncate">{user.email}</p>
                <p className="text-zinc-600 text-xs mt-1">Bangalore, IN</p>
              </div>
            </div>

            <div className="flex mt-6 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden divide-x divide-zinc-800">
              {[
                { value: hydrated ? tickets.length : '—', label: 'Tickets' },
                { value: hydrated ? tickets.length : '—', label: 'Upcoming' },
                { value: memberSince, label: 'Member Since' },
              ].map(({ value, label }) => (
                <div key={label} className="flex-1 py-4 text-center">
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-zinc-600 text-[11px] font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="px-4 mb-8 anim-fade-up">
              <Link href="/host" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-700/30 pressable">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-amber-300 font-bold text-[14px]">Host Dashboard</p>
                  <p className="text-amber-600/80 text-[12px] mt-0.5">Manage events, view participants and scan QR</p>
                </div>
                <div className="text-amber-600"><ChevronRightIcon /></div>
              </Link>
            </div>
          )}

          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-white">My Tickets</h2>
              <span className="text-zinc-600 text-xs font-medium bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                {hydrated ? tickets.length : 0}
              </span>
            </div>

            {!hydrated ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket, i) => (
                  <TicketItem key={ticket.ticketId} ticket={ticket} index={i} eventStatus={eventStatuses[ticket.id]} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                <div className="text-zinc-700 mb-3"><TicketIcon /></div>
                <p className="text-zinc-300 font-semibold text-sm">No tickets yet</p>
                <p className="text-zinc-600 text-xs mt-1">Discover events and grab your first ticket</p>
                <Link href="/discover" className="mt-4 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold pressable">
                  Discover Events
                </Link>
              </div>
            )}
          </div>

          <div className="px-4 mt-4 text-center">
            <p className="text-zinc-700 text-xs">Sneakout v1.0.0 · Made with love in Bangalore</p>
          </div>
        </div>
      </Layout>
    </>
  );
}
