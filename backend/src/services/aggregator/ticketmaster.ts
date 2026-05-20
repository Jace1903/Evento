import { Aggregator, NormalizedEvent } from './types';

const BASE = 'https://app.ticketmaster.com/discovery/v2';

// Ticketmaster segment → our category slugs
const SEGMENT_MAP: Record<string, string> = {
  'Music': 'music',
  'Arts & Theatre': 'creative',
  'Film': 'cultural',
  'Miscellaneous': 'cultural',
};

interface TmImage { url: string; width: number; height: number }
interface TmDate { dateTime?: string; localDate?: string }
interface TmClassification {
  segment?: { name: string };
  genre?: { name: string };
}
interface TmPriceRange { min: number; max: number; type: string }
interface TmVenue {
  name?: string;
  address?: { line1?: string };
  city?: { name?: string };
  state?: { stateCode?: string };
  location?: { longitude?: string; latitude?: string };
}
interface TmEvent {
  id: string;
  name: string;
  url: string;
  images?: TmImage[];
  dates?: { start?: TmDate };
  classifications?: TmClassification[];
  priceRanges?: TmPriceRange[];
  _embedded?: { venues?: TmVenue[] };
}
interface TmResponse {
  _embedded?: { events?: TmEvent[] };
  page: { totalPages: number; number: number };
}

function bestImage(images: TmImage[] = []): string | null {
  const sorted = [...images].sort((a, b) => b.width - a.width);
  return sorted[0]?.url ?? null;
}

function normalize(e: TmEvent): NormalizedEvent {
  const venue = e._embedded?.venues?.[0];
  const prices = e.priceRanges ?? [];
  const isFree = prices.length === 0 ? false : prices.every((p) => p.min === 0);
  const allMins = prices.map((p) => p.min);
  const allMaxs = prices.map((p) => p.max);
  const segment = e.classifications?.[0]?.segment?.name ?? '';
  const locationAddress = [
    venue?.address?.line1,
    venue?.city?.name,
    venue?.state?.stateCode,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    externalId: e.id,
    source: 'ticketmaster',
    sourceUrl: e.url,
    title: e.name,
    description: null,
    imageUrl: bestImage(e.images),
    categorySlug: SEGMENT_MAP[segment] ?? null,
    startAt: e.dates?.start?.dateTime
      ? new Date(e.dates.start.dateTime)
      : new Date(e.dates?.start?.localDate ?? Date.now()),
    endAt: null,
    locationName: venue?.name ?? null,
    locationAddress: locationAddress || null,
    latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : null,
    longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : null,
    isFree,
    priceMin: allMins.length > 0 ? Math.min(...allMins) : null,
    priceMax: allMaxs.length > 0 ? Math.max(...allMaxs) : null,
    attendeeCount: 0,
  };
}

export class TicketmasterAggregator implements Aggregator {
  name = 'ticketmaster' as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetch(): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];
    let page = 0;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        city: 'San Francisco',
        stateCode: 'CA',
        countryCode: 'US',
        startDateTime: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        size: '100',
        page: String(page),
        sort: 'date,asc',
      });

      const res = await fetch(`${BASE}/events.json?${params}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Ticketmaster API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as TmResponse;
      const items = data._embedded?.events ?? [];
      events.push(...items.map(normalize));

      totalPages = data.page.totalPages;
      page++;
    } while (page < Math.min(totalPages, 5)); // cap at 5 pages = 500 events

    return events;
  }
}
