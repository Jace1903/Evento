import { Aggregator, NormalizedEvent } from './types';

const BASE = 'https://www.eventbriteapi.com/v3';

// Eventbrite category_id → our category slugs
const CATEGORY_MAP: Record<string, string> = {
  '101': 'networking',  // Business & Professional
  '102': 'tech',        // Science & Technology
  '103': 'music',       // Music
  '104': 'cultural',    // Film, Media & Entertainment
  '105': 'creative',    // Performing & Visual Arts
  '106': 'cultural',    // Community & Culture
  '110': 'food-drink',  // Food & Drink
};

interface EbDate { utc: string }
interface EbText { text: string }
interface EbAddress {
  address_1?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}
interface EbVenue { name?: string; address?: EbAddress }
interface EbTicket { free: boolean; cost?: { major_value: string } }
interface EbEvent {
  id: string;
  name: EbText;
  description?: EbText;
  url: string;
  start: EbDate;
  end?: EbDate;
  logo?: { url: string };
  category_id?: string;
  venue?: EbVenue;
  ticket_classes?: EbTicket[];
  capacity?: number;
}
interface EbResponse {
  events: EbEvent[];
  pagination: { has_more_items: boolean; continuation?: string };
}

function normalize(e: EbEvent): NormalizedEvent {
  const tickets = e.ticket_classes ?? [];
  const isFree = tickets.length > 0 && tickets.every((t) => t.free);
  const prices = tickets.filter((t) => !t.free && t.cost).map((t) => parseFloat(t.cost!.major_value));
  const addr = e.venue?.address;
  const locationAddress = addr
    ? [addr.address_1, addr.city, addr.region, addr.country].filter(Boolean).join(', ')
    : null;

  return {
    externalId: e.id,
    source: 'eventbrite',
    sourceUrl: e.url,
    title: e.name.text,
    description: e.description?.text ?? null,
    imageUrl: e.logo?.url ?? null,
    categorySlug: e.category_id ? (CATEGORY_MAP[e.category_id] ?? null) : null,
    startAt: new Date(e.start.utc),
    endAt: e.end ? new Date(e.end.utc) : null,
    locationName: e.venue?.name ?? null,
    locationAddress,
    latitude: addr?.latitude ? parseFloat(addr.latitude) : null,
    longitude: addr?.longitude ? parseFloat(addr.longitude) : null,
    isFree,
    priceMin: prices.length > 0 ? Math.min(...prices) : null,
    priceMax: prices.length > 0 ? Math.max(...prices) : null,
    attendeeCount: e.capacity ?? 0,
  };
}

export class EventbriteAggregator implements Aggregator {
  name = 'eventbrite' as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetch(): Promise<NormalizedEvent[]> {
    const events: NormalizedEvent[] = [];
    let continuation: string | undefined;

    do {
      const params = new URLSearchParams({
        'location.address': 'San Francisco, CA',
        'location.within': '50mi',
        'start_date.range_start': new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        expand: 'venue,ticket_classes',
        page_size: '50',
      });
      if (continuation) params.set('continuation', continuation);

      const res = await fetch(`${BASE}/events/search/?${params}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Eventbrite API error ${res.status}: ${body}`);
      }

      const data = (await res.json()) as EbResponse;
      events.push(...data.events.map(normalize));

      continuation = data.pagination.has_more_items ? data.pagination.continuation : undefined;
    } while (continuation);

    return events;
  }
}
