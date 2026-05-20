import { ApiEvent } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

const SLUG_GRADIENT: Record<string, string> = {
  tech: 'from-blue-500 to-indigo-600',
  networking: 'from-violet-500 to-purple-600',
  cultural: 'from-orange-400 to-red-500',
  music: 'from-rose-400 to-pink-600',
  creative: 'from-emerald-400 to-teal-600',
  'food-drink': 'from-amber-400 to-orange-500',
};

const SLUG_BADGE: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  networking: 'bg-violet-100 text-violet-700',
  cultural: 'bg-orange-100 text-orange-700',
  music: 'bg-rose-100 text-rose-700',
  creative: 'bg-emerald-100 text-emerald-700',
  'food-drink': 'bg-amber-100 text-amber-700',
};

const DEFAULT_GRADIENT = 'from-slate-400 to-slate-600';
const DEFAULT_BADGE = 'bg-slate-100 text-slate-600';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function sourceLabel(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export default function EventCard({ event }: { event: ApiEvent }) {
  const slug = event.category?.slug ?? '';
  const gradient = SLUG_GRADIENT[slug] ?? DEFAULT_GRADIENT;
  const badge = SLUG_BADGE[slug] ?? DEFAULT_BADGE;
  const emoji = event.category?.emoji ?? '📅';
  const location = event.locationName ?? event.locationAddress ?? 'Bay Area';

  return (
    <Link href={`/events/${event.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 hover:border-violet-200 transition-all duration-200 flex flex-col">
      {/* Banner: real image or gradient fallback */}
      <div className="relative h-36 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl">{emoji}</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
            {event.category?.name ?? 'Event'}
          </span>
          <span className="text-xs text-slate-400">{sourceLabel(event.source)}</span>
        </div>

        <h3 className="font-semibold text-slate-900 leading-snug mb-1 group-hover:text-violet-700 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{event.description}</p>
        )}

        <div className="flex flex-col gap-1 text-xs text-slate-500 mt-auto mb-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.startAt)} · {formatTime(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {event.priceMin !== null && !event.isFree && (
              <span>From ${event.priceMin.toFixed(0)}</span>
            )}
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.isFree ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {event.isFree ? 'Free' : 'Paid'}
          </span>
        </div>
      </div>
    </Link>
  );
}
