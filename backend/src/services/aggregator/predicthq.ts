import { Aggregator, NormalizedEvent } from './types';

// Geonames IDs for Bay Area cities
const BAY_AREA_PLACE_IDS = [
  '5391959', // San Francisco
  '5378538', // Oakland
  '5392171', // San Jose
  '5380748', // Palo Alto
  '5349755', // Fremont
  '5325738', // Berkeley
].join(',');

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

  const labels = e.labels ?? [];
  const TECH_LABELS = ['technology', 'science', 'ai', 'machine-learning', 'software', 'startup', 'hackathon', 'engineering'];
  const isTech = labels.some((l) => TECH_LABELS.includes(l));
  const categorySlug = isTech ? 'tech' : 'networking';

  return {
    externalId: e.id,
    source: 'predicthq',
    sourceUrl: `https://predicthq.com/events/${e.id}`,
    title: e.title,
    description: e.description ?? null,
    imageUrl: null,
    categorySlug,
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

    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({
      category: 'conferences',
      'place.scope': BAY_AREA_PLACE_IDS,
      'start.gte': today,
      limit: '100',
      sort: 'start',
    });
    url = `https://api.predicthq.com/v1/events/?${params}`;

    let pages = 0;
    while (url && pages < 3) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/json' },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`PredictHQ API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as PhqResponse;
      events.push(...data.results.map(normalize));
      url = data.next;
      pages++;
    }

    return events;
  }
}
