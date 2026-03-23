import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveEventToFirestore } from '../../lib/tickets';

/* ── Icons ───────────────────────────────────────────────────── */
function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function LoadingSpinner() {
  return (<svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>);
}
function CalendarIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
}
function ClockIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
}
function MapPinIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
}
function TicketIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>);
}
function PlusIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
}
function XIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function CheckIcon() {
  return (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function UsersIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function TagIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
}
function CopyIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
}
function LockIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
}
function SparkleIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>);
}
function MusicIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>);
}
function FileTextIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
}

/* ── Categories ──────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Electronic', emoji: '🎛️' },
  { label: 'Live Music', emoji: '🎸' },
  { label: 'Rooftop',    emoji: '🌆' },
  { label: 'Networking', emoji: '🤝' },
  { label: 'Rave',       emoji: '🔊' },
  { label: 'Other',      emoji: '✨' },
];

/* ── Auto cover images (one per category) ────────────────────── */
const CATEGORY_IMAGES = {
  'Electronic': 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80',
  'Live Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'Rooftop':    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'Networking': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  'Rave':       'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'Other':      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
};
function pickImage(category) {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Other'];
}

/* ── Helpers ─────────────────────────────────────────────────── */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SNKOUT-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatDateDisplay(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeDisplay(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

/* ── Floating Particles ──────────────────────────────────────── */
function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="create-particle"
          style={{
            left: p.x + '%',
            top: p.y + '%',
            width: p.size + 'px',
            height: p.size + 'px',
            opacity: p.opacity,
            animationDuration: p.duration + 's',
            animationDelay: p.delay + 's',
          }}
        />
      ))}
      {/* Ambient glow orbs */}
      <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-red-600/8 rounded-full blur-[100px] create-glow-pulse" />
      <div className="absolute top-[60%] right-[5%] w-48 h-48 bg-violet-600/6 rounded-full blur-[80px] create-glow-pulse" style={{ animationDelay: '-7s' }} />
      <div className="absolute bottom-[20%] left-[30%] w-56 h-56 bg-amber-500/5 rounded-full blur-[90px] create-glow-pulse" style={{ animationDelay: '-14s' }} />
    </div>
  );
}

/* ── Section Card ────────────────────────────────────────────── */
function SectionCard({ icon, title, accent = 'red', children }) {
  const accentMap = {
    red:     'border-red-900/40 from-red-950/20',
    amber:   'border-amber-900/40 from-amber-950/20',
    emerald: 'border-emerald-900/40 from-emerald-950/20',
    blue:    'border-blue-900/40 from-blue-950/20',
    violet:  'border-violet-900/40 from-violet-950/20',
  };
  const colors = accentMap[accent] || accentMap.red;

  return (
    <div className={`bg-gradient-to-b ${colors.split(' ')[1]} to-zinc-950/0 border ${colors.split(' ')[0]} rounded-3xl overflow-hidden`}>
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
        <span className="text-zinc-500">{icon}</span>
        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.15em]">{title}</p>
      </div>
      <div className="px-5 pb-5">
        {children}
      </div>
    </div>
  );
}

/* ── Input Row ───────────────────────────────────────────────── */
function InputRow({ icon, children, border = true }) {
  return (
    <div className={'flex items-center gap-3 py-3.5' + (border ? ' border-b border-zinc-800/50' : '')}>
      <span className="text-zinc-600 flex-shrink-0">{icon}</span>
      {children}
    </div>
  );
}

const BARE = "flex-1 bg-transparent text-white text-sm placeholder-zinc-600 focus:outline-none";

/* ── Page ────────────────────────────────────────────────────── */
export default function CreateEvent() {
  const { user, loading, isHost } = useAuth();
  const router = useRouter();
  const formRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [lineup, setLineup]         = useState(['']);

  // Guest list & invite code
  const [inviteCode] = useState(() => generateInviteCode());
  const [guestList, setGuestList]   = useState([]);
  const [codeCopied, setCodeCopied] = useState(false);

  // Discount codes
  const [discountCodes, setDiscountCodes] = useState([{ code: '', percent: '' }]);

  const [form, setForm] = useState({
    title:        '',
    category:     'Electronic',
    date:         '',
    time:         '',
    venue:        '',
    location:     '',
    price:        '',
    isFree:       false,
    description:  '',
    totalTickets: '200',
  });

  useEffect(() => {
    if (!loading && !user)   { router.replace('/'); return; }
    if (!loading && !isHost) { router.replace('/discover'); return; }
  }, [user, loading, isHost, router]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Lineup helpers
  const updateLineup    = (i, v) => setLineup((p) => p.map((x, idx) => idx === i ? v : x));
  const addLineupRow    = ()     => setLineup((p) => [...p, '']);
  const removeLineupRow = (i)   => setLineup((p) => p.filter((_, idx) => idx !== i));

  // Guest list helpers
  const updateGuest = (i, v) => setGuestList((p) => p.map((x, idx) => idx === i ? v : x));
  const addGuest    = ()     => setGuestList((p) => [...p, '']);
  const removeGuest = (i)   => setGuestList((p) => p.filter((_, idx) => idx !== i));

  // Discount code helpers
  const updateDiscount     = (i, field, v) => setDiscountCodes((p) => p.map((x, idx) => idx === i ? { ...x, [field]: v } : x));
  const addDiscountCode    = ()             => setDiscountCodes((p) => [...p, { code: '', percent: '' }]);
  const removeDiscountCode = (i)           => setDiscountCodes((p) => p.filter((_, idx) => idx !== i));

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date.trim() || !form.venue.trim()) {
      setError('Event name, date and venue are required.');
      return;
    }
    setError('');
    setSubmitting(true);

    const cleanGuests    = guestList.map((g) => g.trim()).filter(Boolean);
    const cleanDiscounts = discountCodes
      .filter((d) => d.code.trim() && d.percent)
      .map((d) => ({ code: d.code.trim().toUpperCase(), percent: parseInt(d.percent) || 0 }));

    try {
      const newEventId = await saveEventToFirestore({
        title:         form.title.trim(),
        category:      form.category,
        date:          formatDateDisplay(form.date) || form.date,
        time:          formatTimeDisplay(form.time) || form.time,
        venue:         form.venue,
        location:      form.location,
        price:         form.isFree ? 'Free' : (form.price || '₹0'),
        isFree:        form.isFree,
        description:   form.description,
        image:         pickImage(form.category),
        lineup:        lineup.map((l) => l.trim()).filter(Boolean),
        tags:          [form.category.toLowerCase()],
        totalTickets:  parseInt(form.totalTickets) || 200,
        soldOut:       false,
        guestList:     cleanGuests,
        inviteCode:    cleanGuests.length > 0 ? inviteCode : null,
        discountCodes: cleanDiscounts,
      }, user);
      setSuccess(true);
      setTimeout(() => router.push(`/host/manage/${newEventId}`), 1800);
    } catch {
      setError('Failed to publish. Please try again.');
      setSubmitting(false);
    }
  };

  /* Auth guard spinner */
  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* Success screen */
  if (success) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center gap-5 anim-page px-6">
        <Particles />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 create-success-pop">
            <CheckIcon />
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-black mb-1">Event Published!</p>
            <p className="text-zinc-500 text-sm">Your event is now live on Sneakout</p>
          </div>
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  const coverSrc  = pickImage(form.category);
  const hasGuests = guestList.some((g) => g.trim());

  // Minimum date is today
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Head><title>Create Event — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] relative">
        <Particles />

        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-30 bg-[#09090B]/80 backdrop-blur-2xl border-b border-zinc-800/40">
          <div className="max-w-lg mx-auto px-4 flex items-center gap-3" style={{ height: 56 }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable flex-shrink-0"
            >
              <BackIcon />
            </button>
            <div className="flex-1">
              <p className="text-white font-bold text-[15px]">Create Event</p>
              <p className="text-zinc-600 text-[10px] font-medium">Fill in the details below</p>
            </div>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-600 text-white text-[13px] font-bold disabled:opacity-50 pressable shadow-lg shadow-red-900/30 create-publish-glow"
            >
              {submitting && <LoadingSpinner />}
              {submitting ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 max-w-lg mx-auto px-4 pb-24 pt-6 space-y-6 anim-page">

          {/* ── Cover image preview ── */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800/40 create-cover-shine" style={{ aspectRatio: '16/9' }}>
            <img src={coverSrc} alt="cover preview" className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{form.category}</p>
              <h2 className="text-white font-black text-xl leading-tight drop-shadow-lg">
                {form.title || 'Your event name...'}
              </h2>
              {form.date && (
                <p className="text-zinc-400 text-[11px] mt-1.5 font-medium">
                  {formatDateDisplay(form.date)}{form.time ? ' · ' + formatTimeDisplay(form.time) : ''}
                </p>
              )}
            </div>
          </div>

          {/* ── Event name ── */}
          <div className="anim-fade-up">
            <input
              type="text"
              placeholder="Event name *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full bg-transparent text-white text-[26px] font-extrabold placeholder-zinc-700/60 border-b-2 border-zinc-800/60 focus:border-red-600/60 pb-3 transition-colors outline-none"
              required
            />
          </div>

          {/* ── Category ── */}
          <SectionCard icon={<SparkleIcon />} title="Category" accent="violet">
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ label, emoji }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set('category', label)}
                  className={
                    'flex flex-col items-center gap-1.5 py-3.5 rounded-2xl text-[12px] font-semibold transition-all pressable border ' +
                    (form.category === label
                      ? 'bg-red-600/20 border-red-500/40 text-white shadow-lg shadow-red-900/20'
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-500 hover:border-zinc-700')
                  }
                >
                  <span className="text-lg">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* ── When & Where ── */}
          <SectionCard icon={<CalendarIcon />} title="When & Where" accent="blue">
            <div className="space-y-0">
              {/* Date picker */}
              <InputRow icon={<CalendarIcon />}>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className="create-native-input"
                  required
                />
              </InputRow>

              {/* Time picker */}
              <InputRow icon={<ClockIcon />}>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  className="create-native-input"
                />
              </InputRow>

              {/* Venue */}
              <InputRow icon={<MapPinIcon />}>
                <input type="text" placeholder="Venue name *" value={form.venue} onChange={(e) => set('venue', e.target.value)} className={BARE} required />
              </InputRow>

              {/* Location */}
              <InputRow icon={<MapPinIcon />} border={false}>
                <input type="text" placeholder="Area · City" value={form.location} onChange={(e) => set('location', e.target.value)} className={BARE} />
              </InputRow>
            </div>
          </SectionCard>

          {/* ── Tickets & Pricing ── */}
          <SectionCard icon={<TicketIcon />} title="Tickets & Pricing" accent="emerald">
            {/* Paid / Free toggle */}
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
                    onClick={() => set('isFree', val)}
                    className={
                      'px-5 py-2 rounded-[10px] text-[12px] font-bold transition-all ' +
                      (form.isFree === val ? active + ' text-white shadow-lg' : 'text-zinc-600')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price field */}
            {!form.isFree && (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3.5 mb-3 focus-within:border-red-600/50 transition-all">
                <span className="text-zinc-400 text-lg font-bold">₹</span>
                <input type="text" placeholder="Ticket price  ·  e.g. 999" value={form.price} onChange={(e) => set('price', e.target.value)} className={BARE + ' text-lg font-bold'} />
              </div>
            )}

            {/* Total tickets */}
            <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3.5 focus-within:border-red-600/50 transition-all">
              <span className="text-zinc-600"><TicketIcon /></span>
              <input type="number" placeholder="Total tickets available" value={form.totalTickets} onChange={(e) => set('totalTickets', e.target.value)} className={BARE} min="1" />
              <span className="text-zinc-700 text-[11px] font-medium flex-shrink-0">tickets</span>
            </div>
          </SectionCard>

          {/* ── Description ── */}
          <SectionCard icon={<FileTextIcon />} title="About This Event" accent="red">
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Describe the vibe, dress code, lineup details..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-2xl py-3.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600/50 transition-all outline-none resize-none"
                maxLength={500}
              />
              <span className="absolute bottom-3 right-4 text-zinc-700 text-[11px] pointer-events-none">
                {form.description.length}/500
              </span>
            </div>
          </SectionCard>

          {/* ── Lineup ── */}
          <SectionCard icon={<MusicIcon />} title="Lineup" accent="amber">
            <div className="space-y-2.5">
              {lineup.map((artist, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-3 flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3 focus-within:border-red-600/50 transition-all">
                    <span className={
                      'text-[11px] font-black w-5 text-center flex-shrink-0 ' +
                      (i === 0 ? 'text-amber-400' : 'text-zinc-600')
                    }>
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
                    <button
                      type="button"
                      onClick={() => removeLineupRow(i)}
                      className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLineupRow}
                className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-amber-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                  <PlusIcon />
                </div>
                Add artist
              </button>
            </div>
          </SectionCard>

          {/* ── Guest List ── */}
          <SectionCard icon={<UsersIcon />} title="Guest List" accent="amber">
            <p className="text-zinc-600 text-[12px] mb-3 leading-relaxed">
              Add invited guests. A <span className="text-amber-400 font-semibold">secret code</span> is auto-generated — share it with VIPs for access or discounts.
            </p>

            {/* Secret invite code */}
            {hasGuests && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/30 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-amber-500"><LockIcon /></span>
                    <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold">Invite Code</p>
                  </div>
                  <p className="text-amber-400 font-black font-mono text-[18px] tracking-[0.12em]">{inviteCode}</p>
                </div>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className={
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold pressable transition-all ' +
                    (codeCopied
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/20 border border-amber-500/30 text-amber-400')
                  }
                >
                  {codeCopied ? '✓ Copied' : <><CopyIcon /> Copy</>}
                </button>
              </div>
            )}

            {/* Guest inputs */}
            <div className="space-y-2">
              {guestList.length === 0 && (
                <p className="text-zinc-700 text-[12px] py-0.5">No guests added yet — optional.</p>
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
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0"
                  >
                    <XIcon />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGuest}
                className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-amber-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                  <PlusIcon />
                </div>
                Add guest
              </button>
            </div>
          </SectionCard>

          {/* ── Discount Codes ── */}
          <SectionCard icon={<TagIcon />} title="Discount Codes" accent="emerald">
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
                    <button
                      type="button"
                      onClick={() => removeDiscountCode(i)}
                      className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 pressable flex-shrink-0"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDiscountCode}
                className="flex items-center gap-2 text-zinc-500 text-[13px] font-semibold mt-1 pressable hover:text-emerald-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                  <PlusIcon />
                </div>
                Add discount code
              </button>
            </div>
          </SectionCard>

          {/* ── Error ── */}
          {error && (
            <div className="bg-rose-900/20 border border-rose-700/30 rounded-2xl px-4 py-3">
              <p className="text-rose-400 text-[13px]">{error}</p>
            </div>
          )}

          {/* ── Bottom publish button ── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 disabled:opacity-60 pressable create-publish-glow"
          >
            {submitting ? <><LoadingSpinner /> Publishing…</> : 'Publish Event'}
          </button>

        </form>
      </div>
    </>
  );
}
