import { ApiEventsResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchEvents(params: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiEventsResponse> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') {
    query.set('category', params.category.toLowerCase().replace(' & ', '-'));
  }
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/api/events?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}
