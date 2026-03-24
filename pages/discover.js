import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const categories = ['All', 'Electronic', 'Live Music', 'Rooftop', 'Networking', 'Rave'];

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserAvatarSmall({ user }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || ''}
        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
      />
    );
  }
  const initials = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[13px] font-bold border border-red-700">
      {initials}
    </div>
  );
}

export default function Discover() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [firestoreEvents, setFirestoreEvents] = useState([]);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  // Real-time events listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFirestoreEvents(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    }, () => {});
    return () => unsub();
  }, [user]);

  // Only Firestore events
  const allEvents = firestoreEvents;

  const filtered = allEvents.filter((e) => {
    const matchCategory = activeCategory === 'All' || e.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sneakout — Discover Events</title>
      </Head>

      <Layout>
        <div className="px-4 pb-36">
          <div className="h-12" />

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-zinc-500 text-sm font-medium mb-0.5">Bangalore · This Week</p>
              <h1 className="text-[24px] font-extrabold text-white leading-none tracking-tight">
                Sneakout
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
                <BellIcon />
              </button>
              <div className="pressable" onClick={() => router.push('/profile')}>
                <UserAvatarSmall user={user} />
              </div>
            </div>
          </div>

          {/* ── Search ── */}
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:border-red-600 transition-colors"
            />
          </div>

          {/* ── Category pills ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 pressable ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Count ── */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-[13px] font-medium">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </span>
            <span className="text-zinc-600 text-[12px]">Sorted by date</span>
          </div>

          {/* ── Event Cards ── */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-zinc-700 mb-4"><SearchIcon size={32} /></div>
              <p className="text-zinc-300 font-semibold mb-1">No events found</p>
              <p className="text-zinc-600 text-sm">Try a different search or category</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
