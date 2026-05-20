'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { CATEGORIES, Category } from '@/lib/mockEvents';
import { fetchEvents } from '@/lib/api';
import { ApiEvent } from '@/lib/types';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (category: Category, searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents({ category, search: searchTerm, limit: 50 });
      setEvents(data.events);
      setTotal(data.total);
    } catch {
      setError('Could not load events. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when category changes immediately
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    load(activeCategory, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Debounce search input by 400ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(activeCategory, search);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Discover Bay Area{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Hackathons, tech talks, concerts, cultural festivals — all in one place.
          </p>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => {
            const isChendu = cat === 'Chendu Special';
            const isActive = activeCategory === cat;
            let cls = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ';
            if (isActive && isChendu) {
              cls += 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm';
            } else if (isActive) {
              cls += 'bg-violet-600 text-white shadow-sm';
            } else if (isChendu) {
              cls += 'bg-white text-pink-600 border border-pink-200 hover:border-pink-400 hover:text-pink-700';
            } else {
              cls += 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600';
            }
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cls}>
                {isChendu ? `🐘 ${cat}` : cat}
              </button>
            );
          })}
        </div>

        {activeCategory === 'Chendu Special' && (
          <div className="mb-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 p-6 text-white">
            {/* decorative background elephants */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none pointer-events-none">🐘</span>
            <span className="absolute right-32 bottom-0 text-5xl opacity-10 select-none pointer-events-none">🐘</span>
            <span className="absolute right-20 top-1 text-3xl opacity-10 select-none pointer-events-none rotate-12">🐘</span>
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 text-4xl shadow-inner">
                🐘
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-xl leading-tight">Chendu Special</p>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">SF Only</span>
                </div>
                <p className="text-sm text-white/90">Pubs · Clubs · Cafes · Fun — the best of San Francisco for the squad 🎉</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeCategory === 'All' ? 'All Events' : activeCategory === 'Chendu Special' ? 'Fun in SF' : activeCategory}
            {!loading && (
              <span className="ml-2 text-sm font-normal text-slate-400">{total} events</span>
            )}
          </h2>
        </div>

        {/* States */}
        {error && (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-slate-600 font-medium">{error}</p>
          </div>
        )}

        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
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
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © 2026 Evento · Discover the Bay Area
      </footer>
    </div>
  );
}
