import pool from '../../db';
import { DbCategory } from '../../db/types';
import { NormalizedEvent } from './types';

async function loadCategoryMap(): Promise<Map<string, number>> {
  const { rows } = await pool.query<DbCategory>('SELECT id, slug FROM categories');
  return new Map(rows.map((r) => [r.slug, r.id]));
}

export async function upsertEvents(events: NormalizedEvent[]): Promise<{ inserted: number; updated: number }> {
  if (events.length === 0) return { inserted: 0, updated: 0 };

  const categoryMap = await loadCategoryMap();
  let inserted = 0;
  let updated = 0;

  for (const e of events) {
    const categoryId = e.categorySlug ? (categoryMap.get(e.categorySlug) ?? null) : null;

    const result = await pool.query(
      `INSERT INTO events (
        external_id, source, source_url, title, description, image_url,
        category_id, start_at, end_at,
        location_name, location_address, latitude, longitude,
        is_free, price_min, price_max, attendee_count
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (source, external_id) DO UPDATE SET
        title          = EXCLUDED.title,
        description    = EXCLUDED.description,
        image_url      = EXCLUDED.image_url,
        category_id    = EXCLUDED.category_id,
        start_at       = EXCLUDED.start_at,
        end_at         = EXCLUDED.end_at,
        location_name  = EXCLUDED.location_name,
        location_address = EXCLUDED.location_address,
        latitude       = EXCLUDED.latitude,
        longitude      = EXCLUDED.longitude,
        is_free        = EXCLUDED.is_free,
        price_min      = EXCLUDED.price_min,
        price_max      = EXCLUDED.price_max,
        attendee_count = EXCLUDED.attendee_count,
        updated_at     = NOW()
      RETURNING (xmax = 0) AS is_insert`,
      [
        e.externalId,
        e.source,
        e.sourceUrl,
        e.title,
        e.description,
        e.imageUrl,
        categoryId,
        e.startAt,
        e.endAt,
        e.locationName,
        e.locationAddress,
        e.latitude,
        e.longitude,
        e.isFree,
        e.priceMin,
        e.priceMax,
        e.attendeeCount,
      ]
    );

    if (result.rows[0]?.is_insert) inserted++;
    else updated++;
  }

  return { inserted, updated };
}
