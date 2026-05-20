'use client';

import { useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { fetchSavedEvents } from '@/lib/api';
import { ApiEvent } from '@/lib/types';

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
          <div className="h-36 bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SavedPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token = await (window as any).Clerk?.session?.getToken();
        const data = await fetchSavedEvents(token);
        setEvents(data);
      } catch {
        setError('Could not load saved events. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoaded, isSignedIn]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Saved Events</h1>
          {isSignedIn && !loading && (
            <p className="text-slate-500 mt-1">
              {events.length === 0
                ? 'No saved events yet'
                : `${events.length} event${events.length !== 1 ? 's' : ''} saved`}
            </p>
          )}
        </div>

        {/* Not signed in */}
        {isLoaded && !isSignedIn && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Sign in to see your saved events</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Create an account to bookmark events and access them anytime.
            </p>
            <SignInButton mode="modal">
              <button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                Sign in
              </button>
            </SignInButton>
          </div>
        )}

        {/* Loading */}
        {isSignedIn && loading && <SkeletonGrid />}

        {/* Error */}
        {error && (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-slate-600 font-medium">{error}</p>
          </div>
        )}

        {/* Events grid */}
        {isSignedIn && !loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isSignedIn && !loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No saved events yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
              Browse events and hit the heart button to save them here,{' '}
              {user?.firstName ? `${user.firstName}` : ''}.
            </p>
            <Link
              href="/"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Discover events
            </Link>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © 2026 Evento · Discover the Bay Area
      </footer>
    </div>
  );
}
