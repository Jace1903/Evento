import { Aggregator } from './types';
import { EventbriteAggregator } from './eventbrite';
import { LumaAggregator } from './luma';
import { MeetupAggregator } from './meetup';
import { upsertEvents } from './upsert';

export function buildAggregators(): Aggregator[] {
  const list: Aggregator[] = [];

  if (process.env.EVENTBRITE_API_KEY) {
    list.push(new EventbriteAggregator(process.env.EVENTBRITE_API_KEY));
  } else {
    console.warn('[aggregator] EVENTBRITE_API_KEY not set — skipping Eventbrite');
  }

  list.push(new LumaAggregator());
  list.push(new MeetupAggregator());

  return list;
}

export async function runAllAggregators(): Promise<void> {
  const aggregators = buildAggregators();

  for (const agg of aggregators) {
    console.log(`\n[${agg.name}] fetching...`);
    try {
      const events = await agg.fetch();
      console.log(`[${agg.name}] fetched ${events.length} events`);

      const { inserted, updated } = await upsertEvents(events);
      console.log(`[${agg.name}] inserted=${inserted} updated=${updated}`);
    } catch (err) {
      console.error(`[${agg.name}] failed:`, err);
    }
  }
}
