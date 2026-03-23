import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  getFirestoreEvent,
  getTicketsForEvent,
  updateEventInFirestore,
  deleteEventFromFirestore,
} from '../../../lib/tickets';

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */
function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
}
function UsersIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function TicketIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>);
}
function ScanIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 7 4"/><polyline points="4 17 4 20 7 20"/><polyline points="17 4 20 4 20 7"/><polyline points="17 20 20 20 20 17"/><line x1="4" y1="12" x2="20" y2="12"/></svg>);
}
function EditIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
}
function ShareIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>);
}
function CopyIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
}
function CheckIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function PlusIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
}
function TrashIcon() {
  return (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>);
}
function XIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function DollarIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
}
function CalendarIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
}
function MapPinIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
}
function SearchIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
}
function PauseIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>);
}
function PlayIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
}

/* ═══════════════════════════════════════════
   Helper components
   ═══════════════════════════════════════════ */
function StatCard({ value, label, icon, color }) {
  return (
    <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-white font-black text-xl leading-none">{value}</p>
      <p className="text-zinc-600 text-[10px] font-semibold mt-1">{label}</p>
    </div>
  );
}

function SectionHeader({ title, count, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-bold text-[15px]">{title}</h3>
        {count !== undefined && (
          <span className="text-zinc-600 text-[11px] font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */
export default function ManageEvent() {
  const { user, loading: authLoading, isHost } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Guest list state
  const [newGuest, setNewGuest] = useState('');
  const [guestList, setGuestList] = useState([]);
  const [inviteCode, setInviteCode] = useState('');

  // Discount codes state
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [copied, setCopied] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user)   router.replace('/');
    if (!authLoading && !isHost) router.replace('/discover');
  }, [user, authLoading, isHost, router]);

  // Fetch event + tickets
  useEffect(() => {
    if (!id || !user) return;
    Promise.all([getFirestoreEvent(id), getTicketsForEvent(id)])
      .then(([ev, tix]) => {
        if (!ev || ev.createdBy !== user.uid) { router.replace('/host'); return; }
        setEvent(ev);
        setTickets(tix);
        setGuestList(ev.guestList || []);
        setInviteCode(ev.inviteCode || '');
        setDiscountCodes(ev.discountCodes || []);
      })
      .finally(() => setFetching(false));
  }, [id, user, router]);

  /* ── Helpers ── */
  const copyToClipboard = useCallback((text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }, []);

  const flashSaved = useCallback((msg) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2000);
  }, []);

  /* ── Guest List ── */
  const addGuest = () => {
    const name = newGuest.trim();
    if (!name || guestList.includes(name)) return;
    const updated = [...guestList, name];
    const code = inviteCode || `SNKOUT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setGuestList(updated);
    setInviteCode(code);
    setNewGuest('');
    saveField({ guestList: updated, inviteCode: code }, 'Guest added');
  };

  const removeGuest = (name) => {
    const updated = guestList.filter((g) => g !== name);
    setGuestList(updated);
    saveField({ guestList: updated }, 'Guest removed');
  };

  /* ── Discount Codes ── */
  const addDiscount = () => {
    const code = newCode.trim().toUpperCase();
    const pct = parseInt(newPercent, 10);
    if (!code || !pct || pct < 1 || pct > 100) return;
    if (discountCodes.some((d) => d.code === code)) return;
    const updated = [...discountCodes, { code, percent: pct }];
    setDiscountCodes(updated);
    setNewCode('');
    setNewPercent('');
    saveField({ discountCodes: updated }, 'Discount added');
  };

  const removeDiscount = (code) => {
    const updated = discountCodes.filter((d) => d.code !== code);
    setDiscountCodes(updated);
    saveField({ discountCodes: updated }, 'Discount removed');
  };

  /* ── Event Controls ── */
  const toggleSales = async () => {
    const paused = !event.salesPaused;
    const ok = await updateEventInFirestore(id, { salesPaused: paused });
    if (ok) {
      setEvent((e) => ({ ...e, salesPaused: paused }));
      flashSaved(paused ? 'Sales paused' : 'Sales resumed');
    }
  };

  const markSoldOut = async () => {
    const ok = await updateEventInFirestore(id, { soldOut: true });
    if (ok) {
      setEvent((e) => ({ ...e, soldOut: true }));
      flashSaved('Marked sold out');
    }
  };

  const unmarkSoldOut = async () => {
    const ok = await updateEventInFirestore(id, { soldOut: false });
    if (ok) {
      setEvent((e) => ({ ...e, soldOut: false }));
      flashSaved('Reopened sales');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteEventFromFirestore(id);
    router.replace('/host');
  };

  /* ── Save helper ── */
  const saveField = async (updates, msg) => {
    setSaving(true);
    await updateEventInFirestore(id, updates);
    setSaving(false);
    flashSaved(msg || 'Saved');
  };

  /* ── Derived data ── */
  const checkedIn = tickets.filter((t) => t.checkedIn).length;
  const totalSold = tickets.length;
  const totalCapacity = event?.totalTickets || 0;
  const revenue = event?.isFree ? 0 : tickets.length * (parseFloat(String(event?.price || '0').replace(/[^\d.]/g, '')) || 0);

  const filteredTickets = tickets.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (t.userName || '').toLowerCase().includes(s) ||
      (t.userEmail || '').toLowerCase().includes(s) ||
      (t.ticketId || '').toLowerCase().includes(s)
    );
  });

  // Deduplicate by userId
  const seen = new Set();
  const uniqueTickets = filteredTickets.filter((t) => {
    if (seen.has(t.userId)) return false;
    seen.add(t.userId);
    return true;
  });

  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${id}` : '';

  /* ── Loading / Auth guard ── */
  if (authLoading || fetching || !event) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'attendees', label: 'Attendees' },
    { key: 'guestlist', label: 'Guest List' },
    { key: 'discounts', label: 'Discounts' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <>
      <Head><title>Manage — {event.title}</title></Head>

      <div className="min-h-screen bg-[#09090B] anim-page">

        {/* ── Event Header ── */}
        <div className="relative">
          <div className="h-44 bg-zinc-800">
            {event.image && <img src={event.image} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
          </div>

          <div className="absolute top-0 left-0 right-0 px-4 pt-12">
            <div className="max-w-lg mx-auto flex items-center gap-3">
              <button onClick={() => router.push('/host')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white pressable">
                <BackIcon />
              </button>
              <div className="flex-1" />
              <Link href={`/host/scan/${id}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[12px] font-bold pressable backdrop-blur-sm">
                <ScanIcon /> Scan QR
              </Link>
              <Link href={`/host/edit/${id}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[12px] font-bold pressable backdrop-blur-sm">
                <EditIcon /> Edit
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold">{event.category}</span>
                {event.soldOut && <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold">SOLD OUT</span>}
                {event.salesPaused && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold">PAUSED</span>}
              </div>
              <h1 className="text-white font-black text-xl leading-tight">{event.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-zinc-400 text-[12px]">
                <span className="flex items-center gap-1"><CalendarIcon /> {event.date}{event.time ? ` · ${event.time}` : ''}</span>
                {event.venue && <span className="flex items-center gap-1"><MapPinIcon /> {event.venue}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="sticky top-0 z-30 bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-800">
          <div className="max-w-lg mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all pressable ${
                    activeTab === tab.key
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Saved toast ── */}
        {saved && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[12px] font-bold backdrop-blur-sm anim-fade-pop">
            <CheckIcon /> {saved}
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-6 pb-24">

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 anim-fade-up">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard value={totalSold} label="Tickets Sold" icon={<TicketIcon />} color="bg-red-500/15 text-red-400" />
                <StatCard value={checkedIn} label="Checked In" icon={<ScanIcon />} color="bg-emerald-500/15 text-emerald-400" />
                <StatCard value={totalCapacity - totalSold} label="Remaining" icon={<UsersIcon />} color="bg-blue-500/15 text-blue-400" />
                <StatCard value={event.isFree ? 'Free' : `₹${revenue.toLocaleString()}`} label="Revenue" icon={<DollarIcon />} color="bg-amber-500/15 text-amber-400" />
              </div>

              {/* Progress bar */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-[12px] font-semibold">Capacity</span>
                  <span className="text-white text-[13px] font-bold">{totalSold} / {totalCapacity}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${totalCapacity ? Math.min((totalSold / totalCapacity) * 100, 100) : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-zinc-600 text-[11px]">Check-in rate</span>
                  <span className="text-zinc-400 text-[12px] font-semibold">{totalSold ? Math.round((checkedIn / totalSold) * 100) : 0}%</span>
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => copyToClipboard(eventUrl, 'link')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[13px] font-semibold pressable hover:border-zinc-700 transition-colors">
                    {copied === 'link' ? <><CheckIcon /> Copied!</> : <><ShareIcon /> Share Link</>}
                  </button>
                  <Link href={`/e/${id}`} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[13px] font-semibold pressable hover:border-zinc-700 transition-colors">
                    View Event Page
                  </Link>
                  <button onClick={() => setActiveTab('guestlist')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[13px] font-semibold pressable hover:border-zinc-700 transition-colors">
                    <UsersIcon /> Guest List
                  </button>
                  <button onClick={() => setActiveTab('discounts')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[13px] font-semibold pressable hover:border-zinc-700 transition-colors">
                    <TicketIcon /> Discounts
                  </button>
                </div>
              </div>

              {/* Recent attendees preview */}
              {tickets.length > 0 && (
                <div>
                  <SectionHeader
                    title="Recent Attendees"
                    count={totalSold}
                    action={<button onClick={() => setActiveTab('attendees')} className="text-red-400 text-[12px] font-semibold pressable">View all →</button>}
                  />
                  <div className="space-y-1">
                    {tickets.slice(0, 3).map((t) => (
                      <div key={t.ticketId} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800">
                        {t.userPhotoURL ? (
                          <img src={t.userPhotoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[11px] font-bold">
                            {(t.userName || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-semibold truncate">{t.userName}</p>
                          <p className="text-zinc-600 text-[11px] truncate">{t.ticketId}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.checkedIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                          {t.checkedIn ? 'In' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ ATTENDEES TAB ═══ */}
          {activeTab === 'attendees' && (
            <div className="space-y-4 anim-fade-up">
              {/* Search */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"><SearchIcon /></div>
                <input
                  type="text"
                  placeholder="Search by name, email, or ticket ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-[13px] placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              {/* Stats row */}
              <div className="flex gap-2">
                <div className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-white font-bold text-[16px]">{totalSold}</p>
                  <p className="text-zinc-600 text-[10px] font-semibold">Registered</p>
                </div>
                <div className="flex-1 text-center py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-bold text-[16px]">{checkedIn}</p>
                  <p className="text-emerald-600 text-[10px] font-semibold">Checked In</p>
                </div>
                <div className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-zinc-400 font-bold text-[16px]">{totalSold - checkedIn}</p>
                  <p className="text-zinc-600 text-[10px] font-semibold">Remaining</p>
                </div>
              </div>

              {/* Attendee list */}
              {uniqueTickets.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-zinc-600 text-sm">{search ? 'No matching attendees' : 'No attendees yet'}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {uniqueTickets.map((t, i) => (
                    <div
                      key={t.ticketId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 anim-slide-in"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {t.userPhotoURL ? (
                        <img src={t.userPhotoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[13px] font-bold">
                          {(t.userName || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] font-semibold truncate">{t.userName}</p>
                        <p className="text-zinc-600 text-[11px] truncate">{t.userEmail}</p>
                        <p className="text-zinc-700 text-[10px] font-mono">{t.ticketId}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${t.checkedIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                          {t.checkedIn ? 'Checked In' : 'Pending'}
                        </span>
                        {t.promoCode && (
                          <span className="text-violet-400 text-[10px] font-semibold">{t.promoCode}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ GUEST LIST TAB ═══ */}
          {activeTab === 'guestlist' && (
            <div className="space-y-4 anim-fade-up">
              {/* Invite code card */}
              {inviteCode && (
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
                  <p className="text-zinc-500 text-[11px] font-semibold mb-2">INVITE CODE</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-white font-mono font-bold text-[16px] tracking-wider">{inviteCode}</span>
                    <button
                      onClick={() => copyToClipboard(inviteCode, 'invite')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] font-semibold pressable flex items-center gap-1"
                    >
                      {copied === 'invite' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                    </button>
                  </div>
                  <p className="text-zinc-700 text-[11px] mt-2">Share this code so invited guests can RSVP</p>
                </div>
              )}

              {/* Add guest */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add guest name..."
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGuest()}
                  className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-[13px] placeholder-zinc-600 outline-none focus:border-zinc-600"
                />
                <button onClick={addGuest} className="px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-[13px] pressable flex items-center gap-1">
                  <PlusIcon /> Add
                </button>
              </div>

              {/* Guest list */}
              <SectionHeader title="Invited Guests" count={guestList.length} />
              {guestList.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-zinc-600 text-sm mb-1">No guests added yet</p>
                  <p className="text-zinc-700 text-[12px]">Add names above to generate an invite code</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {guestList.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[11px] font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-white text-[13px] font-medium">{name}</span>
                      <button onClick={() => removeGuest(name)} className="text-zinc-600 hover:text-red-400 pressable transition-colors">
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ DISCOUNTS TAB ═══ */}
          {activeTab === 'discounts' && (
            <div className="space-y-4 anim-fade-up">
              {/* Add discount */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
                <p className="text-white text-[13px] font-bold">Add Discount Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code (e.g. VIP20)"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[13px] placeholder-zinc-600 outline-none focus:border-zinc-600 uppercase"
                  />
                  <input
                    type="number"
                    placeholder="%"
                    value={newPercent}
                    onChange={(e) => setNewPercent(e.target.value)}
                    min="1"
                    max="100"
                    className="w-16 px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-[13px] placeholder-zinc-600 outline-none focus:border-zinc-600 text-center"
                  />
                </div>
                <button onClick={addDiscount} className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-[13px] pressable">
                  Add Discount
                </button>
              </div>

              {/* Discount list */}
              <SectionHeader title="Active Codes" count={discountCodes.length} />
              {discountCodes.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-zinc-600 text-sm">No discount codes yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {discountCodes.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="flex-1">
                        <span className="text-white font-mono font-bold text-[14px]">{d.code}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold">{d.percent}% off</span>
                      <button
                        onClick={() => copyToClipboard(d.code, `dc-${d.code}`)}
                        className="text-zinc-600 hover:text-zinc-400 pressable transition-colors"
                      >
                        {copied === `dc-${d.code}` ? <CheckIcon /> : <CopyIcon />}
                      </button>
                      <button onClick={() => removeDiscount(d.code)} className="text-zinc-600 hover:text-red-400 pressable transition-colors">
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {activeTab === 'settings' && (
            <div className="space-y-4 anim-fade-up">
              {/* Event info */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
                <p className="text-zinc-500 text-[11px] font-semibold uppercase">Event Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[13px]">Price</span>
                    <span className="text-white text-[13px] font-semibold">{event.isFree ? 'Free' : event.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[13px]">Total Capacity</span>
                    <span className="text-white text-[13px] font-semibold">{totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[13px]">Tickets Sold</span>
                    <span className="text-white text-[13px] font-semibold">{totalSold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[13px]">Category</span>
                    <span className="text-white text-[13px] font-semibold">{event.category}</span>
                  </div>
                  {event.location && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500 text-[13px]">Location</span>
                      <span className="text-white text-[13px] font-semibold">{event.location}</span>
                    </div>
                  )}
                </div>
                <Link href={`/host/edit/${id}`} className="block text-center py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-[13px] font-semibold pressable mt-2">
                  <span className="flex items-center justify-center gap-1.5"><EditIcon /> Edit Event Details</span>
                </Link>
              </div>

              {/* Share */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
                <p className="text-zinc-500 text-[11px] font-semibold uppercase">Share</p>
                <div className="flex gap-2">
                  <input type="text" readOnly value={eventUrl} className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-[12px] font-mono outline-none truncate" />
                  <button
                    onClick={() => copyToClipboard(eventUrl, 'settings-link')}
                    className="px-3.5 py-2.5 rounded-lg bg-red-600 text-white text-[12px] font-bold pressable flex items-center gap-1"
                  >
                    {copied === 'settings-link' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Sales controls */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
                <p className="text-zinc-500 text-[11px] font-semibold uppercase">Sales Controls</p>
                <button
                  onClick={toggleSales}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold pressable transition-colors ${
                    event.salesPaused
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {event.salesPaused ? <><PlayIcon /> Resume Sales</> : <><PauseIcon /> Pause Sales</>}
                </button>
                {!event.soldOut ? (
                  <button onClick={markSoldOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-[13px] font-bold pressable hover:border-zinc-600 transition-colors">
                    Mark as Sold Out
                  </button>
                ) : (
                  <button onClick={unmarkSoldOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[13px] font-bold pressable">
                    Reopen Sales
                  </button>
                )}
              </div>

              {/* Danger zone */}
              <div className="bg-zinc-900 rounded-2xl border border-red-900/30 p-4 space-y-3">
                <p className="text-red-400 text-[11px] font-semibold uppercase">Danger Zone</p>
                <p className="text-zinc-600 text-[12px]">Deleting an event is permanent and cannot be undone. All ticket data will be lost.</p>
                <button
                  onClick={handleDelete}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold pressable transition-colors ${
                    confirmDelete
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  <TrashIcon /> {confirmDelete ? 'Confirm Delete — Tap Again' : 'Delete Event'}
                </button>
                {confirmDelete && (
                  <button onClick={() => setConfirmDelete(false)} className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-[12px] font-semibold pressable">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
