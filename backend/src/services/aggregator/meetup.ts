import { Aggregator, NormalizedEvent } from './types';

// Meetup requires OAuth 2.0 — stubbed for future implementation.
// See: https://www.meetup.com/api/guide
export class MeetupAggregator implements Aggregator {
  name = 'meetup' as const;

  async fetch(): Promise<NormalizedEvent[]> {
    console.log('[meetup] aggregator not yet implemented — skipping');
    return [];
  }
}
