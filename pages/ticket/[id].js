import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { getTicketById, getFirestoreEvent } from '../../lib/tickets';

const QRCodeSVG = dynamic(
  async () => {
    const { QRCodeSVG } = await import('qrcode.react');
    return { default: QRCodeSVG };
  },
  { ssr: false, loading: () => <div className="w-40 h-40 bg-zinc-100/10 rounded-xl animate-pulse" /> }
);

function BackIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function ShareIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>);
}
function CheckCircleIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
}

function TicketDetail({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-zinc-600 text-[11px] font-medium uppercase tracking-wide flex-shrink-0 pt-0.5">{label}</span>
      <span className={'text-right text-[13px] font-semibold leading-snug ' + (highlight ? 'text-red-400' : 'text-zinc-300')}>{value}</span>
    </div>
  );
}

export default function TicketPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getTicket, addTicket, hydrated } = useTickets();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [eventCancelled, setEventCancelled] = useState(false);

  useEffect(() => {
    if (!id || !hydrated) return;

    // Try to get from localStorage first
    const existing = getTicket(id);
    if (existing) {
      setTicket(existing);
      return;
    }

    // Not in localStorage — try Firestore (for cross-device support)
    if (user) {
      getTicketById(id).then((firestoreTicket) => {
        if (firestoreTicket) {
          setTicket(firestoreTicket);
        } else {
          setNotFound(true);
        }
      }).catch(() => setNotFound(true));
    } else {
      setNotFound(true);
    }
  }, [id, hydrated, user]);

  // Check if the event still exists
  useEffect(() => {
    if (!ticket) return;
    getFirestoreEvent(ticket.id || ticket.eventId).then((ev) => {
      if (!ev) setEventCancelled(true);
    }).catch(() => {});
  }, [ticket]);

  const handleShare = async () => {
    if (!ticket) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ticket to ' + ticket.title,
          text: "I'm going to " + ticket.title + ' on ' + ticket.date + '!',
          url: window.location.href,
        });
      } catch (_) {}
    }
  };

  // Loading state
  if (!hydrated || (!ticket && !notFound)) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (notFound || !ticket) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-zinc-300 font-semibold mb-2">Ticket not found</p>
        <p className="text-zinc-600 text-sm mb-6">This ticket doesn't exist or was removed.</p>
        <Link href="/discover" className="px-6 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold pressable">
          Back to Discover
        </Link>
      </div>
    );
  }

  const qrValue = 'SNEAKOUT:' + ticket.id + ':' + ticket.ticketId + ':' + new Date(ticket.purchasedAt).getTime();

  return (
    <>
      <Head>
        <title>{'Your Ticket - ' + ticket.title}</title>
      </Head>

      <div className="min-h-screen bg-[#09090B] flex flex-col anim-page">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <Link href="/discover" className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </Link>
          <h1 className="text-[14px] font-bold text-white">Your Ticket</h1>
          <button onClick={handleShare} className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 pressable">
            <ShareIcon />
          </button>
        </div>

        {isNew && (
          <div className="mx-4 mb-2 flex items-center gap-2 bg-emerald-600/10 border border-emerald-600/20 rounded-2xl px-4 py-3 anim-fade-in">
            <span className="text-emerald-400"><CheckCircleIcon /></span>
            <p className="text-emerald-300 text-[13px] font-semibold">Ticket confirmed! See you there.</p>
          </div>
        )}

        {eventCancelled && (
          <div className="mx-4 mb-2 bg-red-600/10 border border-red-600/20 rounded-2xl px-4 py-3 anim-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-red-300 text-[13px] font-bold">Event Cancelled or Removed</p>
            </div>
            <p className="text-red-400/60 text-[12px] ml-6">This event has been cancelled by the host. Your ticket is no longer valid for entry. If you paid, contact the organizer for a refund.</p>
          </div>
        )}

        <div className="flex-1 flex items-start justify-center px-4 pb-12 pt-2">
          <div className="w-full max-w-sm anim-fade-up">
            <div className="ticket-body">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={ticket.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />

                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <img src="/logo.png" alt="S" className="w-5 h-5 object-contain" />
                  <span className="text-white font-bold text-[11px] tracking-wide">SNEAKOUT</span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="pill text-[10px] font-bold uppercase tracking-widest">
                    {ticket.isFree ? 'Free Entry' : 'General Admission'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white text-[16px] font-black leading-tight tracking-tight">{ticket.title}</h2>
                </div>
              </div>

              <div className="ticket-perforation py-3">
                <div className="ticket-dash" />
              </div>

              <div className="flex flex-col items-center px-6 pb-6">
                <div className="bg-white rounded-2xl p-3 mb-4 shadow-xl anim-fade-pop">
                  <QRCodeSVG value={qrValue} size={140} bgColor="#FFFFFF" fgColor="#09090B" level="H" includeMargin={false} />
                </div>

                <div className="w-full space-y-3">
                  <TicketDetail label="Event" value={ticket.title} />
                  <TicketDetail label="Date" value={ticket.date + (ticket.time ? ' · ' + ticket.time : '')} />
                  <TicketDetail label="Venue" value={ticket.venue + (ticket.location ? ', ' + ticket.location : '')} />
                  <TicketDetail label="Type" value={ticket.isFree ? 'Free Entry' : 'General - ' + ticket.price} highlight />
                </div>

                <div className="mt-5 w-full pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Ticket ID</p>
                      <p className="text-zinc-300 text-[13px] font-mono font-bold">{ticket.ticketId || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Status</p>
                      {eventCancelled ? (
                        <span className="inline-flex items-center gap-1 text-red-400 text-[12px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                          Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[12px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Valid
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full flex justify-center gap-px opacity-30">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="bg-zinc-400 rounded-[1px]" style={{ width: i % 3 === 0 ? 3 : i % 5 === 0 ? 5 : 2, height: i % 7 === 0 ? 32 : 24 }} />
                  ))}
                </div>
                <p className="text-zinc-700 text-[9px] mt-1 font-mono tracking-widest">
                  {ticket.ticketId || '000000000000'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link
                href={'/e/' + ticket.id}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold flex items-center justify-center pressable"
              >
                Event Details
              </Link>
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 pressable"
              >
                <ShareIcon /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
