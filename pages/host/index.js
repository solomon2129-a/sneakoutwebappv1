import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFirestoreEvents, deleteEventFromFirestore } from '../../lib/tickets';

/* ── Icons ── */
function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
}
function PlusIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
}
function UsersIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function ScanIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 7 4"/><polyline points="4 17 4 20 7 20"/><polyline points="17 4 20 4 20 7"/><polyline points="17 20 20 20 20 17"/><line x1="4" y1="12" x2="20" y2="12"/></svg>);
}
function CalendarIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
}
function TicketIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>);
}
function StarIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
}
function MapPinIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
}
function EditIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
}
function TrashIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
}

/* ── Stat card ── */
function StatCard({ value, label, icon, accent }) {
  return (
    <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 p-4 flex flex-col gap-2">
      <div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + accent}>
        {icon}
      </div>
      <p className="text-white font-black text-2xl leading-none">{value}</p>
      <p className="text-zinc-600 text-[11px] font-medium">{label}</p>
    </div>
  );
}

/* ── Event card ── */
function EventCard({ event, index, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await onDelete(event.id);
    setDeleting(false);
    setConfirming(false);
  };

  return (
    <div
      className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden anim-slide-in"
      style={{ animationDelay: (index * 0.08) + 's' }}
    >
      {/* Cover */}
      <div className="relative h-40 bg-zinc-800">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <CalendarIcon />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10">
            {event.category}
          </span>
        </div>

        {/* Ticket count */}
        {event.totalTickets && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-zinc-300 text-[10px] font-semibold border border-white/10">
              <TicketIcon /> {event.totalTickets}
            </span>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-extrabold text-[17px] leading-tight mb-1">{event.title}</h3>
          <div className="flex items-center gap-3 text-zinc-400 text-[12px]">
            <span className="flex items-center gap-1">
              <CalendarIcon /> {event.date}{event.time ? ' · ' + event.time : ''}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1 truncate">
                <MapPinIcon /> {event.venue}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className={
          'text-[13px] font-bold ' +
          (event.isFree ? 'text-emerald-400' : 'text-white')
        }>
          {event.isFree ? 'Free Entry' : event.price}
        </span>
        <Link
          href={'/e/' + event.id}
          className="text-zinc-500 text-[11px] font-semibold hover:text-zinc-300 transition-colors pressable"
        >
          View public page →
        </Link>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 divide-x divide-zinc-800">
        <Link
          href={'/host/manage/' + event.id}
          className="flex items-center justify-center gap-1.5 py-3.5 text-red-400 text-[12px] font-semibold pressable hover:bg-zinc-800/60 transition-colors"
        >
          <EditIcon />
          Manage Event
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={'flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold pressable hover:bg-zinc-800/60 transition-colors disabled:opacity-50 ' + (confirming ? 'text-rose-400' : 'text-zinc-600')}
        >
          <TrashIcon />
          {deleting ? '...' : confirming ? 'Sure?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function HostDashboard() {
  const { user, loading, isHost } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user)   { router.replace('/'); return; }
    if (!loading && !isHost) { router.replace('/discover'); return; }
  }, [user, loading, isHost, router]);

  useEffect(() => {
    if (!isHost || !user) return;
    getFirestoreEvents()
      .then((all) => setEvents(all.filter((e) => e.createdBy === user.uid)))
      .finally(() => setFetching(false));
  }, [isHost, user]);

  const handleDeleteEvent = async (eventId) => {
    const ok = await deleteEventFromFirestore(eventId);
    if (ok) setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Host';

  return (
    <>
      <Head><title>Host Dashboard — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] anim-page">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden">
          {/* Amber glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="max-w-lg mx-auto px-4 pt-14 pb-8">
            {/* Nav row */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => router.push('/profile')}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable flex-shrink-0"
              >
                <BackIcon />
              </button>
              <div className="flex-1" />
              <Link
                href="/host/create"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white text-[13px] font-bold pressable shadow-lg shadow-red-900/30"
              >
                <PlusIcon /> New Event
              </Link>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-3 mb-1">
              {user.photoURL ? (
                <img src={user.photoURL} alt={displayName} className="w-12 h-12 rounded-2xl object-cover border border-zinc-700 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="flex items-center gap-1 text-amber-400 text-[11px] font-bold uppercase tracking-widest">
                    <StarIcon /> Host
                  </span>
                </div>
                <p className="text-white font-extrabold text-xl leading-none">{displayName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-24 space-y-8">

          {/* ── Stats ── */}
          <div className="flex gap-3">
            <StatCard
              value={fetching ? '—' : events.length}
              label="Events Created"
              icon={<span className="text-amber-400"><CalendarIcon /></span>}
              accent="bg-amber-500/10 text-amber-400"
            />
            <StatCard
              value={fetching ? '—' : events.reduce((s, e) => s + (e.totalTickets || 0), 0)}
              label="Total Capacity"
              icon={<span className="text-red-400"><TicketIcon /></span>}
              accent="bg-red-500/10 text-red-400"
            />
            <StatCard
              value={fetching ? '—' : events.length}
              label="Upcoming"
              icon={<span className="text-emerald-400"><UsersIcon /></span>}
              accent="bg-emerald-500/10 text-emerald-400"
            />
          </div>

          {/* ── Events list ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-extrabold text-white">Your Events</h2>
              {events.length > 0 && (
                <span className="text-zinc-600 text-xs font-semibold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  {events.length}
                </span>
              )}
            </div>

            {fetching ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-52 rounded-3xl shimmer" />
                ))}
              </div>
            ) : events.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
                    </svg>
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                </div>
                <p className="text-zinc-200 font-bold text-[17px] mb-2">No events yet</p>
                <p className="text-zinc-600 text-sm mb-8 max-w-xs">
                  Create your first event and start selling tickets to your audience.
                </p>
                <Link
                  href="/host/create"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-[14px] pressable shadow-lg shadow-red-900/30"
                >
                  <PlusIcon /> Create First Event
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} onDelete={handleDeleteEvent} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
