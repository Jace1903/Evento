export type EventSource = 'eventbrite' | 'luma' | 'meetup' | 'cerebral_valley' | 'ticketmaster' | 'manual';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbCategory {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  color: string;
}

export interface DbEvent {
  id: string;
  external_id: string | null;
  source: EventSource;
  source_url: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  category_id: number | null;
  start_at: Date;
  end_at: Date | null;
  location_name: string | null;
  location_address: string | null;
  latitude: string | null;
  longitude: string | null;
  is_free: boolean;
  price_min: string | null;
  price_max: string | null;
  attendee_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface DbSavedEvent {
  id: number;
  user_id: string;
  event_id: string;
  created_at: Date;
}
