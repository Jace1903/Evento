'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { fetchEvent, fetchEvents } from '@/lib/api';
import { ApiEvent } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function toggleSave(eventId: string, email: string, name: string | null, token: string) {
  const res = await fetch(`${API_BASE}/api/saved-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventId, email, name }),
  });
  if (!res.ok) throw new Error('Failed to toggle save');
  return res.json() as Promise<{ saved: boolean }>;
}

const SLUG_GRADIENT: Record<string, string> = {
  tech: 'from-blue-500 to-indigo-600',
  networking: 'from-violet-500 to-purple-600',
  cultural: 'from-orange-400 to-red-500',
  music: 'from-rose-400 to-pink-600',
  creative: 'from-emerald-400 to-teal-600',
  'food-drink': 'from-amber-400 to-orange-500',
  'chendu-special': 'from-pink-500 to-orange-400',
};

const SLUG_BADGE: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700',
  networking: 'bg-violet-100 text-violet-700',
  cultural: 'bg-orange-100 text-orange-700',
  music: 'bg-rose-100 text-rose-700',
  creative: 'bg-emerald-100 text-emerald-700',
  'food-drink': 'bg-amber-100 text-amber-700',
  'chendu-special': 'bg-pink-100 text-pink-700',
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

function toIcsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildGoogleCalUrl(event: ApiEvent) {
  const start = toIcsDate(event.startAt);
  const end = event.endAt ? toIcsDate(event.endAt) : toIcsDate(event.startAt);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates: `${start}/${end}` });
  if (event.description) params.set('details', event.description.slice(0, 1000));
  if (event.locationAddress) params.set('location', event.locationAddress);
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadIcs(event: ApiEvent) {
  const start = toIcsDate(event.startAt);
  const end = event.endAt ? toIcsDate(event.endAt) : toIcsDate(event.startAt);
  const esc = (s: string) => s.replace(/[,;\\]/g, '\\$&');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Evento//Bay Area Events//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${esc(event.description.slice(0, 1000)).replace(/\n/g, '\\n')}`] : []),
    ...(event.locationAddress ? [`LOCATION:${esc(event.locationAddress)}`] : []),
    ...(event.sourceUrl ? [`URL:${event.sourceUrl}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-72 bg-slate-200 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    fetchEvent(id)
      .then((e) => {
        setEvent(e);
        if (e.category?.name) {
          fetchEvents({ category: e.category.name, limit: 4 })
            .then((r) => setRelatedEvents(r.events.filter((re) => re.id !== e.id).slice(0, 3)))
            .catch(() => {});
        }
      })
      .catch((err: Error) => {
        if (err.message === 'Event not found') setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!isSignedIn || !user) return;
    setSaving(true);
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const result = await toggleSave(id, user.primaryEmailAddress!.emailAddress, user.fullName, token);
      setSaved(result.saved);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event?.title, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
  const hasEndTime = event.endAt && event.endAt !== event.startAt;
  const hasMap = event.latitude !== null && event.longitude !== null;
  const mapsQuery = event.locationAddress ?? event.locationName ?? '';

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="absolute top-4 right-4">
          {isSignedIn ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                saved ? 'bg-rose-500 text-white' : 'bg-black/30 hover:bg-black/50 text-white/90 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/90 hover:text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Left: primary content (2/3) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                {event.category?.name ?? 'Event'}
              </span>
              <span className="text-xs text-slate-400">{sourceLabel(event.source)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
              {event.title}
            </h1>

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                      {event.priceMax && event.priceMax !== event.priceMin ? ` – $${event.priceMax.toFixed(0)}` : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">See listing</p>
                  )}
                </div>
              </div>

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

            {event.description && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">About this event</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

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

          {/* Right: sidebar (1/3) */}
          <div className="mt-8 lg:mt-0 space-y-4">
            {/* Map embed or link */}
            {hasMap ? (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <iframe
                  title="Event location"
                  width="100%"
                  height="200"
                  style={{ border: 0, display: 'block' }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude! - 0.01},${event.latitude! - 0.01},${event.longitude! + 0.01},${event.latitude! + 0.01}&layer=mapnik&marker=${event.latitude},${event.longitude}`}
                />
                {mapsQuery && (
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <a
                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(mapsQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 hover:underline"
                    >
                      Open larger map →
                    </a>
                  </div>
                )}
              </div>
            ) : mapsQuery ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-violet-600 hover:underline"
                >
                  View on map →
                </a>
              </div>
            ) : null}

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-3 rounded-2xl transition-colors text-sm"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Link copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share event
                </>
              )}
            </button>

            {/* Add to Calendar */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 pt-3 pb-2">Add to Calendar</p>
              <a
                href={buildGoogleCalUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100 text-sm text-slate-700 font-medium"
              >
                <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Google Calendar
              </a>
              <button
                onClick={() => downloadIcs(event)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-100 text-sm text-slate-700 font-medium text-left"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .ics
              </button>
            </div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              More {event.category?.name} events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © 2026 Evento · Discover the Bay Area
      </footer>
    </div>
  );
}
