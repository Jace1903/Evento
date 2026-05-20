import { Aggregator, NormalizedEvent } from './types';

const BASE = 'https://api.predicthq.com/v1';

// SF Bay Area center
const SF_LAT = 37.7749;
const SF_LNG = -122.4194;

// PredictHQ category → our slug
const CATEGORY_MAP: Record<string, string> = {
  conferences: 'tech',
  community: 'networking',
  expos: 'tech',
};

// Refine by labels when category is ambiguous
const TECH_LABELS = new Set(['technology', 'science', 'ai', 'machine-learning', 'software', 'startup', 'hackathon']);

function resolveCategory(category: string, labels: string[]): string {
  if (category === 'conferences' || category === 'expos') {
    return labels.some((l) => TECH_LABELS.has(l)) ? 'tech' : 'networking';
  }
  return CATEGORY_MAP[category] ?? 'tech';
}

interface PhqGeo {
  geometry?: { coordinates?: [number, number] };
  address?: { formatted_address?: string; city?: string; state?: string };
}
interface PhqEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  labels?: string[];
  start: string;
  end?: string;
  geo?: PhqGeo;
  phq_attendance?: number;
  rank?: number;
}
interface PhqResponse {
  count: number;
  next: string | null;
  results: PhqEvent[];
}

function normalize(e: PhqEvent): NormalizedEvent {
  const coords = e.geo?.geometry?.coordinates; // [lng, lat]
  const addr = e.geo?.address;
  const locationAddress = addr?.formatted_address
    ?? [addr?.city, addr?.state].filter(Boolean).join(', ')
    ?? null;

  return {
    externalId: e.id,
    source: 'predicthq',
    sourceUrl: `https://control.predicthq.com/events/${e.id}`,
    title: e.title,
    description: e.description ?? null,
    imageUrl: null,
    categorySlug: resolveCategory(e.category, e.labels ?? []),
    startAt: new Date(e.start),
    endAt: e.end ? new Date(e.end) : null,
    locationName: null,
    locationAddress,
    latitude: coords ? coords[1] : null,
    longitude: coords ? coords[0] : null,
    isFree: false,
    priceMin: null,
    priceMax: null,
    attendeeCount: e.phq_attendance ?? 0,
  };
}

export class PredictHQAggregator implements Aggregator {
  name = 'predicthq' as const;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async fetch(): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];
    let url: string | null = null;

    // Build initial URL
    const params = new URLSearchParams({
      category: 'conferences,community,expos',
      'location_around.origin': `${SF_LAT},${SF_LNG}`,
      'location_around.offset': '75mi',
      'active.gte': new Date().toISOString().split('T')[0],
      limit: '100',
      sort: 'start',
      state: 'active',
    });
    url = `${BASE}/events/?${params}`;

    while (url) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`PredictHQ API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as PhqResponse;
      events.push(...data.results.map(normalize));
      url = data.next;

      // Cap at 500 events (5 pages of 100)
      if (events.length >= 500) break;
    }

    return events;
  }
}
