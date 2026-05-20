export interface ApiEvent {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  locationName: string | null;
  locationAddress: string | null;
  isFree: boolean;
  priceMin: number | null;
  priceMax: number | null;
  attendeeCount: number;
  source: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  category: {
    name: string;
    slug: string;
    emoji: string;
    color: string;
  } | null;
}

export interface ApiEventsResponse {
  events: ApiEvent[];
  total: number;
  page: number;
  limit: number;
}
