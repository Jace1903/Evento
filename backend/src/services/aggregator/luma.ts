import { Aggregator, NormalizedEvent } from './types';

// Luma does not have a public API — stubbed for future implementation.
// Options: (1) official API if/when released, (2) partner access, (3) RSS feeds per calendar.
export class LumaAggregator implements Aggregator {
  name = 'luma' as const;

  async fetch(): Promise<NormalizedEvent[]> {
    console.log('[luma] aggregator not yet implemented — skipping');
    return [];
  }
}
