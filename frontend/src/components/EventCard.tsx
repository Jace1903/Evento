import { Event } from '@/lib/mockEvents';

const categoryStyles: Record<string, string> = {
  Tech: 'bg-blue-100 text-blue-700',
  Networking: 'bg-violet-100 text-violet-700',
  Cultural: 'bg-orange-100 text-orange-700',
  Music: 'bg-rose-100 text-rose-700',
  Creative: 'bg-emerald-100 text-emerald-700',
  'Food & Drink': 'bg-amber-100 text-amber-700',
};

const categoryGradients: Record<string, string> = {
  Tech: 'from-blue-500 to-indigo-600',
  Networking: 'from-violet-500 to-purple-600',
  Cultural: 'from-orange-400 to-red-500',
  Music: 'from-rose-400 to-pink-600',
  Creative: 'from-emerald-400 to-teal-600',
  'Food & Drink': 'from-amber-400 to-orange-500',
};

const categoryEmoji: Record<string, string> = {
  Tech: '💻',
  Networking: '🤝',
  Cultural: '🎭',
  Music: '🎵',
  Creative: '🎨',
  'Food & Drink': '🍜',
};

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 hover:border-violet-200 transition-all duration-200 cursor-pointer flex flex-col">
      {/* Image / gradient banner */}
      <div className={`h-36 bg-gradient-to-br ${categoryGradients[event.category]} flex items-center justify-center`}>
        <span className="text-5xl">{categoryEmoji[event.category]}</span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Top row: category + source */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryStyles[event.category]}`}>
            {event.category}
          </span>
          <span className="text-xs text-slate-400">{event.source}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 leading-snug mb-1 group-hover:text-violet-700 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{event.description}</p>

        {/* Meta */}
        <div className="flex flex-col gap-1 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{event.date} · {event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.attendees.toLocaleString()} going</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.isFree ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {event.isFree ? 'Free' : 'Paid'}
          </span>
        </div>
      </div>
    </div>
  );
}
