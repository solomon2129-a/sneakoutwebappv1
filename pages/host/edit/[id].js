import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getFirestoreEvent, updateEventInFirestore } from '../../../lib/tickets';

/* ── Icons ── */
function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function LoadingSpinner() {
  return (<svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>);
}
function PlusIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
}
function XIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function CheckIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function CopyIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
}
function LockIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
}
function TagIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
}
function UsersIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function TicketIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>);
}
function MusicIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>);
}
function FileTextIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
}

/* ── Helpers ── */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SNKOUT-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/* ── Section wrapper ── */
function Section({ icon, title, accent = 'red', children }) {
  const colors = {
    red:     'border-red-900/40',
    amber:   'border-amber-900/40',
    emerald: 'border-emerald-900/40',
    blue:    'border-blue-900/40',
  };
  return (
    <div className={'border rounded-3xl overflow-hidden ' + (colors[accent] || colors.red)}>
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
        <span className="text-zinc-500">{icon}</span>
        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.15em]">{title}</p>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

export default function EditEvent() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, isHost } = useAuth();

  const [event, setEvent] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [description, setDescription] = useState('');
  const [totalTickets, setTotalTickets] = useState('200');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [lineup, setLineup] = useState(['']);
  const [guestList, setGuestList] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [discountCodes, setDiscountCodes] = useState([{ code: '', percent: '' }]);
  const [codeCopied, setCodeCopied] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.replace('/'); return; }
    if (!loading && !isHost) { router.replace('/discover'); return; }
  }, [user, loading, isHost, router]);

  // Load event data
  useEffect(() => {
    if (!id || !isHost) return;
    getFirestoreEvent(id).then((evt) => {
      if (!evt) { setFetching(false); return; }
      setEvent(evt);
      setDescription(evt.description || '');
      setTotalTickets(String(evt.totalTickets || 200));
      setPrice(evt.price || '');
      setIsFree(evt.isFree || false);
      setLineup(evt.lineup && evt.lineup.length > 0 ? evt.lineup : ['']);
      setGuestList(evt.guestList || []);
      setInviteCode(evt.inviteCode || '');
      setDiscountCodes(
        evt.discountCodes && evt.discountCodes.length > 0
          ? evt.discountCodes.map((d) => ({ code: d.code, percent: String(d.percent) }))
          : [{ code: '', percent: '' }]
      );
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id, isHost]);

  // Lineup helpers
  const updateLineup    = (i, v) => setLineup((p) => p.map((x, idx) => idx === i ? v : x));
  const addLineupRow    = ()     => setLineup((p) => [...p, '']);
  const removeLineupRow = (i)    => setLineup((p) => p.filter((_, idx) => idx !== i));

  // Guest list helpers
  const updateGuest = (i, v) => setGuestList((p) => p.map((x, idx) => idx === i ? v : x));
  const addGuest    = ()     => setGuestList((p) => [...p, '']);
  const removeGuest = (i)    => setGuestList((p) => p.filter((_, idx) => idx !== i));

  // Discount code helpers
  const updateDiscount     = (i, field, v) => setDiscountCodes((p) => p.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const addDiscountCode    = ()             => setDiscountCodes((p) => [...p, { code: '', percent: '' }]);
  const removeDiscountCode = (i)           => setDiscountCodes((p) => p.filter((_, idx) => idx !== i));

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);

    const cleanGuests = guestList.map((g) => g.trim()).filter(Boolean);
    const cleanDiscounts = discountCodes
      .filter((d) => d.code.trim() && d.percent)
      .map((d) => ({ code: d.code.trim().toUpperCase(), percent: parseInt(d.percent) || 0 }));

    // Auto-generate invite code if guests added but no code exists
    const finalInviteCode = cleanGuests.length > 0
      ? (inviteCode || generateInviteCode())
      : null;

    if (cleanGuests.length > 0 && !inviteCode) {
      setInviteCode(finalInviteCode);
    }

    const ok = await updateEventInFirestore(id, {
      description,
      totalTickets: parseInt(totalTickets) || 200,
      price: isFree ? 'Free' : (price || '₹0'),
      isFree,
      lineup: lineup.map((l) => l.trim()).filter(Boolean),
      guestList: cleanGuests,
      inviteCode: finalInviteCode,
      discountCodes: cleanDiscounts,
    });

    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

  const hasGuests = guestList.some((g) => g.trim());

  return (
    <>
      <Head><title>Edit {event.title} — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B]">
        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-30 bg-[#09090B]/80 backdrop-blur-2xl border-b border-zinc-800/40">
          <div className="max-w-lg mx-auto px-4 flex items-center gap-3" style={{ height: 56 }}>
            <button
              type="button"
              onClick={() => router.push('/host')}
              className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable flex-shrink-0"
            >
              <BackIcon />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[15px] truncate">{event.title}</p>
              <p className="text-zinc-600 text-[10px] font-medium">Edit event details</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-600 text-white text-[13px] font-bold disabled:opacity-50 pressable shadow-lg shadow-red-900/30"
            >
              {saving ? <><LoadingSpinner /> Saving...</> : saved ? <><CheckIcon /> Saved!</> : 'Save'}
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-24 pt-6 space-y-6 anim-page">

          {/* ── Event info banner ── */}
          <div className="flex items-center gap-3 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            {event.image && (
              <img src={event.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[15px] truncate">{event.title}</p>
              <p className="text-zinc-500 text-[12px]">{event.date}{event.time ? ' · ' + event.time : ''}</p>
              <p className="text-zinc-600 text-[11px]">{event.venue}{event.location ? ' · ' + event.location : ''}</p>
            </div>
            <span className={'text-[12px] font-bold px-2.5 py-1 rounded-full border ' + (event.isFree ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-white bg-zinc-800 border-zinc-700')}>
              {event.isFree ? 'Free' : event.price}
            </span>
          </div>

          {/* ── Tickets & Pricing ── */}
          <Section icon={<TicketIcon />} title="Tickets & Pricing" accent="emerald">
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-300 text-sm font-medium">Entry type</p>
              <div className="flex bg-zinc-900 rounded-xl p-0.5 border border-zinc-800/60">
                {[
                  { label: 'Paid', val: false, active: 'bg-red-600' },
                  { label: 'Free', val: true,  active: 'bg-emerald-600' },
                ].map(({ label, val, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIsFree(val)}
                    className={
                      'px-5 py-2 rounded-[10px] text-[12px] font-bold transition-all ' +
                      (isFree === val ? active + ' text-white shadow-lg' : 'text-zinc-600')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!isFree && (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3.5 mb-3 focus-within:border-red-600/50 transition-all">
                <span className="text-zinc-400 text-lg font-bold">₹</span>
                <input type="text" placeholder="Ticket price" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1 bg-transparent text-white text-lg font-bold placeholder-zinc-600 focus:outline-none" />
              </div>
            )}

            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3.5 focus-within:border-red-600/50 transition-all">
              <span className="text-zinc-600"><TicketIcon /></span>
              <input type="number" placeholder="Total tickets" value={totalTickets} onChange={(e) => setTotalTickets(e.target.value)} className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none" min="1" />
              <span className="text-zinc-700 text-[11px] font-medium flex-shrink-0">tickets</span>
            </div>

            {event.ticketsSold > 0 && (
              <p className="text-zinc-600 text-[11px] mt-2 px-1">
                {event.ticketsSold} ticket{event.ticketsSold !== 1 ? 's' : ''} already sold
              </p>
            )}
          </Section>

          {/* ── Description ── */}
          <Section icon={<FileTextIcon />} title="Description" accent="red">
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Describe the vibe, dress code, lineup details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-2xl py-3.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600/50 transition-all outline-none resize-none"
                maxLength={500}
              />
              <span className="absolute bottom-3 right-4 text-zinc-700 text-[11px] pointer-events-none">
                {description.length}/500
              </span>
            </div>
          </Section>

          {/* ── Lineup ── */}
          <Section icon={<MusicIcon />} title="Lineup" accent="amber">
            <div className="space-y-2.5">
              {lineup.map((artist, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-3 flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3 focus-within:border-red-600/50 transition-all">
                    <span className={'text-[11px] font-black w-5 text-center flex-shrink-0 ' + (i === 0 ? 'text-amber-400' : 'text-zinc-600')}>
                      {i === 0 ? '★' : String(i + 1).padStart(2, '0')}
                    </span>
                    <input
                      type="text"
                      placeholder={i === 0 ? 'Headliner' : 'Artist / act'}
                      value={artist}
                      onChange={(e) => updateLineup(i, e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                  {lineup.length > 1 && (
                    <button type="button" onClick={() => removeLineupRow(i)} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0">
                      <XIcon />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLineupRow} className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-amber-400 transition-colors">
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center"><PlusIcon /></div>
                Add artist
              </button>
            </div>
          </Section>

          {/* ── Guest List ── */}
          <Section icon={<UsersIcon />} title="Guest List" accent="amber">
            <p className="text-zinc-600 text-[12px] mb-3 leading-relaxed">
              Add or remove invited guests. The invite code lets VIPs access or get a discount.
            </p>

            {/* Invite code */}
            {(hasGuests || inviteCode) && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/30 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-amber-500"><LockIcon /></span>
                    <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold">Invite Code</p>
                  </div>
                  <p className="text-amber-400 font-black font-mono text-[18px] tracking-[0.12em]">{inviteCode || 'None'}</p>
                </div>
                {inviteCode && (
                  <button
                    type="button"
                    onClick={copyInviteCode}
                    className={'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold pressable transition-all ' + (codeCopied ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border border-amber-500/30 text-amber-400')}
                  >
                    {codeCopied ? '✓ Copied' : <><CopyIcon /> Copy</>}
                  </button>
                )}
              </div>
            )}

            {/* Guest inputs */}
            <div className="space-y-2">
              {guestList.length === 0 && (
                <p className="text-zinc-700 text-[12px] py-0.5">No guests added yet.</p>
              )}
              {guestList.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-2.5 focus-within:border-red-600/50 transition-all">
                    <span className="text-zinc-600 text-[11px] font-bold w-4 text-center flex-shrink-0">{i + 1}</span>
                    <input
                      type="text"
                      placeholder="Guest name"
                      value={name}
                      onChange={(e) => updateGuest(i, e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                  <button type="button" onClick={() => removeGuest(i)} className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0">
                    <XIcon />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addGuest} className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-amber-400 transition-colors">
                <div className="w-7 h-7 rounded-full border border-dashed border-zinc-700 flex items-center justify-center"><PlusIcon /></div>
                Add guest
              </button>
            </div>
          </Section>

          {/* ── Discount Codes ── */}
          <Section icon={<TagIcon />} title="Discount Codes" accent="emerald">
            <p className="text-zinc-600 text-[12px] mb-3 leading-relaxed">
              Create promo codes with a % discount. Price is recalculated before payment.
            </p>
            <div className="space-y-2.5">
              {discountCodes.map((dc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-red-600/50 transition-all">
                    <span className="text-zinc-600 flex-shrink-0"><TagIcon /></span>
                    <input
                      type="text"
                      placeholder="e.g. FRIEND30"
                      value={dc.code}
                      onChange={(e) => updateDiscount(i, 'code', e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent text-white text-sm font-mono placeholder-zinc-600 focus:outline-none min-w-0"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <input
                        type="number"
                        placeholder="0"
                        value={dc.percent}
                        onChange={(e) => updateDiscount(i, 'percent', e.target.value)}
                        className="w-12 bg-zinc-800/80 border border-zinc-700/60 text-white text-sm text-center rounded-lg py-1.5 focus:outline-none focus:border-red-600/50 transition-colors"
                        min="1"
                        max="100"
                      />
                      <span className="text-zinc-600 text-[12px] font-semibold">%</span>
                    </div>
                  </div>
                  {discountCodes.length > 1 && (
                    <button type="button" onClick={() => removeDiscountCode(i)} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0">
                      <XIcon />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDiscountCode} className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-emerald-400 transition-colors">
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center"><PlusIcon /></div>
                Add discount code
              </button>
            </div>
          </Section>

          {/* ── Bottom save button ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 disabled:opacity-60 pressable"
          >
            {saving ? <><LoadingSpinner /> Saving Changes...</> : saved ? <><CheckIcon /> Saved!</> : 'Save Changes'}
          </button>

        </div>
      </div>
    </>
  );
}
