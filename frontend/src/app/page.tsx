'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import { mockEvents, CATEGORIES, Category } from '@/lib/mockEvents';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return mockEvents.filter((e) => {
      const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
      const matchesSearch =
        search.trim() === '' ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

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

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

      {/* Category filters + events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeCategory === 'All' ? 'All Events' : activeCategory}
            <span className="ml-2 text-sm font-normal text-slate-400">{filtered.length} events</span>
          </h2>
        </div>

        {/* Events grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © 2026 Evento · Discover the Bay Area
      </footer>
    </div>
  );
}
