import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

// Save a ticket to Firestore and increment the event's ticketsSold counter
export async function saveTicketToFirestore(ticket, user) {
  if (!user) return;
  try {
    // Write the ticket document
    const ticketRef = doc(db, 'tickets', ticket.ticketId);
    await setDoc(ticketRef, {
      ticketId: ticket.ticketId,
      eventId: ticket.id,
      eventTitle: ticket.title,
      eventDate: ticket.date,
      eventTime: ticket.time,
      eventVenue: ticket.venue,
      eventImage: ticket.image,
      eventPrice: ticket.price,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email?.split('@')[0] || 'Attendee',
      userPhotoURL: user.photoURL || null,
      purchasedAt: ticket.purchasedAt,
      razorpayPaymentId: ticket.razorpayPaymentId || null,
      checkedIn: false,
      checkedInAt: null,
      createdAt: serverTimestamp(),
    });

    // Atomically increment ticketsSold on the event document
    const eventRef = doc(db, 'events', ticket.id);
    await updateDoc(eventRef, {
      ticketsSold: increment(1),
    });
  } catch (err) {
    console.error('[Firestore] saveTicket error', err);
  }
}

// Get all tickets owned by a user (for profile sync after localStorage clear)
export async function getUserTicketsFromFirestore(userId) {
  try {
    const q = query(collection(db, 'tickets'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error('[Firestore] getUserTickets error', err);
    return [];
  }
}

// Check if a specific user already has a ticket for a specific event
// Used to prevent duplicate purchases when localStorage was cleared
export async function getExistingTicket(userId, eventId) {
  try {
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId),
      where('eventId', '==', eventId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    // If somehow there are duplicates (edge case), return the earliest one
    const sorted = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.purchasedAt < b.purchasedAt ? -1 : 1));
    return sorted[0];
  } catch (err) {
    console.error('[Firestore] getExistingTicket error', err);
    return null;
  }
}

// Get all tickets for a specific event (host only)
export async function getTicketsForEvent(eventId) {
  try {
    const q = query(collection(db, 'tickets'), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.error('[Firestore] getTicketsForEvent error', err);
    return [];
  }
}

// Get a single ticket by ID
export async function getTicketById(ticketId) {
  try {
    const ref = doc(db, 'tickets', ticketId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('[Firestore] getTicketById error', err);
    return null;
  }
}

// Mark ticket as checked in
export async function checkInTicket(ticketId) {
  try {
    const ref = doc(db, 'tickets', ticketId);
    await updateDoc(ref, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('[Firestore] checkIn error', err);
    return false;
  }
}

// Get all Firestore-created events
export async function getFirestoreEvents() {
  try {
    const snap = await getDocs(collection(db, 'events'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch (err) {
    console.error('[Firestore] getEvents error', err);
    return [];
  }
}

// Get single Firestore event
export async function getFirestoreEvent(id) {
  try {
    const ref = doc(db, 'events', id);
    const snap = await getDoc(ref);
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
  } catch (err) {
    console.error('[Firestore] getEvent error', err);
    return null;
  }
}

// Save a host-created event to Firestore
export async function saveEventToFirestore(eventData, user) {
  try {
    const id = `evt-${Date.now().toString(36)}`;
    const ref = doc(db, 'events', id);
    await setDoc(ref, {
      ...eventData,
      id,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      soldOut: false,
      isFirestoreEvent: true,
    });
    return id;
  } catch (err) {
    console.error('[Firestore] saveEvent error', err);
    throw err;
  }
}

// Update an existing event in Firestore (partial merge)
export async function updateEventInFirestore(eventId, updates) {
  try {
    const ref = doc(db, 'events', eventId);
    await updateDoc(ref, updates);
    return true;
  } catch (err) {
    console.error('[Firestore] updateEvent error', err);
    return false;
  }
}

// Delete a host-created event from Firestore
export async function deleteEventFromFirestore(eventId) {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return true;
  } catch (err) {
    console.error('[Firestore] deleteEvent error', err);
    return false;
  }
}
