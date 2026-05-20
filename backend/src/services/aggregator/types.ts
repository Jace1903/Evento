import { EventSource } from '../../db/types';

export interface NormalizedEvent {
  externalId: string;
  source: EventSource;
  sourceUrl: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  categorySlug: string | null;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  isFree: boolean;
  priceMin: number | null;
  priceMax: number | null;
  attendeeCount: number;
}

export interface Aggregator {
  name: EventSource;
  fetch(): Promise<NormalizedEvent[]>;
}
