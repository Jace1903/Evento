import { Aggregator } from './types';
import { EventbriteAggregator } from './eventbrite';
import { TicketmasterAggregator } from './ticketmaster';
import { PredictHQAggregator } from './predicthq';
import { LumaAggregator } from './luma';
import { MeetupAggregator } from './meetup';
import { upsertEvents } from './upsert';

export function buildAggregators(): Aggregator[] {
  const list: Aggregator[] = [];

  list.push(new EventbriteAggregator());

  if (process.env.TICKETMASTER_API_KEY) {
    list.push(new TicketmasterAggregator(process.env.TICKETMASTER_API_KEY));
  } else {
    console.warn('[aggregator] TICKETMASTER_API_KEY not set — skipping Ticketmaster');
  }

  if (process.env.PREDICTHQ_TOKEN) {
    list.push(new PredictHQAggregator(process.env.PREDICTHQ_TOKEN));
  } else {
    console.warn('[aggregator] PREDICTHQ_TOKEN not set — skipping PredictHQ (tech/networking events)');
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
