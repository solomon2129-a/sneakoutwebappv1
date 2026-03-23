import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getTicketsForEvent, getFirestoreEvent } from '../../../lib/tickets';

function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function ScanIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 7 4"/><polyline points="4 17 4 20 7 20"/><polyline points="17 4 20 4 20 7"/><polyline points="17 20 20 20 20 17"/><line x1="4" y1="12" x2="20" y2="12"/></svg>);
}
function CheckIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function ClockIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
}

export default function EventParticipants() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, isHost } = useAuth();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) { router.replace('/'); return; }
    if (!loading && !isHost) { router.replace('/discover'); return; }
  }, [user, loading, isHost, router]);

  useEffect(() => {
    if (!id || !isHost) return;
    Promise.all([
      getFirestoreEvent(id),
      getTicketsForEvent(id),
    ]).then(([evt, tix]) => {
      setEvent(evt);
      // Deduplicate by userId — keep the earliest ticket per user.
      // Guards against any duplicate Firestore docs from edge-case rebooks.
      const seenUsers = new Set();
      const unique = tix
        .sort((a, b) => (a.purchasedAt < b.purchasedAt ? -1 : 1))
        .filter((t) => {
          if (seenUsers.has(t.userId)) return false;
          seenUsers.add(t.userId);
          return true;
        });
      setTickets(unique);
    }).finally(() => setFetching(false));
  }, [id, isHost]);

  const filtered = tickets.filter((t) =>
    !search ||
    (t.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.ticketId || '').toLowerCase().includes(search.toLowerCase())
  );

  const checkedIn = tickets.filter((t) => t.checkedIn).length;

  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Participants - Sneakout</title></Head>
      <div className="min-h-screen bg-[#09090B] max-w-lg mx-auto px-4 pb-16 anim-page">
        <div className="h-14" />
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/host')} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-white tracking-tight truncate">{event ? event.title : 'Participants'}</h1>
            <p className="text-zinc-500 text-xs mt-0.5">{event ? event.date + ' - ' + event.venue : 'Loading...'}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6 mt-6">
          {[
            { label: 'Registered', value: tickets.length, color: 'text-white' },
            { label: 'Checked In', value: checkedIn, color: 'text-emerald-400' },
            { label: 'Remaining', value: tickets.length - checkedIn, color: 'text-zinc-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 py-4 text-center">
              <p className={'font-bold text-lg ' + color}>{fetching ? '-' : value}</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {id && (
          <button
            onClick={() => router.push('/host/scan/' + id)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-[14px] mb-6 pressable"
          >
            <ScanIcon /> Open QR Scanner
          </button>
        )}

        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search by name, email or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
          />
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <p className="text-zinc-300 font-semibold">No participants yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              {tickets.length === 0 ? 'No one has registered for this event' : 'No results for your search'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t, i) => (
              <div
                key={t.ticketId}
                className={'flex items-center gap-3 p-3 rounded-2xl border anim-slide-in ' + (t.checkedIn ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-zinc-900 border-zinc-800')}
                style={{ animationDelay: (i * 0.04) + 's' }}
              >
                {t.userPhotoURL ? (
                  <img src={t.userPhotoURL} alt={t.userName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-[14px] flex-shrink-0">
                    {(t.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[14px] truncate">{t.userName || 'Attendee'}</p>
                  <p className="text-zinc-500 text-[11px] truncate">{t.userEmail}</p>
                  <p className="text-zinc-600 text-[10px] font-mono mt-0.5">{t.ticketId}</p>
                </div>
                <div className="flex-shrink-0">
                  {t.checkedIn ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30">
                      <CheckIcon /> In
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 text-[11px] font-semibold border border-zinc-700">
                      <ClockIcon /> Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
