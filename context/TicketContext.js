import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserTicketsFromFirestore } from '../lib/tickets';

const TicketContext = createContext(null);

// Map a Firestore ticket document back to the local ticket shape
function fsToLocal(ft) {
  return {
    id:                ft.eventId,
    ticketId:          ft.ticketId,
    title:             ft.eventTitle,
    date:              ft.eventDate,
    time:              ft.eventTime,
    venue:             ft.eventVenue,
    image:             ft.eventImage,
    price:             ft.eventPrice,
    purchasedAt:       ft.purchasedAt,
    razorpayPaymentId: ft.razorpayPaymentId || null,
  };
}

export function TicketProvider({ children }) {
  const [tickets, setTickets]   = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth(); // safe — TicketProvider is inside AuthProvider in _app.js

  // ── 1. Hydrate from localStorage on mount ──────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sneakout-tickets');
      if (stored) setTickets(JSON.parse(stored));
    } catch (_) {}
    setHydrated(true);
  }, []);

  // ── 2. When user signs in and localStorage is empty, pull from Firestore ──
  // This restores tickets after a cache clear, browser switch, or new device.
  useEffect(() => {
    if (!user || !hydrated) return;

    let stored = [];
    try {
      const raw = localStorage.getItem('sneakout-tickets');
      stored = raw ? JSON.parse(raw) : [];
    } catch (_) {}

    // Already have local tickets — no sync needed
    if (stored.length > 0) return;

    getUserTicketsFromFirestore(user.uid).then((fsTickets) => {
      if (!fsTickets.length) return;

      // Deduplicate by eventId — keep the earliest purchase per event
      const seen   = new Set();
      const deduped = fsTickets
        .sort((a, b) => (a.purchasedAt < b.purchasedAt ? -1 : 1))
        .filter((ft) => {
          if (seen.has(ft.eventId)) return false;
          seen.add(ft.eventId);
          return true;
        });

      const mapped = deduped.map(fsToLocal);
      setTickets(mapped);
      try { localStorage.setItem('sneakout-tickets', JSON.stringify(mapped)); } catch (_) {}
    }).catch(() => {}); // never throw — silently fail if offline
  }, [user, hydrated]);

  // ── addTicket: normal purchase (generates new ticketId) ───
  const addTicket = (event) => {
    // Prevent duplicates by eventId
    if (tickets.some((t) => t.id === event.id)) {
      return tickets.find((t) => t.id === event.id);
    }
    const ticket = {
      ...event,
      ticketId:    `SK-${Date.now().toString(36).toUpperCase()}`,
      purchasedAt: new Date().toISOString(),
    };
    const updated = [ticket, ...tickets];
    setTickets(updated);
    try { localStorage.setItem('sneakout-tickets', JSON.stringify(updated)); } catch (_) {}
    return ticket;
  };

  // ── restoreTicket: re-hydrate from an existing Firestore ticket ──
  // Used when a purchase-guard finds an existing Firestore ticket but localStorage is empty.
  // Does NOT create a new Firestore doc or increment ticketsSold.
  const restoreTicket = (fsTicket) => {
    const mapped = fsToLocal(fsTicket);
    if (tickets.some((t) => t.id === mapped.id)) return; // already present
    const updated = [mapped, ...tickets];
    setTickets(updated);
    try { localStorage.setItem('sneakout-tickets', JSON.stringify(updated)); } catch (_) {}
  };

  const hasTicket = (eventId) => tickets.some((t) => t.id === eventId);
  const getTicket = (eventId) => tickets.find((t) => t.id === eventId) || null;

  return (
    <TicketContext.Provider value={{ tickets, addTicket, restoreTicket, hasTicket, getTicket, hydrated }}>
      {children}
    </TicketContext.Provider>
  );
}

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
};
