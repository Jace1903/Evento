import { Aggregator, NormalizedEvent } from './types';

// Eventbrite deprecated their public /events/search/ endpoint in 2024.
// Keeping this stub so org-level event syncing can be added later via
// /v3/organizations/{id}/events/ once an org is set up.
export class EventbriteAggregator implements Aggregator {
  name = 'eventbrite' as const;

  async fetch(): Promise<NormalizedEvent[]> {
    console.log('[eventbrite] public search API deprecated — skipping');
    return [];
  }
}
