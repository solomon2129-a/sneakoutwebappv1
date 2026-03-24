import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { saveTicketToFirestore, getExistingTicket } from '../../lib/tickets';

function BackIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function MapPinIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
}
function CalendarIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
}
function MicIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>);
}
function LoadingSpinner() {
  return (<svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>);
}

function InfoRow({ icon, primary, secondary }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white text-[14px] font-semibold leading-tight">{primary}</p>
        <p className="text-zinc-500 text-[12px] mt-0.5">{secondary}</p>
      </div>
    </div>
  );
}

export default function FirestoreEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addTicket, hasTicket, restoreTicket } = useTickets();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Promo / invite code
  const [promoInput, setPromoInput]   = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // null | { type:'discount', percent, code } | { type:'invite', code }
  const [promoError, setPromoError]   = useState('');

  // Derived sold-out state
  const remaining = event?.totalTickets > 0
    ? Math.max(0, event.totalTickets - (event.ticketsSold || 0))
    : null;
  const isSoldOut = remaining !== null && remaining === 0;

  // Real-time listener — updates instantly when any ticket is sold
  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'events', id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setEvent(snap.exists() ? { ...snap.data(), id: snap.id } : null);
        setFetching(false);
      },
      (err) => {
        console.error('[onSnapshot] event', err);
        setFetching(false);
      }
    );
    return () => unsub();
  }, [id]);

  const owned = event ? hasTicket(event.id) : false;

  // Validate and apply a promo or invite code
  const applyPromoCode = () => {
    if (!promoInput.trim() || !event) return;
    const code = promoInput.trim().toUpperCase();
    setPromoError('');

    // Check invite code first
    if (event.inviteCode && code === event.inviteCode.toUpperCase()) {
      setPromoApplied({ type: 'invite', code });
      return;
    }

    // Check discount codes
    if (event.discountCodes && event.discountCodes.length > 0) {
      const match = event.discountCodes.find((d) => d.code.toUpperCase() === code);
      if (match) {
        setPromoApplied({ type: 'discount', percent: match.percent, code });
        return;
      }
    }

    setPromoError('Invalid code — double-check and try again.');
  };

  const removePromo = () => {
    setPromoApplied(null);
    setPromoInput('');
    setPromoError('');
  };

  const issueTicket = (razorpayPaymentId = null) => {
    const promoData = promoApplied
      ? {
          promoCode:       promoApplied.code,
          promoType:       promoApplied.type,
          discountPercent: promoApplied.type === 'discount' ? promoApplied.percent : null,
        }
      : {};

    const ticket = addTicket({ ...event, razorpayPaymentId });
    if (ticket) {
      saveTicketToFirestore({ ...ticket, razorpayPaymentId, ...promoData }, user).catch(() => {});
    }
    router.push('/ticket/' + event.id);
  };

  const handleGetTicket = async () => {
    if (!user) { router.push('/auth'); return; }
    if (!event) return;

    setLoading(true);

    // ── Anti-duplicate guard ──────────────────────────────────
    // Check Firestore FIRST — in case localStorage was cleared.
    // If a ticket already exists for this user+event, restore it to
    // localStorage and redirect — no new Firestore doc, no double increment.
    const existingFsTicket = await getExistingTicket(user.uid, event.id);
    if (existingFsTicket) {
      restoreTicket(existingFsTicket);
      router.push('/ticket/' + event.id);
      return; // component unmounts — don't call setLoading(false)
    }
    // ─────────────────────────────────────────────────────────

    // Free events — skip payment
    if (event.isFree) {
      await new Promise((r) => setTimeout(r, 500));
      issueTicket();
      setLoading(false);
      return;
    }

    // Paid events — open Razorpay checkout

    // Parse price string like "₹999" → base float
    const priceStr  = String(event.price || '0').replace(/[^0-9.]/g, '');
    const basePrice = parseFloat(priceStr || '0');

    // Apply discount if a discount code is active
    const discountMultiplier = promoApplied?.type === 'discount'
      ? (1 - promoApplied.percent / 100)
      : 1;
    const finalPrice  = Math.round(basePrice * discountMultiplier * 100) / 100;
    const amountPaise = Math.round(finalPrice * 100);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: 'INR',
      name: 'Sneakout',
      description: event.title,
      image: '/icons/icon.svg',
      prefill: {
        name:  user.displayName || '',
        email: user.email || '',
      },
      theme: { color: '#DC2626' },
      modal: {
        ondismiss: () => setLoading(false),
      },
      handler: (response) => {
        // Payment success — issue ticket with payment ID
        // Note: setLoading not called here — router.push in issueTicket unmounts the component
        issueTicket(response.razorpay_payment_id);
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setLoading(false));
      rzp.open();
    } catch (err) {
      console.error('[Razorpay]', err);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <p className="text-zinc-500">Event not found.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{event.title + ' - Sneakout'}</title>
      </Head>

      <div className="min-h-screen bg-[#09090B] anim-page">
        <div className="relative h-[46vh] overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#09090B]" />
          <Link href="/discover" className="absolute top-12 left-4 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 text-white pressable">
            <BackIcon />
          </Link>
          <div className="absolute top-12 right-4">
            <span className="pill text-xs">{event.category}</span>
          </div>
        </div>

        <div className="px-4 pb-36 -mt-2">
          {event.tags && (
            <div className="flex gap-2 flex-wrap mb-3">
              {event.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-zinc-500 font-medium">#{tag}</span>
              ))}
            </div>
          )}

          <h1 className="text-[24px] font-extrabold text-white leading-tight tracking-tight mb-6">{event.title}</h1>

          <div className="space-y-3 mb-6">
            <InfoRow icon={<CalendarIcon />} primary={event.date} secondary={event.time} />
            <InfoRow icon={<MapPinIcon />} primary={event.venue} secondary={event.location} />
          </div>

          <div className="h-px bg-zinc-800 mb-6" />

          {event.description && (
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-white mb-2">About</h3>
              <p className="text-zinc-400 text-[14px] leading-relaxed">{event.description}</p>
            </div>
          )}

          {event.lineup && event.lineup.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[15px] font-bold text-white mb-3">Lineup</h3>
              <div className="space-y-2">
                {event.lineup.map((artist, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400"><MicIcon /></div>
                    <span className="text-zinc-200 text-[14px] font-medium">{artist}</span>
                    {i === 0 && <span className="ml-auto text-[10px] font-semibold text-red-400 bg-red-600/10 border border-red-600/20 px-2 py-0.5 rounded-full">Headliner</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const total     = event.totalTickets || 0;
            const sold      = event.ticketsSold  || 0;
            const remaining = total > 0 ? Math.max(0, total - sold) : null;
            const soldOut   = remaining !== null && remaining === 0;
            const pct       = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;

            return (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-zinc-500 text-xs font-medium mb-0.5">Entry price</p>
                    <p className="text-white text-2xl font-black">
                      {event.isFree ? <span className="text-emerald-400">Free</span> : event.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1.5 text-zinc-600 text-xs mb-0.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Live
                    </p>
                    {remaining !== null ? (
                      <p className={
                        'text-sm font-bold ' +
                        (soldOut ? 'text-rose-400' : remaining <= total * 0.1 ? 'text-amber-400' : 'text-zinc-200')
                      }>
                        {soldOut ? 'Sold Out' : remaining + ' left'}
                      </p>
                    ) : (
                      <p className="text-zinc-400 text-sm font-semibold">—</p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={
                          'h-full rounded-full transition-all duration-500 ' +
                          (soldOut ? 'bg-rose-500' : pct >= 90 ? 'bg-amber-500' : 'bg-red-600')
                        }
                        style={{ width: pct + '%' }}
                      />
                    </div>
                    <p className="text-zinc-600 text-[11px] mt-1.5">
                      {sold} of {total} tickets sold
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Promo / Invite Code ── */}
          {!owned && !isSoldOut && event && !event.isFree &&
            (event.discountCodes?.length > 0 || event.inviteCode) && (
            <div className="mt-3">
              {promoApplied ? (
                /* Code applied — success banner */
                <div className={
                  'flex items-center justify-between px-4 py-3 rounded-2xl border ' +
                  (promoApplied.type === 'invite'
                    ? 'bg-amber-900/15 border-amber-700/30'
                    : 'bg-emerald-900/15 border-emerald-700/30')
                }>
                  <div>
                    <p className={
                      'text-[13px] font-semibold ' +
                      (promoApplied.type === 'invite' ? 'text-amber-400' : 'text-emerald-400')
                    }>
                      {promoApplied.type === 'invite'
                        ? '🎟 Guest access granted!'
                        : `🏷 ${promoApplied.percent}% discount applied!`}
                    </p>
                    <p className="text-zinc-500 text-[11px] mt-0.5 font-mono">{promoApplied.code}</p>
                  </div>
                  <button
                    onClick={removePromo}
                    className="text-zinc-600 text-[12px] font-medium pressable hover:text-zinc-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                /* Code input */
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Have a promo or invite code?"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-zinc-600 font-mono focus:border-red-600/60 transition-colors outline-none"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoInput.trim()}
                    className="px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[13px] font-semibold disabled:opacity-40 pressable flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-rose-400 text-[12px] mt-2 px-1">{promoError}</p>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-lg mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-[#09090B] via-[#09090B]/95 to-transparent">
            {owned ? (
              <Link href={'/ticket/' + event.id} className="w-full py-3 rounded-2xl font-bold text-[16px] tracking-wide flex items-center justify-center bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 pressable">
                View My Ticket
              </Link>
            ) : isSoldOut || event.soldOut ? (
              <div className="w-full py-3 rounded-2xl font-bold text-[16px] tracking-wide flex items-center justify-center bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed">
                Sold Out
              </div>
            ) : event.salesPaused ? (
              <div className="w-full py-3 rounded-2xl font-bold text-[16px] tracking-wide flex items-center justify-center bg-zinc-800 text-amber-500/70 border border-zinc-700 cursor-not-allowed">
                Sales Paused
              </div>
            ) : (
              <button onClick={handleGetTicket} disabled={loading} className="w-full py-3 rounded-2xl font-bold text-[16px] tracking-wide flex items-center justify-center gap-2 bg-red-600 text-white shadow-lg shadow-red-900/40 disabled:opacity-60 pressable">
                {loading ? (
                  <><LoadingSpinner /> Processing…</>
                ) : event.isFree ? (
                  'Get Ticket — Free'
                ) : promoApplied?.type === 'discount' ? (
                  (() => {
                    const base      = parseFloat(String(event.price || '0').replace(/[^0-9.]/g, '') || '0');
                    const discounted = Math.round(base * (1 - promoApplied.percent / 100));
                    return (
                      <span className="flex items-center gap-2">
                        <span className="line-through text-red-300 text-[13px] font-medium opacity-70">{event.price}</span>
                        {'Get Ticket — ₹' + discounted}
                      </span>
                    );
                  })()
                ) : (
                  'Get Ticket — ' + event.price
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
