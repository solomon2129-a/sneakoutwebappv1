import Link from 'next/link';
import { useTickets } from '../context/TicketContext';

const categoryColors = {
  'Electronic': 'from-red-900/80 to-red-700/60',
  'Live Music':  'from-emerald-900/80 to-emerald-700/60',
  'Rooftop':     'from-amber-900/80 to-amber-700/60',
  'Networking':  'from-blue-900/80 to-blue-700/60',
  'Rave':        'from-rose-900/80 to-rose-700/60',
};

function MapPinIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
}
function CalendarIcon() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
}
function CheckIcon() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}

export default function EventCard({ event, index = 0 }) {
  const { hasTicket } = useTickets();
  const owned = hasTicket(event.id);
  const catGradient = categoryColors[event.category] || 'from-zinc-900/80 to-zinc-700/60';

  // All events are Firestore-backed and live at /e/[id]
  const href = '/e/' + event.id;

  return (
    <div className="anim-fade-up" style={{ animationDelay: (index * 0.07) + 's' }}>
      <Link href={href} className="block event-card pressable">
        <div className="relative h-52 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 img-fade-bottom" />

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className="pill">{event.price}</span>
            <span className={'pill bg-gradient-to-r ' + catGradient}>{event.category}</span>
          </div>

          {owned && (
            <div className="absolute bottom-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                <CheckIcon /> Ticket Owned
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-white font-bold text-[17px] leading-snug mb-2.5">{event.title}</h3>

          <div className="flex items-center gap-1.5 text-zinc-400 text-[13px] mb-1.5">
            <MapPinIcon />
            <span>{event.venue} · {event.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 text-[13px] mb-4">
            <CalendarIcon />
            <span>{event.date} · {event.time}</span>
          </div>

          <span className={'flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold tracking-wide ' + (owned ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-600 text-white')}>
            {owned ? 'View My Ticket' : 'Get Ticket'}
          </span>
        </div>
      </Link>
    </div>
  );
}
