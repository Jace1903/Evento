'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { fetchEvent } from '@/lib/api';
import { ApiEvent } from '@/lib/types';

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function sourceLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-72 bg-slate-200 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchEvent(id)
      .then(setEvent)
      .catch((err: Error) => {
        if (err.message === 'Event not found') setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton />;

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-xl font-semibold mb-2">Event not found</p>
          <Link href="/" className="mt-4 text-violet-600 hover:underline text-sm">← Back to events</Link>
        </div>
      </div>
    );
  }

  const slug = event.category?.slug ?? '';
  const gradient = SLUG_GRADIENT[slug] ?? 'from-slate-400 to-slate-600';
  const badge = SLUG_BADGE[slug] ?? 'bg-slate-100 text-slate-600';
  const emoji = event.category?.emoji ?? '📅';
  const location = [event.locationName, event.locationAddress].filter(Boolean).join(' · ');
  const hasEndTime = event.endAt && event.endAt !== event.startAt;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Banner */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-8xl">{emoji}</span>
          </div>
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Category + source */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
            {event.category?.name ?? 'Event'}
          </span>
          <span className="text-xs text-slate-400">{sourceLabel(event.source)}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
          {event.title}
        </h1>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Date & time */}
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Date & Time</p>
              <p className="text-sm font-semibold text-slate-800">{formatDate(event.startAt)}</p>
              <p className="text-sm text-slate-500">
                {formatTime(event.startAt)}
                {hasEndTime && ` – ${formatTime(event.endAt!)}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Location</p>
              <p className="text-sm font-semibold text-slate-800">{event.locationName ?? 'Bay Area'}</p>
              {event.locationAddress && (
                <p className="text-sm text-slate-500">{event.locationAddress}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Price</p>
              {event.isFree ? (
                <p className="text-sm font-semibold text-green-600">Free</p>
              ) : event.priceMin !== null ? (
                <p className="text-sm font-semibold text-slate-800">
                  ${event.priceMin.toFixed(0)}
                  {event.priceMax && event.priceMax !== event.priceMin
                    ? ` – $${event.priceMax.toFixed(0)}`
                    : ''}
                </p>
              ) : (
                <p className="text-sm text-slate-500">See listing</p>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Listed on</p>
              <p className="text-sm font-semibold text-slate-800">{sourceLabel(event.source)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">About this event</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* CTA */}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-4 rounded-2xl transition-colors text-base"
          >
            {event.isFree ? 'Register for Free' : 'Get Tickets'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © 2026 Evento · Discover the Bay Area
      </footer>
    </div>
  );
}
