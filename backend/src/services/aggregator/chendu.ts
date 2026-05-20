import { Aggregator, NormalizedEvent } from './types';

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';
const PHQ_BASE = 'https://api.predicthq.com/v1/events/';
const SF_PLACE_ID = '5391959'; // Geonames ID for San Francisco

// Ticketmaster: segments NOT already covered by the main aggregator
// Main covers: Music, Arts & Theatre, Film, Miscellaneous
// Chendu covers: Sports, Comedy Night, food/drink festivals etc. via keyword
const TM_CLASSIFICATION = 'sports,comedy';

// PredictHQ: categories NOT already covered by the main aggregator
// Main covers: conferences (→ tech/networking)
// Chendu covers: concerts, festivals, community, sports
const PHQ_CATEGORIES = 'concerts,festivals,community,sports';

interface TmImage { url: string; width: number; height: number }
interface TmDate { dateTime?: string; localDate?: string }
interface TmPriceRange { min: number; max: number }
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
  priceRanges?: TmPriceRange[];
  _embedded?: { venues?: TmVenue[] };
}
interface TmResponse {
  _embedded?: { events?: TmEvent[] };
  page: { totalPages: number; number: number };
}

interface PhqGeo {
  geometry?: { coordinates?: [number, number] };
  address?: { formatted_address?: string };
}
interface PhqEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  geo?: PhqGeo;
  phq_attendance?: number;
}
interface PhqResponse {
  count: number;
  next: string | null;
  results: PhqEvent[];
}

export class ChenduSpecialAggregator implements Aggregator {
  name = 'chendu-special' as const;
  private tmKey?: string;
  private phqToken?: string;

  constructor(tmKey?: string, phqToken?: string) {
    this.tmKey = tmKey;
    this.phqToken = phqToken;
  }

  async fetch(): Promise<NormalizedEvent[]> {
    const results: NormalizedEvent[] = [];
    if (this.tmKey) {
      try {
        results.push(...(await this.fetchTicketmaster()));
        console.log(`[chendu-special] ticketmaster fetched ${results.length} events`);
      } catch (err) {
        console.error('[chendu-special] ticketmaster fetch failed:', err);
      }
    }
    if (this.phqToken) {
      const before = results.length;
      try {
        results.push(...(await this.fetchPredictHQ()));
        console.log(`[chendu-special] predicthq fetched ${results.length - before} events`);
      } catch (err) {
        console.error('[chendu-special] predicthq fetch failed:', err);
      }
    }
    return results;
  }

  private async fetchTicketmaster(): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];
    let page = 0;
    let totalPages = 1;

    do {
      const params = new URLSearchParams({
        apikey: this.tmKey!,
        city: 'San Francisco',
        stateCode: 'CA',
        countryCode: 'US',
        classificationName: TM_CLASSIFICATION,
        startDateTime: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        size: '100',
        page: String(page),
        sort: 'date,asc',
      });

      const res = await fetch(`${TM_BASE}/events.json?${params}`);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Ticketmaster ${res.status}: ${body}`);
      }

      const data = (await res.json()) as TmResponse;
      const items = data._embedded?.events ?? [];

      for (const e of items) {
        const venue = e._embedded?.venues?.[0];
        const prices = e.priceRanges ?? [];
        const sortedImages = [...(e.images ?? [])].sort((a, b) => b.width - a.width);

        events.push({
          externalId: `chendu-${e.id}`,
          source: 'chendu-special',
          sourceUrl: e.url,
          title: e.name,
          description: null,
          imageUrl: sortedImages[0]?.url ?? null,
          categorySlug: 'chendu-special',
          startAt: e.dates?.start?.dateTime
            ? new Date(e.dates.start.dateTime)
            : new Date(e.dates?.start?.localDate ?? Date.now()),
          endAt: null,
          locationName: venue?.name ?? null,
          locationAddress:
            [venue?.address?.line1, venue?.city?.name, venue?.state?.stateCode]
              .filter(Boolean)
              .join(', ') || null,
          latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : null,
          longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : null,
          isFree: prices.length === 0 ? false : prices.every((p) => p.min === 0),
          priceMin: prices.length > 0 ? Math.min(...prices.map((p) => p.min)) : null,
          priceMax: prices.length > 0 ? Math.max(...prices.map((p) => p.max)) : null,
          attendeeCount: 0,
        });
      }

      totalPages = data.page.totalPages;
      page++;
    } while (page < Math.min(totalPages, 3));

    return events;
  }

  private async fetchPredictHQ(): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];
    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({
      category: PHQ_CATEGORIES,
      'place.scope': SF_PLACE_ID,
      'start.gte': today,
      limit: '100',
      sort: 'start',
    });

    let url: string | null = `${PHQ_BASE}?${params}`;
    let pages = 0;

    while (url && pages < 3) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.phqToken}`, Accept: 'application/json' },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`PredictHQ ${res.status}: ${body}`);
      }

      const data = (await res.json()) as PhqResponse;
      for (const e of data.results) {
        const coords = e.geo?.geometry?.coordinates; // [lng, lat]
        events.push({
          externalId: `chendu-${e.id}`,
          source: 'chendu-special',
          sourceUrl: `https://predicthq.com/events/${e.id}`,
          title: e.title,
          description: e.description ?? null,
          imageUrl: null,
          categorySlug: 'chendu-special',
          startAt: new Date(e.start),
          endAt: e.end ? new Date(e.end) : null,
          locationName: null,
          locationAddress: e.geo?.address?.formatted_address ?? null,
          latitude: coords ? coords[1] : null,
          longitude: coords ? coords[0] : null,
          isFree: false,
          priceMin: null,
          priceMax: null,
          attendeeCount: e.phq_attendance ?? 0,
        });
      }

      url = data.next;
      pages++;
    }

    return events;
  }
}
